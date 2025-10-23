import {
  OUTPUT_FORMAT_SECTION,
  STRUCTURE_DECISION_GUIDANCE,
  buildDescriptionGuidelines,
  buildReasoningGuidelines,
  WORKOUT_EXAMPLES,
} from '../shared/promptComponents';
import { formatRecentWorkouts } from '../shared/promptHelpers';
import { DailyWorkoutInput } from './types';

// System prompt - static instructions and guidelines
export const SYSTEM_PROMPT = `
You are an elite personal fitness coach creating today's workout.

<Task>
Design a contextually appropriate workout using critical thinking and evidence-based programming.
Create two components:
1. A detailed workout description with all exercises, sets, reps, and structure
2. A thorough coaching rationale explaining all decisions

${STRUCTURE_DECISION_GUIDANCE}
</Task>

${OUTPUT_FORMAT_SECTION}

${buildDescriptionGuidelines("600-900")}

${buildReasoningGuidelines("600-900", false)}

${WORKOUT_EXAMPLES}
`.trim();

// User prompt - dynamic context and user-specific data
export const userPrompt = (
  input: DailyWorkoutInput
) => (fitnessProfile: string) => `
User: ${input.user.name}

Program Details:
- Program type: ${input.fitnessPlan.programType}
- Current mesocycle: ${input.mesocycle.name} (week ${input.microcycle.pattern.weekIndex} of ${input.mesocycle.weeks})
- Mesocycle focus: ${input.mesocycle.focus.join(', ')}
- Today's theme: ${input.dayPlan.theme}
- Load level: ${input.dayPlan.load || 'moderate'}
${input.dayPlan.notes ? `- Special notes: ${input.dayPlan.notes}` : ''}
${input.mesocycle.deload && input.microcycle.pattern.weekIndex === input.mesocycle.weeks ? '- This is a DELOAD week - reduce volume and intensity' : ''}

Recent Training History:
${input.recentWorkouts && input.recentWorkouts.length > 0 ? formatRecentWorkouts(input.recentWorkouts, input.user.timezone) : 'No recent workouts available'}

Fitness Profile:
${fitnessProfile}

Now create the comprehensive workout and reasoning for ${input.user.name}.
`.trim();
