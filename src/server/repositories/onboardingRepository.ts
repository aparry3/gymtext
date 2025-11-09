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
  currentActivity?: 'not_active' | 'once_per_week' | '2_3_per_week' | '4_plus_per_week';
  activityElaboration?: string;
  trainingLocation?: 'home' | 'commercial_gym' | 'bodyweight';
  equipment?: string[];
  acceptedRisks?: boolean;
}

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * OnboardingRepository
 *
 * Manages user onboarding state and signup data
 */
export class OnboardingRepository extends BaseRepository {
  /**
   * Create an onboarding record for a user
   */
  async create(userId: string, signupData?: SignupData): Promise<OnboardingRecord> {
    const record: NewOnboardingRecord = {
      userId,
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
   * Find onboarding record by user ID
   */
  async findByUserId(userId: string): Promise<OnboardingRecord | null> {
    return await this.db
      .selectFrom('userOnboarding')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst() ?? null;
  }

  /**
   * Update onboarding status
   */
  async updateStatus(
    userId: string,
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
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark onboarding as started
   */
  async markStarted(userId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({
        status: 'in_progress',
        startedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark onboarding as completed
   */
  async markCompleted(userId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({
        status: 'completed',
        completedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark final program messages as sent
   */
  async markMessagesSent(userId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({ programMessagesSent: true })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Check if messages have been sent
   */
  async hasMessagesSent(userId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('userOnboarding')
      .select('programMessagesSent')
      .where('userId', '=', userId)
      .executeTakeFirst();

    return result?.programMessagesSent ?? false;
  }

  /**
   * Get signup data
   */
  async getSignupData(userId: string): Promise<SignupData | null> {
    const result = await this.db
      .selectFrom('userOnboarding')
      .select('signupData')
      .where('userId', '=', userId)
      .executeTakeFirst();

    return result?.signupData as SignupData ?? null;
  }

  /**
   * Clear signup data (cleanup after profile creation)
   */
  async clearSignupData(userId: string): Promise<OnboardingRecord> {
    return await this.db
      .updateTable('userOnboarding')
      .set({ signupData: null })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Delete onboarding record (full cleanup)
   */
  async delete(userId: string): Promise<void> {
    await this.db
      .deleteFrom('userOnboarding')
      .where('userId', '=', userId)
      .execute();
  }
}
