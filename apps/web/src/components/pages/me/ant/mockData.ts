// BlockItem v3 types (design-first, close to schema)
export interface Block {
  id: string;
  label: string;
}

export interface Detail {
  text: string;
  type: 'instruction' | 'note' | 'context' | 'warning';
}

export interface FeedbackField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
}

export interface WorkoutItem {
  blockId: string;
  name: string;
  short_detail: string;
  details?: Detail[];
  notes?: string;
  items?: NestedItem[];
  feedbackFields?: FeedbackField[];
  feedbackRows?: Record<string, any>[];
}

export interface NestedItem {
  name: string;
  short_detail: string;
  details?: Detail[];
}

export interface Workout {
  blocks: Block[];
  items: WorkoutItem[];
}

// Traditional Strength Training
export const strengthWorkout: Workout = {
  blocks: [
    { id: 'block-warmup', label: 'Warmup' },
    { id: 'block-main', label: 'Main Lifts' },
    { id: 'block-accessory', label: 'Accessory Work' },
    { id: 'block-cooldown', label: 'Cooldown' },
  ],
  items: [
    {
      blockId: 'block-warmup',
      name: 'Treadmill Walk',
      short_detail: '5 min',
      details: [{ text: '3.0-3.5 mph at 1% incline', type: 'context' }],
    },
    {
      blockId: 'block-warmup',
      name: 'Leg Swings',
      short_detail: '2×10',
      details: [
        { text: 'Front-to-back and side-to-side', type: 'note' },
      ],
    },
    {
      blockId: 'block-warmup',
      name: 'Arm Circles',
      short_detail: '2×10',
      details: [{ text: 'Start small, increase size', type: 'note' }],
    },
    {
      blockId: 'block-main',
      name: 'Barbell Back Squat',
      short_detail: '5×5 @ 225 lbs',
      details: [
        { text: 'Brace core, keep chest up', type: 'note' },
        { text: 'Knees tracking over toes', type: 'warning' },
      ],
      notes: 'Last session: 5×5 @ 215 lbs. Add 10 lbs this week.',
      feedbackFields: [
        { key: 'weight', label: 'Weight', type: 'number', required: true },
        { key: 'reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { weight: 135, reps: 5 },
        { weight: 185, reps: 5 },
        { weight: 205, reps: 5 },
        { weight: 225, reps: 5 },
        { weight: 225, reps: 5 },
      ],
    },
    {
      blockId: 'block-main',
      name: 'Barbell Bench Press',
      short_detail: '5×5 @ 185 lbs',
      details: [
        { text: 'Retract shoulder blades', type: 'note' },
        { text: 'Use spotter for heavy sets', type: 'warning' },
      ],
      notes: 'Last session: 5×5 @ 180 lbs. Focus on control.',
      feedbackFields: [
        { key: 'weight', label: 'Weight', type: 'number', required: true },
        { key: 'reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { weight: 95, reps: 10 },
        { weight: 135, reps: 5 },
        { weight: 165, reps: 5 },
        { weight: 185, reps: 5 },
        { weight: 185, reps: 4 },
      ],
    },
    {
      blockId: 'block-accessory',
      name: 'Romanian Deadlift',
      short_detail: '3×10 @ 135 lbs',
      details: [{ text: 'Hinge at hips, bar close to legs', type: 'note' }],
      feedbackFields: [
        { key: 'weight', label: 'Weight', type: 'number', required: true },
        { key: 'reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { weight: 135, reps: 10 },
        { weight: 135, reps: 10 },
        { weight: 135, reps: 9 },
      ],
    },
    {
      blockId: 'block-accessory',
      name: 'Dumbbell Row',
      short_detail: '3×12 @ 40 lbs',
      details: [{ text: 'Pull to hip, squeeze at top', type: 'note' }],
      feedbackFields: [
        { key: 'weight', label: 'Weight', type: 'number', required: true },
        { key: 'reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { weight: 40, reps: 12 },
        { weight: 40, reps: 12 },
        { weight: 40, reps: 11 },
      ],
    },
    {
      blockId: 'block-cooldown',
      name: 'Foam Rolling — Quads',
      short_detail: '60 sec',
      details: [{ text: 'Roll hip to knee', type: 'note' }],
    },
    {
      blockId: 'block-cooldown',
      name: 'Child\'s Pose',
      short_detail: '60 sec',
    },
  ],
};

// Bodybuilding Supersets
export const supersetWorkout: Workout = {
  blocks: [
    { id: 'block-warmup', label: 'Warmup' },
    { id: 'block-main', label: 'Supersets — Chest & Triceps' },
    { id: 'block-cooldown', label: 'Cooldown' },
  ],
  items: [
    {
      blockId: 'block-warmup',
      name: 'Treadmill',
      short_detail: '5 min',
      details: [{ text: '3.5-4.0 mph at 2% incline', type: 'context' }],
    },
    {
      blockId: 'block-warmup',
      name: 'Push-ups',
      short_detail: '2×15',
      details: [{ text: 'Chest activation', type: 'note' }],
    },
    {
      blockId: 'block-main',
      name: 'Superset A',
      short_detail: '4 rounds',
      details: [
        { text: 'A1 → rest 30s → A2 → rest 90s = 1 round', type: 'context' },
      ],
      notes: 'Keep rest times tight for hypertrophy.',
      items: [
        {
          name: 'Barbell Bench Press',
          short_detail: '4×10 @ 135 lbs',
          details: [{ text: 'Lower to mid-chest', type: 'note' }],
        },
        {
          name: 'Close-Grip Bench Press',
          short_detail: '4×12 @ 95 lbs',
          details: [{ text: 'Shoulder-width, focus on triceps', type: 'note' }],
        },
      ],
      feedbackFields: [
        { key: 'bench_weight', label: 'Bench', type: 'number', required: true },
        { key: 'bench_reps', label: 'Reps', type: 'number', required: true },
        { key: 'cg_weight', label: 'CGBP', type: 'number', required: true },
        { key: 'cg_reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { bench_weight: 135, bench_reps: 10, cg_weight: 95, cg_reps: 12 },
        { bench_weight: 135, bench_reps: 10, cg_weight: 95, cg_reps: 12 },
        { bench_weight: 135, bench_reps: 10, cg_weight: 95, cg_reps: 11 },
        { bench_weight: 135, bench_reps: 9, cg_weight: 95, cg_reps: 10 },
      ],
    },
    {
      blockId: 'block-main',
      name: 'Superset B',
      short_detail: '4 rounds',
      details: [
        { text: 'Upper chest + triceps isolation', type: 'context' },
      ],
      items: [
        {
          name: 'Incline Dumbbell Press',
          short_detail: '4×12 @ 40 lbs',
          details: [{ text: 'Bench 30-45°', type: 'note' }],
        },
        {
          name: 'Tricep Pushdowns',
          short_detail: '4×15 @ 50 lbs',
          details: [{ text: 'Elbows pinned to sides', type: 'note' }],
        },
      ],
      feedbackFields: [
        { key: 'incline_weight', label: 'Incline', type: 'number', required: true },
        { key: 'incline_reps', label: 'Reps', type: 'number', required: true },
        { key: 'push_weight', label: 'Pushdown', type: 'number', required: true },
        { key: 'push_reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { incline_weight: 40, incline_reps: 12, push_weight: 50, push_reps: 15 },
        { incline_weight: 40, incline_reps: 12, push_weight: 50, push_reps: 15 },
        { incline_weight: 40, incline_reps: 11, push_weight: 50, push_reps: 14 },
        { incline_weight: 40, incline_reps: 10, push_weight: 50, push_reps: 12 },
      ],
    },
    {
      blockId: 'block-main',
      name: 'Superset C',
      short_detail: '3 rounds',
      items: [
        {
          name: 'Cable Flyes',
          short_detail: '3×15 @ 25 lbs',
          details: [{ text: 'Squeeze at peak contraction', type: 'note' }],
        },
        {
          name: 'Overhead Tricep Extension',
          short_detail: '3×12 @ 30 lbs',
          details: [{ text: 'Elbows close to head', type: 'note' }],
        },
      ],
      feedbackFields: [
        { key: 'fly_weight', label: 'Fly', type: 'number', required: true },
        { key: 'fly_reps', label: 'Reps', type: 'number', required: true },
        { key: 'ext_weight', label: 'Extension', type: 'number', required: true },
        { key: 'ext_reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        { fly_weight: 25, fly_reps: 15, ext_weight: 30, ext_reps: 12 },
        { fly_weight: 25, fly_reps: 15, ext_weight: 30, ext_reps: 12 },
        { fly_weight: 25, fly_reps: 14, ext_weight: 30, ext_reps: 11 },
      ],
    },
    {
      blockId: 'block-cooldown',
      name: 'Chest Stretch',
      short_detail: '30 sec/side',
    },
    {
      blockId: 'block-cooldown',
      name: 'Tricep Stretch',
      short_detail: '30 sec/side',
    },
  ],
};

// CrossFit AMRAP
export const amrapWorkout: Workout = {
  blocks: [
    { id: 'block-warmup', label: 'Warmup' },
    { id: 'block-main', label: 'AMRAP 15' },
    { id: 'block-cooldown', label: 'Cooldown' },
  ],
  items: [
    {
      blockId: 'block-warmup',
      name: 'Dynamic Warmup',
      short_detail: '5 min',
      details: [{ text: 'Focus on quality, not speed', type: 'note' }],
    },
    {
      blockId: 'block-main',
      name: 'AMRAP 15',
      short_detail: '15 min',
      details: [
        { text: 'Scale weight or movements as needed', type: 'warning' },
      ],
      notes: 'Push hard! You\'ve been progressing well on thrusters.',
      items: [
        { name: 'Thrusters', short_detail: '10 @ 95 lbs' },
        { name: 'Pull-ups', short_detail: '10' },
        { name: 'Box Jumps', short_detail: '15 @ 24 in' },
      ],
      feedbackFields: [
        { key: 'rounds', label: 'Rounds', type: 'number', required: true },
      ],
      feedbackRows: [{ rounds: '' }],
    },
    {
      blockId: 'block-cooldown',
      name: 'Walk + Stretch',
      short_detail: '8 min',
      details: [{ text: 'Focus on deep breathing', type: 'note' }],
    },
  ],
};
