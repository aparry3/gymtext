import { FitnessProgram, Macrocycle, MesocycleDetailed, MesocyclePlan } from "@/shared/types/cycles";
import { RunnableSequence } from "@langchain/core/runnables";
import { UserRepository } from "../repositories/userRepository";
import { mesocycleBreakdownPrompt } from "./prompts";
import { fitnessProfileSubstring } from "../fitnessPlanCreation/prompts";
import { MicrocyclesGeminiSchema } from "@/shared/types/cyclesGemini";
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

export const breakdownMesocycleChain = RunnableSequence.from([
  // Step 1: Prepare context
  async ({ userId, mesocyclePlan, programType, startDate }: {
    userId: string;
    mesocyclePlan: MesocyclePlan;
    programType: string;
    startDate: Date;
  }) => {
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(userId);
    if (!user || !user.profile) throw new Error('User or fitness profile not found');
    const fitnessProfile = fitnessProfileSubstring(user);
    return { user, mesocyclePlan, fitnessProfile, programType, startDate };
  },

  // Step 2: Generate microcycles using structured output
  async ({ user, mesocyclePlan, fitnessProfile, programType, startDate }) => {
    const prompt = mesocycleBreakdownPrompt(
      user, 
      mesocyclePlan, 
      fitnessProfile, 
      programType,
      startDate
    );
    
    const structuredModel = llm.withStructuredOutput(MicrocyclesGeminiSchema);
    const microcycles = await structuredModel.invoke(prompt);
    
    return { mesocyclePlan, microcycles };
  },

  // Step 3: Create complete MesocycleDetailed object
  async ({ mesocyclePlan, microcycles }: { 
    mesocyclePlan: MesocyclePlan; 
    microcycles: z.infer<typeof MicrocyclesGeminiSchema>;
  }) => {
    const mesocycleDetailed: MesocycleDetailed = {
      ...mesocyclePlan,
      microcycles
    };
    return mesocycleDetailed;
  }
]);

export async function breakdownMesocycle({ 
  userId, 
  mesocyclePlan, 
  programType, 
  startDate 
}: { 
  userId: string;
  mesocyclePlan: MesocyclePlan;
  programType: string;
  startDate: Date;
}): Promise<MesocycleDetailed> {
  try {
    const result = await breakdownMesocycleChain.invoke({
      userId,
      mesocyclePlan,
      programType,
      startDate
    });
    
    // Log success for debugging
    console.log(`Successfully generated ${result.microcycles.length} microcycles for mesocycle ${mesocyclePlan.id}`);
    
    return result;
  } catch (error) {
    console.error(`Failed to breakdown mesocycle ${mesocyclePlan.id}:`, error);
    
    // Add more detailed error logging
    if (error instanceof Error && error.message.includes('JSON')) {
      console.error('JSON parsing error - the LLM may have returned incomplete or invalid JSON');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate detailed workouts for mesocycle: ${errorMessage}`);
  }
}

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

// Calculate if we need a transition microcycle
function needsTransitionMicrocycle(startDate: Date): boolean {
  return getDaysUntilNextMonday(startDate) > 0;
}

// Orchestration function to process all mesocycles in a fitness program
export async function processFitnessProgramMesocycles({
  userId,
  program,
  startDate = new Date()
}: {
  userId: string;
  program: FitnessProgram;
  startDate?: Date;
}): Promise<FitnessProgram> {
  try {
    console.log(`Processing fitness program ${program.programId} for user ${userId}`);
    
    // Process each macrocycle
    const processedMacrocycles: Macrocycle[] = [];
    
    for (const macrocycle of program.macrocycles) {
      console.log(`Processing macrocycle ${macrocycle.id}`);
      
      // Set the start date for the macrocycle if not already set
      const macroStartDate = macrocycle.startDate 
        ? new Date(macrocycle.startDate) 
        : startDate;
      
      // Process the first mesocycle with potential transition handling
      const processedMesocycles: MesocycleDetailed[] = [];
      let currentStartDate = macroStartDate;
      
      for (let i = 0; i < macrocycle.mesocycles.length; i++) {
        const mesocyclePlan = macrocycle.mesocycles[i];
        const isFirstMesocycle = i === 0;
        
        console.log(`Processing mesocycle ${mesocyclePlan.id}, starting ${currentStartDate.toISOString()}`);
        
        // Handle transition microcycle for the first mesocycle if needed
        if (isFirstMesocycle && needsTransitionMicrocycle(currentStartDate)) {
          console.log(`Creating transition microcycle for ${mesocyclePlan.id}`);
          
          // Update the mesocycle plan to account for the transition
          const transitionDays = getDaysUntilNextMonday(currentStartDate);
          const adjustedMesocyclePlan: MesocyclePlan = {
            ...mesocyclePlan,
            // Add a note about the transition in the phase name
            phase: `${mesocyclePlan.phase} (with ${transitionDays}-day transition)`
          };
          
          // Generate the mesocycle with transition
          const mesocycleDetailed = await breakdownMesocycleWithTransition({
            userId,
            mesocyclePlan: adjustedMesocyclePlan,
            programType: program.programType,
            startDate: currentStartDate,
            transitionDays
          });
          
          processedMesocycles.push(mesocycleDetailed);
          
          // Calculate next start date (after transition + regular weeks)
          const totalDays = transitionDays + (mesocyclePlan.weeks * 7);
          currentStartDate = addDays(currentStartDate, totalDays);
        } else {
          // Standard mesocycle processing (starts on Monday)
          const mesocycleDetailed = await breakdownMesocycle({
            userId,
            mesocyclePlan,
            programType: program.programType,
            startDate: currentStartDate
          });
          
          processedMesocycles.push(mesocycleDetailed);
          
          // Calculate next start date
          currentStartDate = addDays(currentStartDate, mesocyclePlan.weeks * 7);
        }
      }
      
      // Create processed macrocycle with detailed mesocycles
      processedMacrocycles.push({
        ...macrocycle,
        startDate: macroStartDate.toISOString().split('T')[0],
        mesocycles: processedMesocycles as MesocyclePlan[] // Type assertion needed due to the union type
      });
    }
    
    // Return the complete program with populated mesocycles
    return {
      ...program,
      macrocycles: processedMacrocycles
    };
    
  } catch (error) {
    console.error('Failed to process fitness program mesocycles:', error);
    throw new Error(`Failed to process fitness program: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Modified breakdown function to handle transition microcycles
async function breakdownMesocycleWithTransition({
  userId,
  mesocyclePlan,
  programType,
  startDate,
  transitionDays
}: {
  userId: string;
  mesocyclePlan: MesocyclePlan;
  programType: string;
  startDate: Date;
  transitionDays: number;
}): Promise<MesocycleDetailed> {
  // The mesocyclePlan already has the transition info in the phase name
  // The prompt will handle generating the transition microcycle based on the start date
  console.log(`Generating mesocycle with ${transitionDays}-day transition period`);
  
  return breakdownMesocycle({
    userId,
    mesocyclePlan,
    programType,
    startDate
  });
}
