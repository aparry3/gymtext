#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
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

interface ProgressOptions {
  phone?: string;
  userId?: string;
  advance?: boolean;
  reset?: boolean;
  week?: number;
  mesocycle?: number;
  json?: boolean;
  verbose?: boolean;
}

/**
 * Display progress details
 */
function displayProgress(user: any, plan: any, progress: any, microcycle: any, verbose: boolean = false): void {
  console.log('');
  console.log(chalk.bold('Current Progress'));
  separator();
  
  // Basic progress info
  console.log(chalk.white('User:'), user.name);
  console.log(chalk.white('Program:'), plan.programType);
  console.log(chalk.white('Total Weeks:'), plan.lengthWeeks || 'Not specified');
  
  // Parse mesocycles
  const mesocycles = typeof plan.mesocycles === 'string' 
    ? JSON.parse(plan.mesocycles)
    : plan.mesocycles || [];
  
  const currentMesocycle = mesocycles[progress.mesocycleIndex] || null;
  
  console.log('');
  console.log(chalk.bold('Current Position:'));
  console.log(chalk.white('Mesocycle:'), `${progress.mesocycleIndex + 1} of ${mesocycles.length}`);
  if (currentMesocycle) {
    console.log(chalk.white('Phase:'), currentMesocycle.name || 'Training Phase');
    console.log(chalk.white('Phase Focus:'), Array.isArray(currentMesocycle.focus) 
      ? currentMesocycle.focus.join(', ') 
      : currentMesocycle.focus || 'General');
  }
  console.log(chalk.white('Week:'), `${progress.microcycleWeek} of ${currentMesocycle?.weeks || 4}`);
  
  if (progress.cycleStartDate) {
    const startDate = new Date(progress.cycleStartDate);
    const daysInCycle = Math.floor(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(chalk.white('Days in Cycle:'), daysInCycle);
    console.log(chalk.white('Cycle Started:'), startDate.toLocaleDateString());
  }

  // Microcycle info
  if (microcycle) {
    console.log('');
    console.log(chalk.bold('Current Microcycle:'));
    console.log(chalk.white('Week Number:'), microcycle.weekNumber);
    console.log(chalk.white('Active:'), microcycle.isActive ? chalk.green('Yes') : chalk.red('No'));
    console.log(chalk.white('Period:'), 
      `${new Date(microcycle.startDate).toLocaleDateString()} - ${new Date(microcycle.endDate).toLocaleDateString()}`
    );
    
    if (verbose && microcycle.pattern) {
      const pattern = typeof microcycle.pattern === 'string'
        ? JSON.parse(microcycle.pattern)
        : microcycle.pattern;
      
      if (pattern.days) {
        console.log('');
        console.log(chalk.bold('Weekly Pattern:'));
        const tableData = [['Day', 'Theme', 'Load', 'Notes']];
        
        pattern.days.forEach((day: any) => {
          tableData.push([
            day.day,
            day.theme || 'Rest',
            day.load || 'N/A',
            day.notes || ''
          ]);
        });
        
        displayTable(tableData);
      }
    }
  }

  // Progress visualization
  console.log('');
  console.log(chalk.bold('Overall Progress:'));
  separator();
  
  // Calculate overall progress
  let totalWeeksCompleted = 0;
  for (let i = 0; i < progress.mesocycleIndex; i++) {
    totalWeeksCompleted += mesocycles[i]?.weeks || 0;
  }
  totalWeeksCompleted += progress.microcycleWeek - 1;
  
  const totalWeeks = plan.lengthWeeks || mesocycles.reduce((sum: number, m: any) => sum + (m.weeks || 0), 0);
  const progressPercentage = Math.round((totalWeeksCompleted / totalWeeks) * 100);
  
  console.log(chalk.white('Weeks Completed:'), `${totalWeeksCompleted} of ${totalWeeks}`);
  console.log(chalk.white('Progress:'), `${progressPercentage}%`);
  
  // Progress bar
  const barLength = 30;
  const filledLength = Math.round((progressPercentage / 100) * barLength);
  const emptyLength = barLength - filledLength;
  const progressBar = chalk.green('█'.repeat(filledLength)) + chalk.gray('░'.repeat(emptyLength));
  console.log(chalk.white('Visual:'), `[${progressBar}]`);
  
  // Upcoming milestones
  if (verbose) {
    console.log('');
    console.log(chalk.bold('Upcoming Milestones:'));
    
    const weeksLeftInMesocycle = (currentMesocycle?.weeks || 4) - progress.microcycleWeek + 1;
    console.log(chalk.gray(`• ${weeksLeftInMesocycle} weeks left in current mesocycle`));
    
    if (progress.mesocycleIndex < mesocycles.length - 1) {
      const nextMesocycle = mesocycles[progress.mesocycleIndex + 1];
      console.log(chalk.gray(`• Next phase: ${nextMesocycle.name} (${nextMesocycle.weeks} weeks)`));
    } else {
      console.log(chalk.gray(`• Currently in final mesocycle`));
    }
    
    const weeksRemaining = totalWeeks - totalWeeksCompleted;
    console.log(chalk.gray(`• ${weeksRemaining} weeks until plan completion`));
  }
}

/**
 * Manage fitness plan progress
 */
async function manageProgress(options: ProgressOptions): Promise<void> {
  const timer = new Timer();

  try {
    // Validate input
    if (!options.phone && !options.userId) {
      error('Please provide either --phone or --user-id');
      console.log(chalk.yellow('\nExamples:'));
      console.log('  $ pnpm test:fitness:progress --phone "+1234567890"');
      console.log('  $ pnpm test:fitness:progress --user-id "abc123"');
      process.exit(1);
    }

    header('Fitness Progress', '📊');

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
      process.exit(1);
    }

    success(`Found user: ${user.name}`);
    
    // Get fitness plan
    const plan = await testDb.getFitnessPlan(user.id);
    if (!plan) {
      error('No fitness plan found for user');
      console.log(chalk.yellow('\nCreate a plan first:'));
      console.log(chalk.cyan(`  $ pnpm test:fitness:plan --phone "${user.phoneNumber}"`));
      process.exit(1);
    }

    // Convert plan to FitnessPlan model and get current progress using ProgressService
    const { FitnessPlanModel } = await import('@/server/models/fitnessPlan');
    const { ProgressService } = await import('@/server/services/training/progressService');
    const fitnessPlan = FitnessPlanModel.fromDB(plan as any);
    const progressService = ProgressService.getInstance();
    const progress = progressService.getCurrentProgress(fitnessPlan, user.timezone || 'America/New_York');
    if (!progress) {
      warning('Could not calculate progress for current date');
      process.exit(1);
    }

    // Get current microcycle
    const microcycle = await testDb.getMicrocycle(user.id);

    // Handle reset option
    if (options.reset) {
      warning('Reset Progress');
      separator();
      
      const confirm = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmReset',
        message: 'Are you sure you want to reset progress to week 1?',
        default: false
      } as any);

      if (!confirm.confirmReset) {
        info('Reset cancelled');
        return;
      }

      // Reset would need to be implemented via API
      warning('Progress reset not yet implemented in API');
      console.log(chalk.yellow('This would reset to:'));
      console.log(chalk.gray('  • Mesocycle 1'));
      console.log(chalk.gray('  • Week 1'));
      return;
    }

    // Handle advance option
    if (options.advance) {
      warning('Advance Progress');
      separator();
      
      const mesocycles = typeof plan.mesocycles === 'string' 
        ? JSON.parse(plan.mesocycles)
        : plan.mesocycles || [];
      
      const currentMesocycle = mesocycles[progress.mesocycleIndex];
      const nextWeek = progress.microcycleWeek + 1;
      
      if (nextWeek > (currentMesocycle?.weeks || 4)) {
        // Move to next mesocycle
        if (progress.mesocycleIndex >= mesocycles.length - 1) {
          warning('Already at the end of the fitness plan');
          return;
        }
        
        console.log(chalk.cyan('Advancing to next mesocycle:'));
        console.log(chalk.white('From:'), `${currentMesocycle.name} Week ${progress.microcycleWeek}`);
        console.log(chalk.white('To:'), `${mesocycles[progress.mesocycleIndex + 1].name} Week 1`);
      } else {
        // Advance week
        console.log(chalk.cyan('Advancing to next week:'));
        console.log(chalk.white('From:'), `Week ${progress.microcycleWeek}`);
        console.log(chalk.white('To:'), `Week ${nextWeek}`);
      }
      
      const confirm = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmAdvance',
        message: 'Confirm advance?',
        default: true
      } as any);

      if (!confirm.confirmAdvance) {
        info('Advance cancelled');
        return;
      }

      warning('Progress advance not yet implemented in API');
      console.log(chalk.yellow('Manual advancement would update the database directly'));
      return;
    }

    // Handle setting specific week/mesocycle
    if (options.week !== undefined || options.mesocycle !== undefined) {
      warning('Set Progress Position');
      separator();
      
      if (options.mesocycle !== undefined) {
        console.log(chalk.white('Set Mesocycle:'), options.mesocycle);
      }
      if (options.week !== undefined) {
        console.log(chalk.white('Set Week:'), options.week);
      }
      
      warning('Direct progress setting not yet implemented in API');
      return;
    }

    // Display current progress
    if (options.json) {
      // JSON output
      console.log(JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          phone: user.phoneNumber
        },
        plan: {
          id: plan.id,
          programType: plan.programType,
          lengthWeeks: plan.lengthWeeks,
          mesocycles: typeof plan.mesocycles === 'string' 
            ? JSON.parse(plan.mesocycles)
            : plan.mesocycles
        },
        progress,
        microcycle
      }, null, 2));
    } else {
      // Formatted output
      displayProgress(user, plan, progress, microcycle, options.verbose);
      
      console.log('');
      separator();
      success(`Progress check complete! (${timer.elapsedFormatted()})`);
      
      console.log(chalk.yellow('\n📋 Actions:'));
      console.log(chalk.white('• Advance week:'), chalk.cyan(`pnpm test:fitness:progress --phone "${user.phoneNumber}" --advance`));
      console.log(chalk.white('• Reset progress:'), chalk.cyan(`pnpm test:fitness:progress --phone "${user.phoneNumber}" --reset`));
      console.log(chalk.white('• Generate workout:'), chalk.cyan(`pnpm test:fitness:workout --phone "${user.phoneNumber}"`));
    }

  } catch (err) {
    error('Failed to manage progress', err as Error);
    
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
  .name('test:fitness:progress')
  .description('View and manage fitness plan progress')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-u, --user-id <id>', 'User ID')
  .option('-a, --advance', 'Advance to next week')
  .option('-r, --reset', 'Reset progress to beginning')
  .option('-w, --week <week>', 'Set specific week', parseInt)
  .option('-m, --mesocycle <mesocycle>', 'Set specific mesocycle', parseInt)
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Show detailed output')
  .action(manageProgress);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  View current progress:');
  console.log('  $ pnpm test:fitness:progress --phone "+1234567890"');
  console.log('');
  console.log('  Advance to next week:');
  console.log('  $ pnpm test:fitness:progress --phone "+1234567890" --advance');
  console.log('');
  console.log('  Reset progress:');
  console.log('  $ pnpm test:fitness:progress --phone "+1234567890" --reset');
  console.log('');
  console.log('  Set specific week:');
  console.log('  $ pnpm test:fitness:progress --phone "+1234567890" --week 3');
  console.log('');
  console.log('  View detailed progress:');
  console.log('  $ pnpm test:fitness:progress --phone "+1234567890" --verbose');
  console.log('');
  console.log('  Export as JSON:');
  console.log('  $ pnpm test:fitness:progress --phone "+1234567890" --json');
});

program.parse(process.argv);