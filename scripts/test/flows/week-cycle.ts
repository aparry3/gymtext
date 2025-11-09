#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader } from '../../utils/common';

interface WeekCycleOptions {
  userId?: string;
  phone?: string;
  weeks?: number;
  startDate?: string;
  skipWorkouts?: boolean;
  skipProgress?: boolean;
  skipTransitions?: boolean;
  verbose?: boolean;
  json?: boolean;
}

interface WeekResult {
  week: number;
  startDate: Date;
  endDate: Date;
  microcycleWeek: number;
  mesocycleIndex: number;
  workouts: {
    generated: number;
    types: string[];
  };
  pattern?: {
    id: string;
    generated: boolean;
    workoutTypes: string[];
  };
  transition?: {
    type: 'microcycle' | 'mesocycle' | 'none';
    from?: number;
    to?: number;
  };
  progress: {
    workoutsCompleted: number;
    totalLoad?: number;
    averageIntensity?: number;
  };
  error?: string;
}

interface CycleResult {
  success: boolean;
  userId: string;
  userName?: string;
  weeksSimulated: number;
  weeks: WeekResult[];
  summary: {
    totalWorkouts: number;
    patternsGenerated: number;
    microcycleTransitions: number;
    mesocycleTransitions: number;
    errors: number;
  };
  totalDuration: number;
}

class WeekCycleFlow {
  private db: TestDatabase;
  private config: TestConfig;
  private timer: Timer;
  private options: WeekCycleOptions;
  private result: CycleResult;

