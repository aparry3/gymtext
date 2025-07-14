import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';
import { UserProgramRepository, CreateUserProgramParams, UpdateUserProgramParams, UserProgramProgress } from '../repositories/userProgram.repository';

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