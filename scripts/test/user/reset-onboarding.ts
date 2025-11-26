#!/usr/bin/env tsx

/**
 * Reset Onboarding Script
 *
 * Resets a user's onboarding state for testing purposes.
 * Cleans up all generated data while preserving the user account,
 * then optionally restarts the onboarding flow.
 *
 * Usage:
 *   pnpm test:onboarding:reset -p "+14155551234"
 *   pnpm test:onboarding:reset -p "+14155551234" -s 3  # Start from step 3
 *   pnpm test:onboarding:reset -p "+14155551234" --dry-run
 *   pnpm test:onboarding:reset -p "+14155551234" --skip-trigger
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Import database and services after env is loaded
import { postgresDb } from '@/server/connections/postgres/postgres';
import { inngest } from '@/server/connections/inngest/client';

interface ResetOptions {
  phone: string;
  step?: number;
  skipTrigger?: boolean;
  yes?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
}

interface DeleteCounts {
  messageQueue: number;
  messages: number;
  workouts: number;
  microcycles: number;
  fitnessPlans: number;
  profiles: number;
}

async function prompt(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function findUserByPhone(phone: string) {
  const user = await postgresDb
    .selectFrom('users')
    .selectAll()
    .where('phoneNumber', '=', phone)
    .executeTakeFirst();

  return user;
}

async function countRecordsToDelete(userId: string, startStep: number): Promise<DeleteCounts> {
  const counts: DeleteCounts = {
    messageQueue: 0,
    messages: 0,
    workouts: 0,
    microcycles: 0,
    fitnessPlans: 0,
    profiles: 0,
  };

  // Always count messages and queue (steps 6-7 create these)
  const [messageQueue, messages] = await Promise.all([
    postgresDb
      .selectFrom('messageQueues')
      .select(postgresDb.fn.count('id').as('count'))
      .where('clientId', '=', userId)
      .executeTakeFirst(),
    postgresDb
      .selectFrom('messages')
      .select(postgresDb.fn.count('id').as('count'))
      .where('clientId', '=', userId)
      .executeTakeFirst(),
  ]);
  counts.messageQueue = Number(messageQueue?.count ?? 0);
  counts.messages = Number(messages?.count ?? 0);

  // Count workouts if starting from step 5 or earlier
  if (startStep <= 5) {
    const workouts = await postgresDb
      .selectFrom('workoutInstances')
      .select(postgresDb.fn.count('id').as('count'))
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.workouts = Number(workouts?.count ?? 0);
  }

  // Count microcycles if starting from step 4 or earlier
  if (startStep <= 4) {
    const microcycles = await postgresDb
      .selectFrom('microcycles')
      .select(postgresDb.fn.count('id').as('count'))
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.microcycles = Number(microcycles?.count ?? 0);
  }

  // Count fitness plans if starting from step 3 or earlier
  if (startStep <= 3) {
    const fitnessPlans = await postgresDb
      .selectFrom('fitnessPlans')
      .select(postgresDb.fn.count('id').as('count'))
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.fitnessPlans = Number(fitnessPlans?.count ?? 0);
  }

  // Count profiles if starting from step 2 or earlier
  if (startStep <= 2) {
    const profiles = await postgresDb
      .selectFrom('profiles')
      .select(postgresDb.fn.count('id').as('count'))
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.profiles = Number(profiles?.count ?? 0);
  }

  return counts;
}

async function deleteUserData(userId: string, startStep: number, verbose: boolean): Promise<DeleteCounts> {
  const counts: DeleteCounts = {
    messageQueue: 0,
    messages: 0,
    workouts: 0,
    microcycles: 0,
    fitnessPlans: 0,
    profiles: 0,
  };

  // Always delete message queue entries (steps 6-7 create these)
  if (verbose) console.log(chalk.gray('  Deleting message queue entries...'));
  const queueResult = await postgresDb
    .deleteFrom('messageQueues')
    .where('clientId', '=', userId)
    .executeTakeFirst();
  counts.messageQueue = Number(queueResult.numDeletedRows);

  // Always delete messages (steps 6-7 create these)
  if (verbose) console.log(chalk.gray('  Deleting messages...'));
  const messagesResult = await postgresDb
    .deleteFrom('messages')
    .where('clientId', '=', userId)
    .executeTakeFirst();
  counts.messages = Number(messagesResult.numDeletedRows);

  // Delete workouts if starting from step 5 or earlier
  if (startStep <= 5) {
    if (verbose) console.log(chalk.gray('  Deleting workouts...'));
    const workoutsResult = await postgresDb
      .deleteFrom('workoutInstances')
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.workouts = Number(workoutsResult.numDeletedRows);
  }

  // Delete microcycles if starting from step 4 or earlier
  if (startStep <= 4) {
    if (verbose) console.log(chalk.gray('  Deleting microcycles...'));
    const microcyclesResult = await postgresDb
      .deleteFrom('microcycles')
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.microcycles = Number(microcyclesResult.numDeletedRows);
  }

  // Delete fitness plans if starting from step 3 or earlier
  if (startStep <= 3) {
    if (verbose) console.log(chalk.gray('  Deleting fitness plans...'));
    const plansResult = await postgresDb
      .deleteFrom('fitnessPlans')
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.fitnessPlans = Number(plansResult.numDeletedRows);
  }

  // Delete fitness profiles if starting from step 2 or earlier
  if (startStep <= 2) {
    if (verbose) console.log(chalk.gray('  Deleting fitness profiles...'));
    const profilesResult = await postgresDb
      .deleteFrom('profiles')
      .where('clientId', '=', userId)
      .executeTakeFirst();
    counts.profiles = Number(profilesResult.numDeletedRows);
  }

  return counts;
}

async function resetOnboardingRecord(userId: string, step: number | null) {
  await postgresDb
    .updateTable('userOnboarding')
    .set({
      status: 'pending',
      currentStep: step,
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      programMessagesSent: false,
    })
    .where('clientId', '=', userId)
    .execute();
}

async function ensureActiveSubscription(userId: string, verbose: boolean): Promise<boolean> {
  // Check if user already has active subscription
  const existingSubscription = await postgresDb
    .selectFrom('subscriptions')
    .selectAll()
    .where('clientId', '=', userId)
    .where('status', '=', 'active')
    .executeTakeFirst();

  if (existingSubscription) {
    if (verbose) console.log(chalk.gray('  User already has active subscription'));
    return false;
  }

  // Create a test subscription
  const testSubscriptionId = `test_sub_${Date.now()}`;
  const now = new Date();
  const oneMonthFromNow = new Date(now);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  await postgresDb
    .insertInto('subscriptions')
    .values({
      clientId: userId,
      stripeSubscriptionId: testSubscriptionId,
      status: 'active',
      planType: 'monthly',
      currentPeriodStart: now,
      currentPeriodEnd: oneMonthFromNow,
    })
    .execute();

  if (verbose) console.log(chalk.gray(`  Created test subscription: ${testSubscriptionId}`));
  return true;
}

async function triggerOnboarding(userId: string) {
  await inngest.send({
    name: 'user/onboarding.requested',
    data: { userId },
  });
}

async function resetOnboarding(options: ResetOptions) {
  const startTime = performance.now();

  console.log(chalk.blue('\n🔄 Onboarding Reset Tool\n'));

  // 1. Find user
  console.log(chalk.gray(`Looking up user: ${options.phone}`));
  const user = await findUserByPhone(options.phone);

  if (!user) {
    console.log(chalk.red(`\n❌ User not found with phone: ${options.phone}`));
    process.exit(1);
  }

  console.log(chalk.green(`✓ Found user: ${user.name || 'Unknown'} (${user.id})`));

  // 2. Count records to delete (based on starting step)
  const startStep = options.step ?? 1;
  console.log(chalk.gray(`\nCounting records to delete (starting from step ${startStep})...`));
  const counts = await countRecordsToDelete(user.id, startStep);

  const totalRecords =
    counts.messageQueue +
    counts.messages +
    counts.workouts +
    counts.microcycles +
    counts.fitnessPlans +
    counts.profiles;

  console.log(chalk.white('\nRecords to delete:'));
  console.log(chalk.gray(`  Message queue entries: ${counts.messageQueue}`));
  console.log(chalk.gray(`  Messages: ${counts.messages}`));
  console.log(chalk.gray(`  Workouts: ${counts.workouts}`));
  console.log(chalk.gray(`  Microcycles: ${counts.microcycles}`));
  console.log(chalk.gray(`  Fitness plans: ${counts.fitnessPlans}`));
  console.log(chalk.gray(`  Fitness profiles: ${counts.profiles}`));
  console.log(chalk.white(`  Total: ${totalRecords} records`));

  // 3. Dry run stops here
  if (options.dryRun) {
    console.log(chalk.yellow('\n--dry-run flag set. No changes made.'));
    process.exit(0);
  }

  // 4. Confirmation prompt
  if (!options.yes) {
    const confirmed = await prompt(
      chalk.yellow(`\nAre you sure you want to delete ${totalRecords} records? (y/N): `)
    );
    if (!confirmed) {
      console.log(chalk.gray('Aborted.'));
      process.exit(0);
    }
  }

  // 5. Delete data
  console.log(chalk.blue('\nDeleting data...'));
  const deletedCounts = await deleteUserData(user.id, startStep, options.verbose ?? false);

  console.log(chalk.green('✓ Data deleted'));
  if (options.verbose) {
    console.log(chalk.gray(`  Deleted ${deletedCounts.messageQueue} queue entries`));
    console.log(chalk.gray(`  Deleted ${deletedCounts.messages} messages`));
    console.log(chalk.gray(`  Deleted ${deletedCounts.workouts} workouts`));
    console.log(chalk.gray(`  Deleted ${deletedCounts.microcycles} microcycles`));
    console.log(chalk.gray(`  Deleted ${deletedCounts.fitnessPlans} fitness plans`));
    console.log(chalk.gray(`  Deleted ${deletedCounts.profiles} profiles`));
  }

  // 6. Reset onboarding record
  console.log(chalk.blue('\nResetting onboarding record...'));
  await resetOnboardingRecord(user.id, options.step ?? null);
  console.log(chalk.green(`✓ Onboarding reset to step ${options.step ?? 1}`));

  // 7. Ensure active subscription
  console.log(chalk.blue('\nChecking subscription...'));
  const createdSubscription = await ensureActiveSubscription(user.id, options.verbose ?? false);
  if (createdSubscription) {
    console.log(chalk.green('✓ Created test subscription'));
  } else {
    console.log(chalk.green('✓ Active subscription exists'));
  }

  // 8. Trigger onboarding
  if (!options.skipTrigger) {
    console.log(chalk.blue('\nTriggering onboarding...'));
    await triggerOnboarding(user.id);
    console.log(chalk.green('✓ Onboarding triggered'));
    console.log(chalk.yellow('  Note: Make sure Inngest is running (pnpm inngest)'));
  } else {
    console.log(chalk.gray('\n--skip-trigger flag set. Onboarding not triggered.'));
  }

  // 9. Summary
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  console.log(chalk.green(`\n✅ Reset complete (${duration}ms)`));
  console.log(chalk.white('\nSummary:'));
  console.log(chalk.gray(`  User: ${user.name || 'Unknown'} (${options.phone})`));
  console.log(chalk.gray(`  Records deleted: ${totalRecords}`));
  console.log(chalk.gray(`  Starting step: ${options.step ?? 1}`));
  console.log(chalk.gray(`  Onboarding triggered: ${!options.skipTrigger}`));
}

// CLI setup
const program = new Command();

program
  .name('reset-onboarding')
  .description('Reset a user\'s onboarding state for testing')
  .version('1.0.0')
  .requiredOption('-p, --phone <phone>', 'Phone number (E.164 format)')
  .option('-s, --step <number>', 'Step to restart from (1-7)', (value) => {
    const step = parseInt(value, 10);
    if (isNaN(step) || step < 1 || step > 7) {
      throw new Error('Step must be a number between 1 and 7');
    }
    return step;
  })
  .option('--skip-trigger', 'Don\'t re-trigger onboarding after reset', false)
  .option('-y, --yes', 'Skip confirmation prompt', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .option('--dry-run', 'Show what would be deleted without doing it', false)
  .action(async (options) => {
    try {
      await resetOnboarding(options);
    } catch (error) {
      console.log(chalk.red('\n❌ Error:'), (error as Error).message);
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    } finally {
      // Close database connection
      await postgresDb.destroy();
    }
  });

// Example usage helper
program.on('--help', () => {
  console.log('');
  console.log('Onboarding Steps (data deleted when restarting FROM this step):');
  console.log('  1 - Load signup data           → Deletes: all data');
  console.log('  2 - Extract fitness profile    → Deletes: all data');
  console.log('  3 - Create fitness plan        → Deletes: plan, microcycle, workout, messages');
  console.log('  4 - Create first microcycle    → Deletes: microcycle, workout, messages');
  console.log('  5 - Create first workout       → Deletes: workout, messages');
  console.log('  6 - Finalize program           → Deletes: messages only');
  console.log('  7 - Send onboarding messages   → Deletes: messages only');
  console.log('');
  console.log('Examples:');
  console.log('  $ pnpm test:onboarding:reset -p "+14155551234"              # Delete all, start fresh');
  console.log('  $ pnpm test:onboarding:reset -p "+14155551234" -s 3         # Keep profile, redo plan');
  console.log('  $ pnpm test:onboarding:reset -p "+14155551234" -s 4         # Keep profile+plan, redo microcycle');
  console.log('  $ pnpm test:onboarding:reset -p "+14155551234" --dry-run');
  console.log('  $ pnpm test:onboarding:reset -p "+14155551234" --skip-trigger -y');
});

program.parse();
