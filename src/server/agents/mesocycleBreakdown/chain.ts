import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { mesocycleBreakdownPrompt, transitionMicrocyclePrompt } from "./prompts";
import { MesocycleModel, MesocycleOverview } from "@/server/models/mesocycle";
import { FitnessPlan, MicrocycleModel, UserWithProfile } from "@/server/models";
import { FitnessProfileContext } from "@/server/services/context/fitnessProfileContext";
import { LLMMicrocycle } from "@/server/models/microcycle/schema";
import { MicrocycleBreakdown } from "@/server/models/microcycle";


const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

export const mesocycleAgent = RunnableSequence.from([
  // Step 1: Prepare context
  async ({ user, context }: {
    user: UserWithProfile;
    context: {
      mesocycleOverview: MesocycleOverview;
      fitnessPlan: FitnessPlan;
    }
  }) => {
    const fitnessProfileContextService = new FitnessProfileContext(user);
    const fitnessProfile = await fitnessProfileContextService.getContext();

    const prompt = mesocycleBreakdownPrompt(
      user, 
      context.mesocycleOverview, 
      fitnessProfile, 
      context.fitnessPlan.programType,
    );
    
    const structuredModel = llm.withStructuredOutput(MesocycleModel.microcyclesSchema);
    const microcycles = await structuredModel.invoke(prompt);
    
    return { user, context: { ...context, fitnessProfile }, value: microcycles };
  },

  async ({ user, context, value }: { 
    user: UserWithProfile; 
    context: {
      mesocycleOverview: MesocycleOverview;
      fitnessPlan: FitnessPlan;
      fitnessProfile: string;
    };
    value: LLMMicrocycle[];
  }): Promise<{
    user: UserWithProfile;
    context: {
      mesocycleOverview: MesocycleOverview;
      fitnessPlan: FitnessPlan;
      fitnessProfile: string;
    };
    value: LLMMicrocycle[];
  }> => {
    const startDate = context.fitnessPlan.startDate;
    const daysUntilNextMonday = getDaysUntilNextMonday(new Date(startDate));
    let microcycles = value;
    if (daysUntilNextMonday > 0) {
      const transitionModel = llm.withStructuredOutput(MicrocycleModel.schema)
      const transitionPrompt = transitionMicrocyclePrompt(
        user, 
        context.mesocycleOverview, 
        context.fitnessProfile, 
        context.fitnessPlan.programType,
        daysUntilNextMonday
      )
      const transitionMicrocycle = await transitionModel.invoke(transitionPrompt)
      value.unshift(transitionMicrocycle)
      microcycles = value.map((microcycle, index) => ({
        ...microcycle,
        index: index
      }))
    }
    return { user, context, value: microcycles }
  },

  async ({ user, context, value }: { 
    user: UserWithProfile; 
    context: {
      mesocycleOverview: MesocycleOverview;
      fitnessPlan: FitnessPlan;
      fitnessProfile: string;
    };
    value: LLMMicrocycle[];
  }): Promise<{
    user: UserWithProfile;
    context: {
      mesocycleOverview: MesocycleOverview;
      fitnessPlan: FitnessPlan;
      fitnessProfile: string;
    };
    value: MicrocycleBreakdown[];
  }>   => {
    let currentDate = new Date(context.fitnessPlan.startDate);
    const microcyclesWithDates = value.map((microcycle: LLMMicrocycle) => {
      const microcycleWithDates: Partial<MicrocycleBreakdown> = {
        ...microcycle,
        startDate: currentDate,
        workouts: microcycle.workouts.map((workout) => {
          const workoutWithDate = {
            ...workout,
            date: currentDate,
          }
          currentDate = addDays(currentDate, 1);
          return workoutWithDate;
        })
      };
      microcycleWithDates.endDate = currentDate;
      return microcycleWithDates as MicrocycleBreakdown;
    })
    return { user, context, value: microcyclesWithDates }
  }
]);

// Date utility functions for microcycle alignment
function getDaysUntilNextMonday(date: Date): number {
  const dayOfWeek = date.getDay();
  // If it's Monday (1), return 0. Otherwise calculate days until next Monday
  return dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}