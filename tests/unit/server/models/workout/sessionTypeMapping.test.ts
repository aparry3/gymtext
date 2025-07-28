import { describe, it, expect } from 'vitest';
import {
  mapSessionType,
  isValidDBSessionType,
  SESSION_TYPE_MAP,
  DB_SESSION_TYPES,
  LLM_SESSION_TYPES,
  type DBSessionType,
  type LLMSessionType,
} from '@/server/models/workout/sessionTypeMapping';

describe('Session Type Mapping', () => {
  describe('mapSessionType', () => {
    it('should map LLM session types to DB session types correctly', () => {
      expect(mapSessionType('lift')).toBe('strength');
      expect(mapSessionType('run')).toBe('cardio');
      expect(mapSessionType('metcon')).toBe('cardio');
      expect(mapSessionType('mobility')).toBe('mobility');
      expect(mapSessionType('rest')).toBe('recovery');
      expect(mapSessionType('other')).toBe('recovery');
    });

    it('should default to recovery for unknown session types', () => {
      expect(mapSessionType('unknown')).toBe('recovery');
      expect(mapSessionType('yoga')).toBe('recovery');
      expect(mapSessionType('')).toBe('recovery');
    });

    it('should handle all LLM session types', () => {
      // Ensure all LLM types are mapped
      LLM_SESSION_TYPES.forEach((llmType) => {
        const mapped = mapSessionType(llmType);
        expect(DB_SESSION_TYPES).toContain(mapped);
      });
    });
  });

  describe('isValidDBSessionType', () => {
    it('should validate correct DB session types', () => {
      expect(isValidDBSessionType('strength')).toBe(true);
      expect(isValidDBSessionType('cardio')).toBe(true);
      expect(isValidDBSessionType('mobility')).toBe(true);
      expect(isValidDBSessionType('recovery')).toBe(true);
      expect(isValidDBSessionType('assessment')).toBe(true);
      expect(isValidDBSessionType('deload')).toBe(true);
    });

    it('should reject invalid DB session types', () => {
      expect(isValidDBSessionType('lift')).toBe(false);
      expect(isValidDBSessionType('run')).toBe(false);
      expect(isValidDBSessionType('metcon')).toBe(false);
      expect(isValidDBSessionType('rest')).toBe(false);
      expect(isValidDBSessionType('unknown')).toBe(false);
      expect(isValidDBSessionType('')).toBe(false);
    });
  });

  describe('SESSION_TYPE_MAP constant', () => {
    it('should contain all required mappings', () => {
      expect(SESSION_TYPE_MAP).toHaveProperty('lift', 'strength');
      expect(SESSION_TYPE_MAP).toHaveProperty('run', 'cardio');
      expect(SESSION_TYPE_MAP).toHaveProperty('metcon', 'cardio');
      expect(SESSION_TYPE_MAP).toHaveProperty('mobility', 'mobility');
      expect(SESSION_TYPE_MAP).toHaveProperty('rest', 'recovery');
      expect(SESSION_TYPE_MAP).toHaveProperty('other', 'recovery');
    });

    it('should only map to valid DB types', () => {
      Object.values(SESSION_TYPE_MAP).forEach((dbType) => {
        expect(DB_SESSION_TYPES).toContain(dbType);
      });
    });
  });

  describe('Type arrays', () => {
    it('should have correct DB session types', () => {
      expect(DB_SESSION_TYPES).toEqual([
        'strength',
        'cardio',
        'mobility',
        'recovery',
        'assessment',
        'deload',
      ]);
    });

    it('should have correct LLM session types', () => {
      expect(LLM_SESSION_TYPES).toEqual([
        'run',
        'lift',
        'metcon',
        'mobility',
        'rest',
        'other',
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle case sensitivity by defaulting to recovery', () => {
      expect(mapSessionType('LIFT')).toBe('recovery');
      expect(mapSessionType('Lift')).toBe('recovery');
      expect(mapSessionType('RUN')).toBe('recovery');
    });

    it('should handle null/undefined by defaulting to recovery', () => {
      expect(mapSessionType(null as any)).toBe('recovery');
      expect(mapSessionType(undefined as any)).toBe('recovery');
    });

    it('should handle numeric input by defaulting to recovery', () => {
      expect(mapSessionType(123 as any)).toBe('recovery');
      expect(mapSessionType(0 as any)).toBe('recovery');
    });
  });
});