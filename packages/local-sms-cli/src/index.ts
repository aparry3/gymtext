#!/usr/bin/env node

/**
 * GymText Local SMS CLI
 * 
 * Connects to the SSE endpoint to display local SMS messages in real-time.
 * Run: pnpm gymtext-sms
 * Or:  node dist/index.js
 */

import chalk from 'chalk';
import ora from 'ora';

interface SSEEvent {
  type: 'connected' | 'message';
  timestamp?: string;
  message?: {
    id: string;
    to: string;
    from: string;
    content: string;
    timestamp: string;
  };
}

class LocalSMSCLI {
  private baseUrl: string;
  private phoneNumber?: string;
  private isRunning: boolean = false;

  constructor() {
    // Default to localhost:3000 (Next.js dev server)
    this.baseUrl = process.env.SMS_CLI_URL || 'http://localhost:3000';
    
    // Parse command line args
    const args = process.argv.slice(2);
    const urlIndex = args.findIndex(arg => arg === '--url' || arg === '-u');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
      this.baseUrl = args[urlIndex + 1];
    }
    
    const phoneIndex = args.findIndex(arg => arg === '--phone' || arg === '-p');
    if (phoneIndex !== -1 && args[phoneIndex + 1]) {
      this.phoneNumber = args[phoneIndex + 1];
    }
  }

  async start(): Promise<void> {
    console.clear();
    this.printHeader();

    // Build the SSE URL
    let sseUrl = `${this.baseUrl}/api/messages/stream`;
    if (this.phoneNumber) {
      sseUrl += `?phoneNumber=${encodeURIComponent(this.phoneNumber)}`;
    }

    const spinner = ora({
      text: 'Connecting to message stream...',
      color: 'cyan'
    }).start();

    try {
      const response = await fetch(sseUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        spinner.fail(`Failed to connect: ${response.status} ${response.statusText}`);
        console.log(chalk.red(`\n${errorText}`));
        process.exit(1);
      }

      spinner.succeed('Connected to message stream');
      this.isRunning = true;

      // Display filter info if any
      if (this.phoneNumber) {
        console.log(chalk.gray(`  Filtering messages for: ${this.phoneNumber}`));
      }
      console.log(chalk.gray('  Press Ctrl+C to stop\n'));

      // Process the stream
      await this.processStream(response.body!);

    } catch (error) {
      spinner.fail('Failed to connect to message stream');
      console.log(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}`));
      console.log(chalk.yellow('\nMake sure the dev server is running:'));
      console.log(chalk.gray('  terminal 1: pnpm dev'));
      console.log(chalk.gray('  terminal 2: pnpm gymtext-sms\n'));
      process.exit(1);
    }
  }

  private printHeader(): void {
    console.log(chalk.cyan.bold('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║   GymText Local SMS Monitor v1.0       ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════════╝'));
    console.log();
  }

  private async processStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (this.isRunning) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data: SSEEvent = JSON.parse(line.slice(6));
            this.handleEvent(data);
          } catch (e) {
            // Ignore parse errors for incomplete data
          }
        }
      }
    }
  }

  private handleEvent(event: SSEEvent): void {
    switch (event.type) {
      case 'connected':
        // Already handled by spinner
        break;
        
      case 'message':
        if (event.message) {
          this.displayMessage(event.message);
        }
        break;
    }
  }

  private displayMessage(msg: {
    id: string;
    to: string;
    from: string;
    content: string;
    timestamp: string;
  }): void {
    const timestamp = new Date(msg.timestamp);
    const timeStr = timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const dateStr = timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    // Print message with formatting
    console.log();
    console.log(chalk.bgBlack.white.bold(' NEW MESSAGE '));
    console.log();
    console.log(chalk.gray('  Time:    ') + chalk.white(`${dateStr} ${timeStr}`));
    console.log(chalk.gray('  To:      ') + chalk.cyan(msg.to));
    console.log(chalk.gray('  From:    ') + chalk.gray(msg.from));
    console.log(chalk.gray('  ID:      ') + chalk.gray(msg.id));
    console.log();
    console.log(chalk.gray('  Content:'));
    console.log(chalk.white.bgBlack('  ' + this.wrapText(msg.content, 60).join('\n  ')));
    console.log();
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
  }

  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length > width) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = (currentLine + ' ' + word).trim();
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [''];
  }

  stop(): void {
    this.isRunning = false;
  }
}

// Handle Ctrl+C
const cli = new LocalSMSCLI();

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\nStopping SMS monitor...'));
  cli.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cli.stop();
  process.exit(0);
});

// Start the CLI
cli.start().catch(console.error);
