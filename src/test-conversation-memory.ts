import { ConversationContextService } from './server/services/conversation-context.service';
import { PromptBuilder } from './server/services/prompt-builder.service';
import { UserRepository } from './server/repositories/user.repository';
import { generateChatResponse } from './server/services/chat.service';

async function testConversationMemory() {
  console.log('Testing Conversation Memory System...\n');

  // Test phone number - you'll need to replace with a real test user
  const testPhoneNumber = '+1234567890'; // Replace with test user phone
  
  try {
    // 1. Test Context Service
    console.log('1. Testing ConversationContextService...');
    const { db } = await import('./server/db/postgres/db');
    const contextService = new ConversationContextService(db);
    const userRepository = new UserRepository(db);
    
    // Get test user
    const user = await userRepository.findByPhoneNumber(testPhoneNumber);
    if (!user) {
      console.log('❌ No test user found with phone:', testPhoneNumber);
      console.log('Please create a test user first or update the phone number.');
      return;
    }

    const userWithProfile = await userRepository.findWithProfile(user.id);
    if (!userWithProfile) {
      console.log('❌ Could not get user with profile');
      return;
    }

    // Get conversation context
    const context = await contextService.getContext(user.id);
    console.log('✅ Context retrieved:', {
      conversationId: context?.conversationId,
      messageCount: context?.recentMessages.length,
      isNewConversation: context?.metadata.isNewConversation,
    });

    // 2. Test Prompt Builder
    console.log('\n2. Testing PromptBuilder...');
    const promptBuilder = new PromptBuilder();
    
    if (context) {
      const systemPrompt = "You are a helpful fitness coach.";
      const messages = promptBuilder.buildMessagesWithContext(
        "What did we talk about last time?",
        context,
        systemPrompt
      );
      
      console.log('✅ Messages built:', {
        totalMessages: messages.length,
        types: messages.map(m => m._getType()),
      });
    }

    // 3. Test Chat Response with Context
    console.log('\n3. Testing Chat Response with Context...');
    const testMessages = [
      "Hey, I'm ready for today's workout!",
      "What muscles should I focus on?",
      "Can you remind me what we discussed yesterday?",
    ];

    for (const message of testMessages) {
      console.log(`\nUser: "${message}"`);
      const response = await generateChatResponse(userWithProfile, message);
      console.log(`Assistant: "${response}"`);
      
      // Small delay to simulate conversation flow
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Conversation memory system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConversationMemory()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}