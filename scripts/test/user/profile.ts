#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { testConfig } from '../../utils/config';
import { testDb } from '../../utils/db';
import { testUsers, FitnessProfile } from '../../utils/users';
import { 
  header, 
  success, 
  error, 
  warning, 
  info, 
  separator,
  Timer,
  parsePhoneNumber
} from '../../utils/common';

// Load environment variables
testConfig.loadEnv();

interface ProfileOptions {
  phone?: string;
  userId?: string;
  goals?: string;
  level?: string;
  frequency?: string;
  equipment?: string;
  preferences?: string;
  injuries?: string;
  interactive?: boolean;
  clear?: boolean;
  verbose?: boolean;
}

/**
 * Prompt for profile updates interactively
 */
async function promptProfileUpdates(currentProfile?: any): Promise<FitnessProfile> {
  console.log('');
  info('Update Fitness Profile (press Enter to keep current value)');
  separator();

  const questions = [
    {
      type: 'input',
      name: 'goals',
      message: 'Fitness goals:',
      default: currentProfile?.fitnessGoals || undefined
    },
    {
      type: 'list',
      name: 'level',
      message: 'Skill level:',
      choices: [
        { name: 'Keep current', value: currentProfile?.skillLevel },
        { name: 'Beginner', value: 'beginner' },
        { name: 'Intermediate', value: 'intermediate' },
        { name: 'Advanced', value: 'advanced' }
      ],
      default: 0
    },
    {
      type: 'list',
      name: 'frequency',
      message: 'Exercise frequency:',
      choices: [
        { name: 'Keep current', value: currentProfile?.exerciseFrequency },
        '2-3 times per week',
        '3-4 times per week',
        '4-5 times per week',
        '5-6 times per week',
        'Daily'
      ],
      default: 0
    },
    {
      type: 'checkbox',
      name: 'equipment',
      message: 'Available equipment:',
      choices: [
        'Dumbbells',
        'Barbell',
        'Kettlebells',
        'Resistance Bands',
        'Pull-up Bar',
        'Bench',
        'Squat Rack',
        'Cable Machine',
        'Cardio Machines',
        'TRX',
        'Medicine Ball',
        'Foam Roller'
      ],
      default: currentProfile?.equipment || []
    },
    {
      type: 'checkbox',
      name: 'preferences',
      message: 'Workout preferences:',
      choices: [
        'Strength Training',
        'Cardio',
        'HIIT',
        'Yoga',
        'Pilates',
        'CrossFit',
        'Bodyweight',
        'Olympic Lifting',
        'Powerlifting',
        'Running',
        'Cycling',
        'Swimming'
      ],
      default: currentProfile?.workoutPreferences || []
    },
    {
      type: 'input',
      name: 'injuries',
      message: 'Current injuries or limitations (comma-separated):',
      default: currentProfile?.injuries?.join(', ') || undefined,
      filter: (input: string) => {
        if (!input) return [];
        return input.split(',').map(i => i.trim()).filter(i => i.length > 0);
      }
    }
  ];

  const answers = await inquirer.prompt(questions as any);

  return {
    fitnessGoals: answers.goals || currentProfile?.fitnessGoals || undefined,
    skillLevel: answers.level || currentProfile?.skillLevel || undefined,
    exerciseFrequency: answers.frequency || currentProfile?.exerciseFrequency || undefined,
    equipment: answers.equipment,
    workoutPreferences: answers.preferences,
    injuries: answers.injuries
  };
}

/**
 * Update user profile
 */
