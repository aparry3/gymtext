/**
 * FitnessProfileService - Markdown-based Profile Management
 *
 * This service manages Markdown "Living Dossier" profiles with full history tracking.
 *
 * Key features:
 * - Uses ProfileRepository for Markdown profile storage
 * - Single Profile Update Agent for AI-powered profile creation
 * - Each update creates a new profile row (history tracking)
 * - Profiles stored as Markdown text
 * - Circuit breaker pattern for resilience
 */

import { UserWithProfile } from '@/server/models/user';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createAgent, PROMPT_IDS } from '@/server/agents';
import {
  buildProfileUpdateUserMessage,
  buildStructuredProfileUserMessage,
} from '@/server/services/agents/prompts/profile';
import { ProfileUpdateOutputSchema } from '@/server/services/agents/schemas/profile';
import { StructuredProfileSchema, type StructuredProfile } from '@/server/models/profile';
import type { StructuredProfileOutput, StructuredProfileInput } from '@/server/services/agents/types/profile';
import { createEmptyProfile } from '@/server/utils/profile/jsonToMarkdown';
import { formatSignupDataForLLM } from './signupDataFormatter';
import type { SignupData } from '@/server/repositories/onboardingRepository';
import { formatForAI } from '@/shared/utils/date';
import type { RepositoryContainer } from '../../repositories/factory';

/**
 * Result returned when patching/updating a profile
 */
export interface ProfileUpdateResult {
  /** Updated Markdown profile text */
  profile: string;
  /** Whether the profile was actually updated */
  wasUpdated: boolean;
  /** Summary of changes made. Empty string if nothing was updated. */
  updateSummary: string;
}

/**
 * FitnessProfileServiceInstance interface
 */
export interface FitnessProfileServiceInstance {
  getCurrentProfile(userId: string): Promise<string | null>;
  saveProfile(userId: string, profile: string): Promise<void>;
  createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null>;
  getProfileHistory(userId: string, limit?: number): Promise<Array<{ profile: string; createdAt: Date }>>;
  saveProfileWithStructured(userId: string, profile: string, structured: StructuredProfile | null): Promise<void>;
  getCurrentStructuredProfile(userId: string): Promise<StructuredProfile | null>;
}

/**
 * Create a FitnessProfileService instance with injected repositories
 */
