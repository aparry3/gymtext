import {
  BaseMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from '@langchain/core/messages';
import {
  ConversationContext,
  UserContextProfile,
  ConversationMetadata,
} from '@/shared/types/conversation';
import { ContextConfig, getContextConfig } from '@/shared/config/context.config';

export class PromptBuilder {
  private config: ContextConfig;

  constructor(config?: Partial<ContextConfig>) {
    this.config = { ...getContextConfig(), ...config };
  }

  buildMessagesWithContext(
    currentMessage: string,
    context: ConversationContext,
    systemPrompt: string
  ): BaseMessage[] {
    const messages: BaseMessage[] = [];

    // 1. Add system message with context
    if (this.config.includeSystemMessages) {
      const contextualSystemMessage = this.buildSystemMessageWithContext(
        systemPrompt,
        context
      );
      messages.push(new SystemMessage(contextualSystemMessage));
    } else {
      messages.push(new SystemMessage(systemPrompt));
    }

    // 2. Add recent message history
    if (context.recentMessages && context.recentMessages.length > 0) {
      context.recentMessages.forEach(msg => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // 3. Add current message
    messages.push(new HumanMessage(currentMessage));

    return messages;
  }

  formatContextAsSystemMessage(context: ConversationContext): string {
    const sections: string[] = [];

    // Add conversation summary if available
    if (context.summary) {
      sections.push(`Conversation Summary: ${context.summary}`);
    }

    // Add user profile information
    if (context.userProfile) {
      const profileSection = this.formatUserProfile(context.userProfile);
      if (profileSection) {
        sections.push(profileSection);
      }
    }

    // Add conversation metadata
    if (context.metadata) {
      const metadataSection = this.formatMetadata(context.metadata);
      if (metadataSection) {
        sections.push(metadataSection);
      }
    }

    return sections.join('\n\n');
  }

  private buildSystemMessageWithContext(
    baseSystemPrompt: string,
    context: ConversationContext
  ): string {
    const contextInfo = this.formatContextAsSystemMessage(context);
    
    if (!contextInfo) {
      return baseSystemPrompt;
    }

    return `${baseSystemPrompt}

${contextInfo}`;
  }

  private formatUserProfile(profile: UserContextProfile): string {
    const lines: string[] = ['User Profile:'];

    if (profile.fitnessGoals) {
      lines.push(`- Fitness Goals: ${profile.fitnessGoals}`);
    }

    if (profile.skillLevel) {
      lines.push(`- Skill Level: ${profile.skillLevel}`);
    }

    if (profile.currentProgram) {
      lines.push(`- Current Program: ${profile.currentProgram}`);
    }

    if (profile.preferences) {
      const { age, gender, exerciseFrequency } = profile.preferences;
      if (age) lines.push(`- Age: ${age}`);
      if (gender) lines.push(`- Gender: ${gender}`);
      if (exerciseFrequency) lines.push(`- Exercise Frequency: ${exerciseFrequency}`);
    }

    if (profile.lastWorkoutDate) {
      const daysSinceLastWorkout = Math.floor(
        (Date.now() - new Date(profile.lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      lines.push(`- Last Workout: ${daysSinceLastWorkout} days ago`);
    }

    if (profile.recentTopics && profile.recentTopics.length > 0) {
      lines.push(`- Recent Topics: ${profile.recentTopics.join(', ')}`);
    }

    return lines.length > 1 ? lines.join('\n') : '';
  }

  private formatMetadata(metadata: ConversationMetadata): string {
    const lines: string[] = [];

    if (metadata.isNewConversation) {
      lines.push('Note: This is a new conversation.');
    } else {
      lines.push(`Conversation Context:`);
      
      if (metadata.messageCount) {
        lines.push(`- Total messages in conversation: ${metadata.messageCount}`);
      }

      if (metadata.startTime) {
        const durationMinutes = Math.floor(
          (Date.now() - new Date(metadata.startTime).getTime()) / (1000 * 60)
        );
        lines.push(`- Conversation duration: ${durationMinutes} minutes`);
      }
    }

    return lines.join('\n');
  }

  buildSimpleMessageHistory(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): BaseMessage[] {
    return messages.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }

  async truncateMessagesToFit(
    messages: BaseMessage[],
    maxTokens: number,
    preserveSystemMessage: boolean = true
  ): Promise<BaseMessage[]> {
    // Dynamic import to avoid circular dependencies
    const { TokenManager } = await import('../utils/token-manager');
    const tokenManager = new TokenManager();

    return tokenManager.truncateMessagesToLimit(messages, maxTokens, {
      preserveFirst: preserveSystemMessage ? 1 : 0,
      preserveLast: 1, // Always keep the current user message
    });
  }
}