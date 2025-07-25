#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';
import { postgresDb } from '../src/server/connections/postgres/postgres';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function getUserIdByPhone(phoneNumber: string): Promise<string | null> {
  try {
    const user = await postgresDb
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .select(['id'])
      .executeTakeFirst();
    
    return user?.id || null;
  } catch (error) {
    console.error('Error looking up user:', error);
    return null;
  }
}

async function testProgramCreation(options: {
  phoneNumber: string;
  url?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  // Default values
  const apiUrl = options.url || 'http://localhost:3000/api/programs';
  
  console.log(chalk.blue('🏋️ Testing fitness program creation...'));
  console.log(chalk.gray(`Phone Number: ${options.phoneNumber}`));
  
  // Look up user ID by phone number
  const userId = await getUserIdByPhone(options.phoneNumber);
  
  if (!userId) {
    console.log(chalk.red('\n❌ Error: User not found with phone number:'), options.phoneNumber);
    console.log(chalk.yellow('Make sure the user exists. You can create a user first using: pnpm checkout:test'));
    await postgresDb.destroy();
    process.exit(1);
  }
  
  console.log(chalk.gray(`User ID: ${userId}`));
  
  if (options.verbose) {
    console.log(chalk.gray(`\nEndpoint: ${apiUrl}`));
  }

  try {
    // Send the request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseData.error || response.statusText}`);
    }
    
    console.log(chalk.green(`\n✅ Fitness program created successfully (${duration}ms)`));
    console.log(chalk.white('Response:'), responseData.message || 'User onboarded successfully');

    if (options.verbose) {
      console.log(chalk.gray('\nFull Response:'));
      console.log(chalk.gray(JSON.stringify(responseData, null, 2)));
    }

    console.log(chalk.yellow('\n📱 Check the user\'s phone for welcome and daily workout messages!'));

    // Close database connection
    await postgresDb.destroy();

    return responseData;

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    
    if ((error as Error).message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('Is your local server running? Try: pnpm dev'));
    } else if ((error as Error).message.includes('fetch failed')) {
      console.log(chalk.yellow('Network error. Check your connection and server status.'));
    } else if ((error as Error).message.includes('User not found')) {
      console.log(chalk.yellow('User not found. Make sure the phone number is valid.'));
      console.log(chalk.yellow('You can create a user first using: pnpm checkout:test'));
    }
    
    // Close database connection before exit
    await postgresDb.destroy();
    process.exit(1);
  }
}

// CLI setup
const program = new Command();

program
  .name('test-programs')
  .description('Test the fitness program creation API endpoint')
  .version('1.0.0')
  .requiredOption('-p, --phone <number>', 'Phone number of the user to create fitness program for')
  .option('-u, --url <url>', 'API endpoint URL', 'http://localhost:3000/api/programs')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    await testProgramCreation({
      phoneNumber: options.phone,
      url: options.url,
      verbose: options.verbose
    });
  });

// Example usage helper
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ pnpm programs:test -p "+1234567890"');
  console.log('  $ pnpm programs:test --phone "+19876543210" --verbose');
  console.log('');
  console.log('Note: You need a valid user with this phone number. Create a user first with:');
  console.log('  $ pnpm checkout:test -n "John Doe" -p "+1234567890"');
});

// Parse command line arguments
program.parse();