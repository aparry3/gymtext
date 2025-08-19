#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader, spinner } from '../../utils/common';
import { TestUsers } from '../../utils/users';

interface OnboardingOptions {
  name?: string;
  phone?: string;
  email?: string;
  goals?: string;
  level?: string;
  frequency?: string;
  age?: number;
  gender?: string;
  skipPayment?: boolean;
  skipPlan?: boolean;
  skipWelcome?: boolean;
  skipWorkout?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  json?: boolean;
}

interface OnboardingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  result?: any;
}

interface OnboardingResult {
  success: boolean;
  userId?: string;
  steps: OnboardingStep[];
  totalDuration: number;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  fitnessProfile?: {
    goals: string;
    level: string;
    frequency: string;
  };
  fitnessPlan?: {
    id: string;
    programType: string;
    lengthWeeks: number;
  };
  welcomeMessages?: {
    count: number;
    sent: boolean;
  };
  firstWorkout?: {
    id: string;
    date: Date;
    sessionType: string;
  };
}

class OnboardingFlow {
  private db: TestDatabase;
  private config: TestConfig;
  private users: TestUsers;
  private timer: Timer;
  private options: OnboardingOptions;
  private steps: OnboardingStep[];
  private result: OnboardingResult;

  constructor(options: OnboardingOptions) {
    this.options = options;
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.users = TestUsers.getInstance();
    this.timer = new Timer();
    this.steps = [];
    this.result = {
      success: false,
      steps: this.steps,
      totalDuration: 0,
    };
  }

  /**
   * Initialize steps
   */
  private initializeSteps(): void {
    this.steps.push(
      { name: 'Create User Account', status: 'pending' },
      { name: 'Create Fitness Profile', status: 'pending' },
      { name: 'Process Payment', status: this.options.skipPayment ? 'skipped' : 'pending' },
      { name: 'Generate Fitness Plan', status: this.options.skipPlan ? 'skipped' : 'pending' },
      { name: 'Send Welcome Messages', status: this.options.skipWelcome ? 'skipped' : 'pending' },
      { name: 'Generate First Workout', status: this.options.skipWorkout ? 'skipped' : 'pending' },
      { name: 'Verify Setup', status: 'pending' }
    );
  }

  /**
   * Update step status
   */
  private updateStep(name: string, status: OnboardingStep['status'], error?: string, result?: any): void {
    const step = this.steps.find(s => s.name === name);
    if (step) {
      step.status = status;
      if (error) step.error = error;
      if (result) step.result = result;
      if (status === 'completed' || status === 'failed') {
        step.duration = this.timer.elapsed();
      }
    }
  }

  /**
   * Display progress
   */
  private displayProgress(): void {
    if (this.options.json) return;

    console.clear();
    displayHeader('Onboarding Flow Progress', '🚀');

    const data = [
      ['Step', 'Status', 'Duration'],
      ...this.steps.map(step => {
        let statusDisplay = '';
        switch (step.status) {
          case 'completed':
            statusDisplay = chalk.green('✓ Completed');
            break;
          case 'running':
            statusDisplay = chalk.yellow('⟳ Running...');
            break;
          case 'failed':
            statusDisplay = chalk.red('✗ Failed');
            break;
          case 'skipped':
            statusDisplay = chalk.gray('- Skipped');
            break;
          default:
            statusDisplay = chalk.gray('○ Pending');
        }

        return [
          step.name,
          statusDisplay,
          step.duration ? formatDuration(step.duration) : '-',
        ];
      }),
    ];

    console.log(table(data));

    // Show current error if any
    const failedStep = this.steps.find(s => s.status === 'failed');
    if (failedStep && failedStep.error) {
      error(`Error in ${failedStep.name}: ${failedStep.error}`);
    }
  }

