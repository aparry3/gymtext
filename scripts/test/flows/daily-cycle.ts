#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader } from '../../utils/common';

interface DailyCycleOptions {
  userId?: string;
  phone?: string;
  days?: number;
  startDate?: string;
  skipMessages?: boolean;
  skipWorkouts?: boolean;
  skipProgress?: boolean;
  verbose?: boolean;
  json?: boolean;
}

interface DayResult {
  day: number;
  date: Date;
  workoutGenerated: boolean;
  messagesSent: boolean;
  progressUpdated: boolean;
  workout?: {
    id: string;
    sessionType: string;
    blocks: number;
  };
  messages?: {
    morning?: string;
    evening?: string;
  };
  progress?: {
    week: number;
    mesocycle: number;
    workoutsCompleted: number;
  };
  error?: string;
}

interface CycleResult {
  success: boolean;
  userId: string;
  userName?: string;
  daysSimulated: number;
  days: DayResult[];
  summary: {
    workoutsGenerated: number;
    messagesSent: number;
    progressUpdates: number;
    errors: number;
  };
  totalDuration: number;
}

class DailyCycleFlow {
  private db: TestDatabase;
  private config: TestConfig;
  private timer: Timer;
  private options: DailyCycleOptions;
  private result: CycleResult;

  constructor(options: DailyCycleOptions) {
    this.options = options;
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.timer = new Timer();
    this.result = {
      success: false,
      userId: '',
      daysSimulated: 0,
      days: [],
      summary: {
        workoutsGenerated: 0,
        messagesSent: 0,
        progressUpdates: 0,
        errors: 0,
      },
      totalDuration: 0,
    };
  }

  /**
   * Get user and validate
   */
  private async getUser(): Promise<string> {
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
      // Get a random active user
      const users = await this.db.getActiveUsers();
      if (users.length === 0) {
        throw new Error('No active users found');
      }
      userId = users[0].id;
    }

    const user = await this.db.getUserWithProfile(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Verify user has a fitness plan
    const plan = await this.db.getFitnessPlan(userId);
    if (!plan) {
      throw new Error(`User ${userId} has no fitness plan`);
    }

    this.result.userId = userId;
    this.result.userName = user.name || undefined;

    return userId;
  }

  /**
   * Simulate a single day
   */
  private async simulateDay(userId: string, dayNumber: number, date: Date): Promise<DayResult> {
    const dayResult: DayResult = {
      day: dayNumber,
      date,
      workoutGenerated: false,
      messagesSent: false,
      progressUpdated: false,
    };

    try {
      // Get current progress
      const progressBefore = await this.db.getCurrentProgress(userId);

      // Step 1: Generate workout for the day
      if (!this.options.skipWorkouts) {
        try {
          const apiUrl = this.config.getApiUrl('/workouts/generate');
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              date: date.toISOString(),
            }),
          });

