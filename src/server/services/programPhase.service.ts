import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { BaseRepository } from '../repositories/base.repository';

export interface CreateProgramPhaseParams {
  programId: string;
  phaseNumber: number;
  name: string;
  description?: string;
  focus?: string;
  startWeek: number;
  endWeek: number;
  trainingVariables?: any;
}

export interface UpdateProgramPhaseParams {
  name?: string;
  description?: string;
  focus?: string;
  trainingVariables?: any;
}

export class ProgramPhaseRepository extends BaseRepository {
  async create(params: CreateProgramPhaseParams) {
    const result = await this.db
      .insertInto('program_phases')
      .values({
        program_id: params.programId,
        phase_number: params.phaseNumber,
        name: params.name,
        description: params.description,
        focus: params.focus,
        start_week: params.startWeek,
        end_week: params.endWeek,
        training_variables: JSON.stringify(params.trainingVariables || {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parsePhase(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('program_phases')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async findByProgramId(programId: string) {
    const results = await this.db
      .selectFrom('program_phases')
      .selectAll()
      .where('program_id', '=', programId)
      .orderBy('phase_number', 'asc')
      .execute();

    return results.map(this.parsePhase);
  }

  async findByProgramAndWeek(programId: string, weekNumber: number) {
    const result = await this.db
      .selectFrom('program_phases')
      .selectAll()
      .where('program_id', '=', programId)
      .where('start_week', '<=', weekNumber)
      .where('end_week', '>=', weekNumber)
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async update(id: string, params: UpdateProgramPhaseParams) {
    const updateData: any = {};
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.focus !== undefined) updateData.focus = params.focus;
    if (params.trainingVariables !== undefined) updateData.training_variables = JSON.stringify(params.trainingVariables);

    const result = await this.db
      .updateTable('program_phases')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('program_phases')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async deleteByProgramId(programId: string) {
    await this.db
      .deleteFrom('program_phases')
      .where('program_id', '=', programId)
      .execute();
  }

  private parsePhase(row: any) {
    return {
      id: row.id,
      programId: row.program_id,
      phaseNumber: row.phase_number,
      name: row.name,
      description: row.description,
      focus: row.focus,
      startWeek: row.start_week,
      endWeek: row.end_week,
      trainingVariables: typeof row.training_variables === 'string' ? JSON.parse(row.training_variables) : row.training_variables,
      createdAt: new Date(row.created_at),
    };
  }
}

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