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

interface WorkoutOptions {
  phone?: string;
  userId?: string;
  date?: string;
  force?: boolean;
  pattern?: boolean;
  json?: boolean;
  verbose?: boolean;
}

/**
 * Display workout details
 */
function displayWorkout(workout: any, verbose: boolean = false): void {
  const data = typeof workout.details === 'string' 
    ? JSON.parse(workout.details)
    : workout.details || {};
  
  console.log('');
  console.log(chalk.bold('Workout Details'));
  separator();
  console.log(chalk.white('Date:'), new Date(workout.date).toLocaleDateString());
  console.log(chalk.white('Session Type:'), workout.sessionType || 'Training');
  console.log(chalk.white('Theme:'), data.theme || 'General Training');
  
  if (data.goal) {
    console.log(chalk.white('Goal:'), data.goal);
  }
  
  // Display blocks
  if (data.blocks && Array.isArray(data.blocks)) {
    console.log('');
    console.log(chalk.bold('Workout Structure:'));
    separator();
    
    data.blocks.forEach((block: any, blockIndex: number) => {
      console.log('');
      console.log(chalk.cyan(`${blockIndex + 1}. ${block.name || 'Block ' + (blockIndex + 1)}`));
      
      if (block.items && Array.isArray(block.items)) {
        const tableData: string[][] = [];
        const hasReps = block.items.some((item: any) => item.reps);
        const hasDuration = block.items.some((item: any) => item.durationMin || item.durationSec);
        const hasIntensity = block.items.some((item: any) => item.RPE || item.percentageRM);
        
        // Build header
        const header = ['Exercise'];
        if (hasReps) header.push('Sets', 'Reps');
        if (hasDuration) header.push('Duration');
        if (hasIntensity) header.push('Intensity');
        tableData.push(header);
        
        // Build rows
        block.items.forEach((item: any) => {
          const row = [item.exercise || 'Unknown'];
          
          if (hasReps) {
            row.push(
              item.sets?.toString() || '-',
              item.reps?.toString() || '-'
            );
          }
          
          if (hasDuration) {
            let duration = '-';
            if (item.durationMin) {
              duration = `${item.durationMin} min`;
            } else if (item.durationSec) {
              duration = `${item.durationSec} sec`;
            }
            row.push(duration);
          }
          
          if (hasIntensity) {
            let intensity = '-';
            if (item.RPE) {
              intensity = `RPE ${item.RPE}`;
            } else if (item.percentageRM) {
              intensity = `${item.percentageRM}% 1RM`;
            }
            row.push(intensity);
          }
          
          tableData.push(row);
        });
        
        displayTable(tableData);
      }
    });
  } else if (verbose) {
    // Fallback for old format or different structure
    console.log('');
    console.log(chalk.bold('Raw Workout Data:'));
    console.log(chalk.gray(JSON.stringify(data, null, 2)));
  }
  
  // Display modifications if present
  if (data.modifications && Array.isArray(data.modifications) && data.modifications.length > 0) {
    console.log('');
    console.log(chalk.bold('Modifications:'));
    separator();
    data.modifications.forEach((mod: any) => {
      console.log(chalk.yellow(`• ${mod.note || mod.condition}`));
      if (mod.replace) {
        console.log(chalk.gray(`  Replace ${mod.replace.exercise} with ${mod.replace.with}`));
      }
    });
  }
  
  // Display notes
  if (data.notes) {
    console.log('');
    console.log(chalk.bold('Notes:'));
    console.log(chalk.gray(data.notes));
  }
}

/**
 * Display microcycle pattern
 */
function displayPattern(pattern: any): void {
  console.log('');
  console.log(chalk.bold('Weekly Training Pattern'));
  separator();
  
  if (pattern.days && Array.isArray(pattern.days)) {
    const tableData = [['Day', 'Theme', 'Load', 'Notes']];
    
    pattern.days.forEach((day: any) => {
      tableData.push([
        day.day || 'N/A',
        day.theme || 'Rest',
        day.load || 'N/A',
        day.notes || ''
      ]);
    });
    
    displayTable(tableData);
  }
  
  if (pattern.weekIndex !== undefined) {
    console.log(chalk.white('Week Number:'), pattern.weekIndex);
  }
}

/**
 * Generate or retrieve workout for a user
 */
