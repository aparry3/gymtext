import { BaseRepository } from './base.repository';

export interface CreateProgramSessionParams {
  weekId: string;
  dayOfWeek: number;
  sessionType?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  exercises?: Array<Record<string, unknown>>;
}

export interface UpdateProgramSessionParams {
  sessionType?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  exercises?: Array<Record<string, unknown>>;
}

export interface CreateWeekSessionsParams {
  weekId: string;
  sessions: Omit<CreateProgramSessionParams, 'weekId'>[];
}

export class ProgramSessionRepository extends BaseRepository {
  async create(params: CreateProgramSessionParams) {
    const result = await this.db
      .insertInto('programSessions')
      .values({
        weekId: params.weekId,
        dayOfWeek: params.dayOfWeek,
        sessionType: params.sessionType,
        name: params.name,
        description: params.description,
        durationMinutes: params.durationMinutes,
        exercises: JSON.stringify(params.exercises || []),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseSession(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('programSessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async findByWeekId(weekId: string) {
    const results = await this.db
      .selectFrom('programSessions')
      .selectAll()
      .where('weekId', '=', weekId)
      .orderBy('dayOfWeek', 'asc')
      .execute();

    return results.map(this.parseSession);
  }

  async findByWeekAndDay(weekId: string, dayOfWeek: number) {
    const result = await this.db
      .selectFrom('programSessions')
      .selectAll()
      .where('weekId', '=', weekId)
      .where('dayOfWeek', '=', dayOfWeek)
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async update(id: string, params: UpdateProgramSessionParams) {
    const updateData: Record<string, unknown> = {};
    
    if (params.sessionType !== undefined) updateData.sessionType = params.sessionType;
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.durationMinutes !== undefined) updateData.durationMinutes = params.durationMinutes;
    if (params.exercises !== undefined) updateData.exercises = JSON.stringify(params.exercises);

    const result = await this.db
      .updateTable('programSessions')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom('programSessions')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? this.parseSession(result) : null;
  }

  async deleteByWeekId(weekId: string) {
    await this.db
      .deleteFrom('programSessions')
      .where('weekId', '=', weekId)
      .execute();
  }

  private parseSession(row: {
    id: string;
    weekId: string;
    dayOfWeek: number;
    sessionType: string | null;
    name: string | null;
    description: string | null;
    durationMinutes: number | null;
    exercises: string | Array<Record<string, unknown>> | unknown;
    createdAt: string | Date;
  }) {
    return {
      id: row.id,
      weekId: row.weekId,
      dayOfWeek: row.dayOfWeek,
      sessionType: row.sessionType,
      name: row.name,
      description: row.description,
      durationMinutes: row.durationMinutes,
      exercises: typeof row.exercises === 'string' ? JSON.parse(row.exercises) : row.exercises,
      createdAt: new Date(row.createdAt),
    };
  }
}