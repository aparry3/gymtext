import { Microcycle } from '@/server/models/microcycle';
import { Mesocycle } from '@/server/models/fitnessPlan';
import { updateMicrocyclePrompt, type MicrocycleUpdateParams, MICROCYCLE_UPDATE_SYSTEM_PROMPT } from './prompt';
import { initializeModel } from '@/server/agents/base';
import { z } from 'zod';

export type { MicrocycleUpdateParams };

export interface MicrocycleUpdateContext {
  currentMicrocycle: Microcycle;
  params: MicrocycleUpdateParams;
  mesocycle: Mesocycle;
  programType: string;
}

// Schema for updated microcycle with day overviews and modification tracking
const UpdatedMicrocycleDayOverviewsSchema = z.object({
  mondayOverview: z.string().describe('Updated overview for Monday'),
  tuesdayOverview: z.string().describe('Updated overview for Tuesday'),
  wednesdayOverview: z.string().describe('Updated overview for Wednesday'),
  thursdayOverview: z.string().describe('Updated overview for Thursday'),
  fridayOverview: z.string().describe('Updated overview for Friday'),
  saturdayOverview: z.string().describe('Updated overview for Saturday'),
  sundayOverview: z.string().describe('Updated overview for Sunday'),
  modificationsApplied: z.array(z.string()).describe('List of specific changes made to the weekly pattern')
});

export type UpdatedMicrocycleDayOverviews = z.infer<typeof UpdatedMicrocycleDayOverviewsSchema>;

export const updateMicrocyclePattern = async (context: MicrocycleUpdateContext): Promise<UpdatedMicrocycleDayOverviews> => {
  const {
    currentMicrocycle,
    params,
    mesocycle,
    programType,
  } = context;

  // Generate prompt
  const prompt = updateMicrocyclePrompt(
    currentMicrocycle,
    params,
    mesocycle,
    programType
  );

  // Use structured output for the updated microcycle day overviews schema
  const structuredModel = initializeModel(UpdatedMicrocycleDayOverviewsSchema);

  // Retry mechanism for transient errors
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting to update microcycle (attempt ${attempt + 1}/${maxRetries})`);

      // Generate the updated day overviews
      const updatedDayOverviews = await structuredModel.invoke([
        { role: 'system', content: MICROCYCLE_UPDATE_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]) as UpdatedMicrocycleDayOverviews;

      // Ensure we have a valid response
      if (!updatedDayOverviews) {
        throw new Error('AI returned null/undefined microcycle day overviews');
      }

      // Validate the structure
      const validatedOverviews = UpdatedMicrocycleDayOverviewsSchema.parse(updatedDayOverviews);

      console.log(`Successfully updated microcycle with ${validatedOverviews.modificationsApplied?.length || 0} modifications`);

      return validatedOverviews;
    } catch (error) {
      console.error(`Error updating microcycle (attempt ${attempt + 1}):`, error);

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

  throw new Error('Failed to update microcycle after all attempts');
}
