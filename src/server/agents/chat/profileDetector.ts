import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ProfileUpdateOp } from '../../models/fitnessProfile';

// Schema for SMS profile detection
export const SMSProfileExtractionSchema = z.object({
  reply: z.string().describe('Concise SMS response (under 160 chars)'),
  detectedUpdates: z.array(z.object({
    type: z.enum(['constraint_add', 'constraint_resolve', 'metric_update', 'preference_change', 'goal_change', 'availability_change']),
    data: z.any(),
    confidence: z.number().min(0).max(1),
    description: z.string(),
  })).optional(),
  requiresConfirmation: z.boolean(),
});

export type SMSProfileExtraction = z.infer<typeof SMSProfileExtractionSchema>;

const profileDetectionPrompt = `You are a fitness coach assistant analyzing SMS messages for profile updates.

Your task is to:
1. Detect if the user is reporting any profile-relevant information
2. Generate a concise SMS response (under 160 characters)
3. Extract structured updates with confidence scores

Output JSON format:
{
  "reply": "Your SMS response (keep under 160 chars)",
  "detectedUpdates": [
    {
      "type": "constraint_add", // or constraint_resolve, metric_update, etc.
      "data": { /* structured data */ },
      "confidence": 0.0-1.0,
      "description": "What was detected"
    }
  ],
  "requiresConfirmation": true/false
}

Update types and their data structures:

constraint_add: User reports new injury/limitation
{
  "type": "injury", // or "equipment", "schedule", "mobility", "preference"
  "label": "Description",
  "severity": "mild" | "moderate" | "severe",
  "modifications": "How to work around it"
}

constraint_resolve: User reports recovery
{
  "constraintId": "id_or_description",
  "endDate": "YYYY-MM-DD"
}

metric_update: Weight, measurements, PRs
{
  "bodyweight": { "value": number, "unit": "lbs" | "kg" },
  "prLifts": { "exercise": "weight x reps" }
}

goal_change: New goals or objectives
{
  "primaryGoal": "string",
  "specificObjective": "string"
}

availability_change: Schedule changes
{
  "daysPerWeek": number,
  "minutesPerSession": number
}

preference_change: Likes/dislikes
{
  "workoutStyle": "string",
  "enjoyedExercises": ["string"],
  "dislikedExercises": ["string"]
}

Detection rules:
- Only extract explicitly stated information
- High confidence (>0.8) for clear statements
- Medium confidence (0.5-0.8) for implied information
- Low confidence (<0.5) for ambiguous statements
- Set requiresConfirmation=true for important changes (injuries, major goals)

Current user profile context:
{profileContext}

Conversation history:
{conversationHistory}

User message: {userMessage}`;

export class ProfileDetector {
  private llm: ChatGoogleGenerativeAI;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      temperature: 0.3, // Lower temperature for more consistent extraction
      model: 'gemini-2.0-flash',
      maxOutputTokens: 500,
    });
  }

  /**
   * Detect profile updates in SMS message
   */
  async detectUpdates(
    userMessage: string,
    profileContext: string,
    conversationHistory?: string
  ): Promise<SMSProfileExtraction> {
    const prompt = profileDetectionPrompt
      .replace('{profileContext}', profileContext)
      .replace('{conversationHistory}', conversationHistory || 'No recent messages')
      .replace('{userMessage}', userMessage);

    try {
      const response = await this.llm.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          reply: "Got it, thanks for the update!",
          requiresConfirmation: false,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const result = SMSProfileExtractionSchema.safeParse(parsed);

      if (result.success) {
        return result.data;
      } else {
        return {
          reply: parsed.reply || "Thanks for the update!",
          detectedUpdates: parsed.detectedUpdates,
          requiresConfirmation: parsed.requiresConfirmation || false,
        };
      }
    } catch (error) {
      console.error('Error detecting profile updates:', error);
      return {
        reply: "Got it, thanks!",
        requiresConfirmation: false,
      };
    }
  }

  /**
   * Convert detected updates to profile operations
   */
  convertToOps(detectedUpdates: SMSProfileExtraction['detectedUpdates']): ProfileUpdateOp[] {
    if (!detectedUpdates) return [];

    const ops: ProfileUpdateOp[] = [];

    for (const update of detectedUpdates) {
      // Only process high-confidence updates
      if (update.confidence < 0.7) continue;

      switch (update.type) {
        case 'constraint_add':
          ops.push({
            kind: 'add_constraint',
            constraint: update.data,
          });
          break;

        case 'constraint_resolve':
          ops.push({
            kind: 'resolve_constraint',
            id: update.data.constraintId,
            endDate: update.data.endDate,
          });
          break;

        case 'metric_update':
          if (update.data.bodyweight) {
            ops.push({
              kind: 'set',
              path: '/metrics/bodyweight',
              value: update.data.bodyweight,
            });
          }
          if (update.data.prLifts) {
            for (const [exercise, value] of Object.entries(update.data.prLifts)) {
              ops.push({
                kind: 'set',
                path: `/metrics/prLifts/${exercise}`,
                value: value,
              });
            }
          }
          break;

        case 'goal_change':
          if (update.data.primaryGoal) {
            ops.push({
              kind: 'set',
              path: '/primaryGoal',
              value: update.data.primaryGoal,
            });
          }
          if (update.data.specificObjective) {
            ops.push({
              kind: 'set',
              path: '/specificObjective',
              value: update.data.specificObjective,
            });
          }
          break;

        case 'availability_change':
          if (update.data.daysPerWeek) {
            ops.push({
              kind: 'set',
              path: '/availability/daysPerWeek',
              value: update.data.daysPerWeek,
            });
          }
          if (update.data.minutesPerSession) {
            ops.push({
              kind: 'set',
              path: '/availability/minutesPerSession',
              value: update.data.minutesPerSession,
            });
          }
          break;

        case 'preference_change':
          if (update.data.workoutStyle) {
            ops.push({
              kind: 'set',
              path: '/preferences/workoutStyle',
              value: update.data.workoutStyle,
            });
          }
          if (update.data.enjoyedExercises) {
            ops.push({
              kind: 'set',
              path: '/preferences/enjoyedExercises',
              value: update.data.enjoyedExercises,
            });
          }
          if (update.data.dislikedExercises) {
            ops.push({
              kind: 'set',
              path: '/preferences/dislikedExercises',
              value: update.data.dislikedExercises,
            });
          }
          break;
      }
    }

    return ops;
  }
}