import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MesocycleOverview } from '@/server/models/fitnessPlan';
import { MicrocyclePattern } from '@/server/models/microcycle';
import { _MicrocyclePatternSchema } from '@/server/models/microcycle/schema';
import { microcyclePatternPrompt } from './prompts';

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.3, 
  model: "gemini-2.5-flash" 
});

export interface MicrocyclePatternContext {
  mesocycle: MesocycleOverview;
  weekNumber: number;
  programType: string;
  notes?: string | null;
}

export const generateMicrocyclePattern = async (context: {mesocycle: MesocycleOverview, weekNumber: number, programType: string, notes?: string | null}): Promise<MicrocyclePattern> => {
  const { mesocycle, weekNumber, programType, notes } = context;
  const prompt = microcyclePatternPrompt(
    mesocycle,
    weekNumber,
    programType,
    notes
  );
  
  const structuredModel = llm.withStructuredOutput(_MicrocyclePatternSchema);
  
  try {
    const result = await structuredModel.invoke(prompt);
    return result as MicrocyclePattern;
  } catch (error) {
    console.error('Error generating microcycle pattern:', error);
    // Return a basic fallback pattern if generation fails
    return generateFallbackPattern(weekNumber, programType, mesocycle);
  }
};

function generateFallbackPattern(
  weekNumber: number,
  programType: string,
  mesocycle: MesocycleOverview
): MicrocyclePattern {
  const isDeloadWeek = mesocycle.deload && weekNumber === mesocycle.weeks;
  const load = isDeloadWeek ? 'light' : 'moderate';
  const weekIndex = weekNumber - 1; // Convert 1-based weekNumber to 0-based weekIndex

  const patterns: Record<string, MicrocyclePattern> = {
    strength: {
      weekIndex,
      days: [
        { day: 'MONDAY', theme: 'Lower Body', load },
        { day: 'TUESDAY', theme: 'Upper Push', load },
        { day: 'WEDNESDAY', theme: 'Rest' },
        { day: 'THURSDAY', theme: 'Lower Body', load },
        { day: 'FRIDAY', theme: 'Upper Pull', load },
        { day: 'SATURDAY', theme: 'Active Recovery', load: 'light' },
        { day: 'SUNDAY', theme: 'Rest' },
      ],
    },
    endurance: {
      weekIndex,
      days: [
        { day: 'MONDAY', theme: 'Easy Run', load: 'light' },
        { day: 'TUESDAY', theme: 'Interval Training', load },
        { day: 'WEDNESDAY', theme: 'Recovery', load: 'light' },
        { day: 'THURSDAY', theme: 'Tempo Run', load },
        { day: 'FRIDAY', theme: 'Rest' },
        { day: 'SATURDAY', theme: 'Long Run', load },
        { day: 'SUNDAY', theme: 'Recovery', load: 'light' },
      ],
    },
    hybrid: {
      weekIndex,
      days: [
        { day: 'MONDAY', theme: 'Strength Training', load },
        { day: 'TUESDAY', theme: 'Cardio', load },
        { day: 'WEDNESDAY', theme: 'Active Recovery', load: 'light' },
        { day: 'THURSDAY', theme: 'Strength Training', load },
        { day: 'FRIDAY', theme: 'HIIT', load },
        { day: 'SATURDAY', theme: 'Long Cardio', load: 'light' },
        { day: 'SUNDAY', theme: 'Rest' },
      ],
    },
  };

  // Default pattern if program type not found
  const defaultPattern: MicrocyclePattern = {
    weekIndex,
    days: [
      { day: 'MONDAY', theme: 'Training Day 1', load },
      { day: 'TUESDAY', theme: 'Training Day 2', load },
      { day: 'WEDNESDAY', theme: 'Rest' },
      { day: 'THURSDAY', theme: 'Training Day 3', load },
      { day: 'FRIDAY', theme: 'Training Day 4', load },
      { day: 'SATURDAY', theme: 'Active Recovery', load: 'light' },
      { day: 'SUNDAY', theme: 'Rest' },
    ],
  };

  return patterns[programType] || defaultPattern;
}