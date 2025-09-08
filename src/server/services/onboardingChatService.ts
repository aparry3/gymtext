import type { FitnessProfile } from '@/server/models/user/schemas';
import type { User } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { chatAgent as defaultChatAgent } from '@/server/agents/chat/chain';
import { userProfileAgent as defaultUserProfileAgent } from '@/server/agents/profile/chain';
import { buildOnboardingChatSystemPrompt } from '@/server/agents/onboardingChat/prompts';

export type OnboardingEvent =
  | { type: 'token'; data: string }
  | { type: 'user_update'; data: Partial<User> }
  | { type: 'profile_update'; data: Partial<FitnessProfile> }
  | { type: 'ready_to_save'; data: { canSave: boolean; missing: string[] } }
  | { type: 'user_created'; data: { user: User; success: true } }
  | { type: 'milestone'; data: 'essentials_complete' | 'ask_next' | 'summary' | 'natural_summary' | 'natural_summary_incomplete' | 'final_confirmation' }
  | { type: 'error'; data: string };

export interface OnboardingMessageInput {
  message: string;
  currentUser?: Partial<User>;
  currentProfile?: Partial<FitnessProfile>;
  saveWhenReady?: boolean; // Trigger DB save when requirements met
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>; // Recent conversation context
}

export interface OnboardingChatServiceDeps {
  userRepository?: UserRepository;
  chatAgent?: typeof defaultChatAgent;
  userProfileAgent?: typeof defaultUserProfileAgent;
}

export class OnboardingChatService {
  private userRepo: UserRepository;
  private chatAgent: typeof defaultChatAgent;
  private userProfileAgent: typeof defaultUserProfileAgent;

  constructor(deps: OnboardingChatServiceDeps = {}) {
    this.userRepo = deps.userRepository ?? new UserRepository();
    this.chatAgent = deps.chatAgent ?? defaultChatAgent;
    this.userProfileAgent = deps.userProfileAgent ?? defaultUserProfileAgent;
  }

