#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { testConfig } from '../../utils/config';
import { testUsers, UserData } from '../../utils/users';
import { 
  header, 
  success, 
  error, 
  warning, 
  info, 
  separator,
  Timer,
  parsePhoneNumber,
  generateTestPhone,
  generateTestEmail
} from '../../utils/common';

// Load environment variables
testConfig.loadEnv();

interface CreateUserOptions {
  name?: string;
  phone?: string;
  email?: string;
  goals?: string;
  level?: string;
  frequency?: string;
  gender?: string;
  age?: string;
  timezone?: string;
  hour?: number;
  skipPayment?: boolean;
  interactive?: boolean;
  verbose?: boolean;
  generateTest?: boolean;
}

/**
 * Prompt for user data interactively
 */
async function promptUserData(options: CreateUserOptions): Promise<UserData> {
  header('Create Test User', '👤');
  
  const questions = [];

  // Only prompt for missing fields
  if (!options.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'User name:',
      default: options.generateTest ? `Test User ${Date.now()}` : undefined,
      validate: (input: string) => input.length > 0 || 'Name is required'
    });
  }

  if (!options.phone) {
    questions.push({
      type: 'input',
      name: 'phone',
      message: 'Phone number:',
      default: options.generateTest ? generateTestPhone() : undefined,
      validate: (input: string) => {
        try {
          const parsed = parsePhoneNumber(input);
          return parsed.length >= 11 || 'Invalid phone number';
        } catch {
          return 'Invalid phone number format';
        }
      },
      filter: (input: string) => parsePhoneNumber(input)
    });
  }

  if (!options.email) {
    questions.push({
      type: 'input',
      name: 'email',
      message: 'Email address (optional):',
      default: options.generateTest ? generateTestEmail() : undefined,
      validate: (input: string) => {
        if (!input) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Invalid email format';
      }
    });
  }

  if (!options.goals) {
    questions.push({
      type: 'list',
      name: 'goals',
      message: 'Fitness goals:',
      choices: [
        'Build muscle and strength',
        'Lose weight and tone',
        'Improve endurance',
        'General fitness',
        'Athletic performance',
        'Rehabilitation',
        { name: 'Custom (enter your own)', value: 'custom' }
      ]
    });

    questions.push({
      type: 'input',
      name: 'customGoals',
      message: 'Enter custom fitness goals:',
      when: (answers: any) => answers.goals === 'custom'
    });
  }

  if (!options.level) {
    questions.push({
      type: 'list',
      name: 'level',
      message: 'Skill level:',
      choices: [
        { name: 'Beginner (new to exercise)', value: 'beginner' },
        { name: 'Intermediate (6+ months experience)', value: 'intermediate' },
        { name: 'Advanced (2+ years experience)', value: 'advanced' }
      ]
    });
  }

  if (!options.frequency) {
    questions.push({
      type: 'list',
      name: 'frequency',
      message: 'Exercise frequency:',
      choices: [
        '2-3 times per week',
        '3-4 times per week',
        '4-5 times per week',
        '5-6 times per week',
        'Daily'
      ]
    });
  }

  if (!options.gender) {
    questions.push({
      type: 'list',
      name: 'gender',
      message: 'Gender:',
      choices: ['male', 'female', 'other', 'prefer not to say']
    });
  }

  if (!options.age) {
    questions.push({
      type: 'input',
      name: 'age',
      message: 'Age:',
      default: '30',
      validate: (input: string) => {
        const age = parseInt(input);
        return (age > 0 && age < 120) || 'Please enter a valid age';
      }
    });
  }

  if (!options.timezone) {
    questions.push({
      type: 'list',
      name: 'timezone',
      message: 'Timezone:',
      choices: [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Australia/Sydney',
        { name: 'Other (enter manually)', value: 'other' }
      ]
    });

    questions.push({
      type: 'input',
      name: 'customTimezone',
      message: 'Enter timezone (e.g., America/New_York):',
      when: (answers: any) => answers.timezone === 'other'
    });
  }

  if (options.hour === undefined) {
    questions.push({
      type: 'number',
      name: 'hour',
      message: 'Preferred message time (hour, 0-23):',
      default: 8,
      validate: (input: number) => {
        return (input >= 0 && input <= 23) || 'Hour must be between 0 and 23';
      }
    });
  }

  const answers = questions.length > 0 ? await inquirer.prompt(questions as any) : {};

  // Merge answers with options
  return {
    name: options.name || answers.name,
    phoneNumber: options.phone || answers.phone,
    email: options.email || answers.email || undefined,
    fitnessGoals: answers.customGoals || options.goals || answers.goals,
    skillLevel: options.level || answers.level,
    exerciseFrequency: options.frequency || answers.frequency,
    gender: options.gender || answers.gender,
    age: options.age || answers.age,
    timezone: answers.customTimezone || options.timezone || answers.timezone,
    preferredSendHour: options.hour ?? answers.hour
  };
}

