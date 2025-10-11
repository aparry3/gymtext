import { UserWithProfile } from '@/server/models/userModel';
import { MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview } from '@/server/models/fitnessPlan';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';

export const dailyWorkoutPrompt = (
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
You are an elite personal fitness coach creating todays detailed workout.

<Goal>
Generate a comprehensive workout for ${user.name} that matches todays training theme and intensity.
The workout must be structured with blocks and include specific exercise details.
</Goal>

<Context>
- Program type: ${programType}
- Current mesocycle: ${mesocycle.name} (week ${microcycle.weekIndex} of ${mesocycle.weeks})
- Mesocycle focus: ${mesocycle.focus.join(', ')}
- Todays theme: ${dayPlan.theme}
- Load level: ${dayPlan.load || 'moderate'}
${dayPlan.notes ? `- Special notes: ${dayPlan.notes}` : ''}
${mesocycle.deload && microcycle.weekIndex === mesocycle.weeks ? '- This is a DELOAD week - reduce volume and intensity' : ''}
</Context>

<Recent Training History>
${recentWorkouts && recentWorkouts.length > 0 ? formatRecentWorkouts(recentWorkouts, user.timezone) : 'No recent workouts available'}
</Recent Training History>

<Requirements>
1. Structure the workout with clear blocks:
   - Warm-up block (5-10 minutes)
   - Main work block(s) (core training)
   - Accessory/supplemental block (if applicable)
   - Cool-down block (5-10 minutes)

2. For each exercise, specify:
   - Type (prep, compound, secondary, accessory, core, cardio, cooldown)
   - Exercise name (be specific)
   - Sets and reps (or duration for cardio/conditioning)
   - Rest periods between sets
   - RPE (Rate of Perceived Exertion, 1-10 scale)
   - Any specific notes or cues

3. Progressive overload:
   - Week 1: Introduction (moderate load)
   - Week 2-3: Progressive increase
   - Deload week: Reduce volume by 40-50%

4. Include modifications for common issues:
   - Lower back sensitivity
   - Knee issues
   - Shoulder limitations

5. Match the theme exactly:
   - Upper Push: Chest, shoulders, triceps
   - Upper Pull: Back, biceps
   - Lower Power: Explosive lower body
   - Lower Volume: High-rep lower body
   - Full Body: Balanced total body
   - HIIT: High-intensity intervals
   - Cardio: Steady-state or interval cardio
   - Rest: Active recovery only

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

<Output Format>
Return a JSON object matching the EnhancedWorkoutInstance schema:
{
  "theme": "workout theme",
  "blocks": [
    {
      "name": "Block name",
      "items": [
        {
          "type": "exercise type",
          "exercise": "Exercise name",
          "sets": number,
          "reps": "number or range",
          "rest": "rest period",
          "RPE": number,
          "notes": "optional notes"
        }
      ]
    }
  ],
  "modifications": [
    {
      "condition": "condition string",
      "replace": {
        "exercise": "original",
        "with": "replacement"
      },
      "note": "explanation"
    }
  ],
  "targetMetrics": {
    "totalVolume": number,
    "averageIntensity": number
  },
  "notes": "workout notes"
}
</Output>

Generate the workout now.
`;

function formatRecentWorkouts(workouts: WorkoutInstance[], timezone: string): string {
  if (!workouts || workouts.length === 0) {
    return 'No recent workouts';
  }

  return workouts
    .slice(0, 3) // Last 3 workouts
    .map(w => {
      const dateInUserTz = DateTime.fromJSDate(new Date(w.date)).setZone(timezone);
      const date = dateInUserTz.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });
      const sessionType = w.sessionType;
      const goal = w.goal || 'No specific goal';
      return `- ${date}: ${sessionType} (${goal})`;
    })
    .join('\n');
}