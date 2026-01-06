import type { OnboardingRecord, SignupData, OnboardingStatus } from '@/server/repositories/onboardingRepository';
import type { RepositoryContainer } from '../../repositories/factory';

/**
 * OnboardingDataServiceInstance interface
 */
export interface OnboardingDataServiceInstance {
  createOnboardingRecord(userId: string, signupData?: SignupData): Promise<OnboardingRecord>;
  markStarted(userId: string): Promise<OnboardingRecord>;
  updateCurrentStep(userId: string, stepNumber: number): Promise<OnboardingRecord>;
  markCompleted(userId: string): Promise<OnboardingRecord>;
  updateStatus(userId: string, status: OnboardingStatus, errorMessage?: string): Promise<OnboardingRecord>;
  getStatus(clientId: string): Promise<OnboardingStatus | null>;
  findByClientId(clientId: string): Promise<OnboardingRecord | null>;
  getSignupData(userId: string): Promise<SignupData | null>;
  clearSignupData(userId: string): Promise<OnboardingRecord>;
  markMessagesSent(userId: string): Promise<OnboardingRecord>;
  hasMessagesSent(userId: string): Promise<boolean>;
  delete(userId: string): Promise<void>;
}

/**
 * Create an OnboardingDataService instance with injected repositories
 */
export function createOnboardingDataService(repos: RepositoryContainer): OnboardingDataServiceInstance {
  return {
    async createOnboardingRecord(userId: string, signupData?: SignupData): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Creating onboarding record for user ${userId}`);
      return await repos.onboarding.create(userId, signupData);
    },

    async markStarted(userId: string): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Marking onboarding started for user ${userId}`);
      return await repos.onboarding.markStarted(userId);
    },

    async updateCurrentStep(userId: string, stepNumber: number): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Updating step to ${stepNumber} for user ${userId}`);
      return await repos.onboarding.updateCurrentStep(userId, stepNumber);
    },

    async markCompleted(userId: string): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Marking onboarding completed for user ${userId}`);
      return await repos.onboarding.markCompleted(userId);
    },

    async updateStatus(userId: string, status: OnboardingStatus, errorMessage?: string): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Updating status to '${status}' for user ${userId}`);
      return await repos.onboarding.updateStatus(userId, status, errorMessage);
    },

    async getStatus(clientId: string): Promise<OnboardingStatus | null> {
      const record = await repos.onboarding.findByClientId(clientId);
      return record ? (record.status as OnboardingStatus) : null;
    },

    async findByClientId(clientId: string): Promise<OnboardingRecord | null> {
      return await repos.onboarding.findByClientId(clientId);
    },

    async getSignupData(userId: string): Promise<SignupData | null> {
      return await repos.onboarding.getSignupData(userId);
    },

    async clearSignupData(userId: string): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Clearing signup data for user ${userId}`);
      return await repos.onboarding.clearSignupData(userId);
    },

    async markMessagesSent(userId: string): Promise<OnboardingRecord> {
      console.log(`[OnboardingDataService] Marking messages sent for user ${userId}`);
      return await repos.onboarding.markMessagesSent(userId);
    },

    async hasMessagesSent(userId: string): Promise<boolean> {
      return await repos.onboarding.hasMessagesSent(userId);
    },

    async delete(userId: string): Promise<void> {
      console.log(`[OnboardingDataService] Deleting onboarding record for user ${userId}`);
      return await repos.onboarding.delete(userId);
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { OnboardingRepository } from '@/server/repositories/onboardingRepository';

/**
 * @deprecated Use createOnboardingDataService(repos) instead
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

  async createOnboardingRecord(userId: string, signupData?: SignupData): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Creating onboarding record for user ${userId}`);
    return await this.repository.create(userId, signupData);
  }

  async markStarted(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Marking onboarding started for user ${userId}`);
    return await this.repository.markStarted(userId);
  }

  async updateCurrentStep(userId: string, stepNumber: number): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Updating step to ${stepNumber} for user ${userId}`);
    return await this.repository.updateCurrentStep(userId, stepNumber);
  }

  async markCompleted(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Marking onboarding completed for user ${userId}`);
    return await this.repository.markCompleted(userId);
  }

  async updateStatus(userId: string, status: OnboardingStatus, errorMessage?: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Updating status to '${status}' for user ${userId}`);
    return await this.repository.updateStatus(userId, status, errorMessage);
  }

  async getStatus(clientId: string): Promise<OnboardingStatus | null> {
    const record = await this.repository.findByClientId(clientId);
    return record ? (record.status as OnboardingStatus) : null;
  }

  async findByClientId(clientId: string): Promise<OnboardingRecord | null> {
    return await this.repository.findByClientId(clientId);
  }

  async getSignupData(userId: string): Promise<SignupData | null> {
    return await this.repository.getSignupData(userId);
  }

  async clearSignupData(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Clearing signup data for user ${userId}`);
    return await this.repository.clearSignupData(userId);
  }

  async markMessagesSent(userId: string): Promise<OnboardingRecord> {
    console.log(`[OnboardingDataService] Marking messages sent for user ${userId}`);
    return await this.repository.markMessagesSent(userId);
  }

  async hasMessagesSent(userId: string): Promise<boolean> {
    return await this.repository.hasMessagesSent(userId);
  }

  async delete(userId: string): Promise<void> {
    console.log(`[OnboardingDataService] Deleting onboarding record for user ${userId}`);
    return await this.repository.delete(userId);
  }
}

/**
 * @deprecated Use createOnboardingDataService(repos) instead
 */
export const onboardingDataService = OnboardingDataService.getInstance();
