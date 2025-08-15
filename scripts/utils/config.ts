import { config } from 'dotenv';
import { resolve } from 'path';
import chalk from 'chalk';

/**
 * Test configuration utility
 * Manages environment configuration and API endpoints
 */
export class TestConfig {
  private static instance: TestConfig;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TestConfig {
    if (!TestConfig.instance) {
      TestConfig.instance = new TestConfig();
    }
    return TestConfig.instance;
  }

  /**
   * Load environment variables
   */
  loadEnv(): void {
    if (this.isInitialized) return;
    
    config({ path: resolve(process.cwd(), '.env.local') });
    this.isInitialized = true;
    
    // Validate required environment variables
    const required = [
      'DATABASE_URL',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_NUMBER',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.warn(chalk.yellow(`⚠️  Missing environment variables: ${missing.join(', ')}`));
    }
  }

  /**
   * Get API URL for an endpoint
   */
  getApiUrl(endpoint: string): string {
    const port = process.env.PORT || '3000';
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
    return `${baseUrl}/api/${endpoint}`;
  }

  /**
   * Get test user configuration
   */
  getTestUser(): { phone: string; name: string; email?: string } {
    return {
      phone: process.env.TEST_USER_PHONE || '+1234567890',
      name: process.env.TEST_USER_NAME || 'Test User',
      email: process.env.TEST_USER_EMAIL,
    };
  }

  /**
   * Get current environment
   */
  getEnvironment(): 'development' | 'staging' | 'production' {
    const env = (process.env.NODE_ENV || 'development') as string;
    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    return 'development';
  }

  /**
   * Check if running in dry run mode by default
   */
  isDryRunDefault(): boolean {
    return process.env.TEST_DRY_RUN !== 'false';
  }

  /**
   * Get database connection string
   */
  getDatabaseUrl(): string {
    return process.env.DATABASE_URL || '';
  }

  /**
   * Get test configuration summary
   */
  getSummary(): void {
    console.log(chalk.gray('Configuration:'));
    console.log(chalk.gray(`  Environment: ${this.getEnvironment()}`));
    console.log(chalk.gray(`  API Base: ${this.getApiUrl('')}`));
    console.log(chalk.gray(`  Dry Run Default: ${this.isDryRunDefault()}`));
  }
}

// Export singleton instance
export const testConfig = TestConfig.getInstance();