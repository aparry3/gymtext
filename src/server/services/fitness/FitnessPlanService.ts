import { FitnessProgram } from '@/shared/types/cycles';
import { FitnessPlanDB, NewFitnessPlan } from '@/shared/types/fitnessPlan';
import { FitnessPlanRepository } from '@/server/data/repositories/FitnessPlanRepository';

export class FitnessPlanService {
  constructor(
    private fitnessPlanRepo: FitnessPlanRepository
  ) {}

  /**
   * Creates a new fitness plan from a generated program
   */
  async createFromProgram(
    clientId: string,
    program: FitnessProgram,
    startDate: Date,
    goalStatement?: string
  ): Promise<FitnessPlanDB> {
    return this.fitnessPlanRepo.createFromProgram(
      clientId,
      program,
      startDate,
      goalStatement
    );
  }

  /**
   * Gets the currently active fitness plan for a user
   */
  async getActivePlan(clientId: string): Promise<FitnessPlanDB | null> {
    return this.fitnessPlanRepo.findActiveByClientId(clientId);
  }

  /**
   * Gets the active plan or throws an error if none exists
   */
  async getActivePlanOrThrow(clientId: string): Promise<FitnessPlanDB> {
    const plan = await this.getActivePlan(clientId);
    if (!plan) {
      throw new Error('No active fitness plan found. Please complete onboarding first.');
    }
    return plan;
  }

  /**
   * Gets all fitness plans for a user
   */
  async getAllPlans(clientId: string): Promise<FitnessPlanDB[]> {
    return this.fitnessPlanRepo.findByClientId(clientId);
  }

  /**
   * Transforms a FitnessProgram into the format needed for database insertion
   */
  static transformProgramForDb(
    clientId: string,
    program: FitnessProgram,
    startDate: Date,
    goalStatement?: string
  ): NewFitnessPlan {
    return {
      clientId,
      programType: program.programType,
      goalStatement: goalStatement ?? null,
      overview: program.overview,
      startDate,
      macrocycles: program.macrocycles,
    };
  }
}