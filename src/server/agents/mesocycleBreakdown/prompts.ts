import { WeeklyTarget } from "../../models/_types";
import { formatDate } from "@/shared/utils";

export const mesocycleBreakdownPrompt = (
  weeklyTarget: WeeklyTarget,
  startDate: Date,
  weekNumber: number
) => `
You are an expert workout programmer specializing in periodization and exercise science.

<Goal>
Create a detailed weekly workout schedule based on the provided weekly target and training split.
</Goal>

<Weekly Target Information>
- Week Number: ${weekNumber}
- Focus: ${weeklyTarget.focus}
- Training Split: ${weeklyTarget.split}
- Start Date: ${formatDate(startDate)}
- Targets: ${weeklyTarget.targets.map(t => `${t.key}: ${t.value}`).join(', ')}
- Metrics: ${weeklyTarget.metrics.map(m => `${m.key}: ${m.value}`).join(', ')}
</Weekly Target Information>

<Requirements>
1. Create workouts for each training day based on the split pattern
2. Each workout should include:
   - Name and focus area
   - Estimated duration
   - Exercise list with sets, reps, and rest periods
   - Progressive overload considerations
   - Warm-up and cool-down recommendations

3. Consider the weekly targets and metrics when programming intensity
4. Ensure proper recovery between similar muscle groups
5. Include exercise variations and progression notes

<Output Format>
Return a JSON array of workout objects, each containing:
{
  "name": "Workout name",
  "focus": "Primary focus area",
  "dayOfWeek": 1-7 (1=Monday),
  "estimatedDuration": "45-60 minutes",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "8-12",
      "restSeconds": 90,
      "notes": "Form cues or progression notes"
    }
  ],
  "warmUp": "Warm-up routine description",
  "coolDown": "Cool-down routine description"
}
</Output Format>

Create workouts that align with the "${weeklyTarget.split}" split pattern and "${weeklyTarget.focus}" focus for week ${weekNumber}.
`;

export const workoutGenerationPrompt = (
  workoutType: string,
  duration: string,
  fitnessLevel: string,
  equipment?: string[]
) => `
Create a detailed ${workoutType} workout for a ${fitnessLevel} trainee.

<Workout Parameters>
- Type: ${workoutType}
- Duration: ${duration}
- Fitness Level: ${fitnessLevel}
${equipment ? `- Available Equipment: ${equipment.join(', ')}` : '- Equipment: Standard gym equipment'}
</Workout Parameters>

<Requirements>
1. Progressive exercise selection appropriate for the fitness level
2. Proper warm-up (5-10 minutes)
3. Main workout with clear sets, reps, and rest periods
4. Cool-down and stretching (5-10 minutes)
5. Exercise modifications for different skill levels
6. Safety considerations and form cues

Return a structured workout plan in JSON format.
`;