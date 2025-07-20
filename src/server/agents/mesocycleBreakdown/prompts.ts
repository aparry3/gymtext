import { formatDate } from "@/shared/utils";
import { UserWithProfile } from "@/shared/types/user";
import { MesocyclePlan } from "@/shared/types/cycles";

export const mesocycleBreakdownPrompt = (
  user: UserWithProfile,
  mesocyclePlan: MesocyclePlan,
  fitnessProfile: string,
  programType: string,
  startDate: Date
) => {
  // Calculate transition microcycle requirements
  const dayOfWeek = startDate.getDay();
  const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
  const needsTransition = daysUntilMonday > 0;
  const transitionEndDate = new Date(startDate);
  transitionEndDate.setDate(transitionEndDate.getDate() + daysUntilMonday - 1);
  
  // Check if this is a transition mesocycle based on the phase name
  const isTransitionMesocycle = mesocyclePlan.phase.includes('transition');
  
  // Generate consistent ID prefix for this mesocycle
  const idPrefix = mesocyclePlan.id.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return `
You are an elite personal fitness coach and periodization expert tasked with creating detailed weekly workout plans.

<Goal>
Generate **exactly one JSON array** of Microcycle objects that fully populates the mesocycle with detailed workouts.
</Goal>

<Context>
- Client: ${user.name}
- Mesocycle phase: ${mesocyclePlan.phase}
- Duration: ${mesocyclePlan.weeks} weeks
- Program type: ${programType}
- Start date: ${formatDate(startDate)}
- Mesocycle ID: ${mesocyclePlan.id}
</Context>

<Schema Requirements>
Each Microcycle must include:
• weekNumber: Human-friendly week number (1, 2, 3, etc.)
• workouts: Array of WorkoutInstance objects (exactly 7 for full weeks)

Each WorkoutInstance must include:
• id: UNIQUE identifier using format: "${idPrefix}-w{weekNumber}-d{dayNumber}" (e.g., "${idPrefix}-w1-d1", "${idPrefix}-w1-d2", etc.)
• date: YYYY-MM-DD format string (calculate sequentially from start date)
• sessionType: "run", "lift", "metcon", "mobility", "rest", or "other"
• blocks: Array of WorkoutBlock objects (at least 1, typically warmup/main/cooldown)
• targets: Optional array of {key, value} pairs for workout metrics

Each WorkoutBlock must include:
• label: Block name (e.g., "Warm-up", "Main Work", "Cool-down")
• activities: Array of exercise descriptions with sets/reps/rest

CRITICAL ID GENERATION RULES:
- Each workout ID must be globally unique
- Use the format: "${idPrefix}-w{weekNumber}-d{dayNumber}"
- Week numbers start at 1 (or 0 for transition week)
- Day numbers go from 1-7 (Monday=1, Sunday=7)
- For transition weeks, use day numbers starting from 1

DATE CALCULATION RULES:
- Start from ${formatDate(startDate)} and increment by 1 day for each workout
- Dates must be in YYYY-MM-DD format (e.g., "2025-01-15")
- Each microcycle should have consecutive dates with no gaps
</Schema Requirements>

<Progressive Overload Guidelines>
${mesocyclePlan.weeklyTargets.map((target, idx) => `
Week ${idx + 1} (${target.deload ? 'DELOAD' : 'BUILD'}):
- Split pattern: ${target.split || 'Not specified'}
- Intensity: ${target.avgIntensityPct1RM || 'N/A'}% 1RM
- Main lift sets: ${target.totalSetsMainLifts || 'N/A'}
- Weekly mileage: ${target.totalMileage || 'N/A'}
- Long run: ${target.longRunMileage || 'N/A'} miles
`).join('')}
</Progressive Overload Guidelines>

<Exercise Selection Criteria>
1. Match exercises to the mesocycle phase ("${mesocyclePlan.phase}")
2. Consider user's skill level: ${user.profile?.skillLevel || 'intermediate'}
3. Available equipment: standard gym equipment (adjust based on user feedback)
4. Respect user preferences and limitations
5. Include appropriate variety week-to-week
6. For deload weeks, reduce volume by 40-50% and intensity by 10-20%
</Exercise Selection Criteria>

<Content Guidelines>
- Follow the split pattern exactly as specified in weeklyTargets
- Include specific exercises, sets, reps, rest periods, and tempo where applicable
- Warm-ups should be 5-10 minutes, progressive in nature
- Main work should align with the mesocycle phase and daily focus
- Cool-downs should include stretching and mobility work
- Rest days should have sessionType "rest" with light mobility work only
- For strength work, use percentage-based loading when avgIntensityPct1RM is provided
- For endurance work, include pace/effort guidelines
</Content Guidelines>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

${needsTransition && isTransitionMesocycle ? `
<Transition Microcycle Requirements>
IMPORTANT: The user is starting on ${formatDate(startDate)} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}).
- Create a TRANSITION microcycle first with ${daysUntilMonday} workout days (from ${formatDate(startDate)} to ${formatDate(transitionEndDate)})
- This transition microcycle should have weekNumber: 0
- It should contain exactly ${daysUntilMonday} WorkoutInstance objects
- After the transition, create ${mesocyclePlan.weeks} standard full-week microcycles (Monday-Sunday)
- Total microcycles: ${mesocyclePlan.weeks + 1} (1 transition + ${mesocyclePlan.weeks} standard)

For the transition microcycle:
- Use a modified version of Week 1's split pattern
- Focus on assessment, movement quality, and gradual introduction
- Include at least one rest day if transition is 3+ days
- Prioritize key workouts from the split pattern
</Transition Microcycle Requirements>
` : ''}

<Important>
Generate a JSON array of Microcycle objects. Each Microcycle contains workouts array with 7 WorkoutInstance objects (one per day).
</Important>

**Output only the JSON array wrapped in \`\`\`json ... \`\`\` with no additional text.**
`;
};