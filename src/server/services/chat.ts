import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '../db/postgres/users';
import { fitnessCoachPrompt } from '../prompts/templates';

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: 'gemini-2.0-flash',
  maxOutputTokens: 150 // Keep responses concise for SMS
});

export async function generateChatResponse(
  user: UserWithProfile,
  message: string
): Promise<string> {
  try {
    // Create the fitness coach system prompt with user context
    const systemPrompt = fitnessCoachPrompt(user);
    
    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}\n\nYour response (keep under 160 characters for SMS):`;
    
    // Generate response
    const response = await llm.invoke(fullPrompt);
    
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