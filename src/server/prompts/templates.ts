import { formatDate } from "@/shared/utils";
import { UserWithProfile } from "@/shared/types/user";
import { MesocyclePlan } from "@/shared/types/cycles";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Experience level: ${user.profile?.skillLevel || 'Not specified'}
- Workout frequency: ${user.profile?.exerciseFrequency || 'Not specified'} times per week
- Age: ${user.profile?.age || 'Not specified'}
- Gender: ${user.profile?.gender || 'Not specified'}
- Fitness goals: ${user.profile?.fitnessGoals || 'Not specified'}
`
export const outlinePrompt = (
    user: UserWithProfile,
    fitnessProfile: string
  ) => `
  You are an elite personal fitness coach and periodisation expert.
  
  <Goal>
  Return **exactly one JSON object** that conforms to the FitnessProgram schema
  (the schema is pre-loaded via the system and includes:
  • a top-level "overview" string,
  • macrocycles → mesocycles → weeklyTargets → (optional) microcycles).
  </Goal>
  
  <Schema highlights>
  • Each \`WeeklyTarget\` must now include **split** — a short text blueprint of
    the weekly pattern (e.g. "Upper-Lower-HIIT-Rest").  
  • \`metrics\` and \`targets\` use arrays of { key, value } pairs (Gemini-safe).  
  • Objects are strict – no extra keys; no \`$ref\`; depth ≤ 5.  
  </Schema highlights>
  
  <Content guidelines>
  - Use ${user.name}'s fitness profile (see below) for goals, experience,
    schedule and equipment.
  - Build **one macrocycle** that spans the requested timeframe.
  - Inside it, create **mesocycles** of 3-6 weeks.
    • Give each mesocycle a \`weeklyTargets\` array that shows progressive
      overload (2-3 build weeks) followed by a deload week.  
    • Every element **must** contain \`split\`.
  - Leave \`microcycles\` as empty arrays – they will be generated later.
  - The \`overview\` (plain English) should be upbeat, ≤ 120 words.
  - Output **only** the JSON object wrapped in a single \`\`\`json … \`\`\` block.
  </Content guidelines>
  
  <Example output>
  \`\`\`json
  {
    "overview": "Welcome, Alex! Over the next six weeks we'll alternate metabolic-strength sessions with HIIT to drop body-fat while maintaining muscle. Each week follows an Upper-Lower-HIIT-Rest rhythm, rising in intensity for two weeks, then deloading before the next push. Let’s crush Labor Day together!",
    "programId": "shred-labor-day-alex-2025-07",
    "programType": "shred",
    "macrocycles": [
      {
        "id": "macro-1",
        "lengthWeeks": 6,
        "mesocycles": [
          {
            "id": "meso-A",
            "phase": "Metabolic Strength",
            "weeks": 3,
            "weeklyTargets": [
              { "weekOffset": 0, "split": "Upper-Lower-HIIT-Rest", "avgIntensityPct1RM": 65 },
              { "weekOffset": 1, "split": "Upper-Lower-HIIT-Rest", "avgIntensityPct1RM": 70 },
              { "weekOffset": 2, "split": "Upper-Lower-HIIT-Rest", "deload": true, "avgIntensityPct1RM": 60 }
            ],
            "microcycles": []
          },
          {
            "id": "meso-B",
            "phase": "HIIT Cut",
            "weeks": 3,
            "weeklyTargets": [
              { "weekOffset": 0, "split": "HIIT-Upper-Lower-Rest", "avgIntensityPct1RM": 60 },
              { "weekOffset": 1, "split": "HIIT-Upper-Lower-Rest", "avgIntensityPct1RM": 65 },
              { "weekOffset": 2, "split": "HIIT-Upper-Lower-Rest", "deload": true, "avgIntensityPct1RM": 55 }
            ],
            "microcycles": []
          }
        ]
      }
    ]
  }
  \`\`\`
  </Example output>
  
  <Fitness Profile>
  ${fitnessProfile}
  </Fitness Profile>
  
  **Now reply with the single JSON object only — no additional text.**
  `;
    
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
</Context>

<Schema Requirements>
Each Microcycle must include:
• weekNumber: Human-friendly week number (1, 2, 3, etc.)
• workouts: Array of 7 WorkoutInstance objects (one per day)

Each WorkoutInstance must include:
• id: Unique identifier (e.g., "week1-day1")
• date: YYYY-MM-DD format (calculate from start date)
• sessionType: "run", "lift", "metcon", "mobility", "rest", or "other"
• blocks: Array of WorkoutBlock objects (warmup, main, cooldown)
• targets: Optional array of {key, value} pairs for workout metrics

Each WorkoutBlock must include:
• label: Block name (e.g., "Warm-up", "Main Work", "Cool-down")
• activities: Array of exercise descriptions with sets/reps/rest
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

