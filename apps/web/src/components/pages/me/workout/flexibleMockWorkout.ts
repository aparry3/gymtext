import type { WorkoutDetails } from '@gymtext/shared'

/**
 * Preview data for the V4 blocks + items schema.
 * Used as fallback when real workout details aren't available.
 */
export const FLEXIBLE_WORKOUT_PREVIEW: WorkoutDetails = {
  date: '2026-02-25',
  dayOfWeek: 'Wednesday',
  focus: 'Flexible Schema Preview',
  title: 'Dynamic Workout Panel',
  description: 'Preview data used when flexible workout details are not available yet.',
  estimatedDuration: 55,
  blocks: [
    { id: 'warmup', label: 'Prep Circuit' },
    { id: 'main', label: 'Main Lift' },
    { id: 'conditioning', label: 'Conditioning' },
    { id: 'cooldown', label: 'Cooldown' },
  ],
  items: [
    {
      blockId: 'warmup',
      name: 'Warmup Circuit',
      short_detail: '2 rounds',
      items: [
        { name: 'Air Squat', short_detail: '12 reps' },
        { name: 'Glute Bridge', short_detail: '10 reps' },
      ],
    },
    {
      blockId: 'main',
      name: 'Barbell Bench Press',
      short_detail: '4x5',
      details: [
        { text: 'Smooth tempo, consistent bar path', type: 'note' },
        { text: 'Rest: 2 min', type: 'context' },
      ],
      feedbackFields: [
        { key: 'set', label: 'Set', type: 'number', editable: false },
        { key: 'reps', label: 'Reps', type: 'number', required: true },
        { key: 'weight', label: 'Weight', type: 'number', required: true },
        { key: 'units', label: 'Units', type: 'select', options: ['lb', 'kg'], required: true },
      ],
      feedbackRows: [
        [['set', '1'], ['reps', '5'], ['weight', '135'], ['units', 'lb']],
        [['set', '2'], ['reps', '5'], ['weight', '155'], ['units', 'lb']],
        [['set', '3'], ['reps', '5'], ['weight', '185'], ['units', 'lb']],
        [['set', '4'], ['reps', '5'], ['weight', '185'], ['units', 'lb']],
      ],
    },
    {
      blockId: 'conditioning',
      name: '10 Minute AMRAP',
      short_detail: '10 min',
      feedbackFields: [
        { key: 'rounds', label: 'Rounds Completed', type: 'number', required: true },
      ],
      feedbackRows: [
        [['rounds', '']],
      ],
      items: [
        { name: 'Push-ups', short_detail: '10 reps' },
        { name: 'Air Squats', short_detail: '15 reps' },
      ],
    },
    {
      blockId: 'cooldown',
      name: 'Free Throw Practice',
      short_detail: '100 shots',
      feedbackFields: [
        { key: 'attempted', label: 'Attempted', type: 'number', required: true },
        { key: 'made', label: 'Made', type: 'number', required: true },
      ],
      feedbackRows: [
        [['attempted', '100'], ['made', '']],
      ],
    },
  ],
}
