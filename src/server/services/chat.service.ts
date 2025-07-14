import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/repositories/user.repository';
import { fitnessCoachPrompt } from '../prompts/templates';
import { ConversationContextService } from './conversation-context.service';
import { PromptBuilder } from './prompt-builder.service';
import { db } from '@/server/db/postgres/db';

// Configuration from environment variables
const MAX_OUTPUT_TOKENS = parseInt(process.env.LLM_MAX_OUTPUT_TOKENS || '1000');
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: 'gemini-2.0-flash',
  maxOutputTokens: MAX_OUTPUT_TOKENS
});

// Initialize context services
const contextService = new ConversationContextService(db);
const promptBuilder = new PromptBuilder();

export async function generateChatResponse(
  user: UserWithProfile,
  message: string
): Promise<string> {
  try {
    // Get conversation context
    const context = await contextService.getContext(user.id, {
      includeUserProfile: true,
      includeWorkoutHistory: true,
      messageLimit: 5
    });

    // Create the fitness coach system prompt with user context
    const systemPrompt = fitnessCoachPrompt(user);
    
    let response;
    
    if (context && context.recentMessages.length > 0) {
      // Build messages with conversation history
      const messages = promptBuilder.buildMessagesWithContext(
        message,
        context,
        systemPrompt
      );
      
      // Skip token truncation for now due to tiktoken issue
      // TODO: Re-enable once tiktoken WebAssembly issue is resolved
      
      // Generate response with conversation context
      response = await llm.invoke(messages);
    } else {
      // Fallback to simple prompt if no context available
      const fullPrompt = `${systemPrompt}\n\nUser message: ${message}\n\nYour response:`;
      response = await llm.invoke(fullPrompt);
    }
    
    // Extract text content from response
    const responseText = response.content.toString().trim();
    
    // Modern phones support concatenated SMS
    // Twilio automatically handles message segmentation
    if (responseText.length > SMS_MAX_LENGTH) {
      // Only truncate very long responses
      return responseText.substring(0, SMS_MAX_LENGTH - 3) + '...';
    }
    
    return responseText;
  } catch (error) {
    console.error('Error generating chat response:', error);
    // Fallback response on error
    return "Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!";
  }
}