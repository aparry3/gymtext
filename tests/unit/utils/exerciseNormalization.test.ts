import { describe, it, expect } from 'vitest';
import { normalizeForLex } from '../../../packages/shared/src/server/utils/exerciseNormalization';

describe('normalizeForLex', () => {
  it('handles synonym: laying → lying', () => {
    expect(normalizeForLex('Laying Leg Curls')).toBe('curl leg lying');
  });

  it('handles synonym: dumbell → dumbbell', () => {
    expect(normalizeForLex('Dumbell Bench Press')).toBe('bench dumbbell press');
  });

  it('handles abbreviation: RDL → romanian deadlift', () => {
    expect(normalizeForLex('RDL')).toBe('deadlift romanian');
  });

  it('handles abbreviation: DB → dumbbell', () => {
    expect(normalizeForLex('DB Bench Press')).toBe('bench dumbbell press');
  });

  it('handles abbreviation: BB → barbell', () => {
    expect(normalizeForLex('BB Squat')).toBe('barbell squat');
  });

  it('strips digits and special chars', () => {
    expect(normalizeForLex('3/4 Sit-Up')).toBe('sit up');
  });

  it('ensures token order invariance', () => {
    expect(normalizeForLex('Leg Curl Lying')).toBe(normalizeForLex('Lying Leg Curl'));
  });

  it('removes stopwords', () => {
    expect(normalizeForLex('Press with Dumbbells')).toBe('dumbbell press');
  });

  it('singularizes plurals: curls → curl', () => {
    expect(normalizeForLex('Bicep Curls')).toBe('bicep curl');
  });

  it('singularizes: presses → press', () => {
    expect(normalizeForLex('Bench Presses')).toBe('bench press');
  });

  it('singularizes: raises → raise', () => {
    expect(normalizeForLex('Lateral Raises')).toBe('lateral raise');
  });

  it('singularizes irregular: calves → calf', () => {
    expect(normalizeForLex('Standing Calf Raises')).toBe('calf raise standing');
  });

  it('handles compound words: pullup → pull up', () => {
    expect(normalizeForLex('Pullup')).toBe('pull up');
  });

  it('handles compound words: pushup → push up', () => {
    expect(normalizeForLex('Pushup')).toBe('push up');
  });

  it('deduplicates tokens', () => {
    expect(normalizeForLex('Dumbbell DB Press')).toBe('dumbbell press');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeForLex('')).toBe('');
  });

  it('returns empty string for stopword-only input', () => {
    expect(normalizeForLex('with the and')).toBe('');
  });

  it('handles hyphens as word separators', () => {
    expect(normalizeForLex('T-Bar Row')).toBe('bar row t');
  });

  it('preserves word "press" without over-singularizing', () => {
    expect(normalizeForLex('Bench Press')).toBe('bench press');
  });

  it('handles incline/decline abbreviations', () => {
    expect(normalizeForLex('Incl DB Press')).toBe('dumbbell incline press');
    expect(normalizeForLex('Decl Bench Press')).toBe('bench decline press');
  });
});
