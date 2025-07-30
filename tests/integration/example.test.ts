import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withTestDatabase, seedTestData } from '../utils/db';
import { createIntegrationLLMMock } from '../mocks/llm-integration';
import { createMockTwilio } from '../mocks/twilio';
import { createMockStripe } from '../mocks/stripe';
import { createMockPinecone } from '../mocks/pinecone';

/**
 * Example integration test demonstrating the test infrastructure
 * This test shows how to use all the mocks and test utilities together
 */
describe('Integration Test Infrastructure Example', () => {
  let mockLLM: ReturnType<typeof createIntegrationLLMMock>;
  let mockTwilio: ReturnType<typeof createMockTwilio>;
  let mockStripe: ReturnType<typeof createMockStripe>;
  let mockPinecone: ReturnType<typeof createMockPinecone>;

  beforeEach(() => {
    // Set up all mocks
    mockLLM = createIntegrationLLMMock('userOnboarding');
    mockTwilio = createMockTwilio();
    mockStripe = createMockStripe();
    mockPinecone = createMockPinecone();
  });

  afterEach(() => {
    // Clean up mocks
    mockLLM.reset();
    mockTwilio.reset();
    mockStripe.reset();
    mockPinecone.reset();
  });

  it('should demonstrate database test utilities', async () => {
    await withTestDatabase(async (db) => {
      // Seed test data
      await seedTestData(db, {
        users: [{
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          phoneNumber: '+12125551234',
          email: 'john@example.com',
          stripeCustomerId: 'cus_123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        fitnessProfiles: [{
          id: '123e4567-e89b-12d3-a456-426614174001',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          fitnessGoals: 'strength',
          skillLevel: 'intermediate',
          exerciseFrequency: '4 days/week',
          gender: 'male',
          age: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      });

      // Query the database
      const user = await db
        .selectFrom('users')
        .where('id', '=', '123e4567-e89b-12d3-a456-426614174000')
        .selectAll()
        .executeTakeFirst();

      expect(user).toBeDefined();
      expect(user?.phoneNumber).toBe('+12125551234');
    });
  });

  it('should demonstrate LLM mock usage', async () => {
    // The LLM mock is pre-configured with userOnboarding scenario
    // It will return predictable responses in sequence
    
    const firstResponse = await mockLLM.getMock().invoke('Generate welcome message');
    expect(firstResponse.content).toContain('Welcome to GymText');
    
    const secondResponse = await mockLLM.getMock().invoke('Generate fitness plan');
    expect(secondResponse.content).toHaveProperty('programType', 'hybrid');
    expect(secondResponse.content).toHaveProperty('macrocycles');
  });

  it('should demonstrate Twilio SMS mock', async () => {
    // Send a message
    const message = await mockTwilio.messages.create({
      to: '+12125551234',
      from: process.env.TWILIO_NUMBER!,
      body: 'Welcome to GymText! Your fitness journey starts now.',
    });

    expect(message.sid).toMatch(/^SM/);
    expect(message.status).toBe('sent');

    // Check sent messages
    const sentMessages = mockTwilio.getSentMessages();
    expect(sentMessages).toHaveLength(1);
    expect(sentMessages[0].body).toContain('Welcome to GymText');

    // Simulate incoming SMS
    const incomingMessage = mockTwilio.simulateIncomingSMS(
      '+12125551234',
      'I completed my workout!'
    );
    expect(incomingMessage.body).toBe('I completed my workout!');
  });

  it('should demonstrate Stripe payment mock', async () => {
    // Create a customer
    const customer = await mockStripe.customers.create({
      email: 'test@example.com',
      phone: '+12125551234',
      metadata: { userId: 'user_123' },
    });

    expect(customer.id).toMatch(/^cus_/);

    // Create checkout session
    const session = await mockStripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: 'price_123', quantity: 1 }],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    expect(session.id).toMatch(/^cs_test_/);
    expect(session.url).toContain('checkout.stripe.com');

    // Complete the session
    const completed = mockStripe.completeCheckoutSession(session.id);
    expect(completed.status).toBe('complete');
    expect(completed.payment_status).toBe('paid');
  });

  it('should demonstrate Pinecone vector search mock', async () => {
    const index = mockPinecone.Index('test-index');

    // Upsert vectors
    await index.upsert({
      vectors: [
        {
          id: 'vec1',
          values: Array(1536).fill(0.1),
          metadata: { type: 'workout', category: 'strength' },
        },
        {
          id: 'vec2',
          values: Array(1536).fill(0.2),
          metadata: { type: 'nutrition', category: 'post-workout' },
        },
      ],
    });

    // Query vectors
    const queryResponse = await index.query({
      vector: Array(1536).fill(0.15),
      topK: 5,
      includeMetadata: true,
      filter: { type: 'workout' },
    });

    expect(queryResponse.matches).toHaveLength(1);
    expect(queryResponse.matches[0].metadata).toHaveProperty('type', 'workout');
  });

  it('should demonstrate a complete user onboarding flow', async () => {
    await withTestDatabase(async (db) => {
      // 1. Create Stripe customer
      const stripeCustomer = await mockStripe.customers.create({
        email: 'newuser@example.com',
        phone: '+13105551234',
      });

      // 2. Create user in database
      const user = await db
        .insertInto('users')
        .values({
          id: '223e4567-e89b-12d3-a456-426614174000',
          name: 'New User',
          phoneNumber: '+13105551234',
          email: 'newuser@example.com',
          stripeCustomerId: stripeCustomer.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      expect(user).toBeDefined();

      // 3. Send welcome SMS
      const welcomeMessage = await mockTwilio.messages.create({
        to: user!.phoneNumber,
        from: process.env.TWILIO_NUMBER!,
        body: 'Welcome to GymText!',
      });

      expect(welcomeMessage.status).toBe('sent');

      // 4. Generate fitness plan using LLM
      // First call returns welcome message, second call returns fitness plan
      const welcomeResponse = await mockLLM.getMock().invoke('Welcome message');
      const planResponse = await mockLLM.getMock().invoke('Generate fitness plan');
      expect(planResponse.content).toHaveProperty('programType');

      // 5. Store conversation in Pinecone
      const conversationIndex = mockPinecone.Index('conversations');
      await conversationIndex.upsert({
        vectors: [{
          id: `conv-${user!.id}-welcome`,
          values: Array(1536).fill(0.5),
          metadata: {
            userId: user!.id,
            type: 'conversation',
            content: 'User onboarding completed',
            timestamp: new Date().toISOString(),
          },
        }],
      });

      // Verify complete setup
      const dbUser = await db
        .selectFrom('users')
        .where('id', '=', user!.id)
        .selectAll()
        .executeTakeFirst();

      const sentSms = mockTwilio.getMessagesTo('+13105551234');
      const vectorStats = await conversationIndex.describeIndexStats();

      expect(dbUser).toBeDefined();
      expect(sentSms).toHaveLength(1);
      expect(vectorStats.totalVectorCount).toBe(1);
    });
  });
});