          if (response.ok) {
            const workout = await response.json();
            dayResult.workoutGenerated = true;
            dayResult.workout = {
              id: workout.id,
              sessionType: workout.sessionType,
              blocks: workout.details?.blocks?.length || 0,
            };
            this.result.summary.workoutsGenerated++;
          }
        } catch (err) {
          if (this.options.verbose) {
            warning(`Workout generation failed for day ${dayNumber}: ${err}`);
          }
        }
      }

      // Step 2: Send daily messages
      if (!this.options.skipMessages) {
        try {
          const apiUrl = this.config.getApiUrl('/cron/daily-messages');
          const params = new URLSearchParams({
            testMode: 'true',
            testUserIds: userId,
            testDate: date.toISOString(),
          });

          const response = await fetch(`${apiUrl}?${params.toString()}`, {
            method: 'GET',
          });

          if (response.ok) {
            dayResult.messagesSent = true;
            dayResult.messages = {
              morning: 'Daily workout message sent',
            };
            this.result.summary.messagesSent++;
          }
        } catch (err) {
          if (this.options.verbose) {
            warning(`Message sending failed for day ${dayNumber}: ${err}`);
          }
        }
      }

      // Step 3: Update progress
      if (!this.options.skipProgress) {
        try {
          // Simulate workout completion
          const apiUrl = this.config.getApiUrl('/progress/update');
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              workoutCompleted: true,
              date: date.toISOString(),
            }),
          });

          if (response.ok) {
            const progressAfter = await this.db.getCurrentProgress(userId);
            if (progressAfter && progressBefore) {
              dayResult.progressUpdated = 
                progressAfter.microcycleWeek !== progressBefore.microcycleWeek ||
                progressAfter.mesocycleIndex !== progressBefore.mesocycleIndex;
              
              if (dayResult.progressUpdated) {
                this.result.summary.progressUpdates++;
              }

              dayResult.progress = {
                week: progressAfter.microcycleWeek,
                mesocycle: progressAfter.mesocycleIndex,
                workoutsCompleted: this.result.summary.workoutsGenerated,
              };
            }
          }
        } catch (err) {
          if (this.options.verbose) {
            warning(`Progress update failed for day ${dayNumber}: ${err}`);
          }
        }
      }

    } catch (err) {
      dayResult.error = err instanceof Error ? err.message : String(err);
      this.result.summary.errors++;
    }

    return dayResult;
  }

  /**
   * Display daily progress
   */
  private displayDailyProgress(day: DayResult): void {
    if (this.options.json) return;

    const statusIcon = day.error ? chalk.red('✗') : chalk.green('✓');
    const dateStr = day.date.toLocaleDateString();
    
    console.log(`${statusIcon} Day ${day.day} (${dateStr}):`);
    
    if (day.workout) {
      console.log(`  • Workout: ${day.workout.sessionType} (${day.workout.blocks} blocks)`);
    }
    
    if (day.messagesSent) {
      console.log(`  • Messages sent`);
    }
    
    if (day.progress) {
      console.log(`  • Progress: Week ${day.progress.week}, Mesocycle ${day.progress.mesocycle}`);
    }
    
    if (day.error) {
      console.log(chalk.red(`  • Error: ${day.error}`));
    }
  }

  /**
   * Display cycle summary
   */
  private displaySummary(): void {
    if (this.options.json) {
      console.log(JSON.stringify(this.result, null, 2));
      return;
    }

    displayHeader('Daily Cycle Summary', '📊');

    // User info
    console.log(chalk.cyan('\nUser:'));
    console.log(`  ID: ${this.result.userId}`);
    if (this.result.userName) {
      console.log(`  Name: ${this.result.userName}`);
    }
    console.log(`  Days Simulated: ${this.result.daysSimulated}`);

    // Summary table
    console.log(chalk.cyan('\nActivity Summary:'));
    const summaryData = [
      ['Metric', 'Count', 'Percentage'],
      ['Workouts Generated', 
       this.result.summary.workoutsGenerated.toString(),
       `${(this.result.summary.workoutsGenerated / this.result.daysSimulated * 100).toFixed(1)}%`],
      ['Messages Sent',
       this.result.summary.messagesSent.toString(),
       `${(this.result.summary.messagesSent / this.result.daysSimulated * 100).toFixed(1)}%`],
      ['Progress Updates',
       this.result.summary.progressUpdates.toString(),
       `${(this.result.summary.progressUpdates / this.result.daysSimulated * 100).toFixed(1)}%`],
      ['Errors',
       this.result.summary.errors > 0 ? chalk.red(this.result.summary.errors.toString()) : '0',
       `${(this.result.summary.errors / this.result.daysSimulated * 100).toFixed(1)}%`],
    ];
    console.log(table(summaryData));

    // Day-by-day breakdown
    if (this.options.verbose) {
      console.log(chalk.cyan('\nDaily Breakdown:'));
      const dailyData = [
        ['Day', 'Date', 'Workout', 'Messages', 'Progress'],
        ...this.result.days.map(day => [
          day.day.toString(),
          day.date.toLocaleDateString(),
          day.workoutGenerated ? chalk.green('✓') : chalk.gray('-'),
          day.messagesSent ? chalk.green('✓') : chalk.gray('-'),
          day.progressUpdated ? chalk.green('✓') : chalk.gray('-'),
        ]),
      ];
      console.log(table(dailyData));
    }

    // Success message
    if (this.result.success) {
      success(`Daily cycle completed successfully in ${formatDuration(this.result.totalDuration)}`);
    } else {
      error('Daily cycle completed with errors');
    }
  }

  /**
   * Run the daily cycle simulation
   */
  async run(): Promise<void> {
    this.timer.start();

    if (!this.options.json) {
      displayHeader('Starting Daily Cycle Simulation', '🔄');
      console.log();
    }

    try {
      // Get user
      const userId = await this.getUser();
      
      if (!this.options.json) {
        info(`User: ${this.result.userName || userId}`);
        info(`Simulating ${this.options.days || 7} days`);
        console.log();
      }

      // Calculate dates
      const startDate = this.options.startDate 
        ? new Date(this.options.startDate)
        : new Date();
      
      const daysToSimulate = this.options.days || 7;
      this.result.daysSimulated = daysToSimulate;

      // Simulate each day
      for (let i = 0; i < daysToSimulate; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        if (!this.options.json) {
          console.log(chalk.blue(`\nDay ${i + 1}/${daysToSimulate}...`));
        }
        
        const dayResult = await this.simulateDay(userId, i + 1, currentDate);
        this.result.days.push(dayResult);
        
        if (!this.options.json && this.options.verbose) {
          this.displayDailyProgress(dayResult);
        }
        
        // Add delay to simulate realistic timing
        if (i < daysToSimulate - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      this.result.success = this.result.summary.errors === 0;

    } catch (err) {
      this.result.success = false;
      if (!this.options.json) {
        error(`Simulation failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    this.result.totalDuration = this.timer.elapsed();
    this.displaySummary();
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
  .name('test-flow-daily-cycle')
  .description('Simulate daily workout and message cycle for users')
  .version('1.0.0')
  .option('-u, --user-id <id>', 'User ID to simulate')
  .option('-p, --phone <phone>', 'Phone number of user to simulate')
  .option('-d, --days <days>', 'Number of days to simulate', parseInt)
  .option('-s, --start-date <date>', 'Start date for simulation (ISO format)')
  .option('--skip-messages', 'Skip message sending')
  .option('--skip-workouts', 'Skip workout generation')
  .option('--skip-progress', 'Skip progress tracking')
  .option('-v, --verbose', 'Show detailed output')
  .option('-j, --json', 'Output results as JSON')
  .action(async (options: DailyCycleOptions) => {
    const flow = new DailyCycleFlow(options);

    try {
      await flow.run();
    } catch (err) {
      if (options.json) {
        console.log(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      } else {
        error(`Flow failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      process.exit(1);
    } finally {
      await flow.cleanup();
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.outputHelp();
  console.log(chalk.gray('\nExamples:'));
  console.log(chalk.gray('  # Simulate 7 days for a random user'));
  console.log('  $ pnpm test:flow:daily');
  console.log();
  console.log(chalk.gray('  # Simulate specific user for 14 days'));
  console.log('  $ pnpm test:flow:daily --phone "+1234567890" --days 14');
  console.log();
  console.log(chalk.gray('  # Simulate from specific date'));
  console.log('  $ pnpm test:flow:daily --start-date "2024-01-01" --days 30');
  console.log();
  console.log(chalk.gray('  # Skip messages for faster testing'));
  console.log('  $ pnpm test:flow:daily --skip-messages --verbose');
  console.log();
  console.log(chalk.gray('  # Output as JSON for automation'));
  console.log('  $ pnpm test:flow:daily --json');
}

program.parse(process.argv);