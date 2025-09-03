import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { buildChatSystemPrompt } from '@/server/agents/chat/prompts';
import type { FitnessProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';

/**
 * Configuration for the ChatAgent
 */
export interface ChatAgentConfig {
  model?: 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'gemini-2.0-flash' | 'gemini-2.5-flash';
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
    model = 'gemini-2.5-flash', 
    temperature = 0.7  // Higher temperature for conversational responses
  } = config;

  if (model.startsWith('gemini')) {
    return new ChatGoogleGenerativeAI({
      model: model,
      temperature,
      maxOutputTokens: 5000, // Keep responses concise for SMS
    });
  }

  return new ChatOpenAI({
    model: model,
    temperature,
    maxTokens: 5000,
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
  systemPromptOverride,
}: {
  userName: string;
  message: string;
  profile: FitnessProfile | null;
  wasProfileUpdated?: boolean;
  conversationHistory?: Message[];
  context?: Record<string, unknown>;
  config?: ChatAgentConfig;
  systemPromptOverride?: string;
}): Promise<ChatAgentResult> => {
  try {
    const { verbose = false } = config;
    
    // Initialize the model
    const model = initializeModel(config);
    
    // Build the system prompt with profile and update status
    const systemPrompt = systemPromptOverride ?? buildChatSystemPrompt(profile, wasProfileUpdated);
    
    // Build conversation history string
    const historyString = conversationHistory.length > 0
      ? conversationHistory
          .slice(-5) // Keep last 5 messages for context
          .map(msg => `${msg.direction === 'inbound' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n')
      : '';
    
    // Build the full prompt with safe context handling
    let contextString = '';
    if (context && typeof context === 'object' && Object.keys(context).length > 0) {
      try {
        contextString = `<Additional Context>\n${JSON.stringify(context, null, 2)}\n</Additional Context>\n`;
      } catch (error) {
        console.error('Error stringifying context:', error);
        contextString = `<Additional Context>\nContext processing error\n</Additional Context>\n`;
      }
    }

    const userPrompt = `
${historyString ? `<Conversation History>\n${historyString}\n</Conversation History>\n` : ''}
${contextString}
<Current Message>
User (${userName}): ${message}
</Current Message>

Respond to the user's message.`;
    
    // Validate prompts before creating messages
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      console.error('Invalid systemPrompt:', typeof systemPrompt, systemPrompt);
      throw new Error('System prompt is invalid');
    }
    
    if (!userPrompt || typeof userPrompt !== 'string') {
      console.error('Invalid userPrompt:', typeof userPrompt, userPrompt);
      throw new Error('User prompt is invalid');
    }

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
        historyLength: conversationHistory?.length || 0
      });
    }
    
    let response;
    // Generate the response
    try {
      console.log('About to invoke model with messages:', messages ? `Array of ${messages.length} items` : 'undefined');
      console.log('Message types:', messages?.map(m => m.constructor.name));
      console.log('SystemMessage content length:', messages?.[0]?.content?.length || 'undefined');
      console.log('HumanMessage content length:', messages?.[1]?.content?.length || 'undefined');
      
      if (!messages || !Array.isArray(messages)) {
        throw new Error('Messages array is undefined or not an array');
      }
      
      // Check if messages have valid content
      if (!messages[0]?.content || !messages[1]?.content) {
        throw new Error('Messages missing content');
      }
      
      response = await model.invoke(messages);
    } catch (error) {
      console.error('ChatAgent error:', error);
      return {
        response: "I apologize, but I'm having trouble processing your message right now. Please try again in a moment."
      }
    }
    
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

// No legacy code - only the new two-agent architecture exports