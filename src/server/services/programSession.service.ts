import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';
import { BaseRepository } from '../repositories/base.repository';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, ...sessionData } = session;
      const clonedSession = await this.repository.create({
        weekId: targetWeekId,
        dayOfWeek: sessionData.dayOfWeek,
        sessionType: sessionData.sessionType || undefined,
        name: sessionData.name || undefined,
        description: sessionData.description || undefined,
        durationMinutes: sessionData.durationMinutes || undefined,
        exercises: sessionData.exercises,
      });
      clonedSessions.push(clonedSession);
    }

    return clonedSessions;
  }
}