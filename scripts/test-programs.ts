#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testProgramCreation(options: {
  userId: string;
  url?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  // Default values
  const apiUrl = options.url || 'http://localhost:3000/api/programs';
  
  console.log(chalk.blue('🏋️ Testing fitness program creation...'));
  console.log(chalk.gray(`User ID: ${options.userId}`));
  
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
      body: JSON.stringify({ userId: options.userId }),
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

    return responseData;

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    
    if ((error as Error).message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('Is your local server running? Try: pnpm dev'));
    } else if ((error as Error).message.includes('fetch failed')) {
      console.log(chalk.yellow('Network error. Check your connection and server status.'));
    } else if ((error as Error).message.includes('User not found')) {
      console.log(chalk.yellow('User not found. Make sure the user ID is valid.'));
      console.log(chalk.yellow('You can create a user first using: pnpm checkout:test'));
    }
    
    process.exit(1);
  }
}

// CLI setup
const program = new Command();

program
  .name('test-programs')
  .description('Test the fitness program creation API endpoint')
  .version('1.0.0')
  .requiredOption('-i, --user-id <id>', 'User ID to create fitness program for')
  .option('-u, --url <url>', 'API endpoint URL', 'http://localhost:3000/api/programs')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    await testProgramCreation(options);
  });

// Example usage helper
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ pnpm programs:test -i "123e4567-e89b-12d3-a456-426614174000"');
  console.log('  $ pnpm programs:test --user-id "user_abc123" --verbose');
  console.log('');
  console.log('Note: You need a valid user ID. Create a user first with:');
  console.log('  $ pnpm checkout:test -n "John Doe" -p "+1234567890"');
});

// Parse command line arguments
program.parse();