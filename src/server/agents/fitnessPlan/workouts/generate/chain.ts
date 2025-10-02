import { UserWithProfile } from '@/server/models/userModel';
import { Microcycle } from '@/server/models/microcycle';
import { MesocycleOverview, FitnessPlan } from '@/server/models/fitnessPlan';
import { WorkoutInstance, EnhancedWorkoutInstance } from '@/server/models/workout';
import { _EnhancedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { dailyWorkoutPrompt } from './prompts';
import { initializeModel } from '@/server/agents/base';


export interface DailyWorkoutContext {
  user: UserWithProfile;
  date: Date;
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  };
  microcycle: Microcycle;
  mesocycle: MesocycleOverview;
  fitnessPlan: FitnessPlan;
  recentWorkouts?: WorkoutInstance[];
}

export const generateDailyWorkout = async (context: DailyWorkoutContext): Promise<EnhancedWorkoutInstance> => {
  const { 
    user, 
    date, 
    dayPlan, 
    microcycle, 
    mesocycle, 
    fitnessPlan, 
    recentWorkouts 
  } = context;

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Generate prompt
  const prompt = dailyWorkoutPrompt(
    user,
    fitnessProfile,
    dayPlan,
    microcycle.pattern,
    mesocycle,
    fitnessPlan.programType,
    recentWorkouts
  );

  // Use structured output for the enhanced workout schema
  const structuredModel = initializeModel(_EnhancedWorkoutInstanceSchema, {
  });

  // Retry mechanism for transient errors
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting to generate workout (attempt ${attempt + 1}/${maxRetries})`);
      
      // Generate the workout
      const workout = await structuredModel.invoke(prompt) as EnhancedWorkoutInstance;
      
      // Ensure we have a valid response
      if (!workout) {
        throw new Error('AI returned null/undefined workout');
      }

      // Validate the workout structure
      const validatedWorkout = _EnhancedWorkoutInstanceSchema.parse(workout);
      
      
      // Additional validation
      if (!validatedWorkout.blocks || validatedWorkout.blocks.length === 0) {
        throw new Error('Workout has no blocks');
      }
      
      // Convert date string to Date object if needed
      const validatedWorkoutWithDate = {
        ...workout,
        date: new Date()
      };
      
      console.log(`Successfully generated workout with ${validatedWorkout.blocks.length} blocks`);
      
      // Ensure date is set correctly
      return validatedWorkoutWithDate as EnhancedWorkoutInstance;
    } catch (error) {
      console.error(`Error generating workout with AI (attempt ${attempt + 1}):`, error);
      
      // Log more details about the error for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack?.substring(0, 500),
          name: error.name,
          attempt: attempt + 1
        });
      }

      // If it's the last attempt, break out of the loop
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
    }
  }

  throw new Error('Failed to generate workout after all attempts');
}