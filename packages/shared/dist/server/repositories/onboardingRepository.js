import { BaseRepository } from './baseRepository';
import { sql } from 'kysely';
/**
 * OnboardingRepository
 *
 * Manages user onboarding state and signup data
 */
export class OnboardingRepository extends BaseRepository {
    /**
     * Create an onboarding record for a client
     */
    async create(clientId, signupData) {
        const record = {
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
    async findByClientId(clientId) {
        return await this.db
            .selectFrom('userOnboarding')
            .selectAll()
            .where('clientId', '=', clientId)
            .executeTakeFirst() ?? null;
    }
    /**
     * Update onboarding status
     */
    async updateStatus(clientId, status, errorMessage) {
        const update = {
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
    async markStarted(clientId) {
        return await this.db
            .updateTable('userOnboarding')
            .set({
            status: 'in_progress',
            startedAt: sql `CURRENT_TIMESTAMP`,
        })
            .where('clientId', '=', clientId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Update current step (for progress tracking)
     */
    async updateCurrentStep(clientId, stepNumber) {
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
    async markCompleted(clientId) {
        return await this.db
            .updateTable('userOnboarding')
            .set({
            status: 'completed',
            completedAt: sql `CURRENT_TIMESTAMP`,
        })
            .where('clientId', '=', clientId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Mark final program messages as sent
     */
    async markMessagesSent(clientId) {
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
    async hasMessagesSent(clientId) {
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
    async getSignupData(clientId) {
        const result = await this.db
            .selectFrom('userOnboarding')
            .select('signupData')
            .where('clientId', '=', clientId)
            .executeTakeFirst();
        return result?.signupData ?? null;
    }
    /**
     * Clear signup data (cleanup after profile creation)
     */
    async clearSignupData(clientId) {
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
    async delete(clientId) {
        await this.db
            .deleteFrom('userOnboarding')
            .where('clientId', '=', clientId)
            .execute();
    }
}
