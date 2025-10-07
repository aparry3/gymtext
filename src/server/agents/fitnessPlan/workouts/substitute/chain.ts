import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, UpdatedWorkoutInstance } from '@/server/models/workout';
import { _UpdatedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { substituteExercisesPrompt, type Modification, WORKOUT_SUBSTITUTE_SYSTEM_PROMPT } from './prompts';
import { initializeModel } from '@/server/agents/base';

export type { Modification };

export interface SubstituteExercisesContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  modifications: Modification[];
}

export const substituteExercises = async (context: SubstituteExercisesContext): Promise<UpdatedWorkoutInstance> => {
  const { 
    workout, 
    user,
    modifications,
  } = context;

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Generate prompt
  const prompt = substituteExercisesPrompt(
    fitnessProfile,
    modifications,
    workout
  );

  // Use structured output for the updated workout schema
  const structuredModel = initializeModel(_UpdatedWorkoutInstanceSchema);

  // Retry mechanism for transient errors
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting to substitute exercises (attempt ${attempt + 1}/${maxRetries})`);

      // Generate the workout
      const updatedWorkout = await structuredModel.invoke([WORKOUT_SUBSTITUTE_SYSTEM_PROMPT, prompt]) as UpdatedWorkoutInstance;

      // Ensure we have a valid response
      if (!updatedWorkout) {
        throw new Error('AI returned null/undefined workout');
      }

      // Validate the workout structure
      const validatedWorkout = _UpdatedWorkoutInstanceSchema.parse(updatedWorkout);


      // Additional validation
      if (!validatedWorkout.blocks || validatedWorkout.blocks.length === 0) {
        throw new Error('Workout has no blocks');
      }

      // Combine validated workout with date from original workout
      const validatedWorkoutWithDate: UpdatedWorkoutInstance = {
        ...validatedWorkout,
        date: workout.date
      };

      console.log(`Successfully substituted exercises with ${validatedWorkout.blocks.length} blocks and ${validatedWorkout.modificationsApplied?.length || 0} modifications`);

      return validatedWorkoutWithDate;
    } catch (error) {
      console.error(`Error substituting exercises (attempt ${attempt + 1}):`, error);
      
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

  throw new Error('Failed to substitute exercises after all attempts');
}