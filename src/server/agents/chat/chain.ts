import { UserWithProfile } from "@/shared/types/user";
import { fitnessCoachPrompt } from "./prompts";

export interface ChatInput {
  user: UserWithProfile;
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export class ChatAgent {
  async generateResponse(input: ChatInput): Promise<string> {
    const { user, message, conversationHistory } = input;
    
    const systemPrompt = fitnessCoachPrompt(user);
    
    // Build conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];
    
    // TODO: Implement LLM call here
    // const response = await llm.chat(messages);
    // return response.content;
    
    return `Chat response generated for ${user.name}: ${message}`;
  }
}

export const chatAgent = new ChatAgent();