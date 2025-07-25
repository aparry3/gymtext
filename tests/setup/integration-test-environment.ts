import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanupTestDatabases } from '../utils/db';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test if it exists
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
// Also load from .env.local as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Set up test environment variables
process.env.NODE_ENV = 'test';

// Database configuration
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gymtext';

// External service configurations (use test values)
process.env.TWILIO_ACCOUNT_SID = process.env.TEST_TWILIO_ACCOUNT_SID || 'ACtest000000000000000000000000000';
process.env.TWILIO_AUTH_TOKEN = process.env.TEST_TWILIO_AUTH_TOKEN || 'test_auth_token';
process.env.TWILIO_NUMBER = process.env.TEST_TWILIO_NUMBER || '+15005550006'; // Twilio test number

process.env.STRIPE_SECRET_KEY = process.env.TEST_STRIPE_SECRET_KEY || 'sk_test_dummy_key';
process.env.STRIPE_WEBHOOK_SECRET = process.env.TEST_STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
process.env.STRIPE_PRICE_ID = process.env.TEST_STRIPE_PRICE_ID || 'price_test_123';

process.env.OPENAI_API_KEY = process.env.TEST_OPENAI_API_KEY || 'test-openai-key';
process.env.GOOGLE_API_KEY = process.env.TEST_GOOGLE_API_KEY || 'test-google-key';

process.env.PINECONE_API_KEY = process.env.TEST_PINECONE_API_KEY || 'test-pinecone-key';
process.env.PINECONE_ENVIRONMENT = process.env.TEST_PINECONE_ENVIRONMENT || 'test-environment';
process.env.PINECONE_INDEX_NAME = process.env.TEST_PINECONE_INDEX_NAME || 'test-index';

// App configuration
process.env.NEXTAUTH_SECRET = process.env.TEST_NEXTAUTH_SECRET || 'test-nextauth-secret';
process.env.NEXTAUTH_URL = process.env.TEST_NEXTAUTH_URL || 'http://localhost:3000';

// Global test utilities
global.testHelpers = {
  // Helper to wait for async operations
  waitFor: async (condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> => {
    const startTime = Date.now();
    while (!(await condition())) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for condition');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },
  
  // Helper to create authenticated request headers
  createAuthHeaders: (token?: string): Record<string, string> => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || 'test-token'}`,
    };
  },
  
  // Helper to create form data
  createFormData: (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },
};

// Lifecycle hooks
beforeAll(async () => {
  console.log('🚀 Starting integration tests...');
  
  // Ensure required environment variables are set
  const requiredEnvVars = ['DATABASE_URL'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`);
    }
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up test databases...');
  await cleanupTestDatabases();
  console.log('✅ Integration tests completed');
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Use consistent time for tests
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
});

afterEach(() => {
  // Restore real timers
  vi.useRealTimers();
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Extend global type definitions
declare global {
  var testHelpers: {
    waitFor: (condition: () => boolean | Promise<boolean>, timeout?: number) => Promise<void>;
    createAuthHeaders: (token?: string) => Record<string, string>;
    createFormData: (data: Record<string, any>) => FormData;
  };
}