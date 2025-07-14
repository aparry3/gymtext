import { BaseRepository } from './base.repository';

export interface CreateProgramPhaseParams {
  programId: string;
  phaseNumber: number;
  name: string;
  description?: string;
  focus?: string;
  startWeek: number;
  endWeek: number;
  trainingVariables?: Record<string, unknown>;
}

export interface UpdateProgramPhaseParams {
  name?: string;
  description?: string;
  focus?: string;
  trainingVariables?: Record<string, unknown>;
}

export class ProgramPhaseRepository extends BaseRepository {
  async create(params: CreateProgramPhaseParams) {
    const result = await this.db
      .insertInto('programPhases')
      .values({
        programId: params.programId,
        phaseNumber: params.phaseNumber,
        name: params.name,
        description: params.description,
        focus: params.focus,
        startWeek: params.startWeek,
        endWeek: params.endWeek,
        trainingVariables: JSON.stringify(params.trainingVariables || {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parsePhase(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('programPhases')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async findByProgramId(programId: string) {
    const results = await this.db
      .selectFrom('programPhases')
      .selectAll()
      .where('programId', '=', programId)
      .orderBy('phaseNumber', 'asc')
      .execute();

    return results.map(this.parsePhase);
  }

  async findByProgramAndWeek(programId: string, weekNumber: number) {
    const result = await this.db
      .selectFrom('programPhases')
      .selectAll()
      .where('programId', '=', programId)
      .where('startWeek', '<=', weekNumber)
      .where('endWeek', '>=', weekNumber)
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async update(id: string, params: UpdateProgramPhaseParams) {
    const updateData: Record<string, unknown> = {};
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.focus !== undefined) updateData.focus = params.focus;
    if (params.trainingVariables !== undefined) updateData.trainingVariables = JSON.stringify(params.trainingVariables);

    const result = await this.db
      .updateTable('programPhases')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('programPhases')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parsePhase(result) : null;
  }

  async deleteByProgramId(programId: string) {
    await this.db
      .deleteFrom('programPhases')
      .where('programId', '=', programId)
      .execute();
  }

  private parsePhase(row: {
    id: string;
    programId: string;
    phaseNumber: number;
    name: string;
    description: string | null;
    focus: string | null;
    startWeek: number;
    endWeek: number;
    trainingVariables: string | Record<string, unknown> | unknown;
    createdAt: string | Date;
  }) {
    return {
      id: row.id,
      programId: row.programId,
      phaseNumber: row.phaseNumber,
      name: row.name,
      description: row.description,
      focus: row.focus,
      startWeek: row.startWeek,
      endWeek: row.endWeek,
      trainingVariables: typeof row.trainingVariables === 'string' ? JSON.parse(row.trainingVariables) : row.trainingVariables,
      createdAt: new Date(row.createdAt),
    };
  }
}