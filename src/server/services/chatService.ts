import { UserWithProfile } from '@/server/models/userModel';
import { contextualChatChain } from '@/server/agents/chat/chain';

// Configuration from environment variables
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');

export class ChatService {

  async handleIncomingMessage(
    user: UserWithProfile,
    message: string
  ): Promise<string> {
    try {
      // TODO THIS IS GOING TO BE VERY IMPORTANT
      // ALL AGENTIC FUNCTIONALITY WILL LIVE IN THE AGENT
      // UPDATING WORKOUTS
      // UPDATING PREFERENCES
      // SAVING MEMORIES
      // UPDATING PROGRESS
      // NOTIFICATIONS

      // Use the contextualChatChain agent to generate response
      const result = await contextualChatChain.invoke({
        userId: user.id,
        message: message
      });
      
      // Extract the response text from the agent result
      const responseText = result.response.trim();
      
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
}