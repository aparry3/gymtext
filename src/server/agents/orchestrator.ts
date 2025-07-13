import { ProgramDesignerAgent } from './program-designer';
import { SessionBuilderAgent } from './session-builder';
import { getUserWithProfile } from '../db/postgres/users';
import { FitnessProfile } from '@/shared/types';

interface OrchestrationContext {
  userId: string;
  mode: 'program_generation' | 'session_generation' | 'adapt_program';
  programId?: string;
  weekNumber?: number;
  dayOfWeek?: number;
  phaseId?: string;
  adaptationRequest?: string;
  userFeedback?: string;
}

interface OrchestrationResult {
  success: boolean;
  data?: {
    program?: Record<string, unknown>;
    session?: Record<string, unknown>;
    programId?: string;
    weekNumber?: number;
    dayOfWeek?: number;
    userId?: string;
  };
  error?: string;
}

export class WorkoutOrchestrator {
  private programDesigner: ProgramDesignerAgent;
  private sessionBuilder: SessionBuilderAgent;

  constructor() {
    this.programDesigner = new ProgramDesignerAgent();
    this.sessionBuilder = new SessionBuilderAgent();
  }

  async orchestrate(context: OrchestrationContext): Promise<OrchestrationResult> {
    try {
      switch (context.mode) {
        case 'program_generation':
          return await this.generateProgram(context.userId);
        
        case 'session_generation':
          return await this.generateSession(context);
        
        case 'adapt_program':
          return await this.adaptProgram(context);
        
        default:
          throw new Error(`Unknown orchestration mode: ${context.mode}`);
      }
    } catch (error) {
      console.error('Orchestration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async generateProgram(userId: string): Promise<OrchestrationResult> {
    // Get user profile
    const user = await getUserWithProfile(userId);
    if (!user || !user.fitness_profile) {
      return {
        success: false,
        error: 'User or fitness profile not found'
      };
    }

    // Convert database profile to agent-compatible format
    const fitnessProfile: FitnessProfile = {
      userId: user.id,
      goals: user.fitness_profile.goals as string[],
      skillLevel: user.fitness_profile.skill_level as 'beginner' | 'intermediate' | 'advanced',
      equipment: user.fitness_profile.equipment as string[],
      availability: {
        daysPerWeek: user.fitness_profile.days_per_week || 3,
        minutesPerSession: user.fitness_profile.minutes_per_session || 45
      },
      injuries: user.fitness_profile.injuries
    };

    // Generate program structure
    const programStructure = await this.programDesigner.designProgram(fitnessProfile);

    // Store program structure for future reference
    // This will be implemented when we have the database service

    return {
      success: true,
      data: {
        program: programStructure,
        userId: userId
      }
    };
  }

  private async generateSession(context: OrchestrationContext): Promise<OrchestrationResult> {
    if (!context.programId || context.weekNumber === undefined || context.dayOfWeek === undefined) {
      return {
        success: false,
        error: 'Missing required context for session generation'
      };
    }

    // Get user and program information
    const user = await getUserWithProfile(context.userId);
    if (!user || !user.fitness_profile) {
      return {
        success: false,
        error: 'User or fitness profile not found'
      };
    }

    // TODO: Fetch program and phase details from database
    // This will include the current phase type, session focus, etc.
    const sessionContext = {
      phaseType: 'strength' as const, // Will come from program phase
      weekNumber: context.weekNumber,
      dayOfWeek: context.dayOfWeek,
      sessionFocus: 'Upper Body Push', // Will come from program week structure
      availableEquipment: user.fitness_profile.equipment as string[],
      timeConstraint: user.fitness_profile.minutes_per_session || 45,
      userSkillLevel: user.fitness_profile.skill_level as 'beginner' | 'intermediate' | 'advanced',
      injuries: user.fitness_profile.injuries
    };

    // Generate session
    const session = await this.sessionBuilder.buildSession(sessionContext);

    // TODO: Store generated session in database

    return {
      success: true,
      data: {
        session,
        programId: context.programId,
        weekNumber: context.weekNumber,
        dayOfWeek: context.dayOfWeek
      }
    };
  }

  private async adaptProgram(context: OrchestrationContext): Promise<OrchestrationResult> {
    if (!context.programId || !context.adaptationRequest) {
      return {
        success: false,
        error: 'Missing required context for program adaptation'
      };
    }

    const user = await getUserWithProfile(context.userId);
    if (!user || !user.fitness_profile) {
      return {
        success: false,
        error: 'User or fitness profile not found'
      };
    }

    try {
      // TODO: Fetch current program from database
      // For now, we'll create a mock current program
      const mockCurrentProgram = {
        name: "Current Program",
        description: "User's active program",
        programType: 'strength' as const,
        durationType: 'fixed' as const,
        durationWeeks: 12,
        phases: [],
        goals: { primary: "strength" },
        equipmentRequired: user.fitness_profile.equipment as string[],
        weeklyStructure: {
          daysPerWeek: 4,
          sessionTypes: []
        }
      };

      // Adapt the program using the AI agent
      const adaptedProgram = await this.programDesigner.adaptProgram(
        mockCurrentProgram,
        context.adaptationRequest,
        context.userFeedback
      );

      // TODO: Update program in database

      return {
        success: true,
        data: {
          program: adaptedProgram,
          programId: context.programId
        }
      };
    } catch (error) {
      console.error('Error adapting program:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to adapt program'
      };
    }
  }
}