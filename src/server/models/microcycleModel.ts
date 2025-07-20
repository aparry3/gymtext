import { MicrocycleRepository } from '../repositories/microcycleRepository';
import type { Microcycle } from './_types';

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
    if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
      throw new Error('Microcycle name must be at least 2 characters');
    }
    
    if (data.weekNumber !== undefined && (!data.weekNumber || data.weekNumber < 1)) {
      throw new Error('Microcycle week number must be at least 1');
    }
  }
}