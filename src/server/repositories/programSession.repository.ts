import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { BaseRepository } from './base.repository';

export interface CreateProgramSessionParams {
  weekId: string;
  dayOfWeek: number;
  sessionType?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  exercises?: any;
}

export interface UpdateProgramSessionParams {
  sessionType?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  exercises?: any;
}

export class ProgramSessionRepository extends BaseRepository {
  async create(params: CreateProgramSessionParams) {
    const result = await this.db
      .insertInto('program_sessions')
      .values({
        week_id: params.weekId,
        day_of_week: params.dayOfWeek,
        session_type: params.sessionType,
        name: params.name,
        description: params.description,
        duration_minutes: params.durationMinutes,
        exercises: JSON.stringify(params.exercises || []),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseSession(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('program_sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async findByWeekId(weekId: string) {
    const results = await this.db
      .selectFrom('program_sessions')
      .selectAll()
      .where('week_id', '=', weekId)
      .orderBy('day_of_week', 'asc')
      .execute();

    return results.map(this.parseSession);
  }

  async findByWeekAndDay(weekId: string, dayOfWeek: number) {
    const result = await this.db
      .selectFrom('program_sessions')
      .selectAll()
      .where('week_id', '=', weekId)
      .where('day_of_week', '=', dayOfWeek)
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async update(id: string, params: UpdateProgramSessionParams) {
    const updateData: any = {};
    
    if (params.sessionType !== undefined) updateData.session_type = params.sessionType;
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.durationMinutes !== undefined) updateData.duration_minutes = params.durationMinutes;
    if (params.exercises !== undefined) updateData.exercises = JSON.stringify(params.exercises);

    const result = await this.db
      .updateTable('program_sessions')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('program_sessions')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async deleteByWeekId(weekId: string) {
    await this.db
      .deleteFrom('program_sessions')
      .where('week_id', '=', weekId)
      .execute();
  }

  private parseSession(row: any) {
    return {
      id: row.id,
      weekId: row.week_id,
      dayOfWeek: row.day_of_week,
      sessionType: row.session_type,
      name: row.name,
      description: row.description,
      durationMinutes: row.duration_minutes,
      exercises: typeof row.exercises === 'string' ? JSON.parse(row.exercises) : row.exercises,
      createdAt: new Date(row.created_at),
    };
  }
}