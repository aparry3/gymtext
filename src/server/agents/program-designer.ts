import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { RunnableSequence } from '@langchain/core/runnables';
import { FitnessProfile } from '@/shared/types';
import { config } from '../config';

const ProgramStructureSchema = z.object({
  name: z.string(),
  description: z.string(),
  programType: z.enum(['strength', 'hypertrophy', 'endurance', 'hybrid']),
  durationType: z.enum(['fixed', 'ongoing']),
  durationWeeks: z.number().optional(),
  phases: z.array(z.object({
    phaseNumber: z.number(),
    name: z.string(),
    description: z.string(),
    focus: z.enum(['strength', 'volume', 'peaking', 'deload', 'adaptation']),
    startWeek: z.number(),
    endWeek: z.number(),
    trainingVariables: z.object({
      intensityRange: z.object({
        min: z.number(),
        max: z.number()
      }),
      volumeMultiplier: z.number(),
      frequencyPerWeek: z.number(),
      restDays: z.number()
    })
  })),
  goals: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).optional()
  }),
  equipmentRequired: z.array(z.string()),
  weeklyStructure: z.object({
    daysPerWeek: z.number(),
    sessionTypes: z.array(z.object({
      dayOfWeek: z.number(),
      sessionType: z.enum(['strength', 'hypertrophy', 'conditioning', 'recovery', 'rest']),
      primaryFocus: z.string(),
      secondaryFocus: z.string().optional()
    }))
  })
});

type ProgramStructure = z.infer<typeof ProgramStructureSchema>;

export class ProgramDesignerAgent {
  private model: ChatOpenAI | ChatGoogleGenerativeAI;
  private parser: StructuredOutputParser<ProgramStructure>;
  private chain: RunnableSequence;

  constructor() {
    this.model = config.llm.provider === 'openai' 
      ? new ChatOpenAI({
          modelName: config.llm.model,
          temperature: 0.3,
          openAIApiKey: config.openai.apiKey,
        })
      : new ChatGoogleGenerativeAI({
          modelName: config.llm.model,
          temperature: 0.3,
          apiKey: config.googleai.apiKey,
        });

    this.parser = StructuredOutputParser.fromZodSchema(ProgramStructureSchema);

    const prompt = PromptTemplate.fromTemplate(`
You are an expert fitness program designer with deep knowledge of periodization, progressive overload, and training principles.

Design a comprehensive workout program based on the user's fitness profile.

User Profile:
- Fitness Goals: {goals}
- Skill Level: {skillLevel}
- Available Equipment: {equipment}
- Days Available: {daysAvailable}
- Time per Session: {timePerSession} minutes
- Injuries/Limitations: {injuries}

Design a structured program that:
1. Aligns with the user's primary goals
2. Includes appropriate periodization phases
3. Considers their skill level and available time
4. Works with their available equipment
5. Accounts for any injuries or limitations

The program should include:
- Clear phases with specific focuses (e.g., adaptation, volume, strength, deload)
- Appropriate training variables for each phase
- A weekly structure that fits their schedule
- Progressive overload principles

{format_instructions}
`);

    this.chain = RunnableSequence.from([
      prompt,
      this.model,
      this.parser,
    ]);
  }

  async designProgram(profile: FitnessProfile): Promise<ProgramStructure> {
    try {
      const result = await this.chain.invoke({
        goals: profile.goals.join(', '),
        skillLevel: profile.skillLevel,
        equipment: profile.equipment.join(', '),
        daysAvailable: profile.availability.daysPerWeek,
        timePerSession: profile.availability.minutesPerSession,
        injuries: profile.injuries || 'None',
        format_instructions: this.parser.getFormatInstructions(),
      });

      return result;
    } catch (error) {
      console.error('Error designing program:', error);
      throw new Error('Failed to design workout program');
    }
  }

  async adaptProgram(
    currentProgram: ProgramStructure,
    adaptationReason: string,
    userFeedback?: string
  ): Promise<ProgramStructure> {
    const adaptationPrompt = PromptTemplate.fromTemplate(`
You are adapting an existing workout program based on user needs.

Current Program:
{currentProgram}

Reason for Adaptation:
{adaptationReason}

User Feedback:
{userFeedback}

Modify the program appropriately while:
1. Maintaining the overall program structure
2. Addressing the specific adaptation need
3. Ensuring progressive overload is still achievable
4. Keeping changes minimal and focused

{format_instructions}
`);

    const adaptationChain = RunnableSequence.from([
      adaptationPrompt,
      this.model,
      this.parser,
    ]);

    try {
      const result = await adaptationChain.invoke({
        currentProgram: JSON.stringify(currentProgram, null, 2),
        adaptationReason,
        userFeedback: userFeedback || 'None provided',
        format_instructions: this.parser.getFormatInstructions(),
      });

      return result;
    } catch (error) {
      console.error('Error adapting program:', error);
      throw new Error('Failed to adapt workout program');
    }
  }
}