import type { WorkoutDetails } from '@gymtext/shared'

export const FLEXIBLE_WORKOUT_PREVIEW: WorkoutDetails = {
  date: '2026-02-25',
  dayOfWeek: 'Wednesday',
  focus: 'Flexible Schema Preview',
  title: 'Dynamic Workout Panel',
  description: 'Preview data used when flexible workout details are not available yet.',
  estimatedDuration: 55,
  exerciseGroups: [
    {
      block: 'warmup',
      structure: 'circuit',
      title: 'Prep Circuit',
      rounds: 2,
      groupDisplay: [
        { key: 'rounds', label: 'Rounds', value: '2', emphasis: 'primary' },
        { key: 'rest', label: 'Rest', value: '60 sec', emphasis: 'secondary' },
      ],
      movements: [
        {
          name: 'Air Squat',
          display: [{ key: 'reps', label: 'Reps', value: '12', emphasis: 'primary' }],
          tracking: [{ key: 'reps', label: 'Reps', type: 'number', defaultValue: 12, required: true }],
        },
        {
          name: 'Glute Bridge',
          display: [{ key: 'reps', label: 'Reps', value: '10', emphasis: 'primary' }],
          tracking: [{ key: 'reps', label: 'Reps', type: 'number', defaultValue: 10, required: true }],
        },
      ],
    },
    {
      block: 'main',
      structure: 'straight-sets',
      title: 'Bench Press',
      notes: 'Use smooth tempo and keep bar path consistent.',
      movements: [
        {
          name: 'Barbell Bench Press',
          display: [
            { key: 'set-1', label: 'Set 1', value: '5 reps @ 135 lbs', emphasis: 'secondary', meta: 'warmup' },
            { key: 'set-2', label: 'Set 2', value: '5 reps @ 155 lbs', emphasis: 'secondary', meta: 'warmup' },
            { key: 'set-3', label: 'Set 3', value: '5 reps @ 185 lbs', emphasis: 'primary', meta: 'working' },
            { key: 'set-4', label: 'Set 4', value: '5 reps @ 185 lbs', emphasis: 'primary', meta: 'working' },
            { key: 'rest', label: 'Rest', value: '2 min', emphasis: 'secondary' },
          ],
          tracking: [
            { key: 'weight', label: 'Weight', type: 'number', unit: 'lbs', required: true },
            { key: 'reps', label: 'Reps', type: 'number', required: true },
          ],
        },
      ],
    },
    {
      block: 'conditioning',
      structure: 'amrap',
      title: '10 Minute AMRAP',
      groupDisplay: [{ key: 'time-cap', label: 'Time Cap', value: '10 min', emphasis: 'primary' }],
      groupTracking: [{ key: 'rounds', label: 'Rounds Completed', type: 'number', required: true }],
      movements: [
        {
          name: 'Push-ups',
          display: [{ key: 'reps', label: 'Reps', value: '10', emphasis: 'primary' }],
          tracking: [],
        },
        {
          name: 'Air Squats',
          display: [{ key: 'reps', label: 'Reps', value: '15', emphasis: 'primary' }],
          tracking: [],
        },
      ],
    },
    {
      block: 'cooldown',
      structure: 'for-time',
      title: 'Skill Finisher',
      movements: [
        {
          name: 'Free Throw Practice',
          display: [{ key: 'total-shots', label: 'Total Shots', value: '100', emphasis: 'primary' }],
          tracking: [
            { key: 'shots-attempted', label: 'Attempted', type: 'number', required: true, defaultValue: 100 },
            { key: 'shots-made', label: 'Made', type: 'number', required: true },
          ],
        },
      ],
    },
  ],
}
