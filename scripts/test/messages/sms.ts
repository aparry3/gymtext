#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import { TestDatabase } from '../../utils/db';
import { TestConfig } from '../../utils/config';
import { Timer, formatDuration, success, error, warning, info, displayHeader } from '../../utils/common';

interface SmsTestOptions {
  phone: string;
  message: string;
  sid?: string;
  url?: string;
  context?: boolean;
  verbose?: boolean;
  json?: boolean;
}

interface ConversationContext {
  userId: string;
  userName?: string;
  messageCount: number;
  lastMessage?: {
    content: string;
    timestamp: Date;
    isFromUser: boolean;
  };
  fitnessProfile?: {
    hasProfile: boolean;
    profilePreview: string;
  };
  currentPlan?: {
    id: string;
    currentWeek: number;
    currentMesocycle: number;
  };
}

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

class SmsConversationTester {
  private db: TestDatabase;
  private config: TestConfig;
  private timer: Timer;

  constructor() {
    this.db = TestDatabase.getInstance();
    this.config = TestConfig.getInstance();
    this.timer = new Timer();
  }

  /**
   * Get conversation context for a phone number
   */
  async getConversationContext(phone: string): Promise<ConversationContext | null> {
    const user = await this.db.getUserByPhone(phone);
    if (!user) {
      return null;
    }

    const userWithProfile = await this.db.getUserWithProfile(user.id);
    const fitnessPlan = await this.db.getFitnessPlan(user.id);
    // NOTE: Progress tracking via DB is deprecated - now calculated from dates
    // const progress = await this.db.getCurrentProgress(user.id);

    // Get message history (no longer using conversations)
    const messages = await this.db.db
      .selectFrom('messages')
      .where('userId', '=', user.id!)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .execute();

    const messageCountResult = await this.db.db
      .selectFrom('messages')
      .where('userId', '=', user.id!)
      .select(({ fn }) => [fn.count<number>('id').as('count')])
      .executeTakeFirst();

    const messageCount = messageCountResult?.count || 0;

    let lastMessage: { content: string; timestamp: Date; isFromUser: boolean; } | undefined = undefined;
    if (messages[0]) {
      lastMessage = {
        content: messages[0].content,
        timestamp: new Date(messages[0].createdAt),
        isFromUser: messages[0].direction === 'inbound',
      };
    }

    return {
      userId: user.id,
      userName: userWithProfile?.name || undefined,
      messageCount,
      lastMessage,
      fitnessProfile: userWithProfile?.markdownProfile ? {
        hasProfile: true,
        profilePreview: userWithProfile.markdownProfile.substring(0, 200) + '...',
      } : undefined,
      currentPlan: fitnessPlan ? {
        id: fitnessPlan.id,
        currentWeek: 0, // Progress no longer available from DB
        currentMesocycle: 0, // Progress no longer available from DB
      } : undefined,
    };
  }

  /**
   * Display conversation context
   */
  displayContext(context: ConversationContext): void {
    displayHeader('Conversation Context');

    const data = [
      ['Field', 'Value'],
      ['User', context.userName || context.userId],
      ['Message Count', context.messageCount.toString()],
    ];

    if (context.lastMessage) {
      data.push(['Last Message', context.lastMessage.isFromUser ? 'User' : 'System']);
      data.push(['Last Message Time', context.lastMessage.timestamp.toLocaleString()]);
      data.push(['Last Content', context.lastMessage.content.substring(0, 50) + '...']);
    }

    if (context.fitnessProfile) {
      data.push(['─────────', '─────────']);
      data.push(['Has Profile', context.fitnessProfile.hasProfile ? 'Yes' : 'No']);
      data.push(['Profile Preview', context.fitnessProfile.profilePreview]);
    }

    if (context.currentPlan) {
      data.push(['─────────', '─────────']);
      data.push(['Current Week', context.currentPlan.currentWeek.toString()]);
      data.push(['Current Mesocycle', context.currentPlan.currentMesocycle.toString()]);
    }

    console.log(table(data));
  }

  async cleanup(): Promise<void> {
    await this.db.close();
  }
}

