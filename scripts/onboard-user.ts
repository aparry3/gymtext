#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';
import { UserRepository } from '@/server/repositories/userRepository';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Main function to onboard a user
async function onboardUser(options: {
  phone: string;
  url?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  // Default values
  const apiUrl = options.url || 'http://localhost:3000/api/agent';

  console.log(chalk.blue('🏋️ Onboarding user...'));
  console.log(chalk.gray(`Phone: ${options.phone}`));
  
  if (options.verbose) {
    console.log(chalk.gray(`Endpoint: ${apiUrl}`));
  }

  try {
    // Look up user by phone number
    const userRepository = new UserRepository();
    const user = await userRepository.findByPhoneNumber(options.phone);

    if (!user) {
      console.log(chalk.red('❌ Error: User not found with phone number'), options.phone);
      console.log(chalk.yellow('Make sure the user is registered in the system first.'));
      process.exit(1);
    }

    if (options.verbose) {
      console.log(chalk.gray(`Found user: ${user.id}`));
    }

    // Call the agent endpoint with onboard action
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'onboard',
        userId: user.id,
      }),
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    if (options.verbose) {
      console.log(chalk.gray('\nAPI Response:'));
      console.log(chalk.gray(JSON.stringify(responseData, null, 2)));
    }

    console.log(chalk.green(`\n✅ User onboarded successfully (${duration}ms)`));
    console.log(chalk.white(`User ID: ${user.id}`));
    console.log(chalk.white(`Message: ${responseData.message}`));

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
  .name('onboard-user')
  .description('Onboard a user using the agent endpoint')
  .version('1.0.0')
  .requiredOption('-p, --phone <phone>', 'Phone number of the user to onboard')
  .option('-u, --url <url>', 'API endpoint URL', 'http://localhost:3000/api/agent')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    // Validate phone number format (basic validation)
    if (!options.phone.match(/^\+?[\d\s\-()]+$/)) {
      console.log(chalk.red('Error: Invalid phone number format'));
      process.exit(1);
    }

    await onboardUser(options);
  });

// Parse command line arguments
program.parse();