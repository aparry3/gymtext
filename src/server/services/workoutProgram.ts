import { Kysely } from 'kysely';
import { Database } from '@/shared/types/generated-schema';
import { 
  WorkoutProgramRepository, 
  CreateWorkoutProgramParams, 
  UpdateWorkoutProgramParams 
} from '../repositories/workoutProgram.repository';

export class WorkoutProgramService {
  private repository: WorkoutProgramRepository;

  constructor(db: Kysely<Database>) {
    this.repository = new WorkoutProgramRepository(db);
  }

  async createProgram(params: CreateWorkoutProgramParams) {
    // Validate input
    if (!params.userId || !params.name) {
      throw new Error('User ID and program name are required');
    }

    if (params.durationType === 'fixed' && !params.durationWeeks) {
      throw new Error('Duration weeks is required for fixed programs');
    }

    // Calculate end date for fixed programs
    if (params.durationType === 'fixed' && params.durationWeeks && !params.endDate) {
      const startDate = params.startDate || new Date();
      params.endDate = new Date(startDate);
      params.endDate.setDate(params.endDate.getDate() + (params.durationWeeks * 7));
    }

    return await this.repository.create(params);
  }

  async getProgram(id: string) {
    const program = await this.repository.findById(id);
    if (!program) {
      throw new Error('Program not found');
    }
    return program;
  }

  async getUserPrograms(userId: string, status?: string) {
    return await this.repository.findByUserId(userId, status);
  }

  async updateProgram(id: string, params: UpdateWorkoutProgramParams) {
    const program = await this.repository.update(id, params);
    if (!program) {
      throw new Error('Program not found');
    }
    return program;
  }

  async deleteProgram(id: string) {
    const program = await this.repository.delete(id);
    if (!program) {
      throw new Error('Program not found');
    }
    return program;
  }

  async completeProgram(id: string) {
    return await this.updateProgram(id, { status: 'completed' });
  }

  async pauseProgram(id: string) {
    return await this.updateProgram(id, { status: 'paused' });
  }

  async resumeProgram(id: string) {
    return await this.updateProgram(id, { status: 'active' });
  }
}