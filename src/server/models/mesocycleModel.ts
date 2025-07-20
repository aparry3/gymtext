import { MesocycleRepository } from '../repositories/mesocycleRepository';
import type { Mesocycle } from './_types';

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
    if (updates.name || updates.description || updates.durationWeeks) {
      this.validateMesocycleData(updates);
    }
    
    return await this.mesocycleRepository.update(id, updates);
  }

  async deleteMesocycle(id: string): Promise<void> {
    return await this.mesocycleRepository.delete(id);
  }

  private validateMesocycleData(data: Partial<Mesocycle>): void {
    if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
      throw new Error('Mesocycle name must be at least 2 characters');
    }
    
    if (data.description !== undefined && (!data.description || data.description.trim().length < 10)) {
      throw new Error('Mesocycle description must be at least 10 characters');
    }
    
    if (data.durationWeeks !== undefined && (!data.durationWeeks || data.durationWeeks < 1 || data.durationWeeks > 52)) {
      throw new Error('Mesocycle duration must be between 1 and 52 weeks');
    }
  }
}