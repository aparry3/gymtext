import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { 
  buildChatSystemPrompt, 
  buildContextualChatPrompt 
} from '@/server/agents/chat/prompts';
import type { FitnessProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';

/**
 * Configuration for the ChatAgent
 */
export interface ChatAgentConfig {
  model?: 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'gemini-2.0-flash';
  temperature?: number;
  verbose?: boolean;
}

/**
 * Result type returned by the ChatAgent
 */
export interface ChatAgentResult {
  response: string;
  conversationId?: string;
}

/**
 * Initialize the chat model
 * Using higher temperature for more conversational responses
 */
const initializeModel = (config: ChatAgentConfig = {}) => {
  const { 
    model = 'gemini-2.0-flash', 
    temperature = 0.7  // Higher temperature for conversational responses
  } = config;

  if (model.startsWith('gemini')) {
    return new ChatGoogleGenerativeAI({
      model: model,
      temperature,
      maxOutputTokens: 500, // Keep responses concise for SMS
    });
  }

  return new ChatOpenAI({
    model: model,
    temperature,
    maxTokens: 500,
  });
};

/**
 * ChatAgent - Generates conversational responses based on user profile
 * 
 * This agent is responsible for generating the actual chat response
 * It receives the profile from UserProfileAgent and doesn't fetch it
 */
export const chatAgent = async ({
  userName,
  message,
  profile,
  wasProfileUpdated = false,
  conversationHistory = [],
  context = {},
  config = {},
}: {
  userName: string;
  message: string;
  profile: FitnessProfile | null;
  wasProfileUpdated?: boolean;
  conversationHistory?: Message[];
  context?: Record<string, unknown>;
  config?: ChatAgentConfig;
}): Promise<ChatAgentResult> => {
  try {
    const { verbose = false } = config;
    
    // Initialize the model
    const model = initializeModel(config);
    
    // Build the system prompt with profile and update status
    const systemPrompt = buildChatSystemPrompt(profile, wasProfileUpdated);
    
    // Build conversation history string
    const historyString = conversationHistory.length > 0
      ? conversationHistory
          .slice(-5) // Keep last 5 messages for context
          .map(msg => `${msg.direction === 'inbound' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n')
      : '';
    
    // Build the full prompt
    const userPrompt = `
${historyString ? `<Conversation History>\n${historyString}\n</Conversation History>\n` : ''}
${context && Object.keys(context).length > 0 ? `<Additional Context>\n${JSON.stringify(context, null, 2)}\n</Additional Context>\n` : ''}
<Current Message>
User (${userName}): ${message}
</Current Message>

Respond to the user's message.`;
    
    // Create the message array
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ];
    
    if (verbose) {
      console.log('ChatAgent generating response:', {
        userName,
        wasProfileUpdated,
        hasProfile: !!profile,
        historyLength: conversationHistory.length
      });
    }
    
    // Generate the response
    const response = await model.invoke(messages);
    
    // Extract the response content
    const responseText = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    
    if (verbose) {
      console.log('ChatAgent response generated:', responseText.substring(0, 100) + '...');
    }
    
    return {
      response: responseText
    };
    
  } catch (error) {
    console.error('ChatAgent error:', error);
    
    // Return a fallback response
    return {
      response: "I apologize, but I'm having trouble processing your message right now. Please try again in a moment."
    };
  }
};

/**
 * Contextual chat variant that includes additional context
 * Used when specific context data needs to be incorporated
 */
export const contextualChatAgent = async ({
  userName,
  message,
  profile,
  wasProfileUpdated = false,
  context,
  config = {},
}: {
  userName: string;
  message: string;
  profile: FitnessProfile | null;
  wasProfileUpdated?: boolean;
  context: Record<string, unknown>;
  config?: ChatAgentConfig;
}): Promise<ChatAgentResult> => {
  try {
    const { verbose = false } = config;
    
    // Initialize the model
    const model = initializeModel(config);
    
    // Build the contextual prompt
    const prompt = buildContextualChatPrompt(
      userName,
      message,
      profile,
      context,
      wasProfileUpdated
    );
    
    if (verbose) {
      console.log('ContextualChatAgent generating response with context:', {
        userName,
        wasProfileUpdated,
        hasProfile: !!profile,
        contextKeys: Object.keys(context)
      });
    }
    
    // Generate the response
    const response = await model.invoke(prompt);
    
    // Extract the response content
    const responseText = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    
    return {
      response: responseText
    };
    
  } catch (error) {
    console.error('ContextualChatAgent error:', error);
    
    return {
      response: "I apologize, but I'm having trouble processing your message right now. Please try again in a moment."
    };
  }
};

/**
 * Legacy chain exports for backward compatibility
 * These will be removed once ChatService is updated
 * Wrapping to maintain the .invoke() interface
 */
export const chatChain = {
  invoke: async (input: { userId: string; message: string; conversationId?: string }) => {
    // For backward compatibility, fetch the user to get the profile
    const { UserRepository } = await import('@/server/repositories/userRepository');
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(input.userId);
    
    return chatAgent({
      userName: user?.name || 'User',
      message: input.message,
      profile: user?.parsedProfile || null,
      conversationHistory: [],
      context: {}
    });
  }
};

export const contextualChatChain = {
  invoke: async (input: { userId: string; message: string }) => {
    // For backward compatibility, fetch the user to get the profile
    const { UserRepository } = await import('@/server/repositories/userRepository');
    const { ConversationContextService } = await import('@/server/services/context/conversationContext');
    
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(input.userId);
    
    const contextService = new ConversationContextService();
    const context = await contextService.getContext(input.userId, {
      includeUserProfile: true,
      includeWorkoutHistory: true,
      messageLimit: 5
    });
    
    return contextualChatAgent({
      userName: user?.name || 'User',
      message: input.message,
      profile: user?.parsedProfile || null,
      context: context ? (context as unknown as Record<string, unknown>) : {}
    });
  }
};