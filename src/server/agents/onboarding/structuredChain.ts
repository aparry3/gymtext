import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { FitnessProfile } from '../../models/fitnessProfile';

// Define the structured output schema for profile extraction
export const ProfileExtractionSchema = z.object({
  reply: z.string().describe('Natural conversational response to the user'),
  profileUpdate: z.object({
    type: z.enum(['mergePatch', 'op']).describe('Type of update'),
    patch: z.object({
      primaryGoal: z.string().optional(),
      specificObjective: z.string().optional(),
      eventDate: z.string().optional(),
      experienceLevel: z.string().optional(),
      currentActivity: z.string().optional(),
      currentTraining: z.object({
        programName: z.string().optional(),
        weeksCompleted: z.number().optional(),
        focus: z.string().optional(),
        notes: z.string().optional(),
      }).optional(),
      availability: z.object({
        daysPerWeek: z.number().optional(),
        minutesPerSession: z.number().optional(),
        preferredTimes: z.string().optional(),
      }).optional(),
      equipment: z.object({
        access: z.string().optional(),
        location: z.string().optional(),
        items: z.array(z.string()).optional(),
      }).optional(),
      preferences: z.object({
        workoutStyle: z.string().optional(),
        enjoyedExercises: z.array(z.string()).optional(),
        dislikedExercises: z.array(z.string()).optional(),
        coachingTone: z.enum(['friendly', 'tough-love', 'clinical', 'cheerleader']).optional(),
      }).optional(),
      metrics: z.object({
        heightCm: z.number().optional(),
        bodyweight: z.object({
          value: z.number(),
          unit: z.enum(['lbs', 'kg']),
        }).optional(),
        bodyFatPercent: z.number().optional(),
      }).optional(),
      identity: z.object({
        age: z.number().optional(),
        gender: z.string().optional(),
      }).optional(),
      constraints: z.array(z.object({
        type: z.enum(['injury', 'equipment', 'schedule', 'mobility', 'preference', 'other']),
        label: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe']).optional(),
        modifications: z.string().optional(),
      })).optional(),
    }).optional(),
    op: z.object({
      kind: z.enum(['add_constraint', 'update_constraint', 'resolve_constraint', 'set']),
      constraint: z.object({
        type: z.enum(['injury', 'equipment', 'schedule', 'mobility', 'preference', 'other']),
        label: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe']).optional(),
        modifications: z.string().optional(),
        startDate: z.string().optional(),
      }).optional(),
      id: z.string().optional(),
      path: z.string().optional(),
      value: z.any().optional(),
    }).optional(),
  }).optional(),
  confidence: z.number().min(0).max(1).describe('Confidence in extracted information'),
  nextQuestion: z.string().optional().describe('Suggested follow-up question'),
});

export type ProfileExtraction = z.infer<typeof ProfileExtractionSchema>;

export const enhancedOnboardingPrompt = `You are a friendly fitness coach assistant for GYMTEXT conducting an onboarding conversation.

Your task is to:
1. Have a natural conversation to understand the user's fitness profile
2. Extract structured information from their responses
3. Generate appropriate follow-up questions

IMPORTANT: You must output your response as a JSON object with this exact structure:
{
  "reply": "Your natural conversational response to the user (keep under 150 words for SMS)",
  "profileUpdate": {
    "type": "mergePatch",
    "patch": {
      // Include any profile fields you can extract from the user's message
      // Only include fields that were explicitly mentioned or confirmed
      // Common fields:
      "primaryGoal": "string", // e.g., "weight loss", "muscle gain", "recomp", "endurance"
      "specificObjective": "string", // e.g., "lose 20 pounds", "run a marathon"
      "experienceLevel": "string", // e.g., "beginner", "intermediate", "advanced"
      "availability": {
        "daysPerWeek": number, // e.g., 3, 4, 5
        "minutesPerSession": number // e.g., 45, 60, 90
      },
      "equipment": {
        "access": "string", // e.g., "Planet Fitness", "home gym", "minimal"
        "items": ["string"] // e.g., ["dumbbells", "barbell", "pull-up bar"]
      },
      "preferences": {
        "workoutStyle": "string", // e.g., "heavy lifting", "circuit training", "cardio"
        "enjoyedExercises": ["string"],
        "dislikedExercises": ["string"]
      },
      "metrics": {
        "bodyweight": { "value": number, "unit": "lbs" or "kg" },
        "heightCm": number
      },
      "identity": {
        "age": number,
        "gender": "string"
      }
    }
  },
  "confidence": 0.0-1.0, // Your confidence in the extracted information
  "nextQuestion": "Optional suggested follow-up question"
}

For constraints (injuries, limitations), use the op form instead:
{
  "reply": "...",
  "profileUpdate": {
    "type": "op",
    "op": {
      "kind": "add_constraint",
      "constraint": {
        "type": "injury", // or "equipment", "schedule", "mobility", "preference", "other"
        "label": "Description of the constraint",
        "severity": "mild" | "moderate" | "severe",
        "modifications": "How to work around it"
      }
    }
  },
  "confidence": 0.8
}

Rules:
- Only extract information explicitly stated or strongly implied by the user
- Never invent or assume facts not provided
- Keep your reply conversational and under 150 words
- If you need clarification, include a nextQuestion
- Be encouraging and supportive in your tone

Current conversation context:
{conversationHistory}

User message: {userMessage}`;

export class EnhancedOnboardingAgent {
  private llm: ChatGoogleGenerativeAI;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      temperature: 0.7,
      model: 'gemini-2.0-flash',
      maxOutputTokens: 1000,
    });
  }

  /**
   * Process a message and extract profile information
   */
  async processMessage(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ProfileExtraction> {
    // Build conversation history string
    const conversationHistory = history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Build the prompt
    const prompt = enhancedOnboardingPrompt
      .replace('{conversationHistory}', conversationHistory || 'No previous messages')
      .replace('{userMessage}', userMessage);

    try {
      // Get response from LLM
      const response = await this.llm.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);

      // Try to parse as JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback if no JSON found
        return {
          reply: content.slice(0, 500), // Truncate for safety
          confidence: 0.5,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate against schema (with lenient parsing)
      const result = ProfileExtractionSchema.safeParse(parsed);
      
      if (result.success) {
        return result.data;
      } else {
        // Return partial result with reply at least
        return {
          reply: parsed.reply || content.slice(0, 500),
          profileUpdate: parsed.profileUpdate,
          confidence: parsed.confidence || 0.5,
          nextQuestion: parsed.nextQuestion,
        };
      }
    } catch (error) {
      console.error('Error in enhanced onboarding agent:', error);
      
      // Fallback response
      return {
        reply: "I understand. Let me help you build your fitness profile. Could you tell me more about your main fitness goal?",
        confidence: 0,
      };
    }
  }

  /**
   * Stream response for real-time UI updates
   */
  async *streamResponse(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    // For streaming, we'll process normally but yield the reply in chunks
    const result = await this.processMessage(userMessage, history);
    
    // Yield the reply in chunks for streaming effect
    const chunkSize = 20;
    for (let i = 0; i < result.reply.length; i += chunkSize) {
      yield result.reply.slice(i, i + chunkSize);
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for effect
    }
  }
}