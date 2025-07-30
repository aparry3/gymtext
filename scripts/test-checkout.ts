#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

interface CheckoutData {
  name: string;
  phoneNumber: string;
  email?: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: string;
  paymentMethodId?: string;
}

async function testCheckout(options: {
  name: string;
  phone: string;
  email?: string;
  fitnessGoals?: string;
  skillLevel?: string;
  exerciseFrequency?: string;
  gender?: string;
  age?: string;
  paymentMethod?: string;
  url?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  // Default values
  const apiUrl = options.url || 'http://localhost:3000/api/checkout';
  
  // Prepare checkout data
  const checkoutData: CheckoutData = {
    name: options.name,
    phoneNumber: options.phone,
    email: options.email,
    fitnessGoals: options.fitnessGoals || 'Build muscle and improve fitness',
    skillLevel: options.skillLevel || 'intermediate',
    exerciseFrequency: options.exerciseFrequency || '3-4 times per week',
    gender: options.gender || 'male',
    age: options.age || '25',
    ...(options.paymentMethod && { paymentMethodId: options.paymentMethod })
  };

  console.log(chalk.blue('💳 Testing checkout endpoint...'));
  console.log(chalk.gray(`Name: ${checkoutData.name}`));
  console.log(chalk.gray(`Phone: ${checkoutData.phoneNumber}`));
  if (checkoutData.email) console.log(chalk.gray(`Email: ${checkoutData.email}`));
  
  if (options.verbose) {
    console.log(chalk.gray('\nCheckout Data:'));
    console.log(chalk.gray(JSON.stringify(checkoutData, null, 2)));
    console.log(chalk.gray(`\nEndpoint: ${apiUrl}`));
  }

  try {
    // Send the request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseData.message || response.statusText}`);
    }
    
    console.log(chalk.green(`\n✅ Checkout successful (${duration}ms)`));
    
    if (responseData.sessionId) {
      console.log(chalk.white('Stripe Session ID:'), responseData.sessionId);
      console.log(chalk.yellow('\nNext step: Complete payment at Stripe Checkout'));
    } else if (responseData.subscription) {
      console.log(chalk.white('Subscription created successfully!'));
      console.log(chalk.white('User ID:'), responseData.userId);
      console.log(chalk.white('Redirect URL:'), responseData.redirectUrl);
    }

    if (options.verbose) {
      console.log(chalk.gray('\nFull Response:'));
      console.log(chalk.gray(JSON.stringify(responseData, null, 2)));
    }

    return responseData;

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    
    if ((error as Error).message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('Is your local server running? Try: pnpm dev'));
    } else if ((error as Error).message.includes('fetch failed')) {
      console.log(chalk.yellow('Network error. Check your connection and server status.'));
    }
    
    process.exit(1);
  }
}

// CLI setup
const program = new Command();

program
  .name('test-checkout')
  .description('Test the checkout API endpoint')
  .version('1.0.0')
  .requiredOption('-n, --name <name>', 'User name')
  .requiredOption('-p, --phone <phone>', 'Phone number')
  .option('-e, --email <email>', 'Email address')
  .option('--fitness-goals <goals>', 'Fitness goals')
  .option('--skill-level <level>', 'Skill level (beginner/intermediate/advanced)')
  .option('--exercise-frequency <frequency>', 'Exercise frequency')
  .option('--gender <gender>', 'Gender')
  .option('--age <age>', 'Age')
  .option('--payment-method <id>', 'Payment method ID (for direct payment)')
  .option('-u, --url <url>', 'API endpoint URL', 'http://localhost:3000/api/checkout')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    // Validate phone number format (basic validation)
    if (!options.phone.match(/^\+?[\d\s\-()]+$/)) {
      console.log(chalk.red('Error: Invalid phone number format'));
      process.exit(1);
    }

    await testCheckout(options);
  });

// Example usage helper
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ pnpm checkout:test -n "John Doe" -p "+1234567890"');
  console.log('  $ pnpm checkout:test -n "Jane Smith" -p "+1234567890" -e "jane@example.com" --age 30 -v');
  console.log('  $ pnpm checkout:test -n "Bob Wilson" -p "+1234567890" --skill-level advanced --verbose');
});

// Parse command line arguments
program.parse();