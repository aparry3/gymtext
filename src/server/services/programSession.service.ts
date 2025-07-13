import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { BaseRepository } from '../repositories/base.repository';

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

export interface CreateWeekSessionsParams {
  weekId: string;
  sessions: Omit<CreateProgramSessionParams, 'weekId'>[];
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

export class ProgramSessionService {
  private repository: ProgramSessionRepository;

  constructor(db: Kysely<Database>) {
    this.repository = new ProgramSessionRepository(db);
  }

  async createSession(params: CreateProgramSessionParams) {
    // Validate input
    if (!params.weekId) {
      throw new Error('Week ID is required');
    }

    if (params.dayOfWeek < 0 || params.dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Check if session already exists for this day
    const existingSession = await this.repository.findByWeekAndDay(params.weekId, params.dayOfWeek);
    if (existingSession) {
      throw new Error(`Session already exists for day ${params.dayOfWeek}`);
    }

    return await this.repository.create(params);
  }

  async getSession(id: string) {
    const session = await this.repository.findById(id);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  async getWeekSessions(weekId: string) {
    return await this.repository.findByWeekId(weekId);
  }

  async getSessionByDay(weekId: string, dayOfWeek: number) {
    const session = await this.repository.findByWeekAndDay(weekId, dayOfWeek);
    if (!session) {
      throw new Error(`No session found for day ${dayOfWeek}`);
    }
    return session;
  }

  async updateSession(id: string, params: UpdateProgramSessionParams) {
    const session = await this.repository.update(id, params);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  async deleteSession(id: string) {
    const session = await this.repository.delete(id);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  async createWeekSessions(params: CreateWeekSessionsParams) {
    const createdSessions = [];

    // Sort sessions by day of week
    const sortedSessions = params.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    for (const session of sortedSessions) {
      const createdSession = await this.createSession({
        ...session,
        weekId: params.weekId,
      });
      createdSessions.push(createdSession);
    }

    return createdSessions;
  }

  async cloneWeekSessions(sourceWeekId: string, targetWeekId: string) {
    const sourceSessions = await this.repository.findByWeekId(sourceWeekId);
    const clonedSessions = [];

    for (const session of sourceSessions) {
      const { id, weekId, createdAt, ...sessionData } = session;
      const clonedSession = await this.repository.create({
        ...sessionData,
        weekId: targetWeekId,
      });
      clonedSessions.push(clonedSession);
    }

    return clonedSessions;
  }
}