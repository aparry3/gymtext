import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { RunnableSequence } from '@langchain/core/runnables';
import { config } from '../config';

const ExerciseSchema = z.object({
  name: z.string(),
  category: z.enum(['compound', 'isolation', 'cardio', 'mobility']),
  muscleGroups: z.array(z.string()),
  sets: z.number(),
  reps: z.string(), // Can be ranges like "8-12" or specific like "5"
  rest: z.number(), // Rest in seconds
  tempo: z.string().optional(), // e.g., "2-0-2-0"
  notes: z.string().optional(),
  alternativeExercises: z.array(z.string()).optional()
});

const WorkoutSessionSchema = z.object({
  sessionType: z.enum(['strength', 'hypertrophy', 'conditioning', 'recovery']),
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number(),
  warmup: z.object({
    exercises: z.array(z.object({
      name: z.string(),
      duration: z.string(), // e.g., "5 minutes" or "2 sets of 10"
      notes: z.string().optional()
    }))
  }),
  mainWorkout: z.object({
    exercises: z.array(ExerciseSchema),
    circuitFormat: z.boolean().optional(),
    supersetGroups: z.array(z.array(z.number())).optional() // Indices of exercises that are supersetted
  }),
  cooldown: z.object({
    exercises: z.array(z.object({
      name: z.string(),
      duration: z.string(),
      notes: z.string().optional()
    }))
  }),
  totalVolume: z.object({
    sets: z.number(),
    estimatedReps: z.number()
  }),
  equipmentNeeded: z.array(z.string())
});

type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

interface SessionContext {
  phaseType: 'strength' | 'volume' | 'peaking' | 'deload' | 'adaptation';
  weekNumber: number;
  dayOfWeek: number;
  sessionFocus: string;
  availableEquipment: string[];
  timeConstraint: number;
  recentExercises?: string[]; // To avoid repetition
  userSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  injuries?: string;
}

export class SessionBuilderAgent {
  private model: ChatOpenAI | ChatGoogleGenerativeAI;
  private parser: StructuredOutputParser<WorkoutSession>;
  private chain: RunnableSequence;

  constructor() {
    this.model = config.llm.provider === 'openai' 
      ? new ChatOpenAI({
          modelName: config.llm.model,
          temperature: 0.4,
          openAIApiKey: config.openai.apiKey,
        })
      : new ChatGoogleGenerativeAI({
          modelName: config.llm.model,
          temperature: 0.4,
          apiKey: config.googleai.apiKey,
        });

    this.parser = StructuredOutputParser.fromZodSchema(WorkoutSessionSchema);

    const prompt = PromptTemplate.fromTemplate(`
You are an expert workout session designer creating a specific training session.

Context:
- Phase Type: {phaseType}
- Week Number: {weekNumber}
- Day of Week: {dayOfWeek} (0=Sunday, 6=Saturday)
- Session Focus: {sessionFocus}
- Available Equipment: {availableEquipment}
- Time Available: {timeConstraint} minutes
- User Skill Level: {userSkillLevel}
- Recent Exercises (avoid these): {recentExercises}
- Injuries/Limitations: {injuries}

Design a complete workout session that:
1. Aligns with the current training phase and week
2. Focuses on the specified muscle groups or movement patterns
3. Uses only available equipment
4. Fits within the time constraint
5. Includes appropriate warmup and cooldown
6. Avoids exercises done recently to prevent overuse
7. Considers the user's skill level
8. Accommodates any injuries or limitations

For each exercise, provide:
- Clear exercise names (use common terminology)
- Appropriate sets, reps, and rest periods for the phase
- Alternative exercises in case equipment is unavailable
- Brief notes for form cues or modifications

{format_instructions}
`);

    this.chain = RunnableSequence.from([
      prompt,
      this.model,
      this.parser,
    ]);
  }

  async buildSession(context: SessionContext): Promise<WorkoutSession> {
    try {
      const result = await this.chain.invoke({
        phaseType: context.phaseType,
        weekNumber: context.weekNumber,
        dayOfWeek: context.dayOfWeek,
        sessionFocus: context.sessionFocus,
        availableEquipment: context.availableEquipment.join(', '),
        timeConstraint: context.timeConstraint,
        userSkillLevel: context.userSkillLevel,
        recentExercises: context.recentExercises?.join(', ') || 'None',
        injuries: context.injuries || 'None',
        format_instructions: this.parser.getFormatInstructions(),
      });

      return result;
    } catch (error) {
      console.error('Error building session:', error);
      throw new Error('Failed to build workout session');
    }
  }

  async modifySession(
    currentSession: WorkoutSession,
    modificationRequest: string,
    constraints?: Partial<SessionContext>
  ): Promise<WorkoutSession> {
    const modificationPrompt = PromptTemplate.fromTemplate(`
You are modifying an existing workout session based on a specific request.

Current Session:
{currentSession}

Modification Request:
{modificationRequest}

Additional Constraints:
{constraints}

Modify the session to accommodate the request while:
1. Maintaining the overall session structure and goals
2. Keeping total volume similar (unless specifically requested otherwise)
3. Ensuring exercise substitutions are appropriate
4. Preserving the warmup and cooldown structure

{format_instructions}
`);

    const modificationChain = RunnableSequence.from([
      modificationPrompt,
      this.model,
      this.parser,
    ]);

    try {
      const result = await modificationChain.invoke({
        currentSession: JSON.stringify(currentSession, null, 2),
        modificationRequest,
        constraints: constraints ? JSON.stringify(constraints, null, 2) : 'None',
        format_instructions: this.parser.getFormatInstructions(),
      });

      return result;
    } catch (error) {
      console.error('Error modifying session:', error);
      throw new Error('Failed to modify workout session');
    }
  }

  async generateMinimalSession(
    focus: string,
    timeLimit: number,
    equipment: string[]
  ): Promise<WorkoutSession> {
    const minimalPrompt = PromptTemplate.fromTemplate(`
You are creating a time-efficient workout session with minimal equipment.

Requirements:
- Primary Focus: {focus}
- Time Limit: {timeLimit} minutes
- Available Equipment: {equipment}

Create a highly efficient session that:
1. Maximizes training effect in minimal time
2. Uses compound movements primarily
3. Includes only essential warmup and cooldown
4. Can be completed with limited equipment
5. Maintains safety and effectiveness

Prioritize:
- Multi-joint exercises
- Minimal rest periods (consider supersets)
- High training density
- Essential movement patterns

{format_instructions}
`);

    const minimalChain = RunnableSequence.from([
      minimalPrompt,
      this.model,
      this.parser,
    ]);

    try {
      const result = await minimalChain.invoke({
        focus,
        timeLimit,
        equipment: equipment.join(', ') || 'Bodyweight only',
        format_instructions: this.parser.getFormatInstructions(),
      });

      return result;
    } catch (error) {
      console.error('Error generating minimal session:', error);
      throw new Error('Failed to generate minimal workout session');
    }
  }
}