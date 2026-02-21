import { BaseRepository } from './baseRepository';
import { sql } from 'kysely';
import type { UserOnboarding } from '../models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type OnboardingRecord = Selectable<UserOnboarding>;
export type NewOnboardingRecord = Insertable<UserOnboarding>;
export type OnboardingUpdate = Updateable<UserOnboarding>;

export interface SignupData {
  // Formatted text for LLM (backward compatible)
  fitnessGoals?: string;
  currentExercise?: string;
  injuries?: string;
  environment?: string;

  // Structured data from MultiStepSignupForm (for analytics/reporting)
  primaryGoals?: ('strength' | 'endurance' | 'weight_loss' | 'general_fitness')[];
  goalsElaboration?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  experienceElaboration?: string;
  desiredDaysPerWeek?: '3_per_week' | '4_per_week' | '5_per_week' | '6_per_week';
  availabilityElaboration?: string;
  trainingLocation?: 'home' | 'commercial_gym' | 'bodyweight';
  locationElaboration?: string;
  equipment?: string[];
  acceptedRisks?: boolean;

  // SMS consent
  smsConsent?: boolean;
  smsConsentedAt?: string;

  // Program-specific data (for program signups)
  programId?: string;
  programAnswers?: Record<string, string | string[]>;
}

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * OnboardingRepository
 *
 * Manages user onboarding state and signup data
 */
export class OnboardingRepository extends BaseRepository {
  /**
   * Create an onboarding record for a client
   */
  async create(clientId: string, signupData?: SignupData): Promise<OnboardingRecord> {
    const record: NewOnboardingRecord = {
      clientId,
      signupData: signupData ? JSON.parse(JSON.stringify(signupData)) : null,
      status: 'pending',
      programMessagesSent: false,
    };

    return await this.db
      .insertInto('userOnboarding')
      .values(record)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Find onboarding record by client ID
   */
  async findByClientId(clientId: string): Promise<OnboardingRecord | null> {
    return await this.db
      .selectFrom('userOnboarding')
      .selectAll()
      .where('clientId', '=', clientId)
      .executeTakeFirst() ?? null;
  }

  /**
   * Update onboarding status
   */
  async updateStatus(
    clientId: string,
    status: OnboardingStatus,
    errorMessage?: string
  ): Promise<OnboardingRecord> {
    const update: OnboardingUpdate = {
      status,
      errorMessage: errorMessage ?? null,
    };

    return await this.db
      .updateTable('userOnboarding')
      .set(update)
      .where('clientId', '=', clientId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark onboarding as started
   */
  async markStarted(clientId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({
        status: 'in_progress',
        startedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('clientId', '=', clientId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Update current step (for progress tracking)
   */
  async updateCurrentStep(clientId: string, stepNumber: number): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({ currentStep: stepNumber })
      .where('clientId', '=', clientId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark onboarding as completed
   */
  async markCompleted(clientId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({
        status: 'completed',
        completedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('clientId', '=', clientId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark final program messages as sent
   */
  async markMessagesSent(clientId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({ programMessagesSent: true })
      .where('clientId', '=', clientId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Check if messages have been sent
   */
  async hasMessagesSent(clientId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('userOnboarding')
      .select('programMessagesSent')
      .where('clientId', '=', clientId)
      .executeTakeFirst();

    return result?.programMessagesSent ?? false;
  }

  /**
   * Get signup data
   */
  async getSignupData(clientId: string): Promise<SignupData | null> {
    const result = await this.db
      .selectFrom('userOnboarding')
      .select('signupData')
      .where('clientId', '=', clientId)
      .executeTakeFirst();

    return result?.signupData as SignupData ?? null;
  }

  /**
   * Clear signup data (cleanup after profile creation)
   */
  async clearSignupData(clientId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({ signupData: null })
      .where('clientId', '=', clientId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Delete onboarding record (full cleanup)
   */
  async delete(clientId: string): Promise<void> {
    await this.db
      .deleteFrom('userOnboarding')
      .where('clientId', '=', clientId)
      .execute();
  }
}
