import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '../db/postgres/users';
import { fitnessCoachPrompt } from '../prompts/templates';
import { ConversationContextService } from './conversation-context';
import { PromptBuilder } from './prompt-builder';

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: 'gemini-2.0-flash',
  maxOutputTokens: 150 // Keep responses concise for SMS
});

// Initialize context services
const contextService = new ConversationContextService();
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
      const fullPrompt = `${systemPrompt}\n\nUser message: ${message}\n\nYour response (keep under 160 characters for SMS):`;
      response = await llm.invoke(fullPrompt);
    }
    
    // Extract text content from response
    const responseText = response.content.toString().trim();
    
    // Ensure response fits SMS constraints
    if (responseText.length > 160) {
      // Truncate and add ellipsis if too long
      return responseText.substring(0, 157) + '...';
    }
    
    return responseText;
  } catch (error) {
    console.error('Error generating chat response:', error);
    // Fallback response on error
    return "Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!";
  }
}