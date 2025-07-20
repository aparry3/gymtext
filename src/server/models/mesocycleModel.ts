import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import type { Mesocycles } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import type { MicrocyclePlan } from '@/server/models/microcycleModel';

export type Mesocycle = Selectable<Mesocycles>;
export type NewMesocycle = Insertable<Mesocycles>;
export type MesocycleUpdate = Updateable<Mesocycles>;

export interface MesocyclePlan {
  id: string;
  phase: string;
  weeks: number;
  weeklyTargets: WeeklyTarget[];
}

export interface MesocycleDetailed extends MesocyclePlan {
  microcycles: MicrocyclePlan[];
}

export interface WeeklyTarget {
  weekOffset: number;
  split?: string;
  totalMileage?: number;
  longRunMileage?: number;
  avgIntensityPct1RM?: number;
  totalSetsMainLifts?: number;
  deload?: boolean;
}

export class MesocycleModel {
  private mesocycleRepository: MesocycleRepository;

  constructor() {
    this.mesocycleRepository = new MesocycleRepository();
  }

  async createMesocycle(mesocycleData: Partial<Mesocycle>): Promise<Mesocycle> {
    // Business logic validation
    this.validateMesocycleData(mesocycleData);
    
    return await this.mesocycleRepository.create(mesocycleData);
  }

  async getMesocycleById(id: string): Promise<Mesocycle | undefined> {
    return await this.mesocycleRepository.findById(id);
  }

  async updateMesocycle(id: string, updates: Partial<Mesocycle>): Promise<Mesocycle> {
    // Business logic for updates
    this.validateMesocycleData(updates);
    
    return await this.mesocycleRepository.update(id, updates);
  }

  async deleteMesocycle(id: string): Promise<void> {
    return await this.mesocycleRepository.delete(id);
  }

  private validateMesocycleData(data: Partial<Mesocycle>): void {
    if (data.phase !== undefined && (!data.phase || data.phase.trim().length < 2)) {
      throw new Error('Mesocycle phase must be at least 2 characters');
    }
    
    if (data.lengthWeeks !== undefined && (!data.lengthWeeks || data.lengthWeeks < 1 || data.lengthWeeks > 52)) {
      throw new Error('Mesocycle length must be between 1 and 52 weeks');
    }
    
    if (data.cycleOffset !== undefined && data.cycleOffset < 0) {
      throw new Error('Cycle offset cannot be negative');
    }
  }
}