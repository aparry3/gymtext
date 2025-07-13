import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { BaseRepository } from './base.repository';

export interface CreateUserProgramParams {
  userId: string;
  programId: string;
  startedAt?: Date;
  currentWeek?: number;
  currentPhaseId?: string;
  adaptations?: any;
}

export interface UpdateUserProgramParams {
  currentWeek?: number;
  currentPhaseId?: string;
  adaptations?: any;
  status?: string;
  completedAt?: Date;
}

export class UserProgramRepository extends BaseRepository {
  async create(params: CreateUserProgramParams) {
    const result = await this.db
      .insertInto('user_programs')
      .values({
        user_id: params.userId,
        program_id: params.programId,
        started_at: params.startedAt?.toISOString() || new Date().toISOString(),
        current_week: params.currentWeek || 1,
        current_phase_id: params.currentPhaseId,
        adaptations: JSON.stringify(params.adaptations || {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseUserProgram(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('user_programs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async findByUserId(userId: string, status?: string) {
    let query = this.db
      .selectFrom('user_programs')
      .selectAll()
      .where('user_id', '=', userId);

    if (status) {
      query = query.where('status', '=', status);
    }

    const results = await query.execute();
    return results.map(this.parseUserProgram);
  }

  async findActiveByUserId(userId: string) {
    const result = await this.db
      .selectFrom('user_programs')
      .selectAll()
      .where('user_id', '=', userId)
      .where('status', '=', 'active')
      .orderBy('started_at', 'desc')
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async findByUserAndProgram(userId: string, programId: string) {
    const result = await this.db
      .selectFrom('user_programs')
      .selectAll()
      .where('user_id', '=', userId)
      .where('program_id', '=', programId)
      .orderBy('started_at', 'desc')
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async update(id: string, params: UpdateUserProgramParams) {
    const updateData: any = {};
    
    if (params.currentWeek !== undefined) updateData.current_week = params.currentWeek;
    if (params.currentPhaseId !== undefined) updateData.current_phase_id = params.currentPhaseId;
    if (params.adaptations !== undefined) updateData.adaptations = JSON.stringify(params.adaptations);
    if (params.status !== undefined) updateData.status = params.status;
    if (params.completedAt !== undefined) updateData.completed_at = params.completedAt.toISOString();

    const result = await this.db
      .updateTable('user_programs')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('user_programs')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  private parseUserProgram(row: any) {
    return {
      id: row.id,
      userId: row.user_id,
      programId: row.program_id,
      startedAt: new Date(row.started_at),
      currentWeek: row.current_week,
      currentPhaseId: row.current_phase_id,
      adaptations: typeof row.adaptations === 'string' ? JSON.parse(row.adaptations) : row.adaptations,
      status: row.status,
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}