#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Parse TwiML response to extract message content
function parseTwiMLResponse(xml: string): string {
  const messageMatch = xml.match(/<Message>([\s\S]*?)<\/Message>/);
  if (messageMatch && messageMatch[1]) {
    return messageMatch[1].trim();
  }
  return 'No message found in response';
}

// Generate a mock Twilio Message SID
function generateMessageSid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `SM${timestamp}${random}`.toUpperCase();
}

// Main function to send test SMS
async function sendTestSMS(options: {
  phone: string;
  message: string;
  sid?: string;
  url?: string;
  verbose?: boolean;
}) {
  const startTime = performance.now();
  
  // Default values
  const messageId = options.sid || generateMessageSid();
  const apiUrl = options.url || 'http://localhost:3000/api/sms';
  const twilioNumber = process.env.TWILIO_NUMBER || '+15555555555';

  console.log(chalk.blue('📱 Sending SMS to local endpoint...'));
  console.log(chalk.gray(`From: ${options.phone}`));
  console.log(chalk.gray(`Message: "${options.message}"`));
  
  if (options.verbose) {
    console.log(chalk.gray(`\nMessage SID: ${messageId}`));
    console.log(chalk.gray(`Endpoint: ${apiUrl}`));
    console.log(chalk.gray(`To (Twilio Number): ${twilioNumber}`));
  }

  // Prepare form data to match Twilio webhook format
  const formData = new FormData();
  formData.append('Body', options.message);
  formData.append('From', options.phone);
  formData.append('To', twilioNumber);
  formData.append('MessageSid', messageId);
  formData.append('AccountSid', 'ACtest123456789'); // Mock account SID
  formData.append('NumMedia', '0');

  try {
    // Send the request
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    
    if (options.verbose) {
      console.log(chalk.gray('\nRaw TwiML Response:'));
      console.log(chalk.gray(responseText));
    }

    // Parse and display the response
    const messageContent = parseTwiMLResponse(responseText);
    
    console.log(chalk.green(`\n✅ Response received (${duration}ms):`));
    console.log(chalk.white(`"${messageContent}"`));

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), (error as Error).message);
    
    if ((error as Error).message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('Is your local server running? Try: npm run dev'));
    } else if ((error as Error).message.includes('fetch failed')) {
      console.log(chalk.yellow('Network error. Check your connection and server status.'));
    }
    
    process.exit(1);
  }
}

// CLI setup
const program = new Command();

program
  .name('test-sms')
  .description('Test the SMS chat endpoint locally')
  .version('1.0.0')
  .requiredOption('-p, --phone <phone>', 'Phone number to simulate')
  .requiredOption('-m, --message <message>', 'Message content to send')
  .option('-s, --sid <sid>', 'Message SID (auto-generated if not provided)')
  .option('-u, --url <url>', 'API endpoint URL', 'http://localhost:3000/api/sms')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    // Validate phone number format (basic validation)
    if (!options.phone.match(/^\+?[\d\s\-()]+$/)) {
      console.log(chalk.red('Error: Invalid phone number format'));
      process.exit(1);
    }

    // Ensure message is not empty
    if (!options.message.trim()) {
      console.log(chalk.red('Error: Message cannot be empty'));
      process.exit(1);
    }

    await sendTestSMS(options);
  });

// Parse command line arguments
program.parse();