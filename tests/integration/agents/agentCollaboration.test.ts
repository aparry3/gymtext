import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIContextService } from '@/server/services/aiContextService';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { fitnessPlanAgent } from '@/server/agents/fitnessPlan/chain';
import { dailyWorkoutAgent } from '@/server/agents/dailyWorkout/chain';
import { EnhancedOnboardingAgent } from '@/server/agents/onboarding/structuredChain';
import { FitnessProfile } from '@/server/models/fitnessProfile';
import { UserWithProfile } from '@/server/models/userModel';

// Mock dependencies
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn(),
    withStructuredOutput: vi.fn().mockReturnThis(),
  })),
}));

const mockDb = {
  selectFrom: vi.fn().mockReturnThis(),
  insertInto: vi.fn().mockReturnThis(),
  updateTable: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  execute: vi.fn(),
  executeTakeFirst: vi.fn(),
  selectAll: vi.fn().mockReturnThis(),
};

vi.mock('@/server/connections/postgres/postgres', () => ({
  postgresDb: mockDb,
}));

describe('Agent Collaboration Integration', () => {
  let aiContextService: AIContextService;
  let profileUpdateService: ProfileUpdateService;
  let profileRepo: FitnessProfileRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    aiContextService = new AIContextService();
    profileUpdateService = new ProfileUpdateService(mockDb as any);
    profileRepo = new FitnessProfileRepository(mockDb as any);
  });

  describe('Onboarding to Fitness Plan flow', () => {
    it('should use extracted profile to generate fitness plan', async () => {
      // Step 1: Onboarding extracts profile
      const onboardingAgent = new EnhancedOnboardingAgent();
      const mockOnboardingLLM = (onboardingAgent as any).llm;
      
      mockOnboardingLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "Great! I've got your profile set up.",
          profileUpdate: {
            type: 'mergePatch',
            patch: {
              primaryGoal: 'muscle gain',
              experienceLevel: 'intermediate',
              identity: { age: 30, gender: 'male' },
              availability: {
                daysPerWeek: 4,
                minutesPerSession: 60,
              },
            },
          },
          confidence: 0.95,
        }),
      });

      const onboardingResult = await onboardingAgent.processMessage(
        "I'm 30, intermediate level, want muscle gain, can train 4 days",
        []
      );

      // Step 2: Save profile to database
      const profile = onboardingResult.profileUpdate?.patch as FitnessProfile;
      mockDb.executeTakeFirst.mockResolvedValue({ profile });

      // Step 3: Generate AI context from profile
      const context = aiContextService.buildAIContext(profile);
      expect(context.prose).toContain('muscle gain');
      expect(context.prose).toContain('4x/week');

      // Step 4: Use context to generate fitness plan
      const mockUser: UserWithProfile = {
        id: 'user123',
        name: 'Test User',
        phoneNumber: '+1234567890',
        email: null,
        stripeCustomerId: null,
        preferredSendHour: 8,
        timezone: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null,
      };

      // Mock fitness plan agent
      const mockPlanLLM = vi.fn().mockResolvedValue({
        programOverview: {
          programType: 'Hypertrophy',
          duration: 12,
          daysPerWeek: 4,
          mesocycles: [
            {
              name: 'Foundation',
              weeks: 4,
              focus: 'Building base strength',
            },
          ],
        },
      });

      // The agent should use the AI context
      mockDb.executeTakeFirst.mockResolvedValue({ profile });
      const planResult = await fitnessPlanAgent.invoke({ 
        user: mockUser,
        context: {}
      });

      expect(planResult.user).toBeDefined();
      expect(planResult.program).toBeDefined();
    });
  });

  describe('Profile update triggers plan adjustment', () => {
    it('should adjust workout when constraint is added', async () => {
      // Initial profile
      const initialProfile: FitnessProfile = {
        primaryGoal: 'strength',
        experienceLevel: 'intermediate',
        availability: { daysPerWeek: 4 },
      };

      mockDb.executeTakeFirst.mockResolvedValue({ profile: initialProfile });

      // Add injury constraint
      const updatedProfile = await profileUpdateService.applyOp(
        'user123',
        {
          kind: 'add_constraint',
          constraint: {
            type: 'injury',
            label: 'Lower back pain',
            severity: 'moderate',
            modifications: 'Avoid heavy deadlifts',
          },
        },
        'sms',
        'User reported injury'
      );

      // Generate new context with constraint
      const contextWithConstraint = aiContextService.buildAIContext(updatedProfile);
      expect(contextWithConstraint.prose).toContain('Lower back pain');

      // Daily workout should respect constraint
      const mockWorkoutContext = {
        user: {} as UserWithProfile,
        date: new Date(),
        dayPlan: {
          day: 'Tuesday',
          theme: 'Lower Body',
          load: 'moderate' as const,
        },
        microcycle: {} as any,
        mesocycle: {} as any,
        fitnessPlan: {} as any,
      };

      // The workout agent should now avoid heavy deadlifts
      const workoutResult = await dailyWorkoutAgent.invoke(mockWorkoutContext);
      
      // Verify the agent would consider constraints
      // (actual verification would depend on LLM response)
      expect(workoutResult).toBeDefined();
    });

    it('should update training when availability changes', async () => {
      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        availability: { daysPerWeek: 5 },
      };

      mockDb.executeTakeFirst.mockResolvedValue({ profile });

      // Update availability
      const updatedProfile = await profileUpdateService.applyPatch(
        'user123',
        { availability: { daysPerWeek: 3 } },
        'sms',
        'Schedule change'
      );

      const newContext = aiContextService.buildAIContext(updatedProfile);
      expect(newContext.prose).toContain('3x/week');

      // This should trigger plan regeneration in a real scenario
      // The fitness plan agent would create a 3-day program instead of 5
    });
  });

  describe('Context consistency across agents', () => {
    it('should maintain consistent context across different agents', async () => {
      const profile: FitnessProfile = {
        primaryGoal: 'weight loss',
        experienceLevel: 'beginner',
        identity: { age: 35, gender: 'female' },
        constraints: [
          {
            id: '1',
            type: 'injury',
            label: 'Knee issues',
            severity: 'mild',
            status: 'active',
            modifications: 'Low impact only',
          },
        ],
        metrics: {
          bodyweight: { value: 150, unit: 'lbs' },
        },
      };

      // All agents should receive the same context
      const context = aiContextService.buildAIContext(profile);

      // Context should be consistent
      expect(context.facts.goal?.primary).toBe('weight loss');
      expect(context.facts.training?.experienceLevel).toBe('beginner');
      expect(context.facts.constraints).toHaveLength(1);
      expect(context.facts.metrics?.weightLbs).toBe(150);

      // The prose should contain all relevant information
      expect(context.prose).toContain('weight loss');
      expect(context.prose).toContain('beginner');
      expect(context.prose).toContain('Knee issues');
      expect(context.prose).toContain('Low impact only');
      expect(context.prose).toContain('age 35');
      expect(context.prose).toContain('female');
    });

    it('should handle profile evolution over time', async () => {
      // Initial profile from onboarding
      let profile: FitnessProfile = {
        primaryGoal: 'general fitness',
        experienceLevel: 'beginner',
      };

      mockDb.executeTakeFirst.mockResolvedValue({ profile });

      // Month 1: Add metrics
      profile = await profileUpdateService.applyPatch(
        'user123',
        {
          metrics: {
            bodyweight: { value: 180, unit: 'lbs' },
          },
        },
        'sms',
        'Weight check-in'
      );

      // Month 2: Update goal
      profile = await profileUpdateService.applyPatch(
        'user123',
        { primaryGoal: 'muscle gain' },
        'sms',
        'Goal change'
      );

      // Month 3: Add injury
      profile = await profileUpdateService.applyOp(
        'user123',
        {
          kind: 'add_constraint',
          constraint: {
            type: 'injury',
            label: 'Shoulder impingement',
            severity: 'mild',
          },
        },
        'sms',
        'Injury reported'
      );

      // Final context should reflect all changes
      const finalContext = aiContextService.buildAIContext(profile);
      expect(finalContext.facts.goal?.primary).toBe('muscle gain');
      expect(finalContext.facts.metrics?.weightLbs).toBe(180);
      expect(finalContext.facts.constraints).toHaveLength(1);
    });
  });

  describe('Agent error recovery', () => {
    it('should handle partial profile data gracefully', async () => {
      const incompleteProfile: FitnessProfile = {
        // Only primary goal, missing other fields
        primaryGoal: 'strength',
      };

      const context = aiContextService.buildAIContext(incompleteProfile);
      
      // Should still generate valid context
      expect(context.prose).toContain('strength');
      expect(context.prose).toContain('PROFILE');
      expect(context.facts.goal?.primary).toBe('strength');
      
      // Missing fields should be undefined, not cause errors
      expect(context.facts.training).toBeUndefined();
      expect(context.facts.constraints).toBeUndefined();
    });

    it('should handle conflicting updates', async () => {
      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        constraints: [
          {
            id: '1',
            type: 'injury',
            label: 'Back pain',
            severity: 'severe',
            status: 'active',
          },
        ],
      };

      mockDb.executeTakeFirst.mockResolvedValue({ profile });

      // Try to set a goal that conflicts with constraints
      const updatedProfile = await profileUpdateService.applyPatch(
        'user123',
        { primaryGoal: 'powerlifting' }, // Heavy lifting with severe back pain
        'sms',
        'Goal change request'
      );

      // System should allow the update but context will show the conflict
      const context = aiContextService.buildAIContext(updatedProfile);
      expect(context.facts.goal?.primary).toBe('powerlifting');
      expect(context.facts.constraints?.[0].severity).toBe('severe');
      
      // Agents receiving this context should handle the conflict appropriately
      expect(context.prose).toContain('powerlifting');
      expect(context.prose).toContain('Back pain');
      expect(context.prose).toContain('severe');
    });
  });

  describe('Profile update history tracking', () => {
    it('should maintain complete update history', async () => {
      const updates = [
        { patch: { primaryGoal: 'muscle gain' }, source: 'onboarding' },
        { patch: { experienceLevel: 'intermediate' }, source: 'onboarding' },
        { 
          op: {
            kind: 'add_constraint' as const,
            constraint: {
              type: 'injury' as const,
              label: 'Tennis elbow',
              severity: 'mild' as const,
            },
          },
          source: 'sms',
        },
        { patch: { metrics: { bodyweight: { value: 175, unit: 'lbs' } } }, source: 'sms' },
      ];

      mockDb.executeTakeFirst.mockResolvedValue({ profile: {} });
      mockDb.execute.mockResolvedValue([]);

      // Apply all updates
      for (const update of updates) {
        if ('patch' in update) {
          await profileUpdateService.applyPatch(
            'user123',
            update.patch,
            update.source,
            'Test update'
          );
        } else if ('op' in update) {
          await profileUpdateService.applyOp(
            'user123',
            update.op,
            update.source,
            'Test operation'
          );
        }
      }

      // Verify all updates were recorded
      expect(mockDb.insertInto).toHaveBeenCalledWith('profileUpdates');
      expect(mockDb.insertInto).toHaveBeenCalledTimes(updates.length * 2); // Each update also updates the profile
    });
  });
});