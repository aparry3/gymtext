import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { ChatService } from '@/server/services/chatService';
import { UserRepository } from '@/server/repositories/userRepository';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

describe('ChatService Integration Tests', () => {
  let chatService: ChatService;
  let userRepo: UserRepository;
  let messageRepo: MessageRepository;
  let conversationRepo: ConversationRepository;
  let testUserId: string;

  beforeAll(async () => {
    // Initialize services and repositories
    chatService = new ChatService();
    userRepo = new UserRepository();
    messageRepo = new MessageRepository();
    conversationRepo = new ConversationRepository();

    // Get a real test user from the database
    const users = await postgresDb
      .selectFrom('users')
      .selectAll()
      .limit(1)
      .execute();
    if (users.length === 0) {
      throw new Error('No test users found in database. Run test:user:create first.');
    }
    testUserId = users[0].id;
  });

  afterEach(async () => {
    // Clean up any test messages created
    // Note: In a real test environment, you'd want to use transactions or test database
  });

  describe('Real Agent Integration', () => {
    it('should generate response using actual contextualChatChain', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      const testMessage = 'What are the benefits of squats?';
      
      // Call the real service with real agent
      const response = await chatService.handleIncomingMessage(user, testMessage);

      // Verify response characteristics
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(10); // Should be a meaningful response
      expect(response.length).toBeLessThanOrEqual(1600); // Should respect SMS limit
      
      // Response should be relevant to the question
      const lowerResponse = response.toLowerCase();
      expect(
        lowerResponse.includes('squat') || 
        lowerResponse.includes('leg') || 
        lowerResponse.includes('strength') ||
        lowerResponse.includes('muscle') ||
        lowerResponse.includes('exercise')
      ).toBe(true);
    }, 10000); // Increase timeout for LLM call

    it('should use conversation context in responses', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      // First message to establish context
      const firstMessage = 'I want to focus on building leg strength';
      const firstResponse = await chatService.handleIncomingMessage(user, firstMessage);
      
      expect(firstResponse).toBeTruthy();

      // Wait a bit to ensure any async operations complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second message that should use context
      const secondMessage = 'What exercises do you recommend?';
      const secondResponse = await chatService.handleIncomingMessage(user, secondMessage);

      expect(secondResponse).toBeTruthy();
      
      // Response should be contextually aware (about legs/strength)
      const lowerResponse = secondResponse.toLowerCase();
      expect(
        lowerResponse.includes('leg') || 
        lowerResponse.includes('squat') || 
        lowerResponse.includes('lunge') ||
        lowerResponse.includes('strength') ||
        lowerResponse.includes('lower body')
      ).toBe(true);
    }, 15000); // Increase timeout for multiple LLM calls

    it('should not persist messages to database directly', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      // Get initial message count
      const initialMessages = await postgresDb
        .selectFrom('messages')
        .where('userId', '=', testUserId)
        .select(['id'])
        .execute();
      const initialCount = initialMessages.length;

      // Send a message through the service
      const testMessage = 'This is a test message for duplication check';
      await chatService.handleIncomingMessage(user, testMessage);

      // Check message count hasn't changed (service doesn't persist)
      const afterMessages = await postgresDb
        .selectFrom('messages')
        .where('userId', '=', testUserId)
        .select(['id'])
        .execute();
      const afterCount = afterMessages.length;

      // The service itself should not persist messages
      expect(afterCount).toBe(initialCount);
    }, 10000);

    it('should handle various message types appropriately', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      const testCases = [
        {
          message: 'Hello!',
          expectation: 'greeting response'
        },
        {
          message: 'What should I eat for protein?',
          expectation: 'nutrition advice'
        },
        {
          message: 'I completed my workout!',
          expectation: 'encouragement'
        },
        {
          message: 'How do I improve my form?',
          expectation: 'technique advice'
        }
      ];

      for (const testCase of testCases) {
        const response = await chatService.handleIncomingMessage(user, testCase.message);
        
        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(10);
        expect(response).not.toBe("Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!");
      }
    }, 30000); // Increase timeout for multiple LLM calls

    it('should maintain consistent response quality', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      // Test that responses are consistent and high quality
      const message = 'What are good exercises for beginners?';
      
      const response1 = await chatService.handleIncomingMessage(user, message);
      
      // Wait a moment and ask again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response2 = await chatService.handleIncomingMessage(user, message);

      // Both responses should be valid
      expect(response1).toBeTruthy();
      expect(response2).toBeTruthy();
      
      // Both should be substantial responses
      expect(response1.length).toBeGreaterThan(50);
      expect(response2.length).toBeGreaterThan(50);
      
      // Responses might differ but should cover similar topics
      const topics = ['exercise', 'beginner', 'start', 'form', 'workout'];
      const response1Lower = response1.toLowerCase();
      const response2Lower = response2.toLowerCase();
      
      const response1HasRelevantContent = topics.some(topic => response1Lower.includes(topic));
      const response2HasRelevantContent = topics.some(topic => response2Lower.includes(topic));
      
      expect(response1HasRelevantContent).toBe(true);
      expect(response2HasRelevantContent).toBe(true);
    }, 20000);

    it('should properly truncate very long responses', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      // Ask for something that might generate a long response
      const message = 'Give me a detailed explanation of every muscle group and all exercises for each one';
      
      const response = await chatService.handleIncomingMessage(user, message);

      // Response should be truncated if it was going to be too long
      expect(response.length).toBeLessThanOrEqual(1600);
      
      // If truncated, should end with '...'
      if (response.length === 1600) {
        expect(response.endsWith('...')).toBe(true);
      }
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle invalid user gracefully', async () => {
      const invalidUser = {
        id: 'invalid-user-id-that-does-not-exist',
        name: 'Invalid User',
        email: 'invalid@test.com',
        phoneNumber: '+1234567890',
        stripeCustomerId: null,
        timezone: 'UTC',
        preferredSendHour: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
        fitnessProfile: null
      };

      const response = await chatService.handleIncomingMessage(invalidUser, 'Test message');

      // Should still return something (might be an error message or a generic response)
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    }, 10000);

    it('should handle empty messages appropriately', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      const response = await chatService.handleIncomingMessage(user, '');

      // Should handle empty message gracefully
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    }, 10000);

    it('should handle special characters in messages', async () => {
      const user = await userRepo.findById(testUserId);
      if (!user) {
        throw new Error('Test user not found');
      }

      const specialMessage = '🏋️‍♂️ Can you help with workouts? 💪 #fitness @gym';
      const response = await chatService.handleIncomingMessage(user, specialMessage);

      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
      expect(response).not.toBe("Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!");
    }, 10000);
  });
});