#!/usr/bin/env tsx

import { config } from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';

// Load environment variables
config({ path: '.env.local' });

interface TestOptions {
  hour?: number;
  date?: string;
  users?: string;
  dryRun: boolean;
  testMode: boolean;
  suite?: string;
  verbose: boolean;
}

interface TestResult {
  success: boolean;
  processed: number;
  failed: number;
  duration: number;
  timestamp: string;
  testParams?: {
    testMode: boolean;
    testHour?: number;
    testDate?: string;
    dryRun: boolean;
    testUserIds?: string[];
  };
  errors?: Array<{ userId: string; error: string }>;
}

class CronTestRunner {
  private baseUrl: string;
  private options: TestOptions;

  constructor(options: TestOptions) {
    this.options = options;
    // Use localhost for testing
    const port = process.env.PORT || '3000';
    this.baseUrl = `http://localhost:${port}/api/cron/daily-messages`;
  }

  /**
   * Run a test with specific parameters
   */
  private async runTest(params: URLSearchParams): Promise<TestResult> {
    const url = `${this.baseUrl}?${params.toString()}`;
    
    if (this.options.verbose) {
      console.log(chalk.gray(`Fetching: ${url}`));
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json() as TestResult;
      return result;
    } catch (error) {
      console.error(chalk.red(`Error running test: ${error}`));
      throw error;
    }
  }

  /**
   * Test a specific hour
   */
  async testSpecificHour(hour: number): Promise<void> {
    console.log(chalk.blue(`\n📅 Testing Hour: ${hour}:00 UTC`));
    console.log(chalk.gray('─'.repeat(50)));

    const params = new URLSearchParams({
      testMode: 'true',
      testHour: hour.toString(),
      dryRun: this.options.dryRun.toString(),
    });

    if (this.options.users) {
      params.append('testUserIds', this.options.users);
    }

    const result = await this.runTest(params);
    this.displayResults(result);
  }

  /**
   * Test a specific date and hour
   */
  async testSpecificDate(date: string, hour?: number): Promise<void> {
    const testDate = new Date(date);
    const displayDate = testDate.toISOString().split('T')[0];
    const testHour = hour !== undefined ? hour : testDate.getUTCHours();
    
    console.log(chalk.blue(`\n📆 Testing Date: ${displayDate} at ${testHour}:00 UTC`));
    console.log(chalk.gray('─'.repeat(50)));

    const params = new URLSearchParams({
      testMode: 'true',
      testDate: testDate.toISOString(),
      testHour: testHour.toString(),
      dryRun: this.options.dryRun.toString(),
    });

    if (this.options.users) {
      params.append('testUserIds', this.options.users);
    }

    const result = await this.runTest(params);
    this.displayResults(result);
  }

  /**
   * Test all hours in a day
   */
  async testAllHours(): Promise<void> {
    console.log(chalk.blue('\n🕐 Testing All Hours (0-23 UTC)'));
    console.log(chalk.gray('─'.repeat(50)));

    const results: Array<{ hour: number; result: TestResult }> = [];

    for (let hour = 0; hour < 24; hour++) {
      try {
        const params = new URLSearchParams({
          testMode: 'true',
          testHour: hour.toString(),
          dryRun: 'true', // Always dry run for full day test
        });

        const result = await this.runTest(params);
        results.push({ hour, result });
        
        console.log(
          chalk.gray(`Hour ${hour.toString().padStart(2, '0')}:00 - `) +
          chalk.green(`✓ Processed: ${result.processed}`) +
          (result.failed > 0 ? chalk.red(` Failed: ${result.failed}`) : '')
        );
      } catch (error) {
        console.log(
          chalk.gray(`Hour ${hour.toString().padStart(2, '0')}:00 - `) +
          chalk.red(`✗ Error: ${error}`)
        );
      }
    }

    this.displaySummary(results);
  }