  constructor(options: WeekCycleOptions) {
    this.options = options;
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.timer = new Timer();
    this.result = {
      success: false,
      userId: '',
      weeksSimulated: 0,
      weeks: [],
      summary: {
        totalWorkouts: 0,
        patternsGenerated: 0,
        microcycleTransitions: 0,
        mesocycleTransitions: 0,
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
      // Get a random active user with a fitness plan
      const users = await this.db.getActiveUsers();
      for (const user of users) {
        const plan = await this.db.getFitnessPlan(user.id);
        if (plan) {
          userId = user.id;
          break;
        }
      }
      
      if (!userId) {
        throw new Error('No active users with fitness plans found');
      }
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
   * Generate microcycle pattern for a week
   */
  private async generateMicrocyclePattern(userId: string, week: number): Promise<any> {
    try {
      const apiUrl = this.config.getApiUrl('/microcycle/generate');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          weekNumber: week,
        }),
      });

      if (response.ok) {
        const pattern = await response.json();
        this.result.summary.patternsGenerated++;
        return pattern;
      }
    } catch (err) {
      if (this.options.verbose) {
        warning(`Pattern generation failed for week ${week}: ${err}`);
      }
    }
    return null;
  }

  /**
   * Simulate a single week
   */
  private async simulateWeek(userId: string, weekNumber: number, startDate: Date): Promise<WeekResult> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const weekResult: WeekResult = {
      week: weekNumber,
      startDate,
      endDate,
      microcycleWeek: 0,
      mesocycleIndex: 0,
      workouts: {
        generated: 0,
        types: [],
      },
      progress: {
        workoutsCompleted: 0,
      },
    };

    try {
      // NOTE: Progress tracking via DB is deprecated - now calculated from dates
      // const progressBefore = await this.db.getCurrentProgress(userId);
      // Use default values since progress is no longer stored in DB
      weekResult.microcycleWeek = weekNumber;
      weekResult.mesocycleIndex = 0;

      // Step 1: Generate microcycle pattern if it's the start of a new microcycle
      if (!this.options.skipWorkouts && weekResult.microcycleWeek % 4 === 1) {
        const pattern = await this.generateMicrocyclePattern(userId, weekResult.microcycleWeek);
        if (pattern) {
          weekResult.pattern = {
            id: pattern.id,
            generated: true,
            workoutTypes: pattern.pattern?.workoutTypes || [],
          };
        }
      }

      // Step 2: Generate workouts for each day of the week
      if (!this.options.skipWorkouts) {
        const workoutTypes = new Set<string>();
        
        for (let day = 0; day < 7; day++) {
          const workoutDate = new Date(startDate);
          workoutDate.setDate(startDate.getDate() + day);
          
          // Skip weekends for this simulation (configurable in real implementation)
          if (workoutDate.getDay() === 0 || workoutDate.getDay() === 6) {
            continue;
          }

          try {
            const apiUrl = this.config.getApiUrl('/workouts/generate');
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                date: workoutDate.toISOString(),
              }),
            });

            if (response.ok) {
              const workout = await response.json();
              weekResult.workouts.generated++;
              workoutTypes.add(workout.sessionType);
              this.result.summary.totalWorkouts++;
            }
          } catch (err) {
            if (this.options.verbose) {
              warning(`Workout generation failed for day ${day + 1}: ${err}`);
            }
          }
        }
        
        weekResult.workouts.types = Array.from(workoutTypes);
      }

      // Step 3: Update progress at end of week
      if (!this.options.skipProgress) {
        try {
          // Simulate weekly progress update
          const apiUrl = this.config.getApiUrl('/progress/weekly');
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              weekNumber,
              workoutsCompleted: weekResult.workouts.generated,
            }),
          });

          if (response.ok) {
            // NOTE: Progress tracking via DB is deprecated
            // const progressAfter = await this.db.getCurrentProgress(userId);
            weekResult.progress.workoutsCompleted = weekResult.workouts.generated;

            // Transition tracking no longer supported without DB-based progress
            if (!this.options.skipTransitions) {
              // Transitions are no longer tracked this way
              weekResult.transition = { type: 'none' };
            }
          }
        } catch (err) {
          if (this.options.verbose) {
            warning(`Progress update failed for week ${weekNumber}: ${err}`);
          }
        }
      }

      // Add some simulated metrics
      if (weekResult.workouts.generated > 0) {
        weekResult.progress.totalLoad = Math.round(1000 + Math.random() * 500) * weekResult.workouts.generated;
        weekResult.progress.averageIntensity = 65 + Math.random() * 20;
      }

    } catch (err) {
      weekResult.error = err instanceof Error ? err.message : String(err);
      this.result.summary.errors++;
    }

    return weekResult;
  }

  /**
   * Display week progress
   */
  private displayWeekProgress(week: WeekResult): void {
    if (this.options.json) return;

    const statusIcon = week.error ? chalk.red('✗') : chalk.green('✓');
    const dateRange = `${week.startDate.toLocaleDateString()} - ${week.endDate.toLocaleDateString()}`;
    
    console.log(`${statusIcon} Week ${week.week} (${dateRange}):`);
    console.log(`  • Microcycle Week: ${week.microcycleWeek}, Mesocycle: ${week.mesocycleIndex}`);
    
    if (week.workouts.generated > 0) {
      console.log(`  • Workouts: ${week.workouts.generated} (${week.workouts.types.join(', ')})`);
    }
    
    if (week.pattern) {
      console.log(`  • Pattern generated: ${week.pattern.workoutTypes.join(', ')}`);
    }
    
    if (week.transition && week.transition.type !== 'none') {
      const transitionText = week.transition.type === 'mesocycle' 
        ? `Mesocycle ${week.transition.from} → ${week.transition.to}`
        : `Week ${week.transition.from} → ${week.transition.to}`;
      console.log(chalk.yellow(`  • Transition: ${transitionText}`));
    }
    
    if (week.progress.totalLoad) {
      console.log(`  • Total Load: ${week.progress.totalLoad.toLocaleString()} lbs`);
    }
    
    if (week.error) {
      console.log(chalk.red(`  • Error: ${week.error}`));
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

    displayHeader('Weekly Cycle Summary', '📈');

    // User info
    console.log(chalk.cyan('\nUser:'));
    console.log(`  ID: ${this.result.userId}`);
    if (this.result.userName) {
      console.log(`  Name: ${this.result.userName}`);
    }
    console.log(`  Weeks Simulated: ${this.result.weeksSimulated}`);

    // Summary table
    console.log(chalk.cyan('\nProgression Summary:'));
    const summaryData = [
      ['Metric', 'Count', 'Average/Week'],
      ['Total Workouts', 
       this.result.summary.totalWorkouts.toString(),
       (this.result.summary.totalWorkouts / this.result.weeksSimulated).toFixed(1)],
      ['Patterns Generated',
       this.result.summary.patternsGenerated.toString(),
       (this.result.summary.patternsGenerated / this.result.weeksSimulated).toFixed(2)],
      ['Microcycle Transitions',
       this.result.summary.microcycleTransitions.toString(),
       '-'],
      ['Mesocycle Transitions',
       this.result.summary.mesocycleTransitions.toString(),
       '-'],
      ['Errors',
       this.result.summary.errors > 0 ? chalk.red(this.result.summary.errors.toString()) : '0',
       '-'],
    ];
    console.log(table(summaryData));

    // Week-by-week breakdown
    if (this.options.verbose) {
      console.log(chalk.cyan('\nWeekly Breakdown:'));
      const weeklyData = [
        ['Week', 'Dates', 'Workouts', 'Pattern', 'Transition'],
        ...this.result.weeks.map(week => [
          week.week.toString(),
          `${week.startDate.toLocaleDateString()} - ${week.endDate.toLocaleDateString()}`,
          week.workouts.generated.toString(),
          week.pattern ? chalk.green('✓') : chalk.gray('-'),
          week.transition?.type === 'none' ? chalk.gray('-') : 
            week.transition?.type === 'mesocycle' ? chalk.yellow('Meso') : chalk.blue('Micro'),
        ]),
      ];
      console.log(table(weeklyData));
    }

    // Transition analysis
    if (this.result.summary.microcycleTransitions > 0 || this.result.summary.mesocycleTransitions > 0) {
      console.log(chalk.cyan('\nTransition Analysis:'));
      console.log(`  Microcycle Transitions: ${this.result.summary.microcycleTransitions}`);
      console.log(`  Mesocycle Transitions: ${this.result.summary.mesocycleTransitions}`);
      
      const avgWeeksPerMicro = this.result.weeksSimulated / (this.result.summary.microcycleTransitions + 1);
      console.log(`  Average Weeks per Microcycle: ${avgWeeksPerMicro.toFixed(1)}`);
    }

    // Success message
    if (this.result.success) {
      success(`Weekly cycle completed successfully in ${formatDuration(this.result.totalDuration)}`);
    } else {
      error('Weekly cycle completed with errors');
    }
  }

  /**
   * Run the weekly cycle simulation
   */
  async run(): Promise<void> {
    this.timer.start();

    if (!this.options.json) {
      displayHeader('Starting Weekly Cycle Simulation', '📅');
      console.log();
    }

    try {
      // Get user
      const userId = await this.getUser();
      
      if (!this.options.json) {
        info(`User: ${this.result.userName || userId}`);
        info(`Simulating ${this.options.weeks || 4} weeks`);
        console.log();
      }

      // Calculate dates
      const startDate = this.options.startDate 
        ? new Date(this.options.startDate)
        : new Date();
      
      // Start from Monday
      const dayOfWeek = startDate.getDay();
      if (dayOfWeek !== 1) {
        const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        startDate.setDate(startDate.getDate() + daysToMonday);
      }
      
      const weeksToSimulate = this.options.weeks || 4;
      this.result.weeksSimulated = weeksToSimulate;

      // Simulate each week
      for (let i = 0; i < weeksToSimulate; i++) {
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + (i * 7));
        
        if (!this.options.json) {
          console.log(chalk.blue(`\nWeek ${i + 1}/${weeksToSimulate}...`));
        }
        
        const weekResult = await this.simulateWeek(userId, i + 1, weekStartDate);
        this.result.weeks.push(weekResult);
        
        if (!this.options.json && this.options.verbose) {
          this.displayWeekProgress(weekResult);
        }
        
        // Add delay to simulate realistic timing
        if (i < weeksToSimulate - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
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
  .name('test-flow-week-cycle')
  .description('Simulate weekly progression and transitions for users')
  .version('1.0.0')
  .option('-u, --user-id <id>', 'User ID to simulate')
  .option('-p, --phone <phone>', 'Phone number of user to simulate')
  .option('-w, --weeks <weeks>', 'Number of weeks to simulate', parseInt)
  .option('-s, --start-date <date>', 'Start date for simulation (ISO format)')
  .option('--skip-workouts', 'Skip workout generation')
  .option('--skip-progress', 'Skip progress tracking')
  .option('--skip-transitions', 'Skip transition detection')
  .option('-v, --verbose', 'Show detailed output')
  .option('-j, --json', 'Output results as JSON')
  .action(async (options: WeekCycleOptions) => {
    const flow = new WeekCycleFlow(options);

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
  console.log(chalk.gray('  # Simulate 4 weeks for a random user'));
  console.log('  $ pnpm test:flow:week');
  console.log();
  console.log(chalk.gray('  # Simulate specific user for 12 weeks'));
  console.log('  $ pnpm test:flow:week --phone "+1234567890" --weeks 12');
  console.log();
  console.log(chalk.gray('  # Simulate from specific date'));
  console.log('  $ pnpm test:flow:week --start-date "2024-01-01" --weeks 8');
  console.log();
  console.log(chalk.gray('  # Show detailed progress'));
  console.log('  $ pnpm test:flow:week --weeks 8 --verbose');
  console.log();
  console.log(chalk.gray('  # Skip workouts for faster testing'));
  console.log('  $ pnpm test:flow:week --skip-workouts --weeks 12');
  console.log();
  console.log(chalk.gray('  # Output as JSON for automation'));
  console.log('  $ pnpm test:flow:week --json');
}

program.parse(process.argv);