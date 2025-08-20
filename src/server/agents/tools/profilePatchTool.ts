import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ProfilePatchService } from '@/server/services/profilePatchService';
import { FitnessProfileSchema } from '@/server/models/user/schemas';
import type { FitnessProfile } from '@/server/models/userModel';

/**
 * Tool for updating user fitness profiles based on conversation context
 * This tool is used by the UserProfileAgent to patch profiles when new information is provided
 */
export const profilePatchTool = tool(
  async ({ updates, reason, confidence }, config) => {
    try {
      // Check confidence threshold (default 0.5)
      const CONFIDENCE_THRESHOLD = 0.5;
      
      if (confidence < CONFIDENCE_THRESHOLD) {
        console.log(`Profile update skipped - low confidence: ${confidence} < ${CONFIDENCE_THRESHOLD}`);
        return {
          applied: false,
          reason: 'Low confidence',
          confidence,
          threshold: CONFIDENCE_THRESHOLD
        };
      }

      // Get userId from config
      const userId = config?.configurable?.userId;
      
      if (!userId) {
        console.error('Profile patch tool called without userId in config');
        return {
          applied: false,
          reason: 'Missing userId',
          error: 'userId not provided in config'
        };
      }

      // Initialize the patch service
      const patchService = new ProfilePatchService();
      
      // Log the update attempt
      console.log(`Attempting profile update for user ${userId}:`, {
        confidence,
        reason,
        fieldsUpdated: Object.keys(updates)
      });

      // Apply the profile patch
      const updatedUser = await patchService.patchProfile(
        userId,
        updates,
        {
          source: 'chat',
          reason,
          path: 'profilePatchTool'
        }
      );

      // Get summary of updated fields
      const fieldsUpdated = patchService.getUpdateSummary(updates);

      console.log(`Profile successfully updated for user ${userId}:`, fieldsUpdated);

      return {
        applied: true,
        updatedProfile: updatedUser.parsedProfile,
        fieldsUpdated,
        confidence,
        reason
      };

    } catch (error) {
      console.error('Profile patch tool error:', error);
      
      return {
        applied: false,
        reason: 'Update failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  {
    name: 'update_user_profile',
    description: `Update the user's fitness profile when they provide new information about:
      - Training availability (days per week, session duration, preferred times)
      - Equipment access or gym membership (home gym, commercial gym, minimal equipment)
      - Fitness goals or objectives (strength, muscle gain, fat loss, endurance)
      - Physical metrics (weight, height, body fat percentage)
      - Constraints or injuries (mobility issues, injuries, time constraints)
      - Preferences for workout style (powerlifting, bodybuilding, crossfit, etc.)
      - Experience level (beginner, intermediate, advanced)
      
      Only use this tool when the user explicitly provides new information with high confidence (>0.5).
      Do not use for questions, hypotheticals, or uncertain statements.`,
    schema: z.object({
      updates: FitnessProfileSchema.partial().describe(
        'The specific profile fields to update based on user information'
      ),
      reason: z.string().describe(
        'Brief explanation of why these updates are being made (e.g., "User stated they now train 5 days a week")'
      ),
      confidence: z.number().min(0).max(1).describe(
        'Confidence score from 0-1. Use 0.9-1.0 for direct statements, 0.7-0.89 for clear implications, 0.5-0.69 for moderate confidence. Below 0.5 will not update.'
      )
    })
  }
);

/**
 * Helper function to determine confidence level for different types of statements
 */
export function assessConfidence(statement: string): number {
  // Direct, present-tense statements
  const directPatterns = [
    /^i (now |currently )?train/i,
    /^i go to .* gym/i,
    /^i have .* equipment/i,
    /^my goal is/i,
    /^i weigh/i,
    /^i am \d+ (years old|cm|feet)/i,
    /^i want to/i
  ];

  // Past tense statements indicating change
  const changePatterns = [
    /^i (just |recently )?joined/i,
    /^i (just |recently )?started/i,
    /^i (just |recently )?bought/i,
    /^i switched to/i,
    /^i changed my/i
  ];

  // Uncertain or hypothetical statements
  const uncertainPatterns = [
    /maybe/i,
    /might/i,
    /possibly/i,
    /thinking about/i,
    /considering/i,
    /what if/i,
    /should i/i,
    /could i/i,
    /\?$/
  ];

  // Check for uncertainty first
  if (uncertainPatterns.some(pattern => pattern.test(statement))) {
    return 0.3; // Low confidence
  }

  // Check for direct statements
  if (directPatterns.some(pattern => pattern.test(statement))) {
    return 0.95; // Very high confidence
  }

  // Check for change statements
  if (changePatterns.some(pattern => pattern.test(statement))) {
    return 0.85; // High confidence
  }

  // Default moderate confidence for other statements
  return 0.6;
}

/**
 * Helper to extract specific updates from a message
 */
export function extractProfileUpdates(message: string): Partial<FitnessProfile> {
  const updates: Partial<FitnessProfile> = {};

  // Extract training frequency
  const daysMatch = message.match(/(\d+)\s*days?\s*(a|per)?\s*week/i);
  if (daysMatch) {
    updates.availability = {
      ...updates.availability,
      daysPerWeek: parseInt(daysMatch[1])
    };
  }

  // Extract session duration
  const minutesMatch = message.match(/(\d+)\s*minutes?\s*(per|each)?\s*session/i);
  if (minutesMatch) {
    updates.availability = {
      ...updates.availability,
      minutesPerSession: parseInt(minutesMatch[1])
    };
  }

  // Extract gym membership
  if (/planet fitness|gold'?s? gym|la fitness|anytime fitness/i.test(message)) {
    updates.equipment = {
      ...updates.equipment,
      access: 'full-gym' as const
    };
  }

  // Extract goals
  const goalPatterns: Record<string, FitnessProfile['primaryGoal']> = {
    'get stronger': 'strength',
    'build muscle': 'muscle-gain',
    'lose weight': 'fat-loss',
    'lose fat': 'fat-loss',
    'improve endurance': 'endurance',
    'get fit': 'general-fitness'
  };

  for (const [pattern, goal] of Object.entries(goalPatterns)) {
    if (message.toLowerCase().includes(pattern)) {
      updates.primaryGoal = goal;
      break;
    }
  }

  return updates;
}