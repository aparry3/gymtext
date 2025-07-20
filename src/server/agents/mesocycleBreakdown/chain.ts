import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { mesocycleBreakdownPrompt } from '@/server/agents/mesocycleBreakdown/prompts';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MicrocyclePlan, WeeklyTarget } from '@/server/models/microcycleModel';
import type { JsonValue } from '@/server/models/_types';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

export const mesocycleBreakdownChain = RunnableSequence.from([
  async ({ 
    mesocycleId, 
    weeklyTargets,
    startDate 
  }: { 
    mesocycleId: string;
    weeklyTargets: WeeklyTarget[];
    startDate: Date;
  }) => {
    // Generate detailed microcycles from weekly targets
    const microcycles: MicrocyclePlan[] = [];
    
    for (let i = 0; i < weeklyTargets.length; i++) {
      const weeklyTarget = weeklyTargets[i];
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (i * 7));
      
      const prompt = mesocycleBreakdownPrompt(weeklyTarget, weekStartDate, i + 1);
      const microcycle = await llm.invoke(prompt);
      
      microcycles.push({
        weekNumber: i + 1,
        workouts: JSON.parse(typeof microcycle.content === 'string' ? microcycle.content : JSON.stringify(microcycle.content)), // Assuming LLM returns structured workout data
        weeklyTargets: weeklyTarget
      });
    }
    
    return { mesocycleId, microcycles };
  },
  
  async ({ mesocycleId, microcycles }: { mesocycleId: string; microcycles: MicrocyclePlan[] }) => {
    // Save microcycles to database
    const microcycleRepository = new MicrocycleRepository();
    const workoutRepository = new WorkoutInstanceRepository();
    
    const savedMicrocycles = [];
    
    for (const microcycle of microcycles) {
      const savedMicrocycle = await microcycleRepository.create({
        ...microcycle,
        mesocycleId
      });
      
      // Create workout instances for this microcycle
      const savedWorkouts = [];
      
      for (let i = 0; i < microcycle.workouts.length; i++) {
        const workout = microcycle.workouts[i];
        
        const savedWorkout = await workoutRepository.create({
          microcycleId: savedMicrocycle.id,
          mesocycleId: mesocycleId,
          fitnessPlanId: '', // TODO: Need to pass this through
          clientId: '', // TODO: Need to pass this through
          date: new Date(workout.date),
          sessionType: workout.sessionType,
          details: workout.details as JsonValue,
          goal: workout.goal
        });
        
        savedWorkouts.push(savedWorkout);
      }
      
      savedMicrocycles.push({
        ...savedMicrocycle,
        workouts: savedWorkouts
      });
    }
    
    return { mesocycleId, microcycles: savedMicrocycles };
  }
]);

export const generateMicrocycleChain = RunnableSequence.from([
  async ({ 
    weeklyTarget,
    weekNumber,
    startDate 
  }: { 
    weeklyTarget: WeeklyTarget;
    weekNumber: number;
    startDate: Date;
  }) => {
    const prompt = mesocycleBreakdownPrompt(weeklyTarget, startDate, weekNumber);
    const workouts = await llm.invoke(prompt);
    
    return {
      name: `Week ${weekNumber}`,
      weekNumber,
      startDate,
      workouts: JSON.parse(typeof workouts.content === 'string' ? workouts.content : JSON.stringify(workouts.content)),
      weeklyTargets: weeklyTarget
    };
  },
  // Identity function to satisfy RunnableSequence requirement
  (result) => result
]);