async function manageWorkout(options: WorkoutOptions): Promise<void> {
  const timer = new Timer();

  try {
    // Validate input
    if (!options.phone && !options.userId) {
      error('Please provide either --phone or --user-id');
      console.log(chalk.yellow('\nExamples:'));
      console.log('  $ pnpm test:fitness:workout --phone "+1234567890"');
      console.log('  $ pnpm test:fitness:workout --user-id "abc123"');
      process.exit(1);
    }

    header('Workout Generation', '💪');

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

    // Get current microcycle for pattern
    const microcycle = await testDb.getMicrocycle(user.id);
    
    // If pattern flag is set, show the weekly pattern
    if (options.pattern) {
      if (!microcycle || !microcycle.pattern) {
        warning('No microcycle pattern found');
        console.log(chalk.yellow('A microcycle will be generated when daily messages are sent'));
        process.exit(0);
      }
      
      const pattern = typeof microcycle.pattern === 'string'
        ? JSON.parse(microcycle.pattern)
        : microcycle.pattern;
      
      if (options.json) {
        console.log(JSON.stringify(pattern, null, 2));
      } else {
        displayPattern(pattern);
        console.log('');
        separator();
        info('This pattern guides daily workout generation');
      }
      
      return;
    }

    // Parse date
    const targetDate = options.date ? new Date(options.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    info(`Checking for workout on ${targetDate.toLocaleDateString()}`);
    separator();

    // Check for existing workout
    let workout = await testDb.getTodaysWorkout(user.id, targetDate);
    
    if (workout && !options.force) {
      success('Workout already exists for this date');
      
      if (options.json) {
        console.log(JSON.stringify(workout, null, 2));
      } else {
        displayWorkout(workout, options.verbose);
        
        console.log('');
        separator();
        console.log(chalk.yellow('To regenerate, use --force flag'));
        console.log(chalk.cyan(`  $ pnpm test:fitness:workout --phone "${user.phoneNumber}" --force`));
      }
      
      return;
    }

    if (workout && options.force) {
      warning('Force regenerating workout (existing will be overwritten)');
    }

    // Generate workout via daily message endpoint
    info('Generating workout through daily message system...');
    
    const url = testConfig.getApiUrl('test/daily-message');
    const requestBody = {
      userId: user.id,
      date: targetDate.toISOString(),
      generateOnly: true // Just generate, don't send SMS
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
      // If the endpoint doesn't exist, provide helpful message
      if (response.status === 404) {
        warning('Workout generation endpoint not available');
        console.log(chalk.yellow('\nWorkouts are generated automatically during daily messages'));
        console.log(chalk.yellow('To trigger generation, send a daily message:'));
        console.log(chalk.cyan(`  $ pnpm test:messages:daily --phone "${user.phoneNumber}"`));
        process.exit(0);
      }
      
      throw new Error(`API Error: ${responseData.error || response.statusText}`);
    }

    success(`Workout generated successfully! (${timer.elapsedFormatted()})`);

    // Retrieve the newly generated workout
    workout = await testDb.getTodaysWorkout(user.id, targetDate);
    
    if (!workout) {
      warning('Workout generated but could not retrieve details');
      console.log(chalk.gray('Response:', JSON.stringify(responseData, null, 2)));
    } else {
      if (options.json) {
        console.log(JSON.stringify(workout, null, 2));
      } else {
        displayWorkout(workout, options.verbose);
        
        console.log('');
        separator();
        console.log(chalk.green('✅ Workout ready!'));
        
        if (!microcycle) {
          console.log(chalk.yellow('\n📝 Note:'));
          console.log(chalk.gray('No microcycle pattern found - workout generated with default parameters'));
        }
        
        console.log(chalk.yellow('\n📋 Next Steps:'));
        console.log(chalk.white('1. Send workout to user:'), chalk.cyan(`pnpm test:messages:daily --phone "${user.phoneNumber}"`));
        console.log(chalk.white('2. View weekly pattern:'), chalk.cyan(`pnpm test:fitness:workout --phone "${user.phoneNumber}" --pattern`));
        console.log(chalk.white('3. Check progress:'), chalk.cyan(`pnpm test:fitness:progress --phone "${user.phoneNumber}"`));
      }
    }

  } catch (err) {
    error('Failed to generate workout', err as Error);
    
    // Provide fallback suggestion
    console.log(chalk.yellow('\n💡 Tip: Workouts are typically generated during daily messages'));
    console.log(chalk.yellow('Try sending a daily message instead:'));
    console.log(chalk.cyan('  $ pnpm test:messages:daily --phone "' + (options.phone || '') + '"'));
    
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
  .name('test:fitness:workout')
  .description('Generate or retrieve workout for a user')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-u, --user-id <id>', 'User ID')
  .option('-d, --date <date>', 'Workout date (YYYY-MM-DD)')
  .option('-f, --force', 'Force regenerate workout')
  .option('--pattern', 'Show weekly training pattern')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Show detailed output')
  .action(manageWorkout);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  Get today\'s workout:');
  console.log('  $ pnpm test:fitness:workout --phone "+1234567890"');
  console.log('');
  console.log('  Get workout for specific date:');
  console.log('  $ pnpm test:fitness:workout --phone "+1234567890" --date "2024-01-15"');
  console.log('');
  console.log('  Force regenerate workout:');
  console.log('  $ pnpm test:fitness:workout --phone "+1234567890" --force');
  console.log('');
  console.log('  Show weekly training pattern:');
  console.log('  $ pnpm test:fitness:workout --phone "+1234567890" --pattern');
  console.log('');
  console.log('  Export as JSON:');
  console.log('  $ pnpm test:fitness:workout --phone "+1234567890" --json > workout.json');
  console.log('');
  console.log('Note: Workouts are typically generated automatically during daily messages.');
  console.log('This script is mainly for testing and debugging workout generation.');
});

program.parse(process.argv);