import { z } from 'zod';

export const WorkoutCategoryTag = z.enum([
  'strength', 'hypertrophy', 'power', 'cardio', 'hiit', 'conditioning',
  'mobility', 'flexibility', 'active_recovery', 'rest', 'sport',
  'mindfulness', 'assessment', 'rehab'
]);

export const WorkoutSplitTag = z.enum([
  'push', 'pull', 'legs', 'upper', 'lower', 'full_body',
  'core', 'arms', 'back', 'chest', 'shoulders'
]);

export const WorkoutMuscleTag = z.enum([
  'quads', 'hamstrings', 'glutes', 'calves',
  'chest', 'lats', 'traps', 'rhomboids', 'rear_delts',
  'front_delts', 'side_delts', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'hip_flexors', 'erectors'
]);

export const WorkoutPatternTag = z.enum([
  'squat', 'hinge', 'press', 'row', 'pullup', 'pulldown',
  'lunge', 'carry', 'rotation', 'anti_extension', 'anti_rotation',
  'jump', 'sprint', 'gait'
]);

export const WorkoutEquipmentTag = z.enum([
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine',
  'bodyweight', 'bands', 'pullup_bar', 'bench', 'no_equipment'
]);

export const WorkoutTagsSchema = z.object({
  category: z.array(WorkoutCategoryTag).describe("What kind of session (over-tag: include all that apply)"),
  split: z.array(WorkoutSplitTag).describe("Training split / body regions (over-tag: include all that apply)"),
  muscles: z.array(WorkoutMuscleTag).describe("Primary muscle groups targeted (over-tag: be generous)"),
  patterns: z.array(WorkoutPatternTag).describe("Movement patterns present in the workout"),
  equipment: z.array(WorkoutEquipmentTag).describe("Equipment used in the workout"),
});

export type WorkoutTags = z.infer<typeof WorkoutTagsSchema>;

export function flattenWorkoutTags(tags: WorkoutTags): string[] {
  return [
    ...tags.category.map(t => `category:${t}`),
    ...tags.split.map(t => `split:${t}`),
    ...tags.muscles.map(t => `muscle:${t}`),
    ...tags.patterns.map(t => `pattern:${t}`),
    ...tags.equipment.map(t => `equipment:${t}`),
  ];
}