  async *streamMessage(input: OnboardingMessageInput): AsyncGenerator<OnboardingEvent> {
    const { message, currentUser = {}, currentProfile = {}, saveWhenReady = false, conversationHistory = [] } = input;

    // Count user messages for natural pacing (including current message)
    const userMessageCount = conversationHistory.filter(m => m.role === 'user').length + 1;

    // Track the state for this conversation turn
    let updatedUser = { ...currentUser };
    let updatedProfile = { ...currentProfile };
    let userWasUpdated = false;
    let profileWasUpdated = false;

    // Prepare recent conversation context for both profile extraction and chat generation
    // Take the last few messages (alternating user/assistant) for context
    const recentMessages: string[] = [];
    const maxContextMessages = 6; // Last 3 exchanges (user + assistant pairs)
    
    if (conversationHistory.length > 0) {
      // Take the most recent messages, focusing on the assistant's last response and user's current message
      const contextHistory = conversationHistory.slice(-maxContextMessages);
      
      for (const msg of contextHistory) {
        if (msg.role === 'assistant' && msg.content.trim()) {
          recentMessages.push(`Assistant: ${msg.content.trim()}`);
        } else if (msg.role === 'user' && msg.content.trim()) {
          recentMessages.push(`User: ${msg.content.trim()}`);
        }
      }
    }

    // Extract profile updates from message
    try {

      const profileResult = await this.userProfileAgent({
        userId: 'session-user',
        message,
        currentProfile: updatedProfile,
        currentUser: updatedUser,
        recentMessages,
        config: { 
          temperature: 0.2, 
          verbose: process.env.NODE_ENV === 'development'
        },
      });

      if (profileResult.wasUpdated) {
        if (profileResult.profile) {
          updatedProfile = { ...updatedProfile, ...profileResult.profile };
          profileWasUpdated = true;
          yield { type: 'profile_update', data: updatedProfile };
        }
        
        if (profileResult.user) {
          updatedUser = { ...updatedUser, ...profileResult.user };
          userWasUpdated = true;
          yield { type: 'user_update', data: updatedUser };
        }
      }
    } catch (error) {
      console.error('Profile extraction failed:', error);
    }

    // For now, user info extraction (name, email, phone) will be handled by the frontend
    // In a future iteration, we could add a separate user info extraction agent/tool call here

    // Check if we have enough data to save to DB
    const pendingRequired = this.computePendingRequiredFields(updatedProfile, updatedUser);
    const canSave = pendingRequired.length === 0;
    
    yield { 
      type: 'ready_to_save', 
      data: { canSave, missing: pendingRequired } 
    };

    // If save is requested and we have required fields, create user in DB
    if (saveWhenReady && canSave) {
      try {
        const newUser = await this.userRepo.create({
          name: updatedUser.name!,
          phoneNumber: updatedUser.phoneNumber!,
          email: updatedUser.email || null, // Email is now optional
          timezone: updatedUser.timezone!, // Required timezone
          preferredSendHour: updatedUser.preferredSendHour!, // Required preferred send hour
        });

        if (Object.keys(updatedProfile).length > 0) {
          await this.userRepo.createOrUpdateFitnessProfile(newUser.id, updatedProfile);
        }

        // Return the created user so frontend has the ID
        yield { 
          type: 'user_created', 
          data: { user: newUser, success: true } 
        };
        yield { type: 'milestone', data: 'essentials_complete' };
        return;
      } catch {
        yield { type: 'error', data: 'Failed to save user data' };
        return;
      }
    }

    // Generate chat response
    try {
      const systemPrompt = buildOnboardingChatSystemPrompt(updatedProfile, pendingRequired, userMessageCount);
      const chatResult = await this.chatAgent({
        userName: updatedUser.name || 'there',
        message,
        profile: updatedProfile,
        wasProfileUpdated: userWasUpdated || profileWasUpdated,
        conversationHistory: [], // Use empty array since we'll pass recentMessages via context
        context: { 
          onboarding: true, 
          pendingRequiredFields: pendingRequired,
          userMessageCount, // Pass message count for natural pacing
          recentMessages: recentMessages.join('\n') // Pass recent conversation context
        },
        systemPromptOverride: systemPrompt,
        config: { temperature: 0.7, verbose: process.env.NODE_ENV === 'development' },
      });

      const text = chatResult.response ?? '';
      const chunkSize = 64;
      for (let i = 0; i < text.length; i += chunkSize) {
        yield { type: 'token', data: text.slice(i, i + chunkSize) };
      }

      // Determine milestone based on natural pacing
      if (userMessageCount >= 5 && canSave) {
        yield { type: 'milestone', data: 'natural_summary' };
      } else if (userMessageCount >= 5) {
        yield { type: 'milestone', data: 'natural_summary_incomplete' };
      } else if (canSave && saveWhenReady) {
        yield { type: 'milestone', data: 'final_confirmation' };
      } else {
        yield { type: 'milestone', data: 'ask_next' };
      }
    } catch (error) {
      console.error('Chat generation failed:', error);
      yield { type: 'error', data: 'Chat generation failed' };
    }
  }

  private computePendingRequiredFields(
    profile: Partial<FitnessProfile>,
    user: Partial<User>
  ): Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal' | 'gender' | 'age'> {
    // Focus on essentials needed to create user account and start profile building
    // Email is now optional - collect name, phone, timezone, preferred send hour, primary goal, gender, and age
    // Additional contextual completeness is handled by computeContextualGaps() in the prompts
    const missing: Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal' | 'gender' | 'age'> = [];    
    
    if (!user.name) missing.push('name');
    if (!user.phoneNumber) missing.push('phone');
    if (!user.timezone) missing.push('timezone');
    if (user.preferredSendHour === undefined || user.preferredSendHour === null) missing.push('preferredSendHour');
    if (!profile.primaryGoal) missing.push('primaryGoal');
    if (!profile.gender) missing.push('gender');
    if (!profile.age) missing.push('age');

    return missing;
  }
}
