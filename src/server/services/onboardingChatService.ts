import type { FitnessProfile, UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { chatAgent as defaultChatAgent } from '@/server/agents/chat/chain';
import { userProfileAgent as defaultUserProfileAgent } from '@/server/agents/profile/chain';

export type OnboardingEvent =
  | { type: 'token'; data: string }
  | { type: 'profile_patch'; data: { applied: boolean; updates?: string[]; confidence?: number; reason?: string } }
  | { type: 'milestone'; data: 'essentials_complete' | 'ask_next' | 'summary' }
  | { type: 'error'; data: string };

export interface OnboardingMessageInput {
  message: string;
  userId?: string; // authenticated users
  tempSessionId?: string; // unauth draft sessions
  conversationId?: string;
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
    const { message, userId } = input;

    let user: UserWithProfile | null = null;
    let currentProfile: FitnessProfile | null = null;

    if (userId) {
      try {
        user = await this.userRepo.findWithProfile(userId);
        currentProfile = user?.parsedProfile ?? null;
      } catch {
        yield { type: 'error', data: 'Failed to load user profile' };
      }
    }

    // Phase 2: apply updates only for authenticated users
    if (userId && currentProfile) {
      try {
        const profileResult = await this.userProfileAgent({
          userId,
          message,
          currentProfile,
          config: { temperature: 0.2, verbose: process.env.NODE_ENV === 'development' },
        });

        if (profileResult.wasUpdated) {
          currentProfile = profileResult.profile;
          const summary = profileResult.updateSummary;
          yield {
            type: 'profile_patch',
            data: {
              applied: true,
              updates: summary?.fieldsUpdated,
              confidence: summary?.confidence,
              reason: summary?.reason,
            },
          };
        }
      } catch {
        yield { type: 'error', data: 'Profile extraction failed' };
      }
    }

    const pendingRequired = this.computePendingRequiredFields(currentProfile, user);

    try {
      const chatResult = await this.chatAgent({
        userName: user?.name ?? 'there',
        message,
        profile: currentProfile,
        wasProfileUpdated: false,
        conversationHistory: [],
        context: { onboarding: true, pendingRequiredFields: pendingRequired },
        config: { temperature: 0.7, verbose: process.env.NODE_ENV === 'development' },
      });

      const text = chatResult.response ?? '';
      const chunkSize = 64;
      for (let i = 0; i < text.length; i += chunkSize) {
        yield { type: 'token', data: text.slice(i, i + chunkSize) };
      }

      if (pendingRequired.length === 0) {
        yield { type: 'milestone', data: 'essentials_complete' };
      } else {
        yield { type: 'milestone', data: 'ask_next' };
      }
    } catch {
      yield { type: 'error', data: 'Chat generation failed' };
    }
  }

  private computePendingRequiredFields(
    profile: FitnessProfile | null,
    user?: UserWithProfile | null
  ): Array<'name' | 'email' | 'phone' | 'primaryGoal'> {
    const missing: Array<'name' | 'email' | 'phone' | 'primaryGoal'> = [];
    const name: string | null | undefined = user?.name as unknown as string | null | undefined;
    // Our DB user type uses 'email' and 'phoneNumber'; adapt safely
    const email: string | null | undefined = user ? (user as unknown as { email?: string | null })?.email : null;
    const phone: string | null | undefined = user
      ? ((user as unknown as { phoneNumber?: string | null; phone?: string | null })?.phoneNumber
        ?? (user as unknown as { phone?: string | null })?.phone)
      : null;
    const hasGoal = Boolean(profile?.primaryGoal || profile?.fitnessGoals);

    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!phone) missing.push('phone');
    if (!hasGoal) missing.push('primaryGoal');

    return missing;
  }
}
