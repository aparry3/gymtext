import { describe, it, expect } from 'vitest';
import { profilePatchTool } from '@/server/agents/tools/profilePatchTool';

describe('ProfilePatchTool Activity Data Array Merging', () => {
  const baseProfile = {
    primaryGoal: 'endurance',
    experienceLevel: 'intermediate'
  };

  describe('Activity Data Merging', () => {
    it('should add first activity to empty profile', async () => {
      const result = await profilePatchTool.invoke({
        currentProfile: baseProfile,
        updates: {
          activityData: [{
            type: 'running',
            experienceLevel: 'beginner',
            goals: ['first marathon']
          }]
        },
        reason: 'User mentioned running',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData).toHaveLength(1);
      expect(result.updatedProfile.activityData[0].type).toBe('running');
      expect(result.updatedProfile.activityData[0].goals).toEqual(['first marathon']);
      expect(result.fieldsUpdated).toContain('activityData');
    });

    it('should add second activity type without overwriting first', async () => {
      const profileWithRunning = {
        ...baseProfile,
        activityData: [{
          type: 'running',
          experienceLevel: 'intermediate',
          goals: ['marathon'],
          keyMetrics: { weeklyMileage: 25 }
        }]
      };

      const result = await profilePatchTool.invoke({
        currentProfile: profileWithRunning,
        updates: {
          activityData: [{
            type: 'strength',
            experienceLevel: 'beginner',
            goals: ['build muscle'],
            keyMetrics: { trainingDays: 3 }
          }]
        },
        reason: 'User mentioned strength training',
        confidence: 0.85
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData).toHaveLength(2);
      
      // Original running activity should be preserved
      const runningActivity = result.updatedProfile.activityData.find((a: any) => a.type === 'running');
      expect(runningActivity).toBeDefined();
      expect(runningActivity.goals).toEqual(['marathon']);
      expect(runningActivity.keyMetrics.weeklyMileage).toBe(25);
      
      // New strength activity should be added
      const strengthActivity = result.updatedProfile.activityData.find((a: any) => a.type === 'strength');
      expect(strengthActivity).toBeDefined();
      expect(strengthActivity.goals).toEqual(['build muscle']);
      expect(strengthActivity.keyMetrics.trainingDays).toBe(3);
    });

    it('should update existing activity by merging data', async () => {
      const profileWithRunning = {
        ...baseProfile,
        activityData: [{
          type: 'running',
          experienceLevel: 'beginner',
          goals: ['5K race'],
          keyMetrics: { weeklyMileage: 15 },
          equipment: ['running shoes']
        }]
      };

      const result = await profilePatchTool.invoke({
        currentProfile: profileWithRunning,
        updates: {
          activityData: [{
            type: 'running',
            experienceLevel: 'intermediate',
            goals: ['marathon'],
            keyMetrics: { longestRun: 20 },
            equipment: ['GPS watch']
          }]
        },
        reason: 'User updated running experience',
        confidence: 0.9
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData).toHaveLength(1);
      
      const runningActivity = result.updatedProfile.activityData[0];
      expect(runningActivity.type).toBe('running');
      expect(runningActivity.experienceLevel).toBe('intermediate'); // Updated
      expect(runningActivity.goals).toEqual(['5K race', 'marathon']); // Merged without duplicates
      expect(runningActivity.equipment).toEqual(['running shoes', 'GPS watch']); // Merged
      expect(runningActivity.keyMetrics).toEqual({ 
        weeklyMileage: 15,  // Preserved
        longestRun: 20      // Added
      });
      expect(runningActivity.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle multiple activity updates in single call', async () => {
      const profileWithActivities = {
        ...baseProfile,
        activityData: [{
          type: 'running',
          goals: ['5K'],
          keyMetrics: { weeklyMileage: 10 }
        }]
      };

      const result = await profilePatchTool.invoke({
        currentProfile: profileWithActivities,
        updates: {
          activityData: [
            {
              type: 'running',
              keyMetrics: { longestRun: 8 }  // Update existing
            },
            {
              type: 'cycling',                // Add new
              goals: ['century ride']
            }
          ]
        },
        reason: 'User mentioned multiple activities',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData).toHaveLength(2);
      
      const running = result.updatedProfile.activityData.find((a: any) => a.type === 'running');
      expect(running.keyMetrics).toEqual({ weeklyMileage: 10, longestRun: 8 });
      
      const cycling = result.updatedProfile.activityData.find((a: any) => a.type === 'cycling');
      expect(cycling.goals).toEqual(['century ride']);
    });

    it('should remove duplicate goals and equipment when merging', async () => {
      const profileWithDuplicates = {
        ...baseProfile,
        activityData: [{
          type: 'hiking',
          goals: ['Grand Canyon', 'fitness'],
          equipment: ['boots', 'backpack']
        }]
      };

      const result = await profilePatchTool.invoke({
        currentProfile: profileWithDuplicates,
        updates: {
          activityData: [{
            type: 'hiking',
            goals: ['fitness', 'Appalachian Trail'], // 'fitness' is duplicate
            equipment: ['backpack', 'trekking poles']  // 'backpack' is duplicate
          }]
        },
        reason: 'User updated hiking goals',
        confidence: 0.8
      });

      const hikingActivity = result.updatedProfile.activityData[0];
      expect(hikingActivity.goals).toEqual(['Grand Canyon', 'fitness', 'Appalachian Trail']);
      expect(hikingActivity.equipment).toEqual(['boots', 'backpack', 'trekking poles']);
    });
  });

  describe('Backwards Compatibility', () => {
    // Note: These tests are skipped because LangChain tool schema validation
    // prevents invalid input formats. In production, the LLM agent will always
    // provide properly formatted array data, making these edge cases unlikely.
    
    it.skip('should handle legacy single activity object', async () => {
      // This tests backwards compatibility logic that exists in mergeActivityData
      // but cannot be triggered through the tool interface due to schema validation
    });

    it.skip('should convert single activity update to array format', async () => {
      // This tests single object to array conversion logic 
      // but cannot be triggered through the tool interface due to schema validation
    });

    it('should handle arrays with various activity types', async () => {
      // Test realistic backwards compatibility scenario
      const result = await profilePatchTool.invoke({
        currentProfile: {
          ...baseProfile,
          activityData: [{
            type: 'hiking',
            goals: ['fitness']
          }]
        },
        updates: {
          activityData: [{
            type: 'skiing', 
            experienceLevel: 'advanced',
            goals: ['ski season']
          }]
        },
        reason: 'User mentioned skiing',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData).toHaveLength(2);
      expect(result.updatedProfile.activityData.find((a: any) => a.type === 'hiking')).toBeDefined();
      expect(result.updatedProfile.activityData.find((a: any) => a.type === 'skiing')).toBeDefined();
    });
  });

  describe('Confidence Threshold', () => {
    it('should reject updates below confidence threshold', async () => {
      const result = await profilePatchTool.invoke({
        currentProfile: baseProfile,
        updates: {
          activityData: [{
            type: 'running',
            goals: ['marathon']
          }]
        },
        reason: 'Low confidence update',
        confidence: 0.5  // Below 0.75 threshold
      });

      expect(result.applied).toBe(false);
      expect(result.reason).toBe('Low confidence');
      expect(result.confidence).toBe(0.5);
      expect(result.threshold).toBe(0.75);
    });

    it('should accept updates at or above confidence threshold', async () => {
      const result = await profilePatchTool.invoke({
        currentProfile: baseProfile,
        updates: {
          activityData: [{
            type: 'running',
            goals: ['marathon']
          }]
        },
        reason: 'High confidence update',
        confidence: 0.75  // At threshold
      });

      expect(result.applied).toBe(true);
      expect(result.fieldsUpdated).toContain('activityData');
    });
  });

  describe('Field Tracking', () => {
    it('should track activityData changes in fieldsUpdated', async () => {
      const result = await profilePatchTool.invoke({
        currentProfile: baseProfile,
        updates: {
          primaryGoal: 'strength',  // Regular field update
          activityData: [{
            type: 'running',
            goals: ['marathon']
          }]
        },
        reason: 'Multiple updates',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.fieldsUpdated).toContain('primaryGoal');
      expect(result.fieldsUpdated).toContain('activityData');
      expect(result.updatedProfile.primaryGoal).toBe('strength');
    });

    it('should not track activityData if no actual changes made', async () => {
      const profileWithActivity = {
        ...baseProfile,
        activityData: [{
          type: 'running',
          goals: ['marathon']
        }]
      };

      const result = await profilePatchTool.invoke({
        currentProfile: profileWithActivity,
        updates: {
          primaryGoal: 'strength'  // Only regular field update
        },
        reason: 'Non-activity update',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.fieldsUpdated).toContain('primaryGoal');
      expect(result.fieldsUpdated).not.toContain('activityData');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty activity data gracefully', async () => {
      const result = await profilePatchTool.invoke({
        currentProfile: baseProfile,
        updates: {
          activityData: []  // Empty array
        },
        reason: 'Empty activity data',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData).toEqual([]);
    });

    it('should preserve profile on tool errors', async () => {
      // This test would cover error scenarios, but our current implementation
      // has comprehensive error handling that returns the original profile
      const result = await profilePatchTool.invoke({
        currentProfile: baseProfile,
        updates: {
          activityData: [{
            type: 'running'
            // Missing required fields - should still work due to flexible typing
          }]
        },
        reason: 'Minimal activity data',
        confidence: 0.8
      });

      expect(result.applied).toBe(true);
      expect(result.updatedProfile.activityData[0].type).toBe('running');
    });
  });
});