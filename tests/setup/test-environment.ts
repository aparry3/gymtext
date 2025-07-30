import { beforeEach, afterEach, vi } from 'vitest';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '.env.test.local');
const defaultEnvPath = path.resolve(process.cwd(), '.env.test');

if (existsSync(envPath)) {
  config({ path: envPath });
} else if (existsSync(defaultEnvPath)) {
  config({ path: defaultEnvPath });
}

// Set test defaults if not already set
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost/test';
process.env.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'ACtest1234567890abcdef1234567890ab';
process.env.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'test-auth-token';
process.env.TWILIO_NUMBER = process.env.TWILIO_NUMBER || '+1234567890';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'test-stripe-key';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});