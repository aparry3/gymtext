import { MicrocyclePattern, UpdatedMicrocyclePattern } from '@/server/models/microcycle';
import { _UpdatedMicrocyclePatternSchema } from '@/server/models/microcycle/schema';
import { Mesocycle } from '@/server/models/fitnessPlan';
import { updateMicrocyclePatternPrompt, type MicrocycleUpdateParams, MICROCYCLE_UPDATE_SYSTEM_PROMPT } from './prompt';
import { initializeModel } from '@/server/agents/base';

export type { MicrocycleUpdateParams };

export interface MicrocycleUpdateContext {
  currentPattern: MicrocyclePattern;
  params: MicrocycleUpdateParams;
  mesocycle: Mesocycle;
  programType: string;
}

export const updateMicrocyclePattern = async (context: MicrocycleUpdateContext): Promise<UpdatedMicrocyclePattern> => {
  const {
    currentPattern,
    params,
    mesocycle,
    programType,
  } = context;

  // Generate prompt
  const prompt = updateMicrocyclePatternPrompt(
    currentPattern,
    params,
    mesocycle,
    programType
  );

  // Use structured output for the updated microcycle pattern schema
  const structuredModel = initializeModel(_UpdatedMicrocyclePatternSchema);

  // Retry mechanism for transient errors
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting to update microcycle pattern (attempt ${attempt + 1}/${maxRetries})`);

      // Generate the pattern
      const updatedPattern = await structuredModel.invoke([MICROCYCLE_UPDATE_SYSTEM_PROMPT, prompt]) as UpdatedMicrocyclePattern;

      // Ensure we have a valid response
      if (!updatedPattern) {
        throw new Error('AI returned null/undefined microcycle pattern');
      }

      // Validate the pattern structure
      const validatedPattern = _UpdatedMicrocyclePatternSchema.parse(updatedPattern);

      // Additional validation
      if (!validatedPattern.days || validatedPattern.days.length !== 7) {
        throw new Error('Microcycle pattern must have exactly 7 days');
      }

      // Convert null values to undefined for TypeScript compatibility
      const cleanedPattern: UpdatedMicrocyclePattern = {
        ...validatedPattern,
        days: validatedPattern.days.map(day => ({
          ...day,
          load: day.load ?? undefined,
          notes: day.notes ?? undefined,
        })),
      };

      console.log(`Successfully updated microcycle pattern with ${cleanedPattern.modificationsApplied?.length || 0} modifications`);

      return cleanedPattern;
    } catch (error) {
      console.error(`Error updating microcycle pattern (attempt ${attempt + 1}):`, error);

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

  throw new Error('Failed to update microcycle pattern after all attempts');
}
