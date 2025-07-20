import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import type { Microcycles } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type Microcycle = Selectable<Microcycles>;
export type NewMicrocycle = Insertable<Microcycles>;
export type MicrocycleUpdate = Updateable<Microcycles>;

export class MicrocycleModel {
  private microcycleRepository: MicrocycleRepository;

  constructor() {
    this.microcycleRepository = new MicrocycleRepository();
  }

  async createMicrocycle(microcycleData: Partial<Microcycle>): Promise<Microcycle> {
    // Business logic validation
    this.validateMicrocycleData(microcycleData);
    
    return await this.microcycleRepository.create(microcycleData);
  }

  async getMicrocycleById(id: string): Promise<Microcycle | undefined> {
    return await this.microcycleRepository.findById(id);
  }

  async updateMicrocycle(id: string, updates: Partial<Microcycle>): Promise<Microcycle> {
    // Business logic for updates
    this.validateMicrocycleData(updates);
    
    return await this.microcycleRepository.update(id, updates);
  }

  async deleteMicrocycle(id: string): Promise<void> {
    return await this.microcycleRepository.delete(id);
  }

  private validateMicrocycleData(data: Partial<Microcycle>): void {
    if (data.weekNumber !== undefined && (!data.weekNumber || data.weekNumber < 1)) {
      throw new Error('Microcycle week number must be at least 1');
    }
    
    if (data.cycleOffset !== undefined && data.cycleOffset < 0) {
      throw new Error('Cycle offset cannot be negative');
    }
    
    if (data.startDate !== undefined && data.endDate !== undefined) {
      if (new Date(data.startDate) >= new Date(data.endDate)) {
        throw new Error('Start date must be before end date');
      }
    }
  }
}