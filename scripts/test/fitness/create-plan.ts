#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { testConfig } from '../../utils/config';
import { testDb } from '../../utils/db';
import { 
  header, 
  success, 
  error, 
  warning, 
  info, 
  separator,
  displayTable,
  Timer,
  parsePhoneNumber
} from '../../utils/common';

// Load environment variables
testConfig.loadEnv();

interface CreatePlanOptions {
  phone?: string;
  userId?: string;
  type?: string;
  weeks?: number;
  force?: boolean;
  json?: boolean;
  verbose?: boolean;
}

/**
 * Display fitness plan details
 */
function displayPlanDetails(plan: any, verbose: boolean = false): void {
  console.log('');
  console.log(chalk.bold('Fitness Plan Created'));
  separator();
  console.log(chalk.white('ID:'), plan.id);
  console.log(chalk.white('Program Type:'), plan.programType);
  console.log(chalk.white('Total Weeks:'), plan.lengthWeeks || 'Not specified');
  console.log(chalk.white('Start Date:'), new Date(plan.startDate).toLocaleDateString());
  
  if (plan.overview) {
    console.log('');
    console.log(chalk.bold('Overview:'));
    console.log(chalk.gray(plan.overview));
  }

  if (plan.mesocycles) {
    const mesocycles = typeof plan.mesocycles === 'string' 
      ? JSON.parse(plan.mesocycles)
      : plan.mesocycles;
    
    console.log('');
    console.log(chalk.bold('Mesocycles:'));
    separator();
    
    const tableData = [['#', 'Name', 'Weeks', 'Focus', 'Deload']];
    
    mesocycles.forEach((meso: any, index: number) => {
      tableData.push([
        (index + 1).toString(),
        meso.name || 'Training Phase',
        meso.weeks?.toString() || '4',
        Array.isArray(meso.focus) ? meso.focus.join(', ') : meso.focus || 'General',
        meso.deload ? 'Yes' : 'No'
      ]);
    });
    
    displayTable(tableData);
    
    if (verbose) {
      console.log('');
      console.log(chalk.bold('Detailed Mesocycle Information:'));
      mesocycles.forEach((meso: any, index: number) => {
        console.log(chalk.cyan(`\n${index + 1}. ${meso.name || 'Training Phase'}`));
        console.log(chalk.gray(`   Duration: ${meso.weeks} weeks`));
        console.log(chalk.gray(`   Focus: ${Array.isArray(meso.focus) ? meso.focus.join(', ') : meso.focus}`));
        if (meso.deload) {
          console.log(chalk.yellow(`   Includes deload week`));
        }
      });
    }
  }

  if (plan.notes) {
    console.log('');
    console.log(chalk.bold('Notes:'));
    console.log(chalk.gray(plan.notes));
  }

  // Progress tracking
  console.log('');
  console.log(chalk.bold('Progress Tracking:'));
  separator();
  console.log(chalk.white('Current Mesocycle:'), plan.currentMesocycleIndex + 1);
  console.log(chalk.white('Current Week:'), plan.currentMicrocycleWeek);
  
  if (plan.cycleStartDate) {
    const daysInCycle = Math.floor(
      (Date.now() - new Date(plan.cycleStartDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(chalk.white('Days in Current Cycle:'), daysInCycle);
  }
}

/**
 * Create a fitness plan for a user
 */
async function createFitnessPlan(options: CreatePlanOptions): Promise<void> {
  const timer = new Timer();

  try {
    // Validate input
    if (!options.phone && !options.userId) {
      error('Please provide either --phone or --user-id');
      console.log(chalk.yellow('\nExamples:'));
      console.log('  $ pnpm test:fitness:plan --phone "+1234567890"');
      console.log('  $ pnpm test:fitness:plan --user-id "abc123"');
      process.exit(1);
    }

    header('Create Fitness Plan', '📋');

    // Find the user
    let user;
    if (options.phone) {
      const phoneNumber = parsePhoneNumber(options.phone);
      info(`Looking up user by phone: ${phoneNumber}`);
      user = await testDb.getUserByPhone(phoneNumber);
    } else {
      info(`Looking up user by ID: ${options.userId}`);
      user = await testDb.getUserById(options.userId!);
    }

    if (!user) {
      error('User not found');
      console.log(chalk.yellow('\nTips:'));
      console.log('- Check the phone number format (include country code)');
      console.log('- Verify the user ID is correct');
      console.log('- List users: pnpm test:user:get --all');
      process.exit(1);
    }

    success(`Found user: ${user.name}`);
    separator();

    // Check for existing fitness plan
    const existingPlan = await testDb.getFitnessPlan(user.id);
    
    if (existingPlan && !options.force) {
      warning('User already has a fitness plan');
      console.log(chalk.white('Plan ID:'), existingPlan.id);
      console.log(chalk.white('Created:'), new Date(existingPlan.createdAt).toLocaleDateString());
      console.log(chalk.white('Program Type:'), existingPlan.programType);
      
      console.log(chalk.yellow('\nTo create a new plan, use --force flag'));
      console.log(chalk.cyan('  $ pnpm test:fitness:plan --phone "' + user.phoneNumber + '" --force'));
      
      console.log(chalk.yellow('\nTo view the existing plan:'));
      console.log(chalk.cyan('  $ pnpm test:user:get --phone "' + user.phoneNumber + '"'));
      process.exit(0);
    }

    if (existingPlan && options.force) {
      warning('Overriding existing fitness plan');
    }

    // Check for fitness profile
    const profile = await testDb.getUserWithProfile(user.id);
    const hasProfile = !!(profile as any)?.fitnessGoals;
    
    if (!hasProfile) {
      warning('User has no fitness profile');
      console.log(chalk.yellow('A fitness profile helps generate better plans'));
      console.log(chalk.yellow('\nCreate a profile first:'));
      console.log(chalk.cyan(`  $ pnpm test:user:profile --phone "${user.phoneNumber}"`));
      console.log('');
    }

    // Generate the fitness plan
    info('Generating fitness plan...');
    
    const url = testConfig.getApiUrl('programs');
    const requestBody = {
      userId: user.id,
      programType: options.type,
      lengthWeeks: options.weeks
    };

    if (options.verbose) {
      console.log(chalk.gray('Request:'));
      console.log(chalk.gray(JSON.stringify(requestBody, null, 2)));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${responseData.error || response.statusText}`);
    }

    success(`Fitness plan created successfully! (${timer.elapsedFormatted()})`);

    // Get the newly created plan
    const newPlan = await testDb.getFitnessPlan(user.id);
    
    if (!newPlan) {
      warning('Plan created but could not retrieve details');
      console.log(chalk.gray('Response:', JSON.stringify(responseData, null, 2)));
    } else {
      if (options.json) {
        // JSON output
        console.log(JSON.stringify({
          success: true,
          userId: user.id,
          plan: newPlan,
          message: responseData.message
        }, null, 2));
      } else {
        // Formatted output
        displayPlanDetails(newPlan, options.verbose);
        
        console.log('');
        separator();
        console.log(chalk.green('✅ Plan generation complete!'));
        
        if (responseData.messages) {
          console.log(chalk.yellow('\n📱 Messages sent:'));
          if (responseData.messages.welcome) {
            console.log(chalk.white('  • Welcome message with plan overview'));
          }
          if (responseData.messages.firstWorkout) {
            console.log(chalk.white('  • First workout message'));
          }
        }
        
        console.log(chalk.yellow('\n📋 Next Steps:'));
        console.log(chalk.white('1. View progress:'), chalk.cyan(`pnpm test:fitness:progress --phone "${user.phoneNumber}"`));
        console.log(chalk.white('2. Generate workout:'), chalk.cyan(`pnpm test:fitness:workout --phone "${user.phoneNumber}"`));
        console.log(chalk.white('3. Send daily message:'), chalk.cyan(`pnpm test:messages:daily --phone "${user.phoneNumber}"`));
      }
    }

  } catch (err) {
    error('Failed to create fitness plan', err as Error);
    
    if (options.verbose && err) {
      console.error(chalk.gray((err as Error).stack));
    }
    
    process.exit(1);
  } finally {
    await testDb.close();
  }
}

// CLI setup
const program = new Command();

program
  .name('test:fitness:plan')
  .description('Create a fitness plan for a user')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-u, --user-id <id>', 'User ID')
  .option('-t, --type <type>', 'Program type (strength/endurance/hybrid/shred)')
  .option('-w, --weeks <weeks>', 'Plan duration in weeks', parseInt)
  .option('-f, --force', 'Force create new plan (override existing)')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Show detailed output')
  .action(createFitnessPlan);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  Create plan by phone number:');
  console.log('  $ pnpm test:fitness:plan --phone "+1234567890"');
  console.log('');
  console.log('  Create plan by user ID:');
  console.log('  $ pnpm test:fitness:plan --user-id "abc123"');
  console.log('');
  console.log('  Specify program type:');
  console.log('  $ pnpm test:fitness:plan --phone "+1234567890" --type strength');
  console.log('');
  console.log('  Create 12-week plan:');
  console.log('  $ pnpm test:fitness:plan --phone "+1234567890" --weeks 12');
  console.log('');
  console.log('  Override existing plan:');
  console.log('  $ pnpm test:fitness:plan --phone "+1234567890" --force');
  console.log('');
  console.log('  Export as JSON:');
  console.log('  $ pnpm test:fitness:plan --phone "+1234567890" --json > plan.json');
});

program.parse(process.argv);