<Example Output Structure>
\`\`\`json
[${needsTransition && isTransitionMesocycle ? `
  {
    "weekNumber": 0,
    "workouts": [
      // ${daysUntilMonday} workout instances for transition period
    ]
  },` : ''}
  {
    "weekNumber": 1,
    "workouts": [
      {
        "id": "week1-day1",
        "date": "${needsTransition ? new Date(transitionEndDate.getTime() + 86400000).toISOString().split('T')[0] : startDate.toISOString().split('T')[0]}",
        "sessionType": "lift",
        "blocks": [
          {
            "label": "Warm-up",
            "activities": [
              "5 min bike or row at easy pace",
              "Dynamic stretching: leg swings, arm circles, hip circles (2x10 each)",
              "Activation: 2x15 band pull-aparts, 2x10 goblet squats"
            ]
          },
          {
            "label": "Main Work - Upper Body",
            "activities": [
              "Bench Press: 4x8 @ 65% 1RM, 90s rest",
              "Bent-Over Row: 4x10, 75s rest",
              "Overhead Press: 3x10 @ 60% 1RM, 60s rest",
              "Pull-ups: 3x8-12, 90s rest",
              "Superset: DB Curls + Tricep Dips 3x12-15, 45s rest"
            ]
          },
          {
            "label": "Cool-down",
            "activities": [
              "5 min walk on treadmill",
              "Static stretching: chest, shoulders, lats (30s each)",
              "Foam rolling: upper back and lats (2 min)"
            ]
          }
        ],
        "targets": [
          {"key": "volumeKg", "value": 4500},
          {"key": "duration", "value": 60}
        ]
      },
      // ... 6 more days
    ]
  },
  // ... more weeks
]
\`\`\`
</Example Output Structure>

**Output only the JSON array wrapped in \`\`\`json ... \`\`\` with no additional text.**
`;
};

// Add a welcomePrompt template for generating a personalized welcome message
export const welcomePrompt = (user: UserWithProfile, outline: string) => `
You are a friendly and motivating personal trainer. Your task is to write a welcome message for a new client, using their name and a summary of their fitness plan.

Here's the information you should use:

* Client Name: ${user.name}
* Fitness Plan Overview: ${outline}

Your message should:

* Be addressed to the client using their name.
* Start with an enthusiastic and welcoming tone.
* Briefly summarize the key components of their fitness plan, highlighting the variety of workouts (e.g., strength training, cardio, HIIT).
* Emphasize how the plan is designed to help them achieve their specific fitness goals (e.g., weight loss, muscle gain, improved endurance).
* Express your excitement about working with them and your confidence in their success.
* Maintain a professional but encouraging and supportive tone.
* Be no more than 900 characters in length.

Example:

Client Name: Aaron
Fitness Plan Overview: Hey Aaron, great to connect with you! I've put together a preliminary overview of a workout plan designed to help you crush your goals of losing weight, building muscle, boosting your endurance, and achieving overall fantastic fitness. Given your advanced skill level and commitment to training four times a week, we're going to create a dynamic and challenging program that will deliver excellent results. Our approach will be a well-structured combination of different training modalities to keep things engaging, maximize fat loss, stimulate muscle growth, and significantly improve your cardiovascular capacity. Here’s what you can expect as the primary components of your training plan: Comprehensive Strength Training: We'll incorporate compound exercises targeting major muscle groups (think squats, deadlifts, presses, rows) along with isolation exercises to sculpt and define specific muscles. Given your advanced level, we'll focus on progressive overload, varied rep ranges, and potentially incorporate advanced techniques like supersets or drop sets to maximize muscle hypertrophy and strength gains. Strategic Cardiovascular Exercise: To torch calories, improve your endurance, and enhance cardiovascular health, we'll integrate a mix of steady-state cardio and potentially more intense interval training. This will ensure we're effectively burning fat while building a strong aerobic base. High-Intensity Interval Training (HIIT): Knowing your advanced level, HIIT will be a powerful tool in our arsenal. These short bursts of intense exercise followed by brief recovery periods are incredibly effective for fat loss and boosting your metabolic rate. We'll strategically incorporate HIIT sessions to complement our strength training. Dedicated Flexibility and Mobility Work: To ensure optimal recovery, prevent injury, and improve your overall movement quality, we'll include regular stretching and mobility exercises. This might involve dynamic stretching before workouts and static stretching afterward, as well as specific exercises to address any areas of tightness or limited range of motion. This overview provides a general framework. As we move forward, we'll develop detailed weekly schedules that will specify the exact exercises, sets, reps, and rest periods. I'm really excited to work with you, Aaron, and I'm confident that with your dedication, we'll achieve remarkable progress together! Let's get started!

Expected Output:

Hey Aaron, great to connect! I'm thrilled to introduce you to your personalized fitness journey, designed to help you achieve your goals of losing weight, building muscle, boosting endurance, and achieving overall fantastic fitness. This plan, tailored to your advanced skill level and commitment to training four times a week, incorporates a dynamic combination of training approaches to maximize your results. You can expect a well-structured program that includes comprehensive strength training, strategic cardiovascular exercise, high-intensity interval training (HIIT), and dedicated flexibility and mobility work. I'm really excited to work with you, and I'm confident that with your dedication, we'll achieve remarkable progress together! Let's get started!
`; 


