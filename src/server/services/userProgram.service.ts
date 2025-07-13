import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';
import { BaseRepository } from '../repositories/base.repository';

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

export class UserProgramService {
  private repository: UserProgramRepository;

  constructor(private db: Kysely<Database>) {
    this.repository = new UserProgramRepository(db);
  }

  async enrollUserInProgram(params: CreateUserProgramParams) {
    // Check if user already has an active program
    const activeProgram = await this.repository.findActiveByUserId(params.userId);
    if (activeProgram) {
      throw new Error('User already has an active program. Please complete or pause the current program first.');
    }

    // Get the first phase of the program
    const firstPhase = await this.db
      .selectFrom('programPhases')
      .select('id')
      .where('programId', '=', params.programId)
      .where('phaseNumber', '=', 1)
      .executeTakeFirst();

    return await this.repository.create({
      ...params,
      currentPhaseId: firstPhase?.id,
    });
  }

  async getUserProgram(id: string) {
    const userProgram = await this.repository.findById(id);
    if (!userProgram) {
      throw new Error('User program not found');
    }
    return userProgram;
  }

  async getActiveUserProgram(userId: string) {
    const userProgram = await this.repository.findActiveByUserId(userId);
    if (!userProgram) {
      throw new Error('No active program found for user');
    }
    return userProgram;
  }

  async getUserPrograms(userId: string, status?: string) {
    return await this.repository.findByUserId(userId, status);
  }

  async updateUserProgram(id: string, params: UpdateUserProgramParams) {
    const userProgram = await this.repository.update(id, params);
    if (!userProgram) {
      throw new Error('User program not found');
    }
    return userProgram;
  }

  async progressToNextWeek(userProgramId: string) {
    const userProgram = await this.getUserProgram(userProgramId);
    
    // Get program details to check duration
    const program = await this.db
      .selectFrom('workoutPrograms')
      .select(['durationType', 'durationWeeks'])
      .where('id', '=', userProgram.programId)
      .executeTakeFirstOrThrow();

    const nextWeek = userProgram.currentWeek + 1;

    // Check if program is complete
    if (program.durationType === 'fixed' && program.durationWeeks && nextWeek > program.durationWeeks) {
      return await this.completeUserProgram(userProgramId);
    }

    // Find the phase for the next week
    const nextPhase = await this.db
      .selectFrom('programPhases')
      .select('id')
      .where('programId', '=', userProgram.programId)
      .where('startWeek', '<=', nextWeek)
      .where('endWeek', '>=', nextWeek)
      .executeTakeFirst();

    return await this.updateUserProgram(userProgramId, {
      currentWeek: nextWeek,
      currentPhaseId: nextPhase?.id || userProgram.currentPhaseId || undefined,
    });
  }

  async pauseUserProgram(id: string) {
    return await this.updateUserProgram(id, { status: 'paused' });
  }

  async resumeUserProgram(id: string) {
    return await this.updateUserProgram(id, { status: 'active' });
  }

  async completeUserProgram(id: string) {
    return await this.updateUserProgram(id, { 
      status: 'completed',
      completedAt: new Date()
    });
  }

  async abandonUserProgram(id: string) {
    return await this.updateUserProgram(id, { 
      status: 'abandoned',
      completedAt: new Date()
    });
  }

  async addAdaptation(userProgramId: string, adaptationType: string, adaptationData: Record<string, unknown>) {
    const userProgram = await this.getUserProgram(userProgramId);
    const adaptations = userProgram.adaptations || {};
    
    if (!adaptations[adaptationType]) {
      adaptations[adaptationType] = [];
    }
    
    adaptations[adaptationType].push({
      ...adaptationData,
      appliedAt: new Date().toISOString(),
    });

    return await this.updateUserProgram(userProgramId, { adaptations });
  }

  async getUserProgramProgress(userProgramId: string): Promise<UserProgramProgress> {
    const userProgram = await this.getUserProgram(userProgramId);
    
    // Count completed workouts
    const completedWorkouts = await this.db
      .selectFrom('workouts')
      .select(this.db.fn.count('id').as('count'))
      .where('userProgramId', '=', userProgramId)
      .where('sentAt', 'is not', null)
      .executeTakeFirstOrThrow();

    // Calculate expected workouts
    const currentWeekSessions = await this.db
      .selectFrom('programWeeks')
      .innerJoin('programSessions', 'programSessions.weekId', 'programWeeks.id')
      .select(this.db.fn.count('programSessions.id').as('count'))
      .where('programWeeks.programId', '=', userProgram.programId)
      .where('programWeeks.weekNumber', '=', userProgram.currentWeek)
      .executeTakeFirstOrThrow();

    const pastWeeksSessions = await this.db
      .selectFrom('programWeeks')
      .innerJoin('programSessions', 'programSessions.weekId', 'programWeeks.id')
      .select(this.db.fn.count('programSessions.id').as('count'))
      .where('programWeeks.programId', '=', userProgram.programId)
      .where('programWeeks.weekNumber', '<', userProgram.currentWeek)
      .executeTakeFirstOrThrow();

    const completedCount = Number(completedWorkouts.count);
    const totalExpected = Number(pastWeeksSessions.count) + Math.ceil(Number(currentWeekSessions.count) / 2); // Assume halfway through current week
    const adherenceRate = totalExpected > 0 ? (completedCount / totalExpected) * 100 : 0;

    return {
      userId: userProgram.userId,
      programId: userProgram.programId,
      currentWeek: userProgram.currentWeek,
      currentPhaseId: userProgram.currentPhaseId,
      completedWorkouts: completedCount,
      totalWorkouts: totalExpected,
      adherenceRate: Math.round(adherenceRate),
      isOnTrack: adherenceRate >= 80, // Consider on track if 80% or more adherence
    };
  }
}