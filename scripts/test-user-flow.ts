#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

interface UserData {
  name: string;
  phoneNumber: string;
  email?: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFullUserFlow(options: {
  name: string;
  phone: string;
  email?: string;
  fitnessGoals?: string;
  skillLevel?: string;
  exerciseFrequency?: string;
  gender?: string;
  age?: string;
  baseUrl?: string;
  delay?: number;
  skipPayment?: boolean;
  verbose?: boolean;
}) {
  const baseUrl = options.baseUrl || 'http://localhost:3000';
  const delayMs = options.delay || 2000;
  
  console.log(chalk.bold.blue('🚀 Starting full user flow test...\n'));
  
  // Step 1: Create user via checkout
  console.log(chalk.cyan('Step 1: Creating user via checkout API...'));
  
  const userData: UserData = {
    name: options.name,
    phoneNumber: options.phone,
    email: options.email,
    fitnessGoals: options.fitnessGoals || 'Build muscle and improve fitness',
    skillLevel: options.skillLevel || 'intermediate',
    exerciseFrequency: options.exerciseFrequency || '3-4 times per week',
    gender: options.gender || 'male',
    age: options.age || '25',
  };

  if (options.verbose) {
    console.log(chalk.gray('User Data:'));
    console.log(chalk.gray(JSON.stringify(userData, null, 2)));
  }

  let userId: string;

  try {
    const checkoutResponse = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      throw new Error(`Checkout failed: ${checkoutData.message || checkoutResponse.statusText}`);
    }

    console.log(chalk.green('✅ User created successfully!'));
    
    if (checkoutData.userId) {
      userId = checkoutData.userId;
      console.log(chalk.white('User ID:'), userId);
    } else if (checkoutData.sessionId) {
      console.log(chalk.yellow('⚠️ Stripe checkout session created:'), checkoutData.sessionId);
      console.log(chalk.yellow('Note: In production, user would complete payment before proceeding.'));
      
      if (!options.skipPayment) {
        console.log(chalk.red('\nCannot continue without completing payment.'));
        console.log(chalk.yellow('Use --skip-payment flag to bypass this in testing.'));
        process.exit(1);
      }
      
      // In test mode, we'll need to extract the user ID from the session metadata
      // For now, we'll exit as we can't proceed without payment completion
      console.log(chalk.yellow('\nSkipping payment step (test mode)'));
      console.log(chalk.yellow('In production, user ID would be available after payment completion.'));
      process.exit(0);
    }

    if (options.verbose && checkoutData) {
      console.log(chalk.gray('\nCheckout Response:'));
      console.log(chalk.gray(JSON.stringify(checkoutData, null, 2)));
    }

  } catch (error) {
    console.log(chalk.red('❌ Checkout failed:'), (error as Error).message);
    process.exit(1);
  }

  // Add delay between steps
  console.log(chalk.gray(`\nWaiting ${delayMs}ms before next step...`));
  await delay(delayMs);

  // Step 2: Create fitness program
  console.log(chalk.cyan('\nStep 2: Creating fitness program...'));

  try {
    const programResponse = await fetch(`${baseUrl}/api/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const programData = await programResponse.json();

    if (!programResponse.ok) {
      throw new Error(`Program creation failed: ${programData.error || programResponse.statusText}`);
    }

    console.log(chalk.green('✅ Fitness program created successfully!'));
    console.log(chalk.white('Response:'), programData.message || 'User onboarded successfully');

    if (options.verbose && programData) {
      console.log(chalk.gray('\nProgram Response:'));
      console.log(chalk.gray(JSON.stringify(programData, null, 2)));
    }

  } catch (error) {
    console.log(chalk.red('❌ Program creation failed:'), (error as Error).message);
    process.exit(1);
  }

  // Summary
  console.log(chalk.bold.green('\n🎉 Full user flow completed successfully!'));
  console.log(chalk.white('\nSummary:'));
  console.log(chalk.white('- User created:'), userData.name);
  console.log(chalk.white('- Phone number:'), userData.phoneNumber);
  console.log(chalk.white('- User ID:'), userId!);
  console.log(chalk.white('- Fitness program: Created'));
  console.log(chalk.white('- Messages sent: Welcome + First workout'));
  
  console.log(chalk.yellow('\n📱 Check the user\'s phone for:'));
  console.log(chalk.yellow('1. Welcome message with fitness plan overview'));
  console.log(chalk.yellow('2. First daily workout message'));

  return { userId, userData };
}

// CLI setup
const program = new Command();

program
  .name('test-user-flow')
  .description('Test the complete user creation and fitness program flow')
  .version('1.0.0')
  .requiredOption('-n, --name <name>', 'User name')
  .requiredOption('-p, --phone <phone>', 'Phone number')
  .option('-e, --email <email>', 'Email address')
  .option('--fitness-goals <goals>', 'Fitness goals')
  .option('--skill-level <level>', 'Skill level (beginner/intermediate/advanced)')
  .option('--exercise-frequency <frequency>', 'Exercise frequency')
  .option('--gender <gender>', 'Gender')
  .option('--age <age>', 'Age')
  .option('-b, --base-url <url>', 'Base API URL', 'http://localhost:3000')
  .option('-d, --delay <ms>', 'Delay between steps in milliseconds', '2000')
  .option('--skip-payment', 'Skip payment step (for testing)', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    // Validate phone number format (basic validation)
    if (!options.phone.match(/^\+?[\d\s\-()]+$/)) {
      console.log(chalk.red('Error: Invalid phone number format'));
      process.exit(1);
    }

    // Parse delay to number
    if (options.delay) {
      options.delay = parseInt(options.delay, 10);
    }

    await testFullUserFlow(options);
  });

// Example usage helper
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ pnpm flow:test -n "John Doe" -p "+1234567890"');
  console.log('  $ pnpm flow:test -n "Jane Smith" -p "+1234567890" -e "jane@example.com" --age 30');
  console.log('  $ pnpm flow:test -n "Bob Wilson" -p "+1234567890" --skill-level advanced -v');
  console.log('  $ pnpm flow:test -n "Test User" -p "+1234567890" --skip-payment --delay 5000');
  console.log('');
  console.log('This script will:');
  console.log('  1. Create a new user via the checkout API');
  console.log('  2. Create a fitness program for the user');
  console.log('  3. Send welcome and first workout SMS messages');
});

// Parse command line arguments
program.parse();