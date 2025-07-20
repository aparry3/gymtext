import { UserWithProfile } from "@/shared/types/user";
import { dailyPrompt, weeklyPrompt } from "./prompts";

export interface DailyMessageInput {
  user: UserWithProfile;
  date: Date;
  fitnessPlanOutline: string;
  previousWeeksWorkouts?: string;
}

export interface WeeklyMessageInput extends DailyMessageInput {}

export class DailyMessageAgent {
  async generateDailyWorkout(input: DailyMessageInput): Promise<{
    date: string;
    workout: string;
    equipment: string[];
  }> {
    const { user, date, fitnessPlanOutline, previousWeeksWorkouts } = input;
    
    const prompt = dailyPrompt(user, date, fitnessPlanOutline, previousWeeksWorkouts);
    
    // TODO: Implement LLM call here
    // const response = await llm.generate(prompt);
    // return JSON.parse(response.text);
    
    return {
      date: date.toISOString().split('T')[0],
      workout: `Daily workout generated for ${user.name}`,
      equipment: ["dumbbells", "barbell", "bench"]
    };
  }

  async generateWeeklyWorkouts(input: WeeklyMessageInput): Promise<{
    workouts: Array<{
      date: string;
      workout: string;
      equipment: string[];
    }>;
  }> {
    const { user, date, fitnessPlanOutline, previousWeeksWorkouts } = input;
    
    const prompt = weeklyPrompt(user, date, fitnessPlanOutline, previousWeeksWorkouts);
    
    // TODO: Implement LLM call here
    // const response = await llm.generate(prompt);
    // return JSON.parse(response.text);
    
    return {
      workouts: []
    };
  }
}

export const dailyMessageAgent = new DailyMessageAgent();