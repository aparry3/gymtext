import { describe, it, expect } from 'vitest';
import { flattenWorkoutTags, WorkoutTagsSchema, type WorkoutTags } from './tags';

describe('flattenWorkoutTags', () => {
  it('should flatten all tag categories with correct prefixes', () => {
    const tags: WorkoutTags = {
      category: ['strength', 'hypertrophy'],
      split: ['push', 'upper'],
      muscles: ['chest', 'triceps', 'front_delts'],
      patterns: ['press'],
      equipment: ['barbell', 'dumbbell'],
    };

    const result = flattenWorkoutTags(tags);

    expect(result).toEqual([
      'category:strength',
      'category:hypertrophy',
      'split:push',
      'split:upper',
      'muscle:chest',
      'muscle:triceps',
      'muscle:front_delts',
      'pattern:press',
      'equipment:barbell',
      'equipment:dumbbell',
    ]);
  });

  it('should handle empty arrays', () => {
    const tags: WorkoutTags = {
      category: [],
      split: [],
      muscles: [],
      patterns: [],
      equipment: [],
    };

    const result = flattenWorkoutTags(tags);
    expect(result).toEqual([]);
  });

  it('should handle single items per category', () => {
    const tags: WorkoutTags = {
      category: ['cardio'],
      split: ['full_body'],
      muscles: ['quads'],
      patterns: ['squat'],
      equipment: ['bodyweight'],
    };

    const result = flattenWorkoutTags(tags);

    expect(result).toEqual([
      'category:cardio',
      'split:full_body',
      'muscle:quads',
      'pattern:squat',
      'equipment:bodyweight',
    ]);
  });
});

describe('WorkoutTagsSchema', () => {
  it('should validate a correct tags object', () => {
    const tags = {
      category: ['strength'],
      split: ['upper'],
      muscles: ['chest', 'triceps'],
      patterns: ['press'],
      equipment: ['barbell'],
    };

    const result = WorkoutTagsSchema.safeParse(tags);
    expect(result.success).toBe(true);
  });

  it('should reject invalid tag values', () => {
    const tags = {
      category: ['invalid_category'],
      split: ['upper'],
      muscles: ['chest'],
      patterns: ['press'],
      equipment: ['barbell'],
    };

    const result = WorkoutTagsSchema.safeParse(tags);
    expect(result.success).toBe(false);
  });
});
