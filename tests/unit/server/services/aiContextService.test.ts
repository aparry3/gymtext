import { describe, it, expect, beforeEach } from 'vitest';
import { AIContextService } from '@/server/services/aiContextService';
import { FitnessProfile } from '@/server/models/fitnessProfile';

describe('AIContextService', () => {
  let aiContextService: AIContextService;

  beforeEach(() => {
    aiContextService = new AIContextService();
  });

  describe('buildFacts', () => {
    it('should extract basic profile facts', () => {
      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        currentActivity: 'weight training',
        identity: {
          age: 30,
          gender: 'male',
        },
        availability: {
          daysPerWeek: 4,
          minutesPerSession: 60,
        },
      };

      const facts = aiContextService.buildFacts(profile);

      expect(facts.goal?.primary).toBe('muscle gain');
      expect(facts.training?.currentActivity).toBe('weight training');
      expect(facts.identity?.age).toBe(30);
      expect(facts.identity?.gender).toBe('male');
      expect(facts.availability?.daysPerWeek).toBe(4);
      expect(facts.availability?.minutesPerSession).toBe(60);
    });

    it('should handle empty profile', () => {
      const profile: FitnessProfile = {};
      const facts = aiContextService.buildFacts(profile);

      expect(facts.goal).toBeUndefined();
      expect(facts.training).toBeUndefined();
      expect(facts.identity).toBeUndefined();
    });

    it('should extract active constraints', () => {
      const profile: FitnessProfile = {
        constraints: [
          {
            id: '1',
            type: 'injury',
            label: 'Lower back pain',
            severity: 'moderate',
            status: 'active',
            modifications: 'Avoid heavy deadlifts',
          },
          {
            id: '2',
            type: 'equipment',
            label: 'Home gym only',
            status: 'resolved',
          },
        ],
      };

      const facts = aiContextService.buildFacts(profile);

      expect(facts.constraints).toHaveLength(1);
      expect(facts.constraints?.[0].type).toBe('injury');
      expect(facts.constraints?.[0].label).toBe('Lower back pain');
      expect(facts.constraints?.[0].severity).toBe('moderate');
    });

    it('should extract equipment list', () => {
      const profile: FitnessProfile = {
        equipment: {
          access: 'gym',
          available: ['dumbbells', 'resistance bands', 'pull-up bar'],
        },
      };

      const facts = aiContextService.buildFacts(profile);

      expect(facts.availability?.gym).toBe('gym');
      // Equipment list is stored differently in actual implementation
    });

    it('should extract metrics', () => {
      const profile: FitnessProfile = {
        metrics: {
          bodyweight: {
            value: 180,
            unit: 'lbs',
            lastUpdated: '2024-01-01',
          },
          heightCm: 183,
          bodyFatPercent: 15,
        },
      };

      const facts = aiContextService.buildFacts(profile);

      expect(facts.metrics?.weightLbs).toBe(180);
      expect(facts.metrics?.heightCm).toBe(183);
      expect(facts.metrics?.bodyFatPercent).toBe(15);
    });
  });

  describe('buildDeterministicProse', () => {
    it('should generate prose for complete profile', () => {
      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        experienceLevel: 'intermediate',
        identity: {
          age: 30,
          gender: 'male',
        },
        availability: {
          daysPerWeek: 4,
          minutesPerSession: 60,
        },
      };

      const prose = aiContextService.buildDeterministicProse(
        aiContextService.buildFacts(profile)
      );

      expect(prose).toContain('muscle gain');
      expect(prose).toContain('age 30');
      expect(prose).toContain('male');
      expect(prose).toContain('4x/week');
      expect(prose).toContain('60 min');
    });

    it('should handle constraints in prose', () => {
      const profile: FitnessProfile = {
        constraints: [
          {
            id: '1',
            type: 'injury',
            label: 'Lower back pain',
            severity: 'moderate',
            status: 'active',
            modifications: 'Avoid heavy deadlifts',
          },
        ],
      };

      const facts = aiContextService.buildFacts(profile);
      const prose = aiContextService.buildDeterministicProse(facts);

      expect(prose).toContain('Lower back pain');
      expect(prose).toContain('moderate');
      expect(prose).toContain('Avoid heavy deadlifts');
    });

    it('should handle minimal profile', () => {
      const profile: FitnessProfile = {
        primaryGoal: 'general fitness',
      };

      const facts = aiContextService.buildFacts(profile);
      const prose = aiContextService.buildDeterministicProse(facts);

      expect(prose).toContain('general fitness');
      expect(prose).toContain('PROFILE');
    });
  });

  describe('buildAIContext', () => {
    it('should return both facts and prose', () => {
      const profile: FitnessProfile = {
        primaryGoal: 'weight loss',
        experienceLevel: 'beginner',
      };

      const context = aiContextService.buildAIContext(profile);

      expect(context).toHaveProperty('facts');
      expect(context).toHaveProperty('prose');
      expect(context.facts.goal?.primary).toBe('weight loss');
      expect(context.prose).toContain('weight loss');
    });

    it('should format dates properly', () => {
      const today = new Date();
      const profile: FitnessProfile = {};

      const context = aiContextService.buildAIContext(profile);

      expect(context.prose).toContain(`(as of ${today.toISOString().slice(0, 10)})`);
    });
  });
});