import { describe, it, expect } from 'vitest';
import { formatSignupDataForLLM } from './signupDataFormatter';
import type { SignupData } from '@/server/repositories/onboardingRepository';

describe('formatSignupDataForLLM', () => {
  describe('Schedule & Availability', () => {
    it('includes elaboration when desiredDaysPerWeek is undefined', () => {
      const data: SignupData = {
        availabilityElaboration: 'I do pilates Wed/Thu, want to lift 4 other days',
      };
      const result = formatSignupDataForLLM(data);
      expect(result).toContain('Schedule & Availability');
      expect(result).toContain('I do pilates Wed/Thu, want to lift 4 other days');
    });

    it('includes both days and elaboration when both present', () => {
      const data: SignupData = {
        desiredDaysPerWeek: '4_per_week',
        availabilityElaboration: 'Prefer mornings',
      };
      const result = formatSignupDataForLLM(data);
      expect(result).toContain('4 days per week');
      expect(result).toContain('Prefer mornings');
    });

    it('includes only days when no elaboration', () => {
      const data: SignupData = {
        desiredDaysPerWeek: '3_per_week',
      };
      const result = formatSignupDataForLLM(data);
      expect(result).toContain('3 days per week');
      expect(result).not.toContain('Additional details');
    });

    it('omits section when neither days nor elaboration present', () => {
      const data: SignupData = {
        primaryGoals: ['strength'],
      };
      const result = formatSignupDataForLLM(data);
      expect(result).not.toContain('Schedule & Availability');
    });
  });

  describe('Equipment mappings', () => {
    it('maps kettlebells correctly', () => {
      const data: SignupData = { equipment: ['kettlebells'] };
      const result = formatSignupDataForLLM(data);
      expect(result).toContain('Kettlebells');
    });

    it('maps cable_machine correctly', () => {
      const data: SignupData = { equipment: ['cable_machine'] };
      const result = formatSignupDataForLLM(data);
      expect(result).toContain('Cable machine');
    });
  });
});
