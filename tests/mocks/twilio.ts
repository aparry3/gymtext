import { vi, type Mock } from 'vitest';

interface MockMessage {
  sid: string;
  to: string;
  from: string;
  body: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed';
  dateCreated: Date;
  dateUpdated: Date;
  errorCode?: number;
  errorMessage?: string;
}

interface MockMessageCreateOptions {
  to: string;
  from: string;
  body: string;
  statusCallback?: string;
}

/**
 * Mock Twilio client for testing
 */
export class MockTwilioClient {
  public messages: {
    create: Mock<[options: MockMessageCreateOptions], Promise<MockMessage>>;
    list: Mock<[options?: any], Promise<MockMessage[]>>;
    get: Mock<[sid: string], { fetch: () => Promise<MockMessage> }>;
  };
  
  private sentMessages: MockMessage[] = [];
  private messageIdCounter = 1000;
  private shouldFail = false;
  private failureMessage = 'Test failure';

  constructor() {
    this.messages = {
      create: vi.fn(async (options: MockMessageCreateOptions) => {
        if (this.shouldFail) {
          throw new Error(this.failureMessage);
        }

        // Validate phone numbers
        if (!this.isValidPhoneNumber(options.to)) {
          throw new Error(`Invalid phone number: ${options.to}`);
        }

        const message: MockMessage = {
          sid: `SM${this.generateSid()}`,
          to: options.to,
          from: options.from,
          body: options.body,
          status: 'sent',
          dateCreated: new Date(),
          dateUpdated: new Date(),
        };

        // Simulate Twilio test number behaviors
        if (options.to === '+15005550001') {
          message.status = 'failed';
          message.errorCode = 21211;
          message.errorMessage = 'The phone number is invalid';
        } else if (options.to === '+15005550009') {
          message.status = 'failed';
          message.errorCode = 21408;
          message.errorMessage = 'Permission to send to this number was denied';
        }

        this.sentMessages.push(message);
        return message;
      }),

      list: vi.fn(async (options?: any) => {
        let messages = [...this.sentMessages];
        
        if (options?.to) {
          messages = messages.filter(m => m.to === options.to);
        }
        
        if (options?.from) {
          messages = messages.filter(m => m.from === options.from);
        }
        
        if (options?.limit) {
          messages = messages.slice(0, options.limit);
        }
        
        return messages;
      }),

      get: vi.fn((sid: string) => ({
        fetch: async () => {
          const message = this.sentMessages.find(m => m.sid === sid);
          if (!message) {
            throw new Error(`Message ${sid} not found`);
          }
          return message;
        },
      })),
    };
  }

  /**
   * Get all sent messages
   */
  getSentMessages(): MockMessage[] {
    return [...this.sentMessages];
  }

  /**
   * Get messages sent to a specific number
   */
  getMessagesTo(phoneNumber: string): MockMessage[] {
    return this.sentMessages.filter(m => m.to === phoneNumber);
  }

  /**
   * Clear all sent messages
   */
  clearMessages(): void {
    this.sentMessages = [];
  }

  /**
   * Set the client to fail on next message
   */
  simulateFailure(message: string = 'Test failure'): void {
    this.shouldFail = true;
    this.failureMessage = message;
  }

  /**
   * Reset failure simulation
   */
  resetFailure(): void {
    this.shouldFail = false;
  }

  /**
   * Simulate receiving an SMS (for webhook testing)
   */
  simulateIncomingSMS(from: string, body: string, to?: string): MockMessage {
    const message: MockMessage = {
      sid: `SM${this.generateSid()}`,
      to: to || process.env.TWILIO_NUMBER || '+15005550006',
      from: from,
      body: body,
      status: 'delivered',
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };
    
    return message;
  }

  /**
   * Reset all mocks
   */
  reset(): void {
    this.messages.create.mockClear();
    this.messages.list.mockClear();
    this.messages.get.mockClear();
    this.sentMessages = [];
    this.shouldFail = false;
    this.messageIdCounter = 1000;
  }

  private generateSid(): string {
    return (this.messageIdCounter++).toString().padStart(32, '0');
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation - starts with + and has at least 10 digits
    return /^\+\d{10,}$/.test(phone);
  }
}

/**
 * Create a mock Twilio instance
 */
export function createMockTwilio() {
  const mockClient = new MockTwilioClient();
  
  // Store globally for access in mocked module
  (globalThis as any).__mockTwilioClient = mockClient;
  
  // Mock the twilio module
  vi.mock('twilio', () => {
    return {
      default: vi.fn(() => (globalThis as any).__mockTwilioClient),
      Twilio: vi.fn(() => (globalThis as any).__mockTwilioClient),
    };
  });
  
  return mockClient;
}

/**
 * Helper to create webhook request data
 */
export function createTwilioWebhookData(data: {
  from: string;
  body: string;
  to?: string;
  messageSid?: string;
}) {
  return {
    MessageSid: data.messageSid || `SM${Date.now()}`,
    AccountSid: process.env.TWILIO_ACCOUNT_SID || 'ACtest',
    From: data.from,
    To: data.to || process.env.TWILIO_NUMBER || '+15005550006',
    Body: data.body,
    NumMedia: '0',
    FromCity: 'TEST CITY',
    FromState: 'CA',
    FromCountry: 'US',
    FromZip: '12345',
  };
}

/**
 * Helper to validate Twilio webhook signature (mock version)
 */
export function mockValidateTwilioSignature(
  authToken: string,
  twilioSignature: string,
  url: string,
  params: any
): boolean {
  // In tests, we'll accept a specific test signature
  return twilioSignature === 'test-valid-signature';
}

/**
 * Test scenarios for SMS functionality
 */
export const smsTestScenarios = {
  /**
   * Successful message delivery
   */
  successfulDelivery: (mockClient: MockTwilioClient) => {
    // Messages will be sent successfully by default
    return mockClient;
  },

  /**
   * Failed message delivery
   */
  failedDelivery: (mockClient: MockTwilioClient) => {
    mockClient.simulateFailure('Invalid phone number');
    return mockClient;
  },

  /**
   * Rate limit scenario
   */
  rateLimited: (mockClient: MockTwilioClient) => {
    mockClient.simulateFailure('Rate limit exceeded');
    return mockClient;
  },

  /**
   * Conversation flow
   */
  conversationFlow: (mockClient: MockTwilioClient) => {
    // Simulate a back-and-forth conversation
    const userPhone = '+12125551234';
    const systemPhone = process.env.TWILIO_NUMBER || '+15005550006';
    
    // User: Initial message
    const msg1 = mockClient.simulateIncomingSMS(userPhone, 'Hi, I completed my workout!');
    
    // System: Response (would be sent via create)
    // User: Follow-up
    const msg2 = mockClient.simulateIncomingSMS(userPhone, 'It was tough but I finished all sets');
    
    // System: Another response
    // User: Question
    const msg3 = mockClient.simulateIncomingSMS(userPhone, 'What should I eat for recovery?');
    
    return mockClient;
  },
};