  /**
   * Test timezone coverage
   */
  async testTimezones(): Promise<void> {
    console.log(chalk.blue('\n🌍 Testing Timezone Coverage'));
    console.log(chalk.gray('─'.repeat(50)));

    const timezones = [
      { name: 'US East', hour: 13 },  // 8 AM EST (UTC-5)
      { name: 'US West', hour: 16 },  // 8 AM PST (UTC-8)
      { name: 'UK', hour: 8 },        // 8 AM GMT
      { name: 'Europe', hour: 7 },    // 8 AM CET (UTC+1)
      { name: 'Asia', hour: 0 },      // 8 AM JST (UTC+9)
    ];

    for (const tz of timezones) {
      console.log(chalk.cyan(`\nTesting ${tz.name} (Hour ${tz.hour} UTC):`));
      
      const params = new URLSearchParams({
        testMode: 'true',
        testHour: tz.hour.toString(),
        dryRun: this.options.dryRun.toString(),
      });

      try {
        const result = await this.runTest(params);
        console.log(chalk.green(`  ✓ Processed: ${result.processed} users`));
        if (result.failed > 0) {
          console.log(chalk.yellow(`  ⚠ Failed: ${result.failed} users`));
        }
      } catch (error) {
        console.log(chalk.red(`  ✗ Error: ${error}`));
      }
    }
  }

  /**
   * Display test results
   */
  private displayResults(result: TestResult): void {
    console.log('\n' + chalk.bold('Results:'));
    
    const data = [
      ['Metric', 'Value'],
      ['Status', result.success ? chalk.green('✓ Success') : chalk.red('✗ Failed')],
      ['Processed', result.processed.toString()],
      ['Failed', result.failed > 0 ? chalk.red(result.failed.toString()) : '0'],
      ['Duration', `${result.duration}ms`],
      ['Timestamp', new Date(result.timestamp).toLocaleString()],
    ];

    if (result.testParams) {
      if (result.testParams.testHour !== undefined) {
        data.push(['Test Hour', result.testParams.testHour.toString()]);
      }
      if (result.testParams.testDate) {
        data.push(['Test Date', result.testParams.testDate]);
      }
      if (result.testParams.dryRun) {
        data.push(['Mode', chalk.yellow('DRY RUN')]);
      }
    }

    const config = {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼'
      }
    };

    console.log(table(data, config));

    // Display errors if any and verbose mode
    if (result.errors && result.errors.length > 0 && this.options.verbose) {
      console.log('\n' + chalk.red('Errors:'));
      result.errors.forEach(err => {
        console.log(chalk.red(`  • User ${err.userId}: ${err.error}`));
      });
    }
  }

  /**
   * Display summary for multiple tests
   */
  private displaySummary(results: Array<{ hour: number; result: TestResult }>): void {
    console.log('\n' + chalk.bold('Summary:'));
    
    const totalProcessed = results.reduce((sum, r) => sum + r.result.processed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.result.failed, 0);
    const hoursWithUsers = results.filter(r => r.result.processed > 0).length;
    
    console.log(chalk.green(`  Total Processed: ${totalProcessed}`));
    console.log(chalk.yellow(`  Total Failed: ${totalFailed}`));
    console.log(chalk.blue(`  Hours with Users: ${hoursWithUsers}/24`));
    
    if (hoursWithUsers > 0) {
      console.log('\n' + chalk.bold('Peak Hours:'));
      const sorted = [...results]
        .filter(r => r.result.processed > 0)
        .sort((a, b) => b.result.processed - a.result.processed)
        .slice(0, 5);
      
      sorted.forEach(r => {
        console.log(
          chalk.gray(`  ${r.hour.toString().padStart(2, '0')}:00 UTC - `) +
          chalk.green(`${r.result.processed} users`)
        );
      });
    }
  }

  /**
   * Run the full test suite
   */
  async runFullSuite(): Promise<void> {
    console.log(chalk.bold.blue('\n🧪 Running Full Test Suite'));
    console.log(chalk.gray('═'.repeat(50)));

    // Test 1: Current hour
    const currentHour = new Date().getUTCHours();
    await this.testSpecificHour(currentHour);

    // Test 2: Morning hours (6, 7, 8 AM UTC)
    console.log(chalk.bold.cyan('\n📅 Testing Morning Hours'));
    for (const hour of [6, 7, 8]) {
      await this.testSpecificHour(hour);
    }

    // Test 3: Evening hours (18, 19, 20 PM UTC)
    console.log(chalk.bold.cyan('\n🌙 Testing Evening Hours'));
    for (const hour of [18, 19, 20]) {
      await this.testSpecificHour(hour);
    }

    // Test 4: Timezone coverage
    await this.testTimezones();

    console.log(chalk.bold.green('\n✅ Test Suite Complete!'));
  }
}

