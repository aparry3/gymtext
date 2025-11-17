import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { Mesocycle } from '@/server/models/mesocycle';

export class MesocycleService {
  private static instance: MesocycleService;
  private mesocycleRepo: MesocycleRepository;

  private constructor() {
    this.mesocycleRepo = new MesocycleRepository(postgresDb);
  }

  public static getInstance(): MesocycleService {
    if (!MesocycleService.instance) {
      MesocycleService.instance = new MesocycleService();
    }
    return MesocycleService.instance;
  }

  /**
   * Get a mesocycle by fitness plan ID and mesocycle index
   * Returns the mesocycle from the database
   */
  public async getMesocycle(
    fitnessPlanId: string,
    mesocycleIndex: number
  ): Promise<Mesocycle | null> {
    return await this.mesocycleRepo.getMesocycleByIndex(fitnessPlanId, mesocycleIndex);
  }

  /**
   * Get all mesocycles for a fitness plan
   */
  public async getMesocyclesByPlanId(fitnessPlanId: string): Promise<Mesocycle[]> {
    return await this.mesocycleRepo.getMesocyclesByPlanId(fitnessPlanId);
  }

  /**
   * Get all mesocycles for a user
   */
  public async getMesocyclesByUserId(userId: string): Promise<Mesocycle[]> {
    return await this.mesocycleRepo.getMesocyclesByUserId(userId);
  }

  /**
   * Create a new mesocycle
   */
  public async createMesocycle(
    mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Mesocycle> {
    return await this.mesocycleRepo.createMesocycle(mesocycle);
  }

  /**
   * Update a mesocycle
   */
  public async updateMesocycle(
    id: string,
    updates: Partial<Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'fitnessPlanId' | 'mesocycleIndex'>>
  ): Promise<Mesocycle | null> {
    return await this.mesocycleRepo.updateMesocycle(id, updates);
  }

  /**
   * Delete a mesocycle
   */
  public async deleteMesocycle(id: string): Promise<void> {
    return await this.mesocycleRepo.deleteMesocycle(id);
  }

  /**
   * Delete all mesocycles for a fitness plan
   */
  public async deleteMesocyclesByPlanId(fitnessPlanId: string): Promise<void> {
    return await this.mesocycleRepo.deleteMesocyclesByPlanId(fitnessPlanId);
  }

  /**
   * Get mesocycle by absolute week number (from plan start)
   */
  public async getMesocycleByWeek(
    fitnessPlanId: string,
    absoluteWeek: number
  ): Promise<Mesocycle | null> {
    return await this.mesocycleRepo.getMesocycleByWeek(fitnessPlanId, absoluteWeek);
  }
}

// Export singleton instance
export const mesocycleService = MesocycleService.getInstance();
