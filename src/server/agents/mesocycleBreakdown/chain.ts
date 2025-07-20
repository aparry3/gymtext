import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { mesocycleBreakdownPrompt } from '@/server/agents/mesocycleBreakdown/prompts';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MesocyclePlan, MicrocyclePlan, WeeklyTarget } from '@/server/models/_types';

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
        name: `Week ${i + 1}: ${weeklyTarget.focus}`,
        weekNumber: i + 1,
        startDate: weekStartDate,
        workouts: JSON.parse(microcycle.content), // Assuming LLM returns structured workout data
        targets: weeklyTarget.targets,
        metrics: weeklyTarget.metrics
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
        const workoutDate = new Date(microcycle.startDate);
        workoutDate.setDate(microcycle.startDate.getDate() + i);
        
        const savedWorkout = await workoutRepository.create({
          ...workout,
          microcycleId: savedMicrocycle.id,
          scheduledDate: workoutDate,
          status: 'scheduled'
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
      name: `Week ${weekNumber}: ${weeklyTarget.focus}`,
      weekNumber,
      startDate,
      workouts: JSON.parse(workouts.content),
      targets: weeklyTarget.targets,
      metrics: weeklyTarget.metrics
    };
  }
]);