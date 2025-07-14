import { BaseRepository } from './base.repository';

export interface CreateUserProgramParams {
  userId: string;
  programId: string;
  startedAt?: Date;
  currentWeek?: number;
  currentPhaseId?: string;
  adaptations?: Record<string, unknown>;
}

export interface UpdateUserProgramParams {
  currentWeek?: number;
  currentPhaseId?: string;
  adaptations?: Record<string, unknown>;
  status?: string;
  completedAt?: Date;
}

export interface UserProgramProgress {
  userId: string;
  programId: string;
  currentWeek: number;
  currentPhaseId: string | null;
  completedWorkouts: number;
  totalWorkouts: number;
  adherenceRate: number;
  isOnTrack: boolean;
}

export class UserProgramRepository extends BaseRepository {
  async create(params: CreateUserProgramParams) {
    const result = await this.db
      .insertInto('userPrograms')
      .values({
        userId: params.userId,
        programId: params.programId,
        startedAt: params.startedAt?.toISOString() || new Date().toISOString(),
        currentWeek: params.currentWeek || 1,
        currentPhaseId: params.currentPhaseId,
        adaptations: JSON.stringify(params.adaptations || {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseUserProgram(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('userPrograms')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async findByUserId(userId: string, status?: string) {
    let query = this.db
      .selectFrom('userPrograms')
      .selectAll()
      .where('userId', '=', userId);

    if (status) {
      query = query.where('status', '=', status);
    }

    const results = await query.execute();
    return results.map(this.parseUserProgram);
  }

  async findActiveByUserId(userId: string) {
    const result = await this.db
      .selectFrom('userPrograms')
      .selectAll()
      .where('userId', '=', userId)
      .where('status', '=', 'active')
      .orderBy('startedAt', 'desc')
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async findByUserAndProgram(userId: string, programId: string) {
    const result = await this.db
      .selectFrom('userPrograms')
      .selectAll()
      .where('userId', '=', userId)
      .where('programId', '=', programId)
      .orderBy('startedAt', 'desc')
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async update(id: string, params: UpdateUserProgramParams) {
    const updateData: Record<string, unknown> = {};
    
    if (params.currentWeek !== undefined) updateData.currentWeek = params.currentWeek;
    if (params.currentPhaseId !== undefined) updateData.currentPhaseId = params.currentPhaseId;
    if (params.adaptations !== undefined) updateData.adaptations = JSON.stringify(params.adaptations);
    if (params.status !== undefined) updateData.status = params.status;
    if (params.completedAt !== undefined) updateData.completedAt = params.completedAt.toISOString();

    const result = await this.db
      .updateTable('userPrograms')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('userPrograms')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseUserProgram(result) : null;
  }

  private parseUserProgram(row: {
    id: string;
    userId: string;
    programId: string;
    startedAt: string | Date;
    currentWeek: number | null;
    currentPhaseId: string | null;
    adaptations: string | Record<string, unknown> | unknown;
    status: string | null;
    completedAt: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  }) {
    return {
      id: row.id,
      userId: row.userId,
      programId: row.programId,
      startedAt: new Date(row.startedAt),
      currentWeek: row.currentWeek || 1,
      currentPhaseId: row.currentPhaseId,
      adaptations: typeof row.adaptations === 'string' ? JSON.parse(row.adaptations) : row.adaptations,
      status: row.status || 'active',
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}