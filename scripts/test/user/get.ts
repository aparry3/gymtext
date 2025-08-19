#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { testConfig } from '../../utils/config';
import { testDb } from '../../utils/db';
import { testUsers } from '../../utils/users';
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

interface GetUserOptions {
  phone?: string;
  userId?: string;
  all?: boolean;
  active?: boolean;
  profile?: boolean;
  plan?: boolean;
  progress?: boolean;
  workout?: boolean;
  json?: boolean;
  verbose?: boolean;
}

/**
 * Display user information
 */
async function displayUser(options: GetUserOptions): Promise<void> {
  const timer = new Timer();

  try {
    // Validate input
    if (!options.phone && !options.userId && !options.all && !options.active) {
      error('Please provide either --phone, --user-id, --all, or --active');
      console.log(chalk.yellow('\nExamples:'));
      console.log('  $ pnpm test:user:get --phone "+1234567890"');
      console.log('  $ pnpm test:user:get --user-id "abc123"');
      console.log('  $ pnpm test:user:get --all');
      console.log('  $ pnpm test:user:get --active');
      process.exit(1);
    }

    // Handle listing all or active users
    if (options.all || options.active) {
      header(options.active ? 'Active Users' : 'All Users', '👥');
      
      const users = options.active 
        ? await testDb.getActiveUsers()
        : await testDb.getActiveUsers(); // TODO: Add getAllUsers method
      
      if (users.length === 0) {
        warning('No users found');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(users, null, 2));
      } else {
        const tableData = [
          ['ID', 'Name', 'Phone', 'Email', 'Timezone', 'Send Hour']
        ];
        
        for (const user of users) {
          tableData.push([
            user.id.substring(0, 8) + '...',
            user.name,
            user.phoneNumber,
            user.email || 'N/A',
            user.timezone,
            user.preferredSendHour.toString()
          ]);
        }
        
        displayTable(tableData);
        info(`Found ${users.length} ${options.active ? 'active' : ''} user(s)`);
      }
      
      success(`Query completed in ${timer.elapsedFormatted()}`);
      return;
    }

    // Get single user details
    const identifier = options.phone 
      ? parsePhoneNumber(options.phone)
      : options.userId!;
    
    header('User Details', '👤');
    info(`Looking up user: ${identifier}`);
    separator();

    const details = await testUsers.getUserDetails(identifier);

    if (!details || !details.user) {
      error('User not found');
      
      if (options.phone) {
        console.log(chalk.yellow('\nTips:'));
        console.log('- Make sure the phone number format is correct');
        console.log('- Try with country code: +1234567890');
        console.log('- List all users: pnpm test:user:get --all');
      }
      
      process.exit(1);
    }

    if (options.json) {
      // JSON output
      const output: any = { user: details.user };
      
      if (options.profile && details.profile) {
        output.profile = details.profile as any;
      }
      if (options.plan && details.plan) {
        output.plan = details.plan;
      }
      if (options.progress && details.progress) {
        output.progress = details.progress;
      }
      if (details.microcycle) {
        output.microcycle = details.microcycle;
      }
      
      console.log(JSON.stringify(output, null, 2));
    } else {
      // Formatted output
      const { user, profile, plan, progress, microcycle } = details;

      // Basic user info
      console.log(chalk.bold('Basic Information'));
      separator();
      console.log(chalk.white('ID:'), user.id);
      console.log(chalk.white('Name:'), user.name);
      console.log(chalk.white('Phone:'), user.phoneNumber);
      console.log(chalk.white('Email:'), user.email || chalk.gray('Not set'));
      console.log(chalk.white('Timezone:'), user.timezone);
      console.log(chalk.white('Send Time:'), `${user.preferredSendHour}:00`);
      console.log(chalk.white('Created:'), new Date(user.createdAt).toLocaleString());

      // Fitness profile
      if (options.profile !== false && profile) {
        console.log('');
        console.log(chalk.bold('Fitness Profile'));
        separator();
        const p = profile as any;
        console.log(chalk.white('Goals:'), p.fitnessGoals || chalk.gray('Not set'));
        console.log(chalk.white('Skill Level:'), p.skillLevel || chalk.gray('Not set'));
        console.log(chalk.white('Frequency:'), p.exerciseFrequency || chalk.gray('Not set'));
        
        if (p.equipment && p.equipment.length > 0) {
          console.log(chalk.white('Equipment:'), p.equipment.join(', '));
        }
        
        if (p.injuries && p.injuries.length > 0) {
          console.log(chalk.white('Injuries:'), chalk.yellow(p.injuries.join(', ')));
        }
      }

      // Fitness plan
      if (options.plan !== false && plan) {
        console.log('');
        console.log(chalk.bold('Fitness Plan'));
        separator();
        console.log(chalk.white('ID:'), plan.id);
        console.log(chalk.white('Program Type:'), plan.programType);
        console.log(chalk.white('Total Weeks:'), plan.lengthWeeks || chalk.gray('Not set'));
        console.log(chalk.white('Start Date:'), new Date(plan.startDate).toLocaleDateString());
        
        if (plan.mesocycles) {
          const mesocycles = typeof plan.mesocycles === 'string'
            ? JSON.parse(plan.mesocycles)
            : plan.mesocycles as any[];
          console.log(chalk.white('Mesocycles:'), mesocycles.length);
          
          if (options.verbose) {
            mesocycles.forEach((meso: any, index: number) => {
              console.log(chalk.gray(`  ${index + 1}. ${meso.name} (${meso.weeks} weeks)`));
            });
          }
        }
      }

      // Progress
      if (options.progress !== false && progress) {
        console.log('');
        console.log(chalk.bold('Current Progress'));
        separator();
        console.log(chalk.white('Mesocycle:'), progress.mesocycleIndex + 1);
        console.log(chalk.white('Week:'), progress.microcycleWeek);
        
        if (progress.cycleStartDate) {
          const daysInCycle = Math.floor(
            (Date.now() - new Date(progress.cycleStartDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          console.log(chalk.white('Days in Cycle:'), daysInCycle);
        }
      }

      // Current microcycle
      if (microcycle) {
        console.log('');
        console.log(chalk.bold('Current Microcycle'));
        separator();
        console.log(chalk.white('Week Number:'), microcycle.weekNumber);
        console.log(chalk.white('Active:'), microcycle.isActive ? chalk.green('Yes') : chalk.red('No'));
        console.log(chalk.white('Start Date:'), new Date(microcycle.startDate).toLocaleDateString());
        console.log(chalk.white('End Date:'), new Date(microcycle.endDate).toLocaleDateString());
        
        if (options.verbose && microcycle.pattern) {
          console.log(chalk.white('Pattern:'));
          const pattern = typeof microcycle.pattern === 'string'
            ? JSON.parse(microcycle.pattern)
            : microcycle.pattern as any;
          if (pattern.days) {
            pattern.days.forEach((day: any) => {
              console.log(chalk.gray(`  ${day.day}: ${day.theme} (${day.load || 'moderate'})`));
            });
          }
        }
      }

      // Recent workouts
      if (options.workout) {
        console.log('');
        console.log(chalk.bold('Recent Workouts'));
        separator();
        
        const workouts = await testDb.getRecentWorkouts(user.id, 7);
        if (workouts.length > 0) {
          const tableData = [['Date', 'Theme', 'Blocks']];
          
          for (const workout of workouts.slice(0, 5)) {
            const date = new Date(workout.date).toLocaleDateString();
            const data = typeof workout.details === 'string' 
              ? JSON.parse(workout.details) 
              : workout.details as any;
            const theme = data.theme || workout.sessionType || 'N/A';
            const blocks = data.blocks ? data.blocks.length : 0;
            tableData.push([date, theme, blocks.toString()]);
          }
          
          displayTable(tableData);
        } else {
          console.log(chalk.gray('No recent workouts found'));
        }
      }

      // Summary
      console.log('');
      separator();
      
      const hasProfile = profile?.profile && typeof profile.profile === 'object' && Object.keys(profile.profile).length > 0;
      const hasPlan = !!plan;
      const hasProgress = !!progress;
      
      if (hasProfile && hasPlan && hasProgress) {
        success('User is fully configured and active');
      } else {
        const missing = [];
        if (!hasProfile) missing.push('fitness profile');
        if (!hasPlan) missing.push('fitness plan');
        if (!hasProgress) missing.push('progress tracking');
        
        if (missing.length > 0) {
          warning(`Missing: ${missing.join(', ')}`);
        }
      }
    }

    console.log('');
    success(`Query completed in ${timer.elapsedFormatted()}`);

  } catch (err) {
    error('Failed to get user details', err as Error);
    
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
  .name('test:user:get')
  .description('Get user details and fitness information')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'Phone number to look up')
  .option('-u, --user-id <id>', 'User ID to look up')
  .option('-a, --all', 'List all users')
  .option('--active', 'List only active users')
  .option('--no-profile', 'Exclude fitness profile')
  .option('--no-plan', 'Exclude fitness plan')
  .option('--no-progress', 'Exclude progress info')
  .option('-w, --workout', 'Include recent workouts')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Show detailed output')
  .action(displayUser);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  Look up by phone:');
  console.log('  $ pnpm test:user:get --phone "+1234567890"');
  console.log('');
  console.log('  Look up by user ID:');
  console.log('  $ pnpm test:user:get --user-id "abc123"');
  console.log('');
  console.log('  List all active users:');
  console.log('  $ pnpm test:user:get --active');
  console.log('');
  console.log('  Get detailed info with workouts:');
  console.log('  $ pnpm test:user:get --phone "+1234567890" --workout --verbose');
  console.log('');
  console.log('  Export as JSON:');
  console.log('  $ pnpm test:user:get --phone "+1234567890" --json > user.json');
});

program.parse(process.argv);