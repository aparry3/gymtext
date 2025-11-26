import { OnboardingRepository, type OnboardingRecord, type SignupData, type OnboardingStatus } from '@/server/repositories/onboardingRepository';

/**
 * OnboardingDataService
 *
 * Service layer for managing user onboarding state and signup data.
 * Wraps OnboardingRepository to provide clean service-level interface.
 *
 * Responsibilities:
 * - Manage onboarding lifecycle (pending → in_progress → completed/failed)
 * - Store and retrieve signup form data
 * - Track message sending status (idempotency)
 * - Coordinate cleanup after completion
 *
 * Architecture:
 * Routes/Inngest → OnboardingDataService → OnboardingRepository → Database
 */
export class OnboardingDataService {
  private static instance: OnboardingDataService;
  private repository: OnboardingRepository;

  private constructor() {
    this.repository = new OnboardingRepository();
  }

  public static getInstance(): OnboardingDataService {
    if (!OnboardingDataService.instance) {
      OnboardingDataService.instance = new OnboardingDataService();
    }
    return OnboardingDataService.instance;
  }

  /**
   * Create a new onboarding record for a user
   * Called during signup to initialize onboarding tracking
   */
  async createOnboardingRecord(userId: string, signupData?: SignupData): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Creating onboarding record for user ${userId}`);
    return await this.repository.create(userId, signupData);
  }

  /**
   * Mark onboarding as started (status: pending → in_progress)
   */
  async markStarted(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Marking onboarding started for user ${userId}`);
    return await this.repository.markStarted(userId);
  }

  /**
   * Update current step for progress tracking
   */
  async updateCurrentStep(userId: string, stepNumber: number): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Updating step to ${stepNumber} for user ${userId}`);
    return await this.repository.updateCurrentStep(userId, stepNumber);
  }

  /**
   * Mark onboarding as completed (status: in_progress → completed)
   */
  async markCompleted(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Marking onboarding completed for user ${userId}`);
    return await this.repository.markCompleted(userId);
  }

  /**
   * Update onboarding status with optional error message
   * Used for marking as failed or updating status manually
   */
  async updateStatus(userId: string, status: OnboardingStatus, errorMessage?: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Updating status to '${status}' for user ${userId}`);
    return await this.repository.updateStatus(userId, status, errorMessage);
  }

  /**
   * Get onboarding status for a client
   */
  async getStatus(clientId: string): Promise<OnboardingStatus | null> {
    const record = await this.repository.findByClientId(clientId);
    return record ? (record.status as OnboardingStatus) : null;
  }

  /**
   * Get complete onboarding record by client ID
   */
  async findByClientId(clientId: string): Promise<OnboardingRecord | null> {
    return await this.repository.findByClientId(clientId);
  }

  /**
   * Get signup data for a user
   * Used during async onboarding to retrieve form data
   */
  async getSignupData(userId: string): Promise<SignupData | null> {
    return await this.repository.getSignupData(userId);
  }

  /**
   * Clear signup data after profile extraction
   * Cleanup to remove temporary form data
   */
  async clearSignupData(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Clearing signup data for user ${userId}`);
    return await this.repository.clearSignupData(userId);
  }

  /**
   * Mark final program messages as sent
   * Used for idempotency - ensures messages only sent once
   */
  async markMessagesSent(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Marking messages sent for user ${userId}`);
    return await this.repository.markMessagesSent(userId);
  }

  /**
   * Check if final messages have been sent
   * Used to prevent duplicate message sending
   */
  async hasMessagesSent(userId: string): Promise<boolean> {
    return await this.repository.hasMessagesSent(userId);
  }

  /**
   * Delete onboarding record (full cleanup)
   * Optional: can be used to clean up old records
   */
  async delete(userId: string): Promise<void> {
    console.log(`[OnboardingDataService] Deleting onboarding record for user ${userId}`);
    return await this.repository.delete(userId);
  }
}

// Export singleton instance
export const onboardingDataService = OnboardingDataService.getInstance();
