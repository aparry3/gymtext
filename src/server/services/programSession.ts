import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { 
  ProgramSessionRepository, 
  CreateProgramSessionParams, 
  UpdateProgramSessionParams 
} from '../repositories/programSession.repository';

export interface CreateWeekSessionsParams {
  weekId: string;
  sessions: Omit<CreateProgramSessionParams, 'weekId'>[];
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