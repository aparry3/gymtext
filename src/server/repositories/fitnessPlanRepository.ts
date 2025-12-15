import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  FitnessPlanModel,
  type FitnessPlan,
} from '@/server/models/fitnessPlan';

/**
 * Repository for fitness plan database operations
 *
 * Plans are now simple structured text - no more JSON mesocycles array
 */
export class FitnessPlanRepository extends BaseRepository {
  /**
   * Insert a new fitness plan
   */
  async insertFitnessPlan(fitnessPlan: FitnessPlan): Promise<FitnessPlan> {
    const result = await this.db
      .insertInto('fitnessPlans')
      .values({
        clientId: fitnessPlan.clientId,
        description: fitnessPlan.description,
        formatted: fitnessPlan.formatted,
        message: fitnessPlan.message,
        structured: fitnessPlan.structured ? JSON.stringify(fitnessPlan.structured) : null,
        startDate: fitnessPlan.startDate,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return FitnessPlanModel.fromDB(result);
  }

  /**
   * Get a fitness plan by ID
   */
  async getFitnessPlan(id: string): Promise<FitnessPlan | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) return null;
    return FitnessPlanModel.fromDB(result);
  }

  /**
   * Get the current (latest) fitness plan for a user
   */
  async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('clientId', '=', userId)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    if (!result) return null;
    return FitnessPlanModel.fromDB(result);
  }

  /**
   * Get all fitness plans for a user (for history)
   * Returns plans ordered by creation date (newest first)
   */
  async getPlanHistory(userId: string): Promise<FitnessPlan[]> {
    const results = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('clientId', '=', userId)
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(FitnessPlanModel.fromDB);
  }

  /**
   * Update a fitness plan
   */
  async updateFitnessPlan(
    id: string,
    updates: Partial<Pick<FitnessPlan, 'description' | 'formatted' | 'message' | 'structured'>>
  ): Promise<FitnessPlan | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.formatted !== undefined) {
      updateData.formatted = updates.formatted;
    }
    if (updates.message !== undefined) {
      updateData.message = updates.message;
    }
    if (updates.structured !== undefined) {
      updateData.structured = updates.structured ? JSON.stringify(updates.structured) : null;
    }

    const result = await this.db
      .updateTable('fitnessPlans')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!result) return null;
    return FitnessPlanModel.fromDB(result);
  }

  /**
   * Delete a fitness plan by ID
   */
  async deleteFitnessPlan(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('fitnessPlans')
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}