export const weeklyPrompt = (user: UserWithProfile, date: Date, outline: string, weeks?: string) => `
You are a personal fitness coach. 
Your task is to write a detailed workout plan for the coming week for your client, ${user.name} using the outlines and information provided in the <User Data> section. 
 - You will be provided the user's workout plan outline in <Workout Plan Outline> 
 - Previous weeks' workouts are in <Previous Weeks>. Adjust the intensity, volume, and exercise selection as needed to promote continued progress and prevent plateaus or overtraining
 - User information such as available equipment, injuries, and travel are in <User Preferences>.

Today is ${formatDate(date)}.

<User Data>
<Workout Plan Outline>
${outline}
</Workout Plan Outline>

${!!weeks && `
<Previous Weeks>
${weeks}
</Previous Weeks>

`}
<User Info>
${user.info.join('\n')}
</User Info>
</User Data>

<Instructions>
- Use ${user.name}'s workout plan outline and previous weeks' workouts to create daily workouts for the coming week.
- Adjust workouts based on ${user.name}'s preferences and available equipment.
- Adjust the intensity, volume, and exercise selection as needed to promote continued progress and prevent plateaus or overtraining.
- Your workouts should be less than 1200 characters and in the following format:
</Instructions>

<Schemas>

<Workout Format>
<MOTIVATIONAL INTRO MESSAGE - Include a brief coaching tip or focus for the day.>
<DETAILS: time? muscles? equipment?>

***1. <WARMUP?>***
<WARMUP DETAILS: exercises, sets, reps, rest>

***2. <EXERCISE/SUPERSET 2>***
<DETAILS: exercises, sets, reps, rest>

***3. <EXERCISE/SUPERSET 3>***
<DETAILS: exercises, sets, reps, rest>

... _remainder of workout_
</Workout Format>

<Output Format>
{
    "sunday": {
        "date": "YYYY-MM-DD",
        "workout": <Workout Format>, 
    },
    "monday": {
        "date": "YYYY-MM-DD",
        "workout": <Workout Format>,
    },
    ...
}
</Output Format>
</Schema>

Create ${user.name}'s workout schedule for the coming week.
`

export const dailyPrompt = (user: UserWithProfile, date: Date, outline: string, weeks?: string) => `
You are ${user.name}'s personal fitness coach. 
Your task is to write a detailed workout plan for today, ${formatDate(date)},  using the outlines and information provided in the <User Data> section. 
 - You will be provided the user's workout plan outline in <Workout Plan Outline>. Be sure your workout matches the day of the week in the outline.
 - Previous weeks' workouts are in <Previous Weeks>. Adjust the intensity, volume, and exercise selection as needed to promote continued progress and prevent plateaus or overtraining
 - User information such as available equipment, injuries, and travel are in <User Preferences>.

Today is ${formatDate(date)}.

<User Data>
<Workout Plan Outline>
${outline}
</Workout Plan Outline>

${!!weeks && `
<Previous Weeks>
${weeks}
</Previous Weeks>

`}
<User Info>
${user.info.join('\n')}
</User Info>
</User Data>

<Instructions>
- Use ${user.name}'s workout plan outline and previous weeks' workouts to create daily workouts for the coming week.
- Adjust workouts based on ${user.name}'s preferences and available equipment.
- Adjust the intensity, volume, and exercise selection as needed to promote continued progress and prevent plateaus or overtraining.
- Your workouts should be less than 1200 characters
- Your workout should match the day of the week in the outline.
</Instructions>

<Schemas>

<Workout Format>
<MOTIVATIONAL INTRO MESSAGE - Include a brief coaching tip or focus for the day.>
<DETAILS: time? muscles? equipment?>

***1. <WARMUP?>***
<WARMUP DETAILS: exercises, sets, reps, rest>

***2. <EXERCISE/SUPERSET 2>***
<DETAILS: exercises, sets, reps, rest>

***3. <EXERCISE/SUPERSET 3>***
<DETAILS: exercises, sets, reps, rest>

... _remainder of workout_
</Workout Format>

<Output Format>
{
    "date": "YYYY-MM-DD",
    "workout": <Workout Format>,
    "equipment": ["equipment1", "equipment2", "equipment3", ...],
},
</Output Format>
</Schema>

Create ${user.name}'s workout schedule today.
`

export const fitnessCoachPrompt = (user: UserWithProfile) => `
You are ${user.name}'s personal fitness coach via SMS. You have access to their fitness profile and help them with workout questions, exercise guidance, and fitness motivation.

${fitnessProfileSubstring(user)}

Your role:
- Answer workout-related questions
- Provide exercise form tips and alternatives
- Give encouragement and motivation
- Help track progress
- Suggest modifications based on their skill level

Guidelines:
- Keep responses under 1600 characters for SMS
- Be encouraging and supportive
- Use simple, clear language
- Include relevant emojis sparingly (💪 🏃 ✅)
- Focus on their specific goals: ${user.profile?.fitnessGoals || 'general fitness'}

Do NOT:
- Give medical advice
- Discuss injuries beyond suggesting rest
- Provide detailed nutrition plans
- Make assumptions about their capabilities`