export function createFitnessProfileService(repos: RepositoryContainer): FitnessProfileServiceInstance {
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 60000,
  });

  return {
    async getCurrentProfile(userId: string): Promise<string | null> {
      return await repos.profile.getCurrentProfileText(userId);
    },

    async saveProfile(userId: string, profile: string): Promise<void> {
      try {
        await repos.profile.createProfileForUser(userId, profile);
        console.log(`[FitnessProfileService] Saved profile for user ${userId}`);
      } catch (error) {
        console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
        throw error;
      }
    },

    async createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null> {
      return circuitBreaker.execute<string | null>(async (): Promise<string | null> => {
        try {
          const formattedData = formatSignupDataForLLM(signupData);

          const messageParts: string[] = [];

          if (formattedData.fitnessGoals?.trim()) {
            messageParts.push(`***Goals***:\n${formattedData.fitnessGoals.trim()}`);
          }

          if (formattedData.currentExercise?.trim()) {
            messageParts.push(`***Current Activity***:\n${formattedData.currentExercise.trim()}`);
          }

          if (formattedData.environment?.trim()) {
            messageParts.push(`***Training Environment***:\n${formattedData.environment.trim()}`);
          }

          if (formattedData.injuries?.trim()) {
            messageParts.push(`***Injuries or Limitations***:\n${formattedData.injuries.trim()}`);
          }

          const message = messageParts.join('\n\n');
          const currentProfile = createEmptyProfile(user);
          const currentDate = formatForAI(new Date(), user.timezone);

          const invokeStructuredProfileAgent = async (
            input: StructuredProfileInput | string
          ): Promise<StructuredProfileOutput> => {
            const parsedInput: StructuredProfileInput = typeof input === 'string' ? JSON.parse(input) : input;
            const userPrompt = buildStructuredProfileUserMessage(parsedInput.dossierText, parsedInput.currentDate);
            const agent = await createAgent(
              {
                name: PROMPT_IDS.PROFILE_STRUCTURED,
                schema: StructuredProfileSchema,
              },
              { model: 'gpt-5-nano', temperature: 0.3 }
            );

            const agentResult = await agent.invoke(userPrompt);
            return { structured: agentResult.response, success: true };
          };

          const userPrompt = buildProfileUpdateUserMessage(currentProfile, message, user, currentDate);
          const agent = await createAgent(
            {
              name: PROMPT_IDS.PROFILE_FITNESS,
              schema: ProfileUpdateOutputSchema,
              subAgents: [
                {
                  structured: {
                    agent: { name: PROMPT_IDS.PROFILE_STRUCTURED, invoke: invokeStructuredProfileAgent },
                    condition: (agentResult: unknown) => (agentResult as { wasUpdated: boolean }).wasUpdated,
                    transform: (agentResult: unknown) =>
                      JSON.stringify({
                        dossierText: (agentResult as { updatedProfile: string }).updatedProfile,
                        currentDate,
                      }),
                  },
                },
              ],
            },
            { model: 'gpt-5.1' }
          );

          const agentResult = await agent.invoke(userPrompt);
          const structuredResult = (agentResult as { structured?: StructuredProfileOutput }).structured;
          const structured = structuredResult?.success ? structuredResult.structured : null;

          const result = {
            updatedProfile: agentResult.response.updatedProfile,
            wasUpdated: agentResult.response.wasUpdated,
            updateSummary: agentResult.response.updateSummary || '',
            structured,
          };

          console.log('[FitnessProfileService] Created initial profile:', {
            wasUpdated: result.wasUpdated,
            summary: result.updateSummary,
            hasStructured: result.structured !== null,
          });

          await repos.profile.createProfileWithStructured(user.id, result.updatedProfile, result.structured);

          return result.updatedProfile;
        } catch (error) {
          console.error('[FitnessProfileService] Error creating profile:', error);
          throw error;
        }
      });
    },

    async getProfileHistory(userId: string, limit: number = 10) {
      return await repos.profile.getProfileHistory(userId, limit);
    },

    async saveProfileWithStructured(
      userId: string,
      profile: string,
      structured: StructuredProfile | null
    ): Promise<void> {
      try {
        await repos.profile.createProfileWithStructured(userId, profile, structured);
        console.log(`[FitnessProfileService] Saved profile with structured data for user ${userId}`);
      } catch (error) {
        console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
        throw error;
      }
    },

    async getCurrentStructuredProfile(userId: string): Promise<StructuredProfile | null> {
      return await repos.profile.getCurrentStructuredProfile(userId);
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { ProfileRepository } from '@/server/repositories/profileRepository';

/**
 * @deprecated Use createFitnessProfileService(repos) instead
 */
export class FitnessProfileService {
  private static instance: FitnessProfileService;
  private circuitBreaker: CircuitBreaker;
  private profileRepository: ProfileRepository;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 60000,
    });
    this.profileRepository = new ProfileRepository();
  }

  public static getInstance(): FitnessProfileService {
    if (!FitnessProfileService.instance) {
      FitnessProfileService.instance = new FitnessProfileService();
    }
    return FitnessProfileService.instance;
  }

  async getCurrentProfile(userId: string): Promise<string | null> {
    return await this.profileRepository.getCurrentProfileText(userId);
  }

  async saveProfile(userId: string, profile: string): Promise<void> {
    try {
      await this.profileRepository.createProfileForUser(userId, profile);
      console.log(`[FitnessProfileService] Saved profile for user ${userId}`);
    } catch (error) {
      console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
      throw error;
    }
  }

  async createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null> {
    return this.circuitBreaker.execute<string | null>(async (): Promise<string | null> => {
      try {
        const formattedData = formatSignupDataForLLM(signupData);
        const messageParts: string[] = [];

        if (formattedData.fitnessGoals?.trim()) {
          messageParts.push(`***Goals***:\n${formattedData.fitnessGoals.trim()}`);
        }
        if (formattedData.currentExercise?.trim()) {
          messageParts.push(`***Current Activity***:\n${formattedData.currentExercise.trim()}`);
        }
        if (formattedData.environment?.trim()) {
          messageParts.push(`***Training Environment***:\n${formattedData.environment.trim()}`);
        }
        if (formattedData.injuries?.trim()) {
          messageParts.push(`***Injuries or Limitations***:\n${formattedData.injuries.trim()}`);
        }

        const message = messageParts.join('\n\n');
        const currentProfile = createEmptyProfile(user);
        const currentDate = formatForAI(new Date(), user.timezone);

        const invokeStructuredProfileAgent = async (
          input: StructuredProfileInput | string
        ): Promise<StructuredProfileOutput> => {
          const parsedInput: StructuredProfileInput = typeof input === 'string' ? JSON.parse(input) : input;
          const userPrompt = buildStructuredProfileUserMessage(parsedInput.dossierText, parsedInput.currentDate);
          const agent = await createAgent(
            { name: PROMPT_IDS.PROFILE_STRUCTURED, schema: StructuredProfileSchema },
            { model: 'gpt-5-nano', temperature: 0.3 }
          );
          const agentResult = await agent.invoke(userPrompt);
          return { structured: agentResult.response, success: true };
        };

        const userPrompt = buildProfileUpdateUserMessage(currentProfile, message, user, currentDate);
        const agent = await createAgent(
          {
            name: PROMPT_IDS.PROFILE_FITNESS,
            schema: ProfileUpdateOutputSchema,
            subAgents: [
              {
                structured: {
                  agent: { name: PROMPT_IDS.PROFILE_STRUCTURED, invoke: invokeStructuredProfileAgent },
                  condition: (agentResult: unknown) => (agentResult as { wasUpdated: boolean }).wasUpdated,
                  transform: (agentResult: unknown) =>
                    JSON.stringify({
                      dossierText: (agentResult as { updatedProfile: string }).updatedProfile,
                      currentDate,
                    }),
                },
              },
            ],
          },
          { model: 'gpt-5.1' }
        );

        const agentResult = await agent.invoke(userPrompt);
        const structuredResult = (agentResult as { structured?: StructuredProfileOutput }).structured;
        const structured = structuredResult?.success ? structuredResult.structured : null;

        const result = {
          updatedProfile: agentResult.response.updatedProfile,
          wasUpdated: agentResult.response.wasUpdated,
          updateSummary: agentResult.response.updateSummary || '',
          structured,
        };

        console.log('[FitnessProfileService] Created initial profile:', {
          wasUpdated: result.wasUpdated,
          summary: result.updateSummary,
          hasStructured: result.structured !== null,
        });

        await this.profileRepository.createProfileWithStructured(user.id, result.updatedProfile, result.structured);
        return result.updatedProfile;
      } catch (error) {
        console.error('[FitnessProfileService] Error creating profile:', error);
        throw error;
      }
    });
  }

  async getProfileHistory(userId: string, limit: number = 10) {
    return await this.profileRepository.getProfileHistory(userId, limit);
  }

  async saveProfileWithStructured(
    userId: string,
    profile: string,
    structured: StructuredProfile | null
  ): Promise<void> {
    try {
      await this.profileRepository.createProfileWithStructured(userId, profile, structured);
      console.log(`[FitnessProfileService] Saved profile with structured data for user ${userId}`);
    } catch (error) {
      console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
      throw error;
    }
  }

  async getCurrentStructuredProfile(userId: string): Promise<StructuredProfile | null> {
    return await this.profileRepository.getCurrentStructuredProfile(userId);
  }
}

/**
 * @deprecated Use createFitnessProfileService(repos) instead
 */
export const fitnessProfileService = FitnessProfileService.getInstance();
