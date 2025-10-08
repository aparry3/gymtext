import { MesocycleOverview } from '@/server/models/fitnessPlan';

export const microcyclePatternPrompt = (
  mesocycle: MesocycleOverview,
  weekNumber: number,
  programType: string,
  notes?: string | null
) => `
You are an expert fitness coach creating a weekly training pattern.

<Goal>
Generate ONE weeks training pattern for week ${weekNumber} of ${mesocycle.weeks} in the "${mesocycle.name}" mesocycle.
Return a JSON object that matches the MicrocyclePattern schema exactly.
</Goal>

<Context>
- Program type: ${programType}
- Mesocycle: ${mesocycle.name}
- Focus areas: ${mesocycle.focus.join(', ')}
- Week ${weekNumber} of ${mesocycle.weeks}
- ${mesocycle.deload && weekNumber === mesocycle.weeks ? 'This is a DELOAD week - reduce volume and intensity' : 'Regular training week'}
${notes ? `- Special considerations: ${notes}` : ''}
</Context>

<Requirements>
1. Generate a pattern for all 7 days (Monday through Sunday)
2. Each day must have: day (uppercase), theme, and optionally load (light/moderate/heavy)
3. Include appropriate rest days based on program type
4. Apply progressive overload principles:
   - Week 1: Moderate load (introduction)
   - Week 2-3: Progressive increase in load
   - Deload week: Light load across all days
5. Match the training split to the program type and mesocycle focus

<Program Type Guidelines>
- **strength**: Focus on compound lifts, lower/upper splits, 4-5 training days
- **endurance**: Running/cardio focus, 5-6 training days with varied intensities
- **hybrid**: Mix of strength and cardio, 4-5 training days
- **shred**: High-intensity metabolic work, 5-6 training days
- **rehab**: Lower intensity, focus on movement quality, 3-4 training days

<Example Output>
\`\`\`json
{
  "weekIndex": ${weekNumber},
  "days": [
    {"day": "MONDAY", "theme": "Lower Power", "load": "heavy", "notes": "Focus on explosive movements"},
    {"day": "TUESDAY", "theme": "Upper Push", "load": "moderate"},
    {"day": "WEDNESDAY", "theme": "Active Recovery", "load": "light", "notes": "Mobility and light cardio"},
    {"day": "THURSDAY", "theme": "Lower Volume", "load": "moderate"},
    {"day": "FRIDAY", "theme": "Upper Pull", "load": "moderate"},
    {"day": "SATURDAY", "theme": "Full Body Circuit", "load": "light"},
    {"day": "SUNDAY", "theme": "Rest"}
  ]
}
\`\`\`
</Example>

Output ONLY the JSON object, no additional text.
`;