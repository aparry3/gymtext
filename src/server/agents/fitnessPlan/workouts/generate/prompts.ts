import { UserWithProfile } from '@/server/models/userModel';
import { MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview } from '@/server/models/fitnessPlan';
import { WorkoutInstance } from '@/server/models/workout';
import { LongFormWorkout } from '@/server/models/workout/schema';
import {
  OUTPUT_FORMAT_SECTION,
  STRUCTURE_DECISION_GUIDANCE,
  buildDescriptionGuidelines,
  buildReasoningGuidelines,
  WORKOUT_EXAMPLES,
} from '../shared/promptComponents';
import {
  formatRecentWorkouts,
  createStructuredPrompt,
  createMessagePrompt,
} from '../shared/promptHelpers';

// Step 1: Generate long-form workout description and reasoning
export const longFormPrompt = (
  user: UserWithProfile,
  fitnessProfile: string,
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  },
  microcycle: MicrocyclePattern,
  mesocycle: MesocycleOverview,
  programType: string,
  recentWorkouts?: WorkoutInstance[]
) => `
You are an elite personal fitness coach creating today's workout for ${user.name}.

<Task>
Design a contextually appropriate workout using critical thinking and evidence-based programming.
Create two components:
1. A detailed workout description with all exercises, sets, reps, and structure
2. A thorough coaching rationale explaining all decisions

${STRUCTURE_DECISION_GUIDANCE}
</Task>

<Context>
- Program type: ${programType}
- Current mesocycle: ${mesocycle.name} (week ${microcycle.weekIndex} of ${mesocycle.weeks})
- Mesocycle focus: ${mesocycle.focus.join(', ')}
- Today's theme: ${dayPlan.theme}
- Load level: ${dayPlan.load || 'moderate'}
${dayPlan.notes ? `- Special notes: ${dayPlan.notes}` : ''}
${mesocycle.deload && microcycle.weekIndex === mesocycle.weeks ? '- This is a DELOAD week - reduce volume and intensity' : ''}
</Context>

<Recent Training History>
${recentWorkouts && recentWorkouts.length > 0 ? formatRecentWorkouts(recentWorkouts, user.timezone) : 'No recent workouts available'}
</Recent Training History>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

${OUTPUT_FORMAT_SECTION}

${buildDescriptionGuidelines("600-900")}

${buildReasoningGuidelines("600-900", false)}

${WORKOUT_EXAMPLES}

Now create the comprehensive workout and reasoning for ${user.name}.
`.trim();

// Step 2a: Convert long-form description to structured JSON workout
export const structuredPrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => createStructuredPrompt(longFormWorkout, user, fitnessProfile, false);

// Step 2b: Convert long-form description to SMS message
export const messagePrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => createMessagePrompt(longFormWorkout, user, fitnessProfile, 'standard');
