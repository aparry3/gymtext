import { ProgramOutline } from "@/shared/types/schema";
import { UserWithProfile } from "../db/postgres/users";


interface Exercise {
  // Add specific exercise properties here
  [key: string]: unknown;
}

interface WorkoutDay {
  date: string;
  exercises: Exercise[];
}

interface WeeklyWorkout {
  week: number;
  days: WorkoutDay[];
}

interface UpdateContext {
  // Add specific context properties here
  [key: string]: unknown;
}

export const outlinePrompt = (user: UserWithProfile) => `
You are GymText, an expert personal trainer. You have a new client named ${user.name} and are making ${user.profile?.gender === 'male' ? 'him' : user.profile?.gender === 'female' ? 'her' : 'them'} a customized program.

Client profile:
- Name: ${user.name}
- Experience level: ${user.profile?.skill_level || 'Not specified'}
- Workout frequency: ${user.profile?.exercise_frequency || 'Not specified'} times per week
- Age: ${user.profile?.age || 'Not specified'}
- Gender: ${user.profile?.gender || 'Not specified'}
- Fitness goals: ${user.profile?.fitness_goals || 'Not specified'}

Based on ${user.name}'s specific profile and goals, generate a program outline focused on ${user.profile?.fitness_goals || 'fat loss and muscle gain'}.

Your response must strictly follow this JSON schema:
{
  "outline": {
    "id": "unique-id", 
    "userId": "${user.id}",
    "createdAt": "current-timestamp",
    "updatedAt": "current-timestamp",
    "goals": {
      "primary": "primary-goal",
      "secondary": ["secondary-goal-1", "secondary-goal-2"]
    },
    "progression": {
      "type": "linear|undulating|block",
      "description": "description of progression approach"
    },
    "weeks": [
      {
        "weekNumber": 1,
        "focusAreas": ["focus-area-1", "focus-area-2"],
        "thingsToConsider": ["tip-1", "tip-2"],
        "intensity": "light|moderate|heavy",
        "volume": "low|medium|high",
        "description": "week description",
        "notes": ["note-1", "note-2"]
      },
      ...
    ]
  }
}
`;

export const weeklyPrompt = (programOutline: ProgramOutline, pastWeeks: WeeklyWorkout[]) => `
Program outline: ${JSON.stringify(programOutline)}.
Past week details: ${JSON.stringify(pastWeeks)}.
Generate detailed workouts for the upcoming week in JSON: { week: X, days: [ { date: "YYYY-MM-DD", exercises: [...] }, ... ] }
`;

export const updatePrompt = (message: string, context: UpdateContext[]) => `
The user says: "${message}".
Based on context: ${JSON.stringify(context)}, should you update daily or weekly? Return JSON: { scope: "daily" | "weekly", updatedPlan: { ... } }
`;

// Add a welcomePrompt template for generating a personalized welcome message
export const welcomePrompt = (user: UserWithProfile, outline: ProgramOutline) => `
You are GymText, an expert personal trainer. You're welcoming your new client ${user.name} to their personalized fitness program.

Client profile:
- Experience level: ${user.profile?.skill_level || 'Not specified'}
- Workout frequency: ${user.profile?.exercise_frequency || 'Not specified'} times per week
- Fitness goals: ${user.profile?.fitness_goals || 'Not specified'}

The program outline is: ${JSON.stringify(outline)}.

Generate a friendly summary of the workout for ${user.name}. Don't go into too much detail, but highlight information like number of weeks, and user terminology that a person with ${user.name} would have.

Your message must strictly follow this JSON schema and must not be more than 800 characters:
{
  "message": "friendly summary of the workout"
}
`; 