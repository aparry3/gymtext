#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { success, error, warning, info, displayHeader } from '../../utils/common';
import { inngest } from '@/server/connections/inngest/client';
import readline from 'readline';

interface ResetOptions {
  phone?: string;
  userId?: string;
  yes?: boolean;
  verbose?: boolean;
}

interface ResetStats {
  workoutsDeleted: number;
  microcyclesDeleted: number;
  mesocyclesDeleted: number;
  plansDeleted: number;
  subscriptionCreated: boolean;
  onboardingReset: boolean;
  eventTriggered: boolean;
}

class OnboardingReset {
  private db: TestDatabase;
  private options: ResetOptions;
  private stats: ResetStats;

  constructor(options: ResetOptions) {
    this.options = options;
    this.db = TestDatabase.getInstance();
    this.stats = {
      workoutsDeleted: 0,
      microcyclesDeleted: 0,
      mesocyclesDeleted: 0,
      plansDeleted: 0,
      subscriptionCreated: false,
      onboardingReset: false,
      eventTriggered: false,
    };
  }

  /**
   * Get user from phone or ID
   */
  private async getUser(): Promise<{ id: string; phoneNumber: string; name: string } | null> {
    if (this.options.userId) {
      const user = await this.db.getUserById(this.options.userId);
      if (!user) {
        error(`User not found with ID: ${this.options.userId}`);
        return null;
      }
      return user;
    }

    if (this.options.phone) {
      // Ensure phone is in E.164 format
      const phone = this.options.phone.startsWith('+') ? this.options.phone : `+${this.options.phone}`;
      const user = await this.db.getUserByPhone(phone);
      if (!user) {
        error(`User not found with phone: ${phone}`);
        return null;
      }
      return user;
    }

    error('No user identifier provided. Use --phone or --user-id');
    return null;
  }

