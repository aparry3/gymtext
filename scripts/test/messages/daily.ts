#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader, spinner } from '../../utils/common';

interface DailyMessageOptions {
  phone?: string;
  userId?: string;
  all?: boolean;
  hour?: number;
  date?: string;
  dryRun: boolean;
  forceGenerate?: boolean;
  batch?: boolean;
  hours?: string;
  verbose: boolean;
  json?: boolean;
}

interface MessageResult {
  userId: string;
  userName?: string;
  phone: string;
  success: boolean;
  message?: string;
  workoutGenerated?: boolean;
  progressUpdated?: boolean;
  microcycleTransition?: boolean;
  error?: string;
  duration?: number;
}

interface BatchResult {
  hour: number;
  processed: number;
  successful: number;
  failed: number;
  results: MessageResult[];
}

class DailyMessageTester {
  private db: TestDatabase;
  private config: TestConfig;
  private options: DailyMessageOptions;
  private timer: Timer;

  constructor(options: DailyMessageOptions) {
    this.options = options;
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.timer = new Timer();
  }

  /**
   * Send daily message for a specific user
   */
  private async sendDailyMessage(userId: string, testDate?: Date): Promise<MessageResult> {
    const startTime = Date.now();
    const user = await this.db.getUserWithProfile(userId);
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const result: MessageResult = {
      userId,
      userName: user.name || undefined,
      phone: user.phoneNumber,
      success: false,
    };

    try {
      // Get current fitness plan and progress
      const fitnessPlan = await this.db.getFitnessPlan(userId);
      const progress = await this.db.getCurrentProgress(userId);
      
      if (!fitnessPlan) {
        throw new Error('No fitness plan found');
      }

      // Check for microcycle transition
      if (progress) {
        const currentWeek = progress.microcycleWeek;
        const mesocycles = fitnessPlan.mesocycles as any[] || [];
        const totalWeeks = mesocycles.reduce((sum: number, m: any) => sum + (m.weeks || 4), 0);
        result.microcycleTransition = currentWeek % 4 === 0 || currentWeek === totalWeeks;
      }

      // Prepare API request
      const apiUrl = this.config.getApiUrl('/cron/daily-messages');
      const params = new URLSearchParams({
        testMode: 'true',
        testUserIds: userId,
        dryRun: this.options.dryRun.toString(),
      });

      if (this.options.forceGenerate) {
        params.append('forceGenerate', 'true');
      }

      if (testDate) {
        params.append('testDate', testDate.toISOString());
        params.append('testHour', testDate.getUTCHours().toString());
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
      result.message = apiResult.message || 'Message sent successfully';
      
    } catch (err) {
      result.success = false;
      result.error = err instanceof Error ? err.message : String(err);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Send daily messages for all users scheduled for a specific hour
   */
  private async sendForHour(hour: number, testDate?: Date): Promise<BatchResult> {
    const users = await this.db.getUsersForHour(hour);
    const results: MessageResult[] = [];
    
    const batchResult: BatchResult = {
      hour,
      processed: 0,
      successful: 0,
      failed: 0,
      results,
    };

    if (users.length === 0) {
      return batchResult;
    }

    console.log(chalk.cyan(`Processing ${users.length} users for hour ${hour}:00 UTC`));

    for (const user of users) {
      try {
        const result = await this.sendDailyMessage(user.id, testDate);
        results.push(result);
        batchResult.processed++;
        
        if (result.success) {
          batchResult.successful++;
          if (!this.options.json) {
            console.log(chalk.green(`  ✓ ${result.userName || result.phone}`));
          }
        } else {
          batchResult.failed++;
          if (!this.options.json) {
            console.log(chalk.red(`  ✗ ${result.userName || result.phone}: ${result.error}`));
          }
        }
      } catch (err) {
        batchResult.failed++;
        results.push({
          userId: user.id,
          phone: user.phoneNumber,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return batchResult;
  }

  /**
   * Display results for a single message
   */
  private displayMessageResult(result: MessageResult): void {
    const data = [
      ['Field', 'Value'],
      ['User', result.userName || result.userId],
      ['Phone', result.phone],
      ['Status', result.success ? chalk.green('✓ Success') : chalk.red('✗ Failed')],
    ];

    if (result.workoutGenerated !== undefined) {
      data.push(['Workout Generated', result.workoutGenerated ? chalk.green('Yes') : chalk.gray('No')]);
    }

    if (result.progressUpdated !== undefined) {
      data.push(['Progress Updated', result.progressUpdated ? chalk.green('Yes') : chalk.gray('No')]);
    }

    if (result.microcycleTransition) {
      data.push(['Microcycle Transition', chalk.yellow('Yes')]);
    }

    if (result.duration) {
      data.push(['Duration', formatDuration(result.duration)]);
    }

    if (result.error) {
      data.push(['Error', chalk.red(result.error)]);
    }

    if (this.options.dryRun) {
      data.push(['Mode', chalk.yellow('DRY RUN')]);
    }

    console.log(table(data));
  }

  /**
   * Display batch results
   */
  private displayBatchResults(results: BatchResult[]): void {
    displayHeader('Batch Results Summary');

    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
    const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

    const data = [
      ['Hour (UTC)', 'Processed', 'Successful', 'Failed'],
      ...results
        .filter(r => r.processed > 0)
        .map(r => [
          `${r.hour.toString().padStart(2, '0')}:00`,
          r.processed.toString(),
          chalk.green(r.successful.toString()),
          r.failed > 0 ? chalk.red(r.failed.toString()) : '0',
        ]),
      ['─────', '─────', '─────', '─────'],
      ['Total', totalProcessed.toString(), chalk.green(totalSuccessful.toString()), 
       totalFailed > 0 ? chalk.red(totalFailed.toString()) : '0'],
    ];

    console.log(table(data));

    // Show any errors in verbose mode
    if (this.options.verbose && totalFailed > 0) {
      console.log(chalk.red('\nErrors:'));
      results.forEach(batch => {
        batch.results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(chalk.red(`  • ${r.userName || r.phone}: ${r.error}`));
          });
      });
    }
  }

  /**
   * Run the test for a specific user
   */
  async testUser(): Promise<void> {
    this.timer.start();

    let userId: string | undefined;

    if (this.options.userId) {
      userId = this.options.userId;
    } else if (this.options.phone) {
      const user = await this.db.getUserByPhone(this.options.phone);
      if (!user) {
        throw new Error(`User with phone ${this.options.phone} not found`);
      }
      userId = user.id;
    } else {
      throw new Error('Either --phone or --user-id must be provided');
    }

    const user = await this.db.getUserWithProfile(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (!this.options.json) {
      displayHeader('Send Daily Message');
      info(`User: ${user.name || user.id}`);
      info(`Phone: ${user.phoneNumber}`);
      
      if (this.options.date) {
        info(`Test Date: ${this.options.date}`);
      }
      if (this.options.hour !== undefined) {
        info(`Test Hour: ${this.options.hour}:00 UTC`);
      }
      if (this.options.forceGenerate) {
        warning('Force regenerate enabled');
      }
      if (this.options.dryRun) {
        warning('DRY RUN MODE - No messages will be sent');
      }
      console.log();
    }

    const testDate = this.options.date ? new Date(this.options.date) : undefined;
    
    const spin = this.options.json ? null : spinner('Sending daily message...');
    const result = await this.sendDailyMessage(userId, testDate);
    spin?.stop();

    if (this.options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      this.displayMessageResult(result);
      
      if (result.success) {
        success(`Daily message ${this.options.dryRun ? 'would be' : 'was'} sent successfully`);
        
        if (result.workoutGenerated) {
          info('New workout was generated');
        }
        if (result.progressUpdated) {
          info('Progress was updated');
        }
        if (result.microcycleTransition) {
          warning('Microcycle transition detected');
        }
      } else {
        error(`Failed to send daily message: ${result.error}`);
      }

      console.log(chalk.gray(`\nCompleted in ${formatDuration(this.timer.elapsed())}`));
    }
  }

  /**
   * Run the test for all users
   */
  async testAll(): Promise<void> {
    this.timer.start();

    if (!this.options.json) {
      displayHeader('Send Daily Messages - All Users');
      
      if (this.options.dryRun) {
        warning('DRY RUN MODE - No messages will be sent');
      }
      console.log();
    }

    const testDate = this.options.date ? new Date(this.options.date) : new Date();
    const hour = this.options.hour !== undefined ? this.options.hour : testDate.getUTCHours();

    const result = await this.sendForHour(hour, testDate);

    if (this.options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (result.processed === 0) {
        warning(`No users scheduled for ${hour}:00 UTC`);
      } else {
        this.displayBatchResults([result]);
        success(`Processed ${result.processed} users (${result.successful} successful, ${result.failed} failed)`);
      }

      console.log(chalk.gray(`\nCompleted in ${formatDuration(this.timer.elapsed())}`));
    }
  }

  /**
   * Run batch test for multiple hours
   */
  async testBatch(): Promise<void> {
    this.timer.start();

    const hours = this.options.hours 
      ? this.options.hours.split(',').map(h => parseInt(h.trim()))
      : [6, 7, 8, 18, 19, 20]; // Default peak hours

    if (!this.options.json) {
      displayHeader('Batch Daily Messages Test');
      info(`Testing hours: ${hours.join(', ')} UTC`);
      
      if (this.options.dryRun) {
        warning('DRY RUN MODE - No messages will be sent');
      }
      console.log();
    }

    const testDate = this.options.date ? new Date(this.options.date) : new Date();
    const results: BatchResult[] = [];

    for (const hour of hours) {
      if (!this.options.json) {
        console.log(chalk.blue(`\nHour ${hour}:00 UTC:`));
      }
      
      const result = await this.sendForHour(hour, testDate);
      results.push(result);
    }

    if (this.options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      this.displayBatchResults(results);
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
  .name('test-messages-daily')
  .description('Test daily workout message generation and sending')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'Phone number of user to test')
  .option('-u, --user-id <id>', 'User ID to test')
  .option('-a, --all', 'Send to all users scheduled for current/specified hour')
  .option('-H, --hour <hour>', 'Test specific UTC hour (0-23)', parseInt)
  .option('-d, --date <date>', 'Test specific date (ISO format)')
  .option('--dry-run', 'Run without sending actual messages', false)
  .option('--no-dry-run', 'Send actual messages (use with caution!)')
  .option('-f, --force-generate', 'Force regenerate workout (bypass cache)')
  .option('-b, --batch', 'Test multiple hours')
  .option('--hours <hours>', 'Comma-separated list of hours for batch test')
  .option('-v, --verbose', 'Show detailed output', false)
  .option('-j, --json', 'Output results as JSON', false)
  .action(async (options: DailyMessageOptions) => {
    const tester = new DailyMessageTester(options);

    try {
      if (!options.dryRun && !options.json) {
        console.log(chalk.yellow.bold('\n⚠️  WARNING: Running in LIVE mode - messages WILL be sent!'));
        console.log(chalk.yellow('Press Ctrl+C to cancel...\n'));
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      if (options.batch) {
        await tester.testBatch();
      } else if (options.all) {
        await tester.testAll();
      } else {
        await tester.testUser();
      }
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
  console.log(chalk.gray('  # Send to specific user (current time)'));
  console.log('  $ pnpm test:messages:daily --phone "+1234567890"');
  console.log();
  console.log(chalk.gray('  # Send to all users scheduled for current hour'));
  console.log('  $ pnpm test:messages:daily --all');
  console.log();
  console.log(chalk.gray('  # Test specific date/time'));
  console.log('  $ pnpm test:messages:daily --phone "+1234567890" --date "2024-01-15" --hour 8');
  console.log();
  console.log(chalk.gray('  # Batch test for multiple hours'));
  console.log('  $ pnpm test:messages:daily --batch --hours "6,7,8,18,19,20"');
  console.log();
  console.log(chalk.gray('  # Force regenerate workout'));
  console.log('  $ pnpm test:messages:daily --phone "+1234567890" --force-generate');
  console.log();
  console.log(chalk.gray('  # Run in LIVE mode (sends real messages!)'));
  console.log('  $ pnpm test:messages:daily --phone "+1234567890" --no-dry-run');
}

program.parse(process.argv);