  /**
   * Step 1: Create user account
   */
  private async createUser(): Promise<string> {
    this.updateStep('Create User Account', 'running');
    this.displayProgress();

    const userData = {
      name: this.options.name || `Test User ${Date.now()}`,
      phone: this.options.phone || `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      email: this.options.email || `test${Date.now()}@example.com`,
    };

    try {
      if (this.options.dryRun) {
        // In dry run, simulate user creation
        const simulatedUserId = `sim_${Date.now()}`;
        this.updateStep('Create User Account', 'completed', undefined, userData);
        this.result.user = { id: simulatedUserId, ...userData };
        return simulatedUserId;
      }

      // Create user via API
      const apiUrl = this.config.getApiUrl('/checkout');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          skipPayment: true, // We'll handle payment separately
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      const result = await response.json();
      this.updateStep('Create User Account', 'completed', undefined, userData);
      this.result.user = { id: result.userId, ...userData };
      return result.userId;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Create User Account', 'failed', errorMsg);
      throw err;
    }
  }

  /**
   * Step 2: Create fitness profile
   */
  private async createFitnessProfile(userId: string): Promise<void> {
    this.updateStep('Create Fitness Profile', 'running');
    this.displayProgress();

    const profileData = {
      fitnessGoals: this.options.goals || 'Build muscle and increase strength',
      skillLevel: this.options.level || 'intermediate',
      exerciseFrequency: this.options.frequency || '4x per week',
      age: this.options.age || 30,
      gender: this.options.gender || 'male',
    };

    try {
      if (this.options.dryRun) {
        this.updateStep('Create Fitness Profile', 'completed', undefined, profileData);
        this.result.fitnessProfile = {
          goals: profileData.fitnessGoals,
          level: profileData.skillLevel,
          frequency: profileData.exerciseFrequency,
        };
        return;
      }

      // Update profile via database (now stored in users table)
      await this.db.db
        .updateTable('users')
        .set({
          profile: profileData,
          updatedAt: new Date(),
        })
        .where('id', '=', userId)
        .execute();

      this.updateStep('Create Fitness Profile', 'completed', undefined, profileData);
      this.result.fitnessProfile = {
        goals: profileData.fitnessGoals,
        level: profileData.skillLevel,
        frequency: profileData.exerciseFrequency,
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Create Fitness Profile', 'failed', errorMsg);
      throw err;
    }
  }

  /**
   * Step 3: Process payment
   */
  private async processPayment(userId: string): Promise<void> {
    if (this.options.skipPayment) {
      return;
    }

    this.updateStep('Process Payment', 'running');
    this.displayProgress();

    try {
      if (this.options.dryRun) {
        this.updateStep('Process Payment', 'completed', undefined, { method: 'simulated' });
        return;
      }

      // Simulate Stripe payment processing
      // In real implementation, this would integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create subscription record
      await this.db.db
        .insertInto('subscriptions')
        .values({
          userId,
          stripeSubscriptionId: `sub_test_${Date.now()}`,
          status: 'active',
          planType: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .execute();

      this.updateStep('Process Payment', 'completed', undefined, { method: 'stripe' });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Process Payment', 'failed', errorMsg);
      throw err;
    }
  }

  /**
   * Step 4: Generate fitness plan
   */
  private async generateFitnessPlan(userId: string): Promise<void> {
    if (this.options.skipPlan) {
      return;
    }

    this.updateStep('Generate Fitness Plan', 'running');
    this.displayProgress();

    try {
      if (this.options.dryRun) {
        const simulatedPlan = {
          id: `plan_${Date.now()}`,
          programType: 'strength',
          lengthWeeks: 12,
        };
        this.updateStep('Generate Fitness Plan', 'completed', undefined, simulatedPlan);
        this.result.fitnessPlan = simulatedPlan;
        return;
      }

      // Call fitness plan generation API
      const apiUrl = this.config.getApiUrl('/fitness-plans/generate');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate fitness plan: ${response.statusText}`);
      }