  /**
   * Prompt for confirmation
   */
  private async confirm(message: string): Promise<boolean> {
    if (this.options.yes) {
      return true;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(chalk.yellow(`${message} (y/N): `), (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * Delete fitness data
   */
  private async deleteFitnessData(userId: string): Promise<void> {
    info('Deleting fitness data...');

    // Delete workout instances
    const workouts = await this.db.db
      .deleteFrom('workoutInstances')
      .where('clientId', '=', userId)
      .executeTakeFirst();
    this.stats.workoutsDeleted = Number(workouts.numDeletedRows || 0);
    if (this.options.verbose) {
      console.log(chalk.gray(`  Deleted ${this.stats.workoutsDeleted} workout instances`));
    }

    // Delete microcycles
    const microcycles = await this.db.db
      .deleteFrom('microcycles')
      .where('userId', '=', userId)
      .executeTakeFirst();
    this.stats.microcyclesDeleted = Number(microcycles.numDeletedRows || 0);
    if (this.options.verbose) {
      console.log(chalk.gray(`  Deleted ${this.stats.microcyclesDeleted} microcycles`));
    }

    // Delete mesocycles (if table exists)
    try {
      const mesocycles = await this.db.db
        .deleteFrom('mesocycles')
        .where('userId', '=', userId)
        .executeTakeFirst();
      this.stats.mesocyclesDeleted = Number(mesocycles.numDeletedRows || 0);
      if (this.options.verbose) {
        console.log(chalk.gray(`  Deleted ${this.stats.mesocyclesDeleted} mesocycles`));
      }
    } catch (err) {
      // Table might not exist in older schemas
      if (this.options.verbose) {
        console.log(chalk.gray('  Mesocycles table not found (skipping)'));
      }
    }

    // Delete fitness plans
    const plans = await this.db.db
      .deleteFrom('fitnessPlans')
      .where('clientId', '=', userId)
      .executeTakeFirst();
    this.stats.plansDeleted = Number(plans.numDeletedRows || 0);
    if (this.options.verbose) {
      console.log(chalk.gray(`  Deleted ${this.stats.plansDeleted} fitness plans`));
    }

    success('Fitness data deleted successfully');
  }

  /**
   * Ensure free subscription exists
   */
  private async ensureFreeSubscription(userId: string): Promise<void> {
    info('Checking subscription...');

    // Check if subscription exists
    const existingSub = await this.db.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (existingSub) {
      if (this.options.verbose) {
        console.log(chalk.gray(`  Existing subscription found: ${existingSub.stripeSubscriptionId}`));
      }
      success('Subscription already exists');
      return;
    }

    // Create free subscription
    await this.db.db
      .insertInto('subscriptions')
      .values({
        userId,
        stripeSubscriptionId: `free_dev_${userId}`,
        status: 'active',
        planType: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date('2125-01-01'), // Far future date
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .execute();

    this.stats.subscriptionCreated = true;
    success('Free subscription created');
  }

  /**
   * Reset onboarding status
   */
  private async resetOnboardingStatus(userId: string): Promise<void> {
    info('Resetting onboarding status...');

    // Check if onboarding record exists
    const onboarding = await this.db.db
      .selectFrom('userOnboarding')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (!onboarding) {
      error('No onboarding record found - cannot reset');
      return;
    }

    // Reset onboarding status
    await this.db.db
      .updateTable('userOnboarding')
      .set({
        status: 'pending',
        currentStep: 0,
        completedAt: null,
        programMessagesSent: false,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where('userId', '=', userId)
      .execute();

    this.stats.onboardingReset = true;
    success('Onboarding status reset to pending');
  }

  /**
   * Trigger onboarding event
   */
  private async triggerOnboarding(userId: string): Promise<void> {
    info('Triggering onboarding event...');

    try {
      await inngest.send({
        name: 'user/onboarding.requested',
        data: {
          userId,
        },
      });

      this.stats.eventTriggered = true;
      success('Onboarding event triggered successfully');
    } catch (err) {
      error(`Failed to trigger onboarding event: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  /**
   * Display summary
   */
  private displaySummary(user: { id: string; phoneNumber: string; name: string }): void {
    console.log('\n');
    displayHeader('Reset Complete', '✅');

    console.log(chalk.cyan('\nUser:'));
    console.log(`  Name: ${user.name}`);
    console.log(`  Phone: ${user.phoneNumber}`);
    console.log(`  ID: ${user.id}`);

    console.log(chalk.cyan('\nActions Taken:'));
    const data = [
      ['Action', 'Result'],
      ['Workout Instances Deleted', this.stats.workoutsDeleted.toString()],
      ['Microcycles Deleted', this.stats.microcyclesDeleted.toString()],
      ['Mesocycles Deleted', this.stats.mesocyclesDeleted.toString()],
      ['Fitness Plans Deleted', this.stats.plansDeleted.toString()],
      ['Free Subscription', this.stats.subscriptionCreated ? 'Created' : 'Already Exists'],
      ['Onboarding Status', this.stats.onboardingReset ? 'Reset to Pending' : 'Not Reset'],
      ['Onboarding Event', this.stats.eventTriggered ? 'Triggered' : 'Not Triggered'],
    ];
    console.log(table(data));

    console.log(chalk.green('\n✓ Onboarding flow will now regenerate fitness plan, microcycle, and workout'));
    console.log(chalk.gray('  Monitor Inngest dashboard for progress'));
  }

  /**
   * Run the reset
   */
  async run(): Promise<void> {
    displayHeader('Reset User Onboarding', '🔄');

    // Get user
    const user = await this.getUser();
    if (!user) {
      process.exit(1);
    }

    console.log(chalk.cyan('\nUser Found:'));
    console.log(`  Name: ${user.name}`);
    console.log(`  Phone: ${user.phoneNumber}`);
    console.log(`  ID: ${user.id}`);

    // Confirm
    const confirmed = await this.confirm(
      '\nThis will delete all fitness data (plans, microcycles, workouts) and re-trigger onboarding. Continue?'
    );
    if (!confirmed) {
      warning('Reset cancelled');
      process.exit(0);
    }

    console.log('\n');

    try {
      // Step 1: Delete fitness data
      await this.deleteFitnessData(user.id);

      // Step 2: Ensure free subscription
      await this.ensureFreeSubscription(user.id);

      // Step 3: Reset onboarding status
      await this.resetOnboardingStatus(user.id);

      // Step 4: Trigger onboarding
      await this.triggerOnboarding(user.id);

      // Display summary
      this.displaySummary(user);
    } catch (err) {
      error(`Reset failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  }

  /**
   * Cleanup
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
  .name('reset-onboarding')
  .description('Reset user onboarding flow - deletes fitness data and re-triggers onboarding')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'User phone number (E.164 format, e.g., +1234567890)')
  .option('-u, --user-id <userId>', 'User ID')
  .option('-y, --yes', 'Skip confirmation prompt')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options: ResetOptions) => {
    if (!options.phone && !options.userId) {
      error('You must provide either --phone or --user-id');
      program.outputHelp();
      process.exit(1);
    }

    const reset = new OnboardingReset(options);

    try {
      await reset.run();
    } catch (err) {
      error(`Reset failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    } finally {
      await reset.cleanup();
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.outputHelp();
  console.log(chalk.gray('\nExamples:'));
  console.log(chalk.gray('  # Reset using phone number'));
  console.log('  $ pnpm test:user:reset --phone +1234567890');
  console.log();
  console.log(chalk.gray('  # Reset using user ID'));
  console.log('  $ pnpm test:user:reset --user-id abc123');
  console.log();
  console.log(chalk.gray('  # Skip confirmation prompt'));
  console.log('  $ pnpm test:user:reset --phone +1234567890 --yes');
  console.log();
  console.log(chalk.gray('  # Verbose output'));
  console.log('  $ pnpm test:user:reset --phone +1234567890 --verbose');
}

program.parse(process.argv);
