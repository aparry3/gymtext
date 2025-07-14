import { BaseRepository } from './base.repository';

export interface CreateWorkoutProgramParams {
  userId: string;
  name: string;
  description?: string;
  programType?: string;
  durationType: 'fixed' | 'ongoing';
  durationWeeks?: number;
  startDate?: Date;
  endDate?: Date;
  goals?: Record<string, unknown>;
  equipmentRequired?: string[];
}

export interface UpdateWorkoutProgramParams {
  name?: string;
  description?: string;
  status?: string;
  goals?: Record<string, unknown>;
  equipmentRequired?: string[];
  endDate?: Date;
}

export class WorkoutProgramRepository extends BaseRepository {
  async create(params: CreateWorkoutProgramParams) {
    const result = await this.db
      .insertInto('workoutPrograms')
      .values({
        userId: params.userId,
        name: params.name,
        description: params.description,
        programType: params.programType,
        durationType: params.durationType,
        durationWeeks: params.durationWeeks,
        startDate: params.startDate?.toISOString().split('T')[0],
        endDate: params.endDate?.toISOString().split('T')[0],
        goals: JSON.stringify(params.goals || {}),
        equipmentRequired: JSON.stringify(params.equipmentRequired || []),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseProgram(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('workoutPrograms')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parseProgram(result) : null;
  }

  async findByUserId(userId: string, status?: string) {
    let query = this.db
      .selectFrom('workoutPrograms')
      .selectAll()
      .where('userId', '=', userId);

    if (status) {
      query = query.where('status', '=', status);
    }

    const results = await query.execute();
    return results.map(this.parseProgram);
  }

  async update(id: string, params: UpdateWorkoutProgramParams) {
    const updateData: Record<string, unknown> = {};
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.goals !== undefined) updateData.goals = JSON.stringify(params.goals);
    if (params.equipmentRequired !== undefined) updateData.equipmentRequired = JSON.stringify(params.equipmentRequired);
    if (params.endDate !== undefined) updateData.endDate = params.endDate.toISOString().split('T')[0];

    const result = await this.db
      .updateTable('workoutPrograms')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseProgram(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('workoutPrograms')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseProgram(result) : null;
  }

  private parseProgram(row: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    programType: string | null;
    durationType: string | null;
    durationWeeks: number | null;
    startDate: Date | null;
    endDate: Date | null;
    status: string | null;
    goals: string | Record<string, unknown> | unknown;
    equipmentRequired: string | string[] | unknown;
    createdAt: string | Date;
    updatedAt: string | Date;
  }) {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description,
      programType: row.programType,
      durationType: row.durationType,
      durationWeeks: row.durationWeeks,
      startDate: row.startDate ? new Date(row.startDate) : null,
      endDate: row.endDate ? new Date(row.endDate) : null,
      status: row.status,
      goals: typeof row.goals === 'string' ? JSON.parse(row.goals) : row.goals,
      equipmentRequired: typeof row.equipmentRequired === 'string' ? JSON.parse(row.equipmentRequired) : row.equipmentRequired,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}