      const plan = await response.json();
      this.updateStep('Generate Fitness Plan', 'completed', undefined, plan);
      this.result.fitnessPlan = {
        id: plan.id,
        programType: plan.programType,
        lengthWeeks: plan.lengthWeeks,
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Generate Fitness Plan', 'failed', errorMsg);
      throw err;
    }
  }

  /**
   * Step 5: Send welcome messages
   */
  private async sendWelcomeMessages(userId: string): Promise<void> {
    if (this.options.skipWelcome) {
      return;
    }

    this.updateStep('Send Welcome Messages', 'running');
    this.displayProgress();

    try {
      if (this.options.dryRun) {
        this.updateStep('Send Welcome Messages', 'completed', undefined, { count: 3, sent: true });
        this.result.welcomeMessages = { count: 3, sent: true };
        return;
      }

      // Send welcome SMS sequence
      const apiUrl = this.config.getApiUrl('/messages/welcome');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send welcome messages: ${response.statusText}`);
      }

      const result = await response.json();
      this.updateStep('Send Welcome Messages', 'completed', undefined, result);
      this.result.welcomeMessages = {
        count: result.messageCount || 3,
        sent: true,
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Send Welcome Messages', 'failed', errorMsg);
      // Don't throw - welcome messages are not critical
      warning(`Welcome messages failed: ${errorMsg}`);
    }
  }

  /**
   * Step 6: Generate first workout
   */
  private async generateFirstWorkout(userId: string): Promise<void> {
    if (this.options.skipWorkout) {
      return;
    }

    this.updateStep('Generate First Workout', 'running');
    this.displayProgress();

    try {
      if (this.options.dryRun) {
        const simulatedWorkout = {
          id: `workout_${Date.now()}`,
          date: new Date(),
          sessionType: 'upper_body',
        };
        this.updateStep('Generate First Workout', 'completed', undefined, simulatedWorkout);
        this.result.firstWorkout = simulatedWorkout;
        return;
      }

      // Generate first workout
      const apiUrl = this.config.getApiUrl('/workouts/generate');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate first workout: ${response.statusText}`);
      }

      const workout = await response.json();
      this.updateStep('Generate First Workout', 'completed', undefined, workout);
      this.result.firstWorkout = {
        id: workout.id,
        date: new Date(workout.date),
        sessionType: workout.sessionType,
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Generate First Workout', 'failed', errorMsg);
      // Don't throw - first workout is not critical
      warning(`First workout generation failed: ${errorMsg}`);
    }
  }

  /**
   * Step 7: Verify setup
   */
  private async verifySetup(userId: string): Promise<void> {
    this.updateStep('Verify Setup', 'running');
    this.displayProgress();

    try {
      if (this.options.dryRun) {
        this.updateStep('Verify Setup', 'completed', undefined, { verified: true });
        return;
      }

      // Verify user exists
      const user = await this.db.getUserWithProfile(userId);
      if (!user) {
        throw new Error('User not found after creation');
      }

      // Verify fitness plan exists
      if (!this.options.skipPlan) {
        const plan = await this.db.getFitnessPlan(userId);
        if (!plan) {
          throw new Error('Fitness plan not found after generation');
        }
      }

      // Verify subscription exists
      if (!this.options.skipPayment) {
        const subscription = await this.db.db
          .selectFrom('subscriptions')
          .where('userId', '=', userId)
          .selectAll()
          .executeTakeFirst();
        
        if (!subscription) {
          throw new Error('Subscription not found after payment');
        }
      }

      this.updateStep('Verify Setup', 'completed', undefined, { verified: true });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateStep('Verify Setup', 'failed', errorMsg);
      throw err;
    }
  }

  /**
   * Display final results
   */
  private displayResults(): void {
    if (this.options.json) {
      console.log(JSON.stringify(this.result, null, 2));
      return;
    }

    displayHeader('Onboarding Complete', '✅');

    // User details
    if (this.result.user) {
      console.log(chalk.cyan('\nUser Account:'));
      console.log(`  ID: ${this.result.user.id}`);
      console.log(`  Name: ${this.result.user.name}`);
      console.log(`  Phone: ${this.result.user.phone}`);
      if (this.result.user.email) {
        console.log(`  Email: ${this.result.user.email}`);
      }
    }

    // Fitness profile
    if (this.result.fitnessProfile) {
      console.log(chalk.cyan('\nFitness Profile:'));
      console.log(`  Goals: ${this.result.fitnessProfile.goals}`);
      console.log(`  Level: ${this.result.fitnessProfile.level}`);
      console.log(`  Frequency: ${this.result.fitnessProfile.frequency}`);
    }

    // Fitness plan
    if (this.result.fitnessPlan) {
      console.log(chalk.cyan('\nFitness Plan:'));
      console.log(`  ID: ${this.result.fitnessPlan.id}`);
      console.log(`  Type: ${this.result.fitnessPlan.programType}`);
      console.log(`  Duration: ${this.result.fitnessPlan.lengthWeeks} weeks`);
    }

    // Welcome messages
    if (this.result.welcomeMessages) {
      console.log(chalk.cyan('\nWelcome Messages:'));
      console.log(`  Sent: ${this.result.welcomeMessages.sent ? 'Yes' : 'No'}`);
      console.log(`  Count: ${this.result.welcomeMessages.count}`);
    }

    // First workout
    if (this.result.firstWorkout) {
      console.log(chalk.cyan('\nFirst Workout:'));
      console.log(`  ID: ${this.result.firstWorkout.id}`);
      console.log(`  Date: ${this.result.firstWorkout.date.toLocaleDateString()}`);
      console.log(`  Type: ${this.result.firstWorkout.sessionType}`);
    }

    // Summary table
    console.log(chalk.cyan('\nStep Summary:'));
    const summaryData = [
      ['Step', 'Status', 'Duration'],
      ...this.steps.map(step => {
        let statusIcon = '';
        switch (step.status) {
          case 'completed': statusIcon = chalk.green('✓'); break;
          case 'failed': statusIcon = chalk.red('✗'); break;
          case 'skipped': statusIcon = chalk.gray('-'); break;
        }
        return [
          step.name,
          statusIcon,
          step.duration ? formatDuration(step.duration) : '-',
        ];
      }),
      ['─────────', '───', '─────────'],
      ['Total', this.result.success ? chalk.green('✓') : chalk.red('✗'), formatDuration(this.result.totalDuration)],
    ];
    console.log(table(summaryData));

    if (this.result.success) {
      success('Onboarding flow completed successfully!');
    } else {
      error('Onboarding flow completed with errors');
    }
  }

  /**
   * Run the onboarding flow
   */
  async run(): Promise<void> {
    this.timer.start();
    this.initializeSteps();

    if (!this.options.json) {
      displayHeader('Starting Onboarding Flow', '🚀');
      
      if (this.options.dryRun) {
        warning('DRY RUN MODE - No actual changes will be made');
      }
      
      console.log();
    }

    try {
      // Step 1: Create user
      const userId = await this.createUser();
      this.result.userId = userId;

      // Step 2: Create fitness profile
      await this.createFitnessProfile(userId);

      // Step 3: Process payment
      await this.processPayment(userId);

      // Step 4: Generate fitness plan
      await this.generateFitnessPlan(userId);

      // Step 5: Send welcome messages
      await this.sendWelcomeMessages(userId);

      // Step 6: Generate first workout
      await this.generateFirstWorkout(userId);

      // Step 7: Verify setup
      await this.verifySetup(userId);

      this.result.success = true;

    } catch (err) {
      this.result.success = false;
      if (!this.options.json) {
        error(`Flow failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    this.result.totalDuration = this.timer.elapsed();
    this.displayResults();
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
  .name('test-flow-onboarding')
  .description('Test complete onboarding flow for new users')
  .version('1.0.0')
  .option('-n, --name <name>', 'User name')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-e, --email <email>', 'Email address')
  .option('-g, --goals <goals>', 'Fitness goals')
  .option('-l, --level <level>', 'Skill level (beginner/intermediate/advanced)')
  .option('-f, --frequency <frequency>', 'Exercise frequency')
  .option('-a, --age <age>', 'User age', parseInt)
  .option('--gender <gender>', 'User gender')
  .option('--skip-payment', 'Skip payment processing')
  .option('--skip-plan', 'Skip fitness plan generation')
  .option('--skip-welcome', 'Skip welcome messages')
  .option('--skip-workout', 'Skip first workout generation')
  .option('--dry-run', 'Run without making actual changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('-j, --json', 'Output results as JSON')
  .action(async (options: OnboardingOptions) => {
    const flow = new OnboardingFlow(options);

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
  console.log(chalk.gray('  # Complete onboarding with defaults'));
  console.log('  $ pnpm test:flow:onboarding');
  console.log();
  console.log(chalk.gray('  # Onboarding with custom user'));
  console.log('  $ pnpm test:flow:onboarding --name "John Doe" --phone "+1234567890"');
  console.log();
  console.log(chalk.gray('  # Skip payment for testing'));
  console.log('  $ pnpm test:flow:onboarding --skip-payment');
  console.log();
  console.log(chalk.gray('  # Dry run to see what would happen'));
  console.log('  $ pnpm test:flow:onboarding --dry-run');
  console.log();
  console.log(chalk.gray('  # Full custom onboarding'));
  console.log('  $ pnpm test:flow:onboarding --name "Jane Smith" --goals "Build strength" \\');
  console.log('    --level intermediate --frequency "4x per week"');
}

program.parse(process.argv);