/**
 * Create a test user
 */
async function createTestUser(options: CreateUserOptions): Promise<void> {
  const timer = new Timer();

  try {
    // Get user data either from options or prompts
    let userData: UserData;
    
    if (options.interactive !== false && (
      !options.name || !options.phone || !options.goals || 
      !options.level || !options.frequency || !options.gender || !options.age
    )) {
      userData = await promptUserData(options);
    } else {
      // Use provided options
      userData = {
        name: options.name || 'Test User',
        phoneNumber: options.phone ? parsePhoneNumber(options.phone) : generateTestPhone(),
        email: options.email,
        fitnessGoals: options.goals || 'General fitness',
        skillLevel: options.level || 'intermediate',
        exerciseFrequency: options.frequency || '3-4 times per week',
        gender: options.gender || 'other',
        age: options.age || '30',
        timezone: options.timezone || 'America/New_York',
        preferredSendHour: options.hour ?? 8
      };
    }

    separator();
    info('Creating user with the following details:');
    
    if (options.verbose) {
      console.log(chalk.gray(JSON.stringify(userData, null, 2)));
    } else {
      console.log(chalk.white('  Name:'), userData.name);
      console.log(chalk.white('  Phone:'), userData.phoneNumber);
      if (userData.email) console.log(chalk.white('  Email:'), userData.email);
      console.log(chalk.white('  Goals:'), userData.fitnessGoals);
      console.log(chalk.white('  Level:'), userData.skillLevel);
      console.log(chalk.white('  Timezone:'), userData.timezone);
      console.log(chalk.white('  Send Time:'), `${userData.preferredSendHour}:00`);
    }

    separator();

    // Create the user
    const result = await testUsers.createUser(userData, options.skipPayment);

    if (result) {
      if (result.userId) {
        success(`User created successfully! (${timer.elapsedFormatted()})`);
        console.log(chalk.bold.white('\nUser ID:'), chalk.green(result.userId));
        
        if (!options.skipPayment) {
          info('User has been created and subscribed');
        } else {
          warning('User created without payment (test mode)');
        }

        console.log(chalk.yellow('\n📱 Next Steps:'));
        console.log(chalk.white('1. Create fitness plan:'), chalk.cyan(`pnpm test:fitness:plan --user-id "${result.userId}"`));
        console.log(chalk.white('2. Send daily message:'), chalk.cyan(`pnpm test:messages:daily --phone "${userData.phoneNumber}"`));
        console.log(chalk.white('3. View user details:'), chalk.cyan(`pnpm test:user:get --phone "${userData.phoneNumber}"`));
        
      } else if (result.sessionId) {
        warning('Stripe checkout session created');
        console.log(chalk.white('Session ID:'), result.sessionId);
        info('Complete payment at Stripe Checkout to finish user creation');
        
        if (!options.skipPayment) {
          console.log(chalk.yellow('\nTo skip payment in test mode, use:'), chalk.cyan('--skip-payment'));
        }
      }
    } else {
      error('Failed to create user');
    }

  } catch (err) {
    error('User creation failed', err as Error);
    
    if (options.verbose && err) {
      console.error(chalk.gray((err as Error).stack));
    }
    
    process.exit(1);
  }
}

// CLI setup
const program = new Command();

program
  .name('test:user:create')
  .description('Create a test user with fitness profile')
  .version('1.0.0')
  .option('-n, --name <name>', 'User name')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-e, --email <email>', 'Email address')
  .option('--goals <goals>', 'Fitness goals')
  .option('--level <level>', 'Skill level (beginner/intermediate/advanced)')
  .option('--frequency <frequency>', 'Exercise frequency')
  .option('--gender <gender>', 'Gender')
  .option('--age <age>', 'Age')
  .option('-t, --timezone <timezone>', 'Timezone (e.g., America/New_York)')
  .option('-h, --hour <hour>', 'Preferred send hour (0-23)', parseInt)
  .option('--skip-payment', 'Skip Stripe payment (test mode)')
  .option('--no-interactive', 'Disable interactive prompts')
  .option('-g, --generate-test', 'Generate test data automatically')
  .option('-v, --verbose', 'Show detailed output')
  .action(createTestUser);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  Interactive mode (recommended):');
  console.log('  $ pnpm test:user:create');
  console.log('');
  console.log('  Quick creation with arguments:');
  console.log('  $ pnpm test:user:create -n "John Doe" -p "+1234567890"');
  console.log('');
  console.log('  Full specification:');
  console.log('  $ pnpm test:user:create \\');
  console.log('      --name "Jane Smith" \\');
  console.log('      --phone "+1234567890" \\');
  console.log('      --email "jane@example.com" \\');
  console.log('      --goals "Build muscle" \\');
  console.log('      --level intermediate \\');
  console.log('      --skip-payment');
  console.log('');
  console.log('  Generate test user:');
  console.log('  $ pnpm test:user:create --generate-test --skip-payment');
});

program.parse(process.argv);