/**
 * Main CLI
 */
const program = new Command();

program
  .name('test-cron-daily-messages')
  .description('Test the daily messages cron endpoint')
  .version('1.0.0');

program
  .option('-H, --hour <hour>', 'Test specific UTC hour (0-23)', parseInt)
  .option('-d, --date <date>', 'Test specific date (ISO format)')
  .option('-u, --users <users>', 'Test specific users (comma-separated IDs)')
  .option('--dry-run', 'Run without sending actual messages', true)
  .option('--no-dry-run', 'Send actual messages (use with caution!)')
  .option('-s, --suite <suite>', 'Run test suite (full, hours, timezones)')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options: TestOptions) => {
    try {
      console.log(chalk.bold('🚀 Daily Messages Cron Tester'));
      console.log(chalk.gray(`Environment: ${process.env.NODE_ENV || 'development'}`));
      
      if (!options.dryRun) {
        console.log(chalk.yellow.bold('\n⚠️  WARNING: Running in LIVE mode - messages WILL be sent!'));
        console.log(chalk.yellow('Press Ctrl+C to cancel...\n'));
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const runner = new CronTestRunner({
        ...options,
        testMode: true,
      });

      // Run specific test based on options
      if (options.suite === 'full') {
        await runner.runFullSuite();
      } else if (options.suite === 'hours') {
        await runner.testAllHours();
      } else if (options.suite === 'timezones') {
        await runner.testTimezones();
      } else if (options.date) {
        await runner.testSpecificDate(options.date, options.hour);
      } else if (options.hour !== undefined) {
        await runner.testSpecificHour(options.hour);
      } else {
        // Default: test current hour
        const currentHour = new Date().getUTCHours();
        console.log(chalk.cyan(`Testing current hour (${currentHour}:00 UTC)`));
        await runner.testSpecificHour(currentHour);
      }

      console.log(chalk.green('\n✨ Test completed successfully!'));
    } catch (error) {
      console.error(chalk.red('\n❌ Test failed:'), error);
      process.exit(1);
    }
  });

// Show examples if no arguments
if (process.argv.length === 2) {
  console.log(chalk.bold('\n📚 Examples:\n'));
  console.log(chalk.gray('  # Test current hour (dry run by default)'));
  console.log('  $ pnpm test:cron\n');
  console.log(chalk.gray('  # Test specific hour'));
  console.log('  $ pnpm test:cron --hour 14\n');
  console.log(chalk.gray('  # Test specific date and hour'));
  console.log('  $ pnpm test:cron --date "2024-01-15" --hour 10\n');
  console.log(chalk.gray('  # Test specific users'));
  console.log('  $ pnpm test:cron --users "user1,user2"\n');
  console.log(chalk.gray('  # Run full test suite'));
  console.log('  $ pnpm test:cron --suite full\n');
  console.log(chalk.gray('  # Test all hours of the day'));
  console.log('  $ pnpm test:cron --suite hours\n');
  console.log(chalk.gray('  # Test timezone coverage'));
  console.log('  $ pnpm test:cron --suite timezones\n');
  console.log(chalk.gray('  # Run in LIVE mode (sends real messages!)'));
  console.log('  $ pnpm test:cron --no-dry-run\n');
}

program.parse(process.argv);