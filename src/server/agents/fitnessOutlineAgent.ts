import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { fitnessProfileSubstring, outlinePrompt, welcomePrompt, mesocycleBreakdownPrompt } from '../prompts/templates';
import { UserRepository } from '../data/repositories/userRepository';
import { UserWithProfile } from '@/shared/types/user';
import { twilioClient } from '../core/clients/twilio';
import { FitnessProgramSchema, MesocyclePlan, MesocycleDetailed, MicrocyclesSchema, FitnessProgram, Macrocycle } from '@/shared/types/cycles';
import { z } from 'zod';
import { FitnessPlanService } from '../services/fitness/fitnessPlanService';
import { FitnessPlanRepository } from '../data/repositories/fitnessPlanRepository';
// import { ChatOpenAI } from '@langchain/openai';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });
// const llm = new ChatOpenAI({ temperature: 0.3, model: "o3-mini-2025-01-31" });

export const onboardUserChain = RunnableSequence.from([
  // Step 1: Fetch user info and profile
  async (userId: string) => {
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(userId);
    if (!user || !user.profile) throw new Error('User or fitness profile not found');
    return { user };
  },

  // Step 2: Use the profile to create a workout plan outline
  async ({ user }: { user: UserWithProfile }) => {
    const fitnessProfile = fitnessProfileSubstring(user);
    // Remove vector memory storage - database is our single source of truth
    // await remember({userId: user.id, key: 'fitness_profile',text: fitnessProfile});
    const prompt = outlinePrompt(user, fitnessProfile);
    const structuredModel = llm.withStructuredOutput(FitnessProgramSchema);
    const program = await structuredModel.invoke(prompt);
    console.log('program', JSON.stringify(program, null, 2));
    return { user, program };
  },

  // Step 3: Store the workout plan in the database
  async ({ user, program }: { user: UserWithProfile; program: FitnessProgram }) => {
    const fitnessPlanService = new FitnessPlanService(
      new FitnessPlanRepository()
    );
    
    // Determine start date (today for now, could be customized)
    const startDate = new Date();
    
    // Extract goal statement from fitness goals
    const goalStatement = user.profile?.fitnessGoals || undefined;
    
    // Save to database using the service
    const savedPlan = await fitnessPlanService.createFromProgram(
      user.id,
      program,
      startDate,
      goalStatement
    );
    
    console.log('Saved fitness plan to database:', savedPlan.id);
    
    // Remove vector memory storage - database is our single source of truth
    // await remember({userId: user.id, key: 'outline', text: `Outline: ${program}`});
    
    return { user, program, savedPlan };
  },

  // Step 4: Summarize the outline and create a welcome message for the user
  async ({ user, program }) => {
    const welcomePromptText = welcomePrompt(user, program);
    const welcomeResp = await llm.invoke(welcomePromptText);
    const welcomeContent = typeof welcomeResp.content === 'string'
      ? welcomeResp.content
      : String(welcomeResp.content);
    
    return { user, program, message: welcomeContent };
  },
  // Step 5: Return the welcome message
]);

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
    
    const structuredModel = llm.withStructuredOutput(MicrocyclesSchema);
    const microcycles = await structuredModel.invoke(prompt);
    
    return { mesocyclePlan, microcycles };
  },

  // Step 3: Create complete MesocycleDetailed object
  async ({ mesocyclePlan, microcycles }: { 
    mesocyclePlan: MesocyclePlan; 
    microcycles: z.infer<typeof MicrocyclesSchema>;
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

export async function onboardUser({ userId }: { userId: string }): Promise<string> {
  const result = await onboardUserChain.invoke(userId);
  
  // At this point message should already be a string from our chain
  const messageText = String(result.message);
  const outlineText = JSON.stringify(result.program);
  console.log('messageText', messageText);
  console.log('result.user.phoneNumber', result.user.phoneNumber);
  await twilioClient.sendSMS(result.user.phoneNumber, messageText);
  return outlineText;
}
