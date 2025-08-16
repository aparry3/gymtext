import chalk from 'chalk';
import { table } from 'table';

/**
 * Common utilities for test scripts
 */

/**
 * Delay execution for specified milliseconds
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Display results in a table
 */
export function displayTable(data: any[][], title?: string): void {
  if (title) {
    console.log(chalk.bold(`\n${title}`));
  }

  const config = {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼'
    }
  };

  console.log(table(data, config));
}

/**
 * Display a separator line
 */
export function separator(char: string = '─', length: number = 50): void {
  console.log(chalk.gray(char.repeat(length)));
}

/**
 * Display a header
 */
export function header(title: string, icon?: string): void {
  console.log(chalk.bold.blue(`\n${icon ? icon + ' ' : ''}${title}`));
  separator();
}

/**
 * Display success message
 */
export function success(message: string, details?: string): void {
  console.log(chalk.green(`✅ ${message}`));
  if (details) {
    console.log(chalk.gray(`   ${details}`));
  }
}

/**
 * Display error message
 */
export function error(message: string, err?: Error): void {
  console.log(chalk.red(`❌ ${message}`));
  if (err) {
    console.log(chalk.gray(`   ${err.message}`));
  }
}

/**
 * Display warning message
 */
export function warning(message: string, details?: string): void {
  console.log(chalk.yellow(`⚠️  ${message}`));
  if (details) {
    console.log(chalk.gray(`   ${details}`));
  }
}

/**
 * Display info message
 */
export function info(message: string, details?: string): void {
  console.log(chalk.cyan(`ℹ️  ${message}`));
  if (details) {
    console.log(chalk.gray(`   ${details}`));
  }
}

/**
 * Confirm action with user (for interactive mode)
 */
export async function confirm(message: string): Promise<boolean> {
  console.log(chalk.yellow(`\n${message} (y/n)`));
  
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === 'y' || answer === 'yes');
    });
  });
}

/**
 * Parse phone number to ensure consistent format
 */
export function parsePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  
  // Add + prefix
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generate a test phone number
 */
export function generateTestPhone(): string {
  const timestamp = Date.now().toString().slice(-7);
  return `+1555${timestamp}`;
}

/**
 * Generate a test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now().toString(36);
  return `test-${timestamp}@example.com`;
}

/**
 * Display spinner animation (basic)
 */
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private current = 0;
  private interval: NodeJS.Timeout | null = null;
  private message: string;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    this.interval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(this.frames[this.current])} ${this.message}`);
      this.current = (this.current + 1) % this.frames.length;
    }, 80);
  }

  stop(success: boolean = true): void {
    if (this.interval) {
      clearInterval(this.interval);
      process.stdout.write('\r' + ' '.repeat(this.message.length + 4) + '\r');
      
      if (success) {
        console.log(chalk.green(`✅ ${this.message}`));
      } else {
        console.log(chalk.red(`❌ ${this.message}`));
      }
    }
  }

  update(message: string): void {
    this.message = message;
  }
}

/**
 * Measure execution time
 */
export class Timer {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  start(): void {
    this.startTime = performance.now();
  }

  elapsed(): number {
    return performance.now() - this.startTime;
  }

  elapsedFormatted(): string {
    return formatDuration(this.elapsed());
  }

  reset(): void {
    this.startTime = performance.now();
  }
}

/**
 * Display a formatted header
 */
export function displayHeader(title: string, icon?: string): void {
  console.log(chalk.bold.blue(`\n${icon ? icon + ' ' : ''}${title}`));
  separator('═');
}

/**
 * Create a simple spinner helper
 */
export function spinner(message: string): { stop: () => void } {
  const spin = new Spinner(message);
  spin.start();
  return {
    stop: () => spin.stop()
  };
}