#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader, spinner } from '../../utils/common';

interface BatchMessageOptions {
  limit?: number;
  concurrency?: number;
  hour?: number;
  date?: string;
  dryRun: boolean;
  includeInactive?: boolean;
  testErrors?: boolean;
  verbose: boolean;
  json?: boolean;
}

interface UserMessageResult {
  userId: string;
  userName?: string;
  phone: string;
  success: boolean;
  duration: number;
  error?: string;
  workoutGenerated?: boolean;
  progressUpdated?: boolean;
}

interface BatchMetrics {
  totalUsers: number;
  processed: number;
  successful: number;
  failed: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
  throughput: number; // messages per second
  concurrency: number;
  errors: { [key: string]: number };
}

class BatchMessageTester {
  private db: TestDatabase;
  private config: TestConfig;
  private options: BatchMessageOptions;
  private timer: Timer;

  constructor(options: BatchMessageOptions) {
    this.options = options;
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.timer = new Timer();
  }

  /**
   * Process a single user
   */
  private async processUser(userId: string, testDate?: Date): Promise<UserMessageResult> {
    const startTime = Date.now();
    const user = await this.db.getUserWithProfile(userId);

    if (!user) {
      return {
        userId,
        phone: 'unknown',
        success: false,
        duration: Date.now() - startTime,
        error: 'User not found',
      };
    }

    const result: UserMessageResult = {
      userId,
      userName: user.name || undefined,
      phone: user.phoneNumber,
      success: false,
      duration: 0,
    };

    try {
      // Simulate error for testing if requested
      if (this.options.testErrors && Math.random() < 0.2) {
        throw new Error('Simulated error for testing');
      }

      // Get current fitness plan and progress
      const fitnessPlan = await this.db.getFitnessPlan(userId);
      const progress = await this.db.getCurrentProgress(userId);
      
      if (!fitnessPlan) {
        throw new Error('No fitness plan found');
      }

      // Call the API
      const apiUrl = this.config.getApiUrl('/cron/daily-messages');
      const params = new URLSearchParams({
        testMode: 'true',
        testUserIds: userId,
        dryRun: this.options.dryRun.toString(),
      });

      if (testDate) {
        params.append('testDate', testDate.toISOString());
        params.append('testHour', (this.options.hour ?? testDate.getUTCHours()).toString());
      } else if (this.options.hour !== undefined) {
        params.append('testHour', this.options.hour.toString());
      }

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const apiResult = await response.json();
      
      // Check if workout was generated
      const todaysWorkout = await this.db.getTodaysWorkout(userId, testDate);
      result.workoutGenerated = !!todaysWorkout;
      
      // Check if progress was updated
      const newProgress = await this.db.getCurrentProgress(userId);
      if (newProgress && progress) {
        result.progressUpdated = 
          newProgress.microcycleWeek !== progress.microcycleWeek ||
          newProgress.mesocycleIndex !== progress.mesocycleIndex;
      }

      result.success = apiResult.success;
      
    } catch (err) {
      result.success = false;
      result.error = err instanceof Error ? err.message : String(err);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Process users in batches with concurrency control
   */
  private async processBatch(userIds: string[], testDate?: Date): Promise<UserMessageResult[]> {
    const results: UserMessageResult[] = [];
    const concurrency = this.options.concurrency || 5;
    
    // Process in chunks
    for (let i = 0; i < userIds.length; i += concurrency) {
      const chunk = userIds.slice(i, i + concurrency);
      const chunkResults = await Promise.all(
        chunk.map(userId => this.processUser(userId, testDate))
      );
      results.push(...chunkResults);

      // Show progress
      if (!this.options.json && userIds.length > 10) {
        const progress = Math.round((results.length / userIds.length) * 100);
        process.stdout.write(`\r${chalk.cyan(`Progress: ${progress}% (${results.length}/${userIds.length})`)}`);
      }
    }

    if (!this.options.json && userIds.length > 10) {
      process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear progress line
    }

    return results;
  }

  /**
   * Calculate metrics from results
   */
  private calculateMetrics(results: UserMessageResult[], totalDuration: number): BatchMetrics {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const durations = results.map(r => r.duration);
    
    // Count error types
    const errors: { [key: string]: number } = {};
    results
      .filter(r => !r.success && r.error)
      .forEach(r => {
        const errorKey = r.error!.split(':')[0].trim();
        errors[errorKey] = (errors[errorKey] || 0) + 1;
      });

    return {
      totalUsers: results.length,
      processed: results.length,
      successful,
      failed,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration,
      throughput: (results.length / totalDuration) * 1000,
      concurrency: this.options.concurrency || 5,
      errors,
    };
  }

  /**
   * Display performance metrics
   */
  private displayMetrics(metrics: BatchMetrics): void {
    displayHeader('Performance Metrics');

    const data = [
      ['Metric', 'Value'],
      ['Total Users', metrics.totalUsers.toString()],
      ['Processed', metrics.processed.toString()],
      ['Successful', chalk.green(metrics.successful.toString())],
      ['Failed', metrics.failed > 0 ? chalk.red(metrics.failed.toString()) : '0'],
      ['Success Rate', `${((metrics.successful / metrics.totalUsers) * 100).toFixed(1)}%`],
      ['─────────', '─────────'],
      ['Avg Duration', `${metrics.averageDuration.toFixed(0)}ms`],
      ['Min Duration', `${metrics.minDuration}ms`],
      ['Max Duration', `${metrics.maxDuration}ms`],
      ['Total Duration', formatDuration(metrics.totalDuration)],
      ['─────────', '─────────'],
      ['Throughput', `${metrics.throughput.toFixed(2)} msg/sec`],
      ['Concurrency', metrics.concurrency.toString()],
    ];

    console.log(table(data));

    // Display error breakdown if any
    if (Object.keys(metrics.errors).length > 0) {
      console.log(chalk.red('\nError Breakdown:'));
      Object.entries(metrics.errors)
        .sort((a, b) => b[1] - a[1])
        .forEach(([error, count]) => {
          console.log(chalk.red(`  • ${error}: ${count}`));
        });
    }
  }

  /**
   * Display individual results
   */
  private displayResults(results: UserMessageResult[]): void {
    displayHeader('Individual Results');

    const data = [
      ['User', 'Phone', 'Status', 'Duration', 'Workout', 'Progress'],
      ...results.map(r => [
        r.userName || r.userId.substring(0, 8),
        r.phone.substring(0, 10) + '...',
        r.success ? chalk.green('✓') : chalk.red('✗'),
        `${r.duration}ms`,
        r.workoutGenerated ? chalk.green('✓') : chalk.gray('─'),
        r.progressUpdated ? chalk.green('✓') : chalk.gray('─'),
      ]),
    ];

    console.log(table(data));

    // Show errors in verbose mode
    if (this.options.verbose) {
      const errors = results.filter(r => !r.success && r.error);
      if (errors.length > 0) {
        console.log(chalk.red('\nDetailed Errors:'));
        errors.forEach(r => {
          console.log(chalk.red(`  • ${r.userName || r.userId}: ${r.error}`));
        });
      }
    }
  }

  /**
   * Run the batch test
   */
  async run(): Promise<void> {
    this.timer.start();

    if (!this.options.json) {
      displayHeader('Batch Message Testing');
      
      if (this.options.dryRun) {
        warning('DRY RUN MODE - No messages will be sent');
      }
      if (this.options.testErrors) {
        warning('Error simulation enabled (20% failure rate)');
      }
      
      info(`Concurrency: ${this.options.concurrency || 5}`);
      if (this.options.limit) {
        info(`User limit: ${this.options.limit}`);
      }
      if (this.options.hour !== undefined) {
        info(`Test hour: ${this.options.hour}:00 UTC`);
      }
      if (this.options.date) {
        info(`Test date: ${this.options.date}`);
      }
      console.log();
    }

    // Get users to test
    let users;
    if (this.options.hour !== undefined) {
      users = await this.db.getUsersForHour(this.options.hour);
      if (!this.options.json) {
        info(`Found ${users.length} users scheduled for ${this.options.hour}:00 UTC`);
      }
    } else {
      users = await this.db.getActiveUsers();
      if (!this.options.json) {
        info(`Found ${users.length} active users`);
      }
    }

    if (this.options.limit && users.length > this.options.limit) {
      users = users.slice(0, this.options.limit);
      if (!this.options.json) {
        warning(`Limited to ${this.options.limit} users`);
      }
    }

    if (users.length === 0) {
      if (this.options.json) {
        console.log(JSON.stringify({ error: 'No users found' }));
      } else {
        warning('No users found to test');
      }
      return;
    }

    const testDate = this.options.date ? new Date(this.options.date) : undefined;
    
    if (!this.options.json) {
      console.log();
      const spin = spinner(`Processing ${users.length} users...`);
    }

    // Process users
    const userIds = users.map(u => u.id);
    const results = await this.processBatch(userIds, testDate);
    
    const metrics = this.calculateMetrics(results, this.timer.elapsed());

    if (this.options.json) {
      console.log(JSON.stringify({
        metrics,
        results: this.options.verbose ? results : undefined,
      }, null, 2));
    } else {
      console.log(); // Clear line
      this.displayMetrics(metrics);
      
      if (this.options.verbose && results.length <= 20) {
        this.displayResults(results);
      }

      if (metrics.successful === metrics.totalUsers) {
        success(`All ${metrics.totalUsers} messages processed successfully!`);
      } else if (metrics.failed > 0) {
        warning(`${metrics.successful}/${metrics.totalUsers} messages successful, ${metrics.failed} failed`);
      }

      console.log(chalk.gray(`\nCompleted in ${formatDuration(this.timer.elapsed())}`));
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.db.close();
  }
}

/**
 * Main CLI
 */
const program = new Command();

program
  .name('test-messages-batch')
  .description('Test batch daily message processing with performance metrics')
  .version('1.0.0')
  .option('-l, --limit <number>', 'Limit number of users to test', parseInt)
  .option('-c, --concurrency <number>', 'Number of concurrent requests (default: 5)', parseInt)
  .option('-H, --hour <hour>', 'Test users scheduled for specific UTC hour (0-23)', parseInt)
  .option('-d, --date <date>', 'Test specific date (ISO format)')
  .option('--dry-run', 'Run without sending actual messages', true)
  .option('--no-dry-run', 'Send actual messages (use with caution!)')
  .option('--include-inactive', 'Include inactive users in test')
  .option('--test-errors', 'Simulate random errors for testing (20% failure rate)')
  .option('-v, --verbose', 'Show detailed output including individual results', false)
  .option('-j, --json', 'Output results as JSON', false)
  .action(async (options: BatchMessageOptions) => {
    const tester = new BatchMessageTester(options);

    try {
      if (!options.dryRun && !options.json) {
        console.log(chalk.yellow.bold('\n⚠️  WARNING: Running in LIVE mode - messages WILL be sent!'));
        console.log(chalk.yellow('Press Ctrl+C to cancel...\n'));
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      await tester.run();
    } catch (err) {
      if (options.json) {
        console.log(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      } else {
        error(`Test failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      process.exit(1);
    } finally {
      await tester.cleanup();
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.outputHelp();
  console.log(chalk.gray('\nExamples:'));
  console.log(chalk.gray('  # Test all active users with default concurrency'));
  console.log('  $ pnpm test:messages:batch');
  console.log();
  console.log(chalk.gray('  # Test with limited users and higher concurrency'));
  console.log('  $ pnpm test:messages:batch --limit 50 --concurrency 10');
  console.log();
  console.log(chalk.gray('  # Test users scheduled for specific hour'));
  console.log('  $ pnpm test:messages:batch --hour 8');
  console.log();
  console.log(chalk.gray('  # Test with error simulation'));
  console.log('  $ pnpm test:messages:batch --limit 20 --test-errors --verbose');
  console.log();
  console.log(chalk.gray('  # Run in LIVE mode (sends real messages!)'));
  console.log('  $ pnpm test:messages:batch --no-dry-run --limit 10');
  console.log();
  console.log(chalk.gray('  # Output as JSON for automation'));
  console.log('  $ pnpm test:messages:batch --json');
}

program.parse(process.argv);