import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { BaseRepository } from '../repositories/base.repository';

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
      .selectFrom('program_phases')
      .select('id')
      .where('program_id', '=', params.programId)
      .where('phase_number', '=', 1)
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
      .selectFrom('workout_programs')
      .select(['duration_type', 'duration_weeks'])
      .where('id', '=', userProgram.programId)
      .executeTakeFirstOrThrow();

    const nextWeek = userProgram.currentWeek + 1;

    // Check if program is complete
    if (program.duration_type === 'fixed' && program.duration_weeks && nextWeek > program.duration_weeks) {
      return await this.completeUserProgram(userProgramId);
    }

    // Find the phase for the next week
    const nextPhase = await this.db
      .selectFrom('program_phases')
      .select('id')
      .where('program_id', '=', userProgram.programId)
      .where('start_week', '<=', nextWeek)
      .where('end_week', '>=', nextWeek)
      .executeTakeFirst();

    return await this.updateUserProgram(userProgramId, {
      currentWeek: nextWeek,
      currentPhaseId: nextPhase?.id || userProgram.currentPhaseId,
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

  async addAdaptation(userProgramId: string, adaptationType: string, adaptationData: any) {
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
      .where('user_program_id', '=', userProgramId)
      .where('sent_at', 'is not', null)
      .executeTakeFirstOrThrow();

    // Calculate expected workouts
    const weeksCompleted = userProgram.currentWeek - 1;
    const currentWeekSessions = await this.db
      .selectFrom('program_weeks')
      .innerJoin('program_sessions', 'program_sessions.week_id', 'program_weeks.id')
      .select(this.db.fn.count('program_sessions.id').as('count'))
      .where('program_weeks.program_id', '=', userProgram.programId)
      .where('program_weeks.week_number', '=', userProgram.currentWeek)
      .executeTakeFirstOrThrow();

    const pastWeeksSessions = await this.db
      .selectFrom('program_weeks')
      .innerJoin('program_sessions', 'program_sessions.week_id', 'program_weeks.id')
      .select(this.db.fn.count('program_sessions.id').as('count'))
      .where('program_weeks.program_id', '=', userProgram.programId)
      .where('program_weeks.week_number', '<', userProgram.currentWeek)
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