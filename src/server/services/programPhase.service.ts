import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';
import { ProgramPhaseRepository, CreateProgramPhaseParams, UpdateProgramPhaseParams } from '../repositories/program-phase.repository';

export class ProgramPhaseService {
  private repository: ProgramPhaseRepository;

  constructor(db: Kysely<Database>) {
    this.repository = new ProgramPhaseRepository(db);
  }

  async createPhase(params: CreateProgramPhaseParams) {
    // Validate input
    if (!params.programId || !params.name) {
      throw new Error('Program ID and phase name are required');
    }

    if (params.startWeek > params.endWeek) {
      throw new Error('Start week must be before or equal to end week');
    }

    // Check for overlapping phases
    const existingPhases = await this.repository.findByProgramId(params.programId);
    const hasOverlap = existingPhases.some(phase => 
      (params.startWeek >= phase.startWeek && params.startWeek <= phase.endWeek) ||
      (params.endWeek >= phase.startWeek && params.endWeek <= phase.endWeek) ||
      (params.startWeek <= phase.startWeek && params.endWeek >= phase.endWeek)
    );

    if (hasOverlap) {
      throw new Error('Phase weeks overlap with an existing phase');
    }

    return await this.repository.create(params);
  }

  async getPhase(id: string) {
    const phase = await this.repository.findById(id);
    if (!phase) {
      throw new Error('Phase not found');
    }
    return phase;
  }

  async getProgramPhases(programId: string) {
    return await this.repository.findByProgramId(programId);
  }

  async getCurrentPhase(programId: string, currentWeek: number) {
    const phase = await this.repository.findByProgramAndWeek(programId, currentWeek);
    if (!phase) {
      throw new Error(`No phase found for week ${currentWeek}`);
    }
    return phase;
  }

  async updatePhase(id: string, params: UpdateProgramPhaseParams) {
    const phase = await this.repository.update(id, params);
    if (!phase) {
      throw new Error('Phase not found');
    }
    return phase;
  }

  async deletePhase(id: string) {
    const phase = await this.repository.delete(id);
    if (!phase) {
      throw new Error('Phase not found');
    }
    return phase;
  }

  async createProgramPhases(programId: string, phases: Omit<CreateProgramPhaseParams, 'programId'>[]) {
    const createdPhases = [];
    
    // Sort phases by phase number to ensure correct order
    const sortedPhases = phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    for (const phase of sortedPhases) {
      const createdPhase = await this.createPhase({
        ...phase,
        programId,
      });
      createdPhases.push(createdPhase);
    }

    return createdPhases;
  }
}