// Main function to send test SMS
async function sendTestSMS(options: SmsTestOptions) {
  const timer = new Timer();
  timer.start();
  
  const tester = new SmsConversationTester();
  const config = TestConfig.getInstance();
  
  // Default values
  const messageId = options.sid || generateMessageSid();
  const apiUrl = options.url || config.getApiUrl('/sms');
  const twilioNumber = process.env.TWILIO_NUMBER || '+15555555555';

  if (!options.json) {
    displayHeader('SMS Conversation Test');
    info(`From: ${options.phone}`);
    info(`Message: "${options.message}"`);
    
    if (options.verbose) {
      console.log(chalk.gray(`Message SID: ${messageId}`));
      console.log(chalk.gray(`Endpoint: ${apiUrl}`));
      console.log(chalk.gray(`To (Twilio Number): ${twilioNumber}`));
    }
    console.log();
  }

  // Show conversation context if requested
  if (options.context && !options.json) {
    const context = await tester.getConversationContext(options.phone);
    if (context) {
      tester.displayContext(context);
      console.log();
    } else {
      warning('No conversation context found for this phone number');
      console.log();
    }
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
    if (!options.json) {
      console.log(chalk.blue('📱 Sending message...'));
    }

    // Send the request
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const duration = timer.elapsed();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    
    // Parse the response
    const messageContent = parseTwiMLResponse(responseText);
    
    if (options.json) {
      const result = {
        success: true,
        request: {
          from: options.phone,
          message: options.message,
          messageId,
        },
        response: {
          message: messageContent,
          duration,
        },
      };
      
      // Add context if requested
      if (options.context) {
        const context = await tester.getConversationContext(options.phone);
        if (context) {
          (result as any).context = context;
        }
      }
      
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (options.verbose) {
        console.log(chalk.gray('\nRaw TwiML Response:'));
        console.log(chalk.gray(responseText));
      }
      
      success(`Response received (${formatDuration(duration)}):`);
      console.log(chalk.white(`\n"${messageContent}"\n`));
      
      // Show updated context if requested
      if (options.context) {
        console.log(chalk.cyan('Updated context:'));
        const newContext = await tester.getConversationContext(options.phone);
        if (newContext) {
          const newCount = newContext.messageCount;
          info(`Total messages in conversation: ${newCount}`);
        }
      }
    }

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    if (options.json) {
      console.log(JSON.stringify({ 
        success: false, 
        error: errorMessage,
        duration: timer.elapsed(),
      }));
    } else {
      error(`Failed: ${errorMessage}`);
      
      if (errorMessage.includes('ECONNREFUSED')) {
        console.log(chalk.yellow('Is your local server running? Try: pnpm dev'));
      } else if (errorMessage.includes('fetch failed')) {
        console.log(chalk.yellow('Network error. Check your connection and server status.'));
      }
    }
    
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// CLI setup
const program = new Command();

program
  .name('test-messages-sms')
  .description('Test the SMS chat endpoint with conversation context')
  .version('1.0.0')
  .requiredOption('-p, --phone <phone>', 'Phone number to simulate')
  .requiredOption('-m, --message <message>', 'Message content to send')
  .option('-s, --sid <sid>', 'Message SID (auto-generated if not provided)')
  .option('-u, --url <url>', 'API endpoint URL')
  .option('-c, --context', 'Show conversation context', false)
  .option('--conversation-id <id>', 'Specify conversation ID')
  .option('-v, --verbose', 'Show verbose output', false)
  .option('-j, --json', 'Output as JSON', false)
  .action(async (options: SmsTestOptions) => {
    // Validate phone number format (basic validation)
    if (!options.phone.match(/^\+?[\d\s\-()]+$/)) {
      if (options.json) {
        console.log(JSON.stringify({ error: 'Invalid phone number format' }));
      } else {
        error('Invalid phone number format');
      }
      process.exit(1);
    }

    // Ensure message is not empty
    if (!options.message.trim()) {
      if (options.json) {
        console.log(JSON.stringify({ error: 'Message cannot be empty' }));
      } else {
        error('Message cannot be empty');
      }
      process.exit(1);
    }

    await sendTestSMS(options);
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.outputHelp();
  console.log(chalk.gray('\nExamples:'));
  console.log(chalk.gray('  # Send a simple test message'));
  console.log('  $ pnpm test:messages:sms -p "+1234567890" -m "What\'s my workout today?"');
  console.log();
  console.log(chalk.gray('  # Send with conversation context'));
  console.log('  $ pnpm test:messages:sms -p "+1234567890" -m "I completed it!" --context');
  console.log();
  console.log(chalk.gray('  # Use specific conversation ID'));
  console.log('  $ pnpm test:messages:sms -p "+1234567890" -m "Next exercise?" --conversation-id "conv_123"');
  console.log();
  console.log(chalk.gray('  # Verbose output with context'));
  console.log('  $ pnpm test:messages:sms -p "+1234567890" -m "How many sets?" --context --verbose');
  console.log();
  console.log(chalk.gray('  # JSON output for automation'));
  console.log('  $ pnpm test:messages:sms -p "+1234567890" -m "Help" --json --context');
}

// Parse command line arguments
program.parse();