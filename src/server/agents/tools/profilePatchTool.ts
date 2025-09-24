import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FitnessProfileSchema } from '@/server/models/user/schemas';
import type { FitnessProfile, ActivityData } from '@/server/models/user/schemas';

// Use a more flexible type for activity merging to avoid strict union type issues
type AnyActivity = {
  type: string;
  experienceLevel?: string;
  keyMetrics?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  equipment?: string[];
  goals?: string[];
  experience?: string;
  lastUpdated?: Date;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- Allow other activity-specific fields
};

/**
 * Merge activity data arrays, preserving existing activities and updating/adding new ones
 */
function mergeActivityData(
  current: ActivityData = [], 
  newActivity: AnyActivity
): ActivityData {
  // Use any typing to avoid strict union type conflicts
  let currentArray: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  if (!Array.isArray(current)) {
    // Handle backwards compatibility - convert single activity to array
    currentArray = current ? [current] : [];
  } else {
    currentArray = current as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  // Find existing activity of same type
  const existingIndex = currentArray.findIndex(
    (activity: any) => activity.type === newActivity.type // eslint-disable-line @typescript-eslint/no-explicit-any
  );
  
  if (existingIndex >= 0) {
    // Update existing activity (merge metrics, goals, etc.)
    const existing = currentArray[existingIndex];
    const updated = {
      ...existing,
      ...newActivity,
      // Merge arrays instead of overwriting
      equipment: [
        ...(existing.equipment || []), 
        ...(newActivity.equipment || [])
      ].filter((item: string, index: number, arr: string[]) => arr.indexOf(item) === index), // Remove duplicates
      goals: [
        ...(existing.goals || []), 
        ...(newActivity.goals || [])
      ].filter((item: string, index: number, arr: string[]) => arr.indexOf(item) === index), // Remove duplicates
      keyMetrics: { 
        ...(existing.keyMetrics || {}), 
        ...(newActivity.keyMetrics || {}) 
      },
      lastUpdated: new Date()
    };
    
    const result = [...currentArray];
    result[existingIndex] = updated;
    return result as ActivityData;
  } else {
    // Add new activity type
    return [...currentArray, { ...newActivity, lastUpdated: new Date() }] as ActivityData;
  }
}

/**
 * Tool for updating user fitness profiles based on conversation context
 * This tool is used by the UserProfileAgent to patch profiles when new information is provided
 * 
 * Simplified version that works with partial objects - no database operations
 */
export const profilePatchTool = tool(
  async ({ currentProfile, updates, reason, confidence }) => {
    try {
      // Handle activityData array merging locally for compatibility
      const processedUpdates = { ...updates };
      if (updates.activityData) {
        if (!Array.isArray(updates.activityData)) {
          // Convert single activity to array format for consistency
          processedUpdates.activityData = [updates.activityData] as ActivityData;
        }

        const currentActivities = currentProfile.activityData || [];
        
        // Clean and sanitize activity data before merging  
        const sanitizedActivities = (processedUpdates.activityData || []).map((activity: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any  
          // Remove null values from keyMetrics
          if (activity.keyMetrics) {
            const cleanKeyMetrics: Record<string, unknown> = {};  
            for (const [key, value] of Object.entries(activity.keyMetrics)) {
              if (value !== null && value !== undefined) {
                cleanKeyMetrics[key] = value;
              }
            }
            activity.keyMetrics = Object.keys(cleanKeyMetrics).length > 0 ? cleanKeyMetrics : undefined;
          }
          
          // Ensure arrays are properly defined
          activity.equipment = Array.isArray(activity.equipment) ? activity.equipment : [];
          activity.goals = Array.isArray(activity.goals) ? activity.goals : [];
          
          return activity;
        });
        
        // Merge each sanitized activity
        const mergedActivityData = sanitizedActivities.reduce(
          (acc: ActivityData, newActivity: AnyActivity) => mergeActivityData(acc, newActivity),
          currentActivities
        );
        
        processedUpdates.activityData = mergedActivityData;
      }

      // For now, just handle the patching logic locally until we refactor to use service methods
      // Check confidence threshold (raised to 0.75)
      const CONFIDENCE_THRESHOLD = 0.75;
      
      if (confidence < CONFIDENCE_THRESHOLD) {
        console.log(`Profile update skipped - low confidence: ${confidence} < ${CONFIDENCE_THRESHOLD}`);
        return {
          applied: false,
          reason: 'Low confidence',
          confidence,
          threshold: CONFIDENCE_THRESHOLD,
          updatedProfile: currentProfile
        };
      }

      // Merge updates into current profile
      const updatedProfile: Partial<FitnessProfile> = {
        ...currentProfile,
        ...processedUpdates
      };

      // Get list of fields that were updated
      const fieldsUpdated = Object.keys(processedUpdates).filter(key => 
        processedUpdates[key as keyof FitnessProfile] !== undefined
      );

      console.log(`Profile update applied:`, {
        confidence,
        reason,
        fieldsUpdated
      });

      return {
        applied: true,
        updatedProfile,
        fieldsUpdated,
        confidence,
        reason
      };

    } catch (error) {
      console.error('Profile patch tool error:', error);
      
      return {
        applied: false,
        reason: 'Update failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedProfile: currentProfile
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
      
      Only use this tool when the user explicitly provides new information with high confidence (≥0.75).
      Do not use for questions, hypotheticals, or uncertain statements.`,
    schema: z.object({
      currentProfile: FitnessProfileSchema.partial().describe(
        'The current user fitness profile state'
      ),
      updates: FitnessProfileSchema.partial().describe(
        'The specific profile fields to update based on user information'
      ),
      reason: z.string().describe(
        'Brief explanation of why these updates are being made (e.g., "User stated they now train 5 days a week")'
      ),
      confidence: z.number().min(0).max(1).describe(
        'Confidence score from 0-1. Use 0.9-1.0 for direct statements, 0.7-0.89 for clear implications, 0.75+ required for updates.'
      )
    })
  }
);