async function updateProfile(options: ProfileOptions): Promise<void> {
  const timer = new Timer();

  try {
    // Validate input
    if (!options.phone && !options.userId) {
      error('Please provide either --phone or --user-id');
      console.log(chalk.yellow('\nExamples:'));
      console.log('  $ pnpm test:user:profile --phone "+1234567890"');
      console.log('  $ pnpm test:user:profile --user-id "abc123"');
      process.exit(1);
    }

    header('Update Fitness Profile', '💪');

    // Find the user
    const identifier = options.phone 
      ? parsePhoneNumber(options.phone)
      : options.userId!;
    
    info(`Looking up user: ${identifier}`);
    
    let user;
    if (options.phone) {
      user = await testDb.getUserByPhone(parsePhoneNumber(options.phone));
    } else {
      user = await testDb.getUserById(options.userId!);
    }

    if (!user) {
      error('User not found');
      process.exit(1);
    }

    success(`Found user: ${user.name}`);
    separator();

    // Get current profile
    const currentProfile = await testDb.getUserWithProfile(user.id);
    
    // Display current profile if verbose
    if (options.verbose && currentProfile) {
      const p = currentProfile as any;
      console.log(chalk.bold('Current Profile:'));
      console.log(chalk.gray(JSON.stringify({
        fitnessGoals: p.fitnessGoals,
        skillLevel: p.skillLevel,
        exerciseFrequency: p.exerciseFrequency,
        equipment: p.equipment,
        workoutPreferences: p.workoutPreferences,
        injuries: p.injuries
      }, null, 2)));
      separator();
    }

    // Handle clear option
    if (options.clear) {
      warning('Clearing fitness profile...');
      
      const confirm = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmClear',
        message: 'Are you sure you want to clear the fitness profile?',
        default: false
      } as any);

      if (!confirm.confirmClear) {
        info('Profile update cancelled');
        return;
      }

      const cleared = await testUsers.updateProfile(user.id, {
        fitnessGoals: '',
        skillLevel: '',
        exerciseFrequency: '',
        equipment: [],
        workoutPreferences: [],
        injuries: []
      });

      if (cleared) {
        success('Profile cleared successfully');
      } else {
        error('Failed to clear profile');
      }
      return;
    }

    // Build profile update
    let profileUpdate: FitnessProfile;

    if (options.interactive !== false && (
      !options.goals && !options.level && !options.frequency && 
      !options.equipment && !options.preferences && !options.injuries
    )) {
      // Interactive mode
      profileUpdate = await promptProfileUpdates(currentProfile);
    } else {
      // Use command-line options
      const p = currentProfile as any;
      profileUpdate = {
        fitnessGoals: options.goals || p?.fitnessGoals || undefined,
        skillLevel: options.level || p?.skillLevel || undefined,
        exerciseFrequency: options.frequency || p?.exerciseFrequency || undefined,
        equipment: options.equipment ? options.equipment.split(',').map(e => e.trim()) : p?.equipment || undefined,
        workoutPreferences: options.preferences ? options.preferences.split(',').map(p => p.trim()) : p?.workoutPreferences || undefined,
        injuries: options.injuries ? options.injuries.split(',').map(i => i.trim()) : p?.injuries || undefined
      };
    }

    // Display what will be updated
    console.log('');
    console.log(chalk.bold('Profile Updates:'));
    separator();
    
    if (profileUpdate.fitnessGoals) {
      console.log(chalk.white('Goals:'), profileUpdate.fitnessGoals);
    }
    if (profileUpdate.skillLevel) {
      console.log(chalk.white('Skill Level:'), profileUpdate.skillLevel);
    }
    if (profileUpdate.exerciseFrequency) {
      console.log(chalk.white('Frequency:'), profileUpdate.exerciseFrequency);
    }
    if (profileUpdate.equipment && profileUpdate.equipment.length > 0) {
      console.log(chalk.white('Equipment:'), profileUpdate.equipment.join(', '));
    }
    if (profileUpdate.workoutPreferences && profileUpdate.workoutPreferences.length > 0) {
      console.log(chalk.white('Preferences:'), profileUpdate.workoutPreferences.join(', '));
    }
    if (profileUpdate.injuries && profileUpdate.injuries.length > 0) {
      console.log(chalk.white('Injuries:'), chalk.yellow(profileUpdate.injuries.join(', ')));
    }

    separator();

    // Confirm update
    if (options.interactive !== false) {
      const confirm = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmUpdate',
        message: 'Apply these updates?',
        default: true
      } as any);

      if (!confirm.confirmUpdate) {
        info('Profile update cancelled');
        return;
      }
    }

    // Update the profile
    info('Updating profile...');
    const updated = await testUsers.updateProfile(user.id, profileUpdate);

    if (updated) {
      success(`Profile updated successfully! (${timer.elapsedFormatted()})`);
      
      console.log(chalk.yellow('\n📋 Next Steps:'));
      console.log(chalk.white('1. View updated profile:'), chalk.cyan(`pnpm test:user:get --phone "${user.phoneNumber}"`));
      console.log(chalk.white('2. Generate new fitness plan:'), chalk.cyan(`pnpm test:fitness:plan --user-id "${user.id}"`));
      
    } else {
      error('Failed to update profile');
      process.exit(1);
    }

  } catch (err) {
    error('Profile update failed', err as Error);
    
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
  .name('test:user:profile')
  .description('Update user fitness profile')
  .version('1.0.0')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-u, --user-id <id>', 'User ID')
  .option('--goals <goals>', 'Fitness goals')
  .option('--level <level>', 'Skill level (beginner/intermediate/advanced)')
  .option('--frequency <frequency>', 'Exercise frequency')
  .option('--equipment <equipment>', 'Available equipment (comma-separated)')
  .option('--preferences <preferences>', 'Workout preferences (comma-separated)')
  .option('--injuries <injuries>', 'Current injuries (comma-separated)')
  .option('--no-interactive', 'Disable interactive prompts')
  .option('--clear', 'Clear the fitness profile')
  .option('-v, --verbose', 'Show detailed output')
  .action(updateProfile);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  Interactive update (recommended):');
  console.log('  $ pnpm test:user:profile --phone "+1234567890"');
  console.log('');
  console.log('  Update specific fields:');
  console.log('  $ pnpm test:user:profile --user-id "abc123" \\');
  console.log('      --goals "Build muscle and lose fat" \\');
  console.log('      --level intermediate');
  console.log('');
  console.log('  Update equipment and preferences:');
  console.log('  $ pnpm test:user:profile --phone "+1234567890" \\');
  console.log('      --equipment "Dumbbells,Barbell,Bench" \\');
  console.log('      --preferences "Strength Training,HIIT"');
  console.log('');
  console.log('  Add injury information:');
  console.log('  $ pnpm test:user:profile --phone "+1234567890" \\');
  console.log('      --injuries "Lower back pain,Shoulder impingement"');
  console.log('');
  console.log('  Clear profile:');
  console.log('  $ pnpm test:user:profile --phone "+1234567890" --clear');
});

program.parse(process.argv);