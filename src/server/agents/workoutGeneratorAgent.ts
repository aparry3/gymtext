import { getUserWithProfile } from '../db/postgres/users';
import { WorkoutOrchestrator } from './orchestrator';
import { twilioClient } from '../clients/twilio';

interface DailyWorkout {
  sessionId: string;
  programId: string;
  weekNumber: number;
  dayOfWeek: number;
  workout: string;
  equipment: string[];
}

export async function generateDailyWorkout(userId: string): Promise<DailyWorkout> {
  const user = await getUserWithProfile(userId);
  if (!user) throw new Error('User not found');

  // TODO: Get user's active program from database
  const activeProgram = await getActiveProgram(userId);
  if (!activeProgram) {
    throw new Error('No active program found. Please generate a program first.');
  }

  const orchestrator = new WorkoutOrchestrator();
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Generate today's workout session
  const result = await orchestrator.orchestrate({
    userId,
    mode: 'session_generation',
    programId: activeProgram.id,
    weekNumber: activeProgram.currentWeek,
    dayOfWeek
  });

  if (!result.success || !result.data?.session) {
    throw new Error(result.error || 'Failed to generate workout session');
  }

  // Format workout for SMS delivery
  const formattedWorkout = formatWorkoutForSMS(result.data.session);

  // Send via SMS
  await twilioClient.sendSMS(user.phone_number, formattedWorkout);

  return {
    sessionId: result.data.session.id || 'temp-id',
    programId: activeProgram.id,
    weekNumber: activeProgram.currentWeek,
    dayOfWeek,
    workout: formattedWorkout,
    equipment: result.data.session.equipmentNeeded
  };
}

interface WorkoutSession {
  id?: string;
  name: string;
  description: string;
  warmup: {
    exercises: Array<{
      name: string;
      duration: string;
    }>;
  };
  mainWorkout: {
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: number;
      notes?: string;
    }>;
  };
  cooldown: {
    exercises: Array<{
      name: string;
      duration: string;
    }>;
  };
  equipmentNeeded: string[];
}

function formatWorkoutForSMS(session: WorkoutSession): string {
  let message = `${session.name}\n${session.description}\n\n`;
  
  // Warmup
  message += "WARMUP:\n";
  session.warmup.exercises.forEach((ex) => {
    message += `- ${ex.name}: ${ex.duration}\n`;
  });
  
  // Main workout
  message += "\nWORKOUT:\n";
  session.mainWorkout.exercises.forEach((ex, idx) => {
    message += `${idx + 1}. ${ex.name}\n`;
    message += `   ${ex.sets}x${ex.reps} | Rest: ${ex.rest}s\n`;
    if (ex.notes) message += `   Note: ${ex.notes}\n`;
  });
  
  // Cooldown
  message += "\nCOOLDOWN:\n";
  session.cooldown.exercises.forEach((ex) => {
    message += `- ${ex.name}: ${ex.duration}\n`;
  });
  
  return message;
}

interface ActiveProgram {
  id: string;
  currentWeek: number;
  currentPhase: string;
}

// Placeholder function - will be implemented with database integration
async function getActiveProgram(_userId: string): Promise<ActiveProgram> {
  // TODO: Query database for user's active program
  return {
    id: 'program-123',
    currentWeek: 1,
    currentPhase: 'strength'
  };
}