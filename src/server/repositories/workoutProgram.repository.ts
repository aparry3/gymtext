import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
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
  goals?: any;
  equipmentRequired?: any;
}

export interface UpdateWorkoutProgramParams {
  name?: string;
  description?: string;
  status?: string;
  goals?: any;
  equipmentRequired?: any;
  endDate?: Date;
}

export class WorkoutProgramRepository extends BaseRepository {
  async create(params: CreateWorkoutProgramParams) {
    const result = await this.db
      .insertInto('workout_programs')
      .values({
        user_id: params.userId,
        name: params.name,
        description: params.description,
        program_type: params.programType,
        duration_type: params.durationType,
        duration_weeks: params.durationWeeks,
        start_date: params.startDate?.toISOString().split('T')[0],
        end_date: params.endDate?.toISOString().split('T')[0],
        goals: JSON.stringify(params.goals || {}),
        equipment_required: JSON.stringify(params.equipmentRequired || []),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseProgram(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('workout_programs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parseProgram(result) : null;
  }

  async findByUserId(userId: string, status?: string) {
    let query = this.db
      .selectFrom('workout_programs')
      .selectAll()
      .where('user_id', '=', userId);

    if (status) {
      query = query.where('status', '=', status);
    }

    const results = await query.execute();
    return results.map(this.parseProgram);
  }

  async update(id: string, params: UpdateWorkoutProgramParams) {
    const updateData: any = {};
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.goals !== undefined) updateData.goals = JSON.stringify(params.goals);
    if (params.equipmentRequired !== undefined) updateData.equipment_required = JSON.stringify(params.equipmentRequired);
    if (params.endDate !== undefined) updateData.end_date = params.endDate.toISOString().split('T')[0];

    const result = await this.db
      .updateTable('workout_programs')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseProgram(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('workout_programs')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseProgram(result) : null;
  }

  private parseProgram(row: any) {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      programType: row.program_type,
      durationType: row.duration_type,
      durationWeeks: row.duration_weeks,
      startDate: row.start_date ? new Date(row.start_date) : null,
      endDate: row.end_date ? new Date(row.end_date) : null,
      status: row.status,
      goals: typeof row.goals === 'string' ? JSON.parse(row.goals) : row.goals,
      equipmentRequired: typeof row.equipment_required === 'string' ? JSON.parse(row.equipment_required) : row.equipment_required,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}