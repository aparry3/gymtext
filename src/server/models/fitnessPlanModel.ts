import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import type { FitnessPlans } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type FitnessPlan = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

// These types are likely defined elsewhere, keeping them for now
export type FitnessPlanDB = FitnessPlan;
export interface FitnessProgram {
  programType: string;
  macrocycles: Macrocycle[];
  overview: string;
}
export interface Macrocycle {
  name: string;
  description: string;
  durationWeeks: number;
  mesocycles: any[];
}

export class FitnessPlanModel {
  private fitnessPlanRepository: FitnessPlanRepository;

  constructor() {
    this.fitnessPlanRepository = new FitnessPlanRepository();
  }

  async createPlanFromProgram(
    clientId: string,
    program: FitnessProgram,
    startDate: Date,
    goalStatement?: string
  ): Promise<FitnessPlanDB> {
    // Business logic validation
    this.validateProgram(program);
    this.validateStartDate(startDate);
    
    return await this.fitnessPlanRepository.createFromProgram(
      clientId,
      program,
      startDate,
      goalStatement
    );
  }

  async getPlanById(id: string): Promise<FitnessPlanDB | undefined> {
    return await this.fitnessPlanRepository.findById(id);
  }

  async getPlansForUser(clientId: string): Promise<FitnessPlanDB[]> {
    return await this.fitnessPlanRepository.findByClientId(clientId);
  }

  async updatePlan(id: string, updates: Partial<FitnessPlanDB>): Promise<FitnessPlanDB> {
    // Business logic for updates
    if (updates.startDate) {
      this.validateStartDate(updates.startDate);
    }
    
    return await this.fitnessPlanRepository.update(id, updates);
  }

  async deletePlan(id: string): Promise<void> {
    return await this.fitnessPlanRepository.delete(id);
  }

  private validateProgram(program: FitnessProgram): void {
    if (!program.programType) {
      throw new Error('Program type is required');
    }
    
    if (!program.macrocycles || program.macrocycles.length === 0) {
      throw new Error('At least one macrocycle is required');
    }
    
    if (!program.overview || program.overview.trim().length < 10) {
      throw new Error('Program overview must be at least 10 characters');
    }
    
    // Validate each macrocycle
    program.macrocycles.forEach((macrocycle, index) => {
      this.validateMacrocycle(macrocycle, index);
    });
  }

  private validateMacrocycle(macrocycle: Macrocycle, index: number): void {
    if (!macrocycle.name || macrocycle.name.trim().length < 2) {
      throw new Error(`Macrocycle ${index + 1} name must be at least 2 characters`);
    }
    
    if (!macrocycle.description || macrocycle.description.trim().length < 10) {
      throw new Error(`Macrocycle ${index + 1} description must be at least 10 characters`);
    }
    
    if (!macrocycle.durationWeeks || macrocycle.durationWeeks < 1) {
      throw new Error(`Macrocycle ${index + 1} duration must be at least 1 week`);
    }
    
    if (!macrocycle.mesocycles || macrocycle.mesocycles.length === 0) {
      throw new Error(`Macrocycle ${index + 1} must have at least one mesocycle`);
    }
  }

  private validateStartDate(startDate: Date): void {
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    if (startDate < now) {
      throw new Error('Start date cannot be in the past');
    }
    
    if (startDate > oneYearFromNow) {
      throw new Error('Start date cannot be more than one year in the future');
    }
  }
}