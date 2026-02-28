// Mock data for the Plan page - fresh design, not tied to existing schemas

export interface PlanTag {
  label: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';
}

export interface WeekSnapshot {
  day: string; // Mon, Tue, etc.
  type: 'strength' | 'cardio' | 'mobility' | 'rest' | 'hiit';
  label?: string;
}

export interface Plan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverGradient: [string, string]; // from, to colors
  coverEmoji: string;
  duration: string; // e.g. "12 weeks"
  frequency: string; // e.g. "4x/week"
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  tags: PlanTag[];
  weekSnapshot: WeekSnapshot[];
  highlights: string[];
  rating: number; // 0-5
  enrolledCount: number;
  featured?: boolean;
  category: string;
}

const TAG_COLORS: Record<string, PlanTag['color']> = {
  Strength: 'blue',
  Hypertrophy: 'purple',
  Cardio: 'green',
  HIIT: 'red',
  Mobility: 'teal',
  Running: 'green',
  'Full Body': 'orange',
  Powerlifting: 'blue',
  Bodyweight: 'teal',
  Endurance: 'green',
  Flexibility: 'teal',
  Athletic: 'orange',
  Recovery: 'teal',
};

function tag(label: string): PlanTag {
  return { label, color: TAG_COLORS[label] || 'blue' };
}

export const PLAN_CATEGORIES = [
  'All',
  'Strength',
  'Running',
  'HIIT',
  'Mobility',
  'Sport-Specific',
] as const;

export const MOCK_PLANS: Plan[] = [
  {
    id: 'strength-foundations',
    title: 'Strength Foundations',
    subtitle: 'Build your base',
    description:
      'A structured program focusing on the big compound lifts. Perfect for those new to strength training or returning after time off. Progressive overload built in.',
    coverGradient: ['#1e3a5f', '#2d6a9f'],
    coverEmoji: '🏋️',
    duration: '8 weeks',
    frequency: '3x/week',
    level: 'Beginner',
    tags: [tag('Strength'), tag('Full Body')],
    weekSnapshot: [
      { day: 'Mon', type: 'strength', label: 'Upper' },
      { day: 'Tue', type: 'rest' },
      { day: 'Wed', type: 'strength', label: 'Lower' },
      { day: 'Thu', type: 'rest' },
      { day: 'Fri', type: 'strength', label: 'Full' },
      { day: 'Sat', type: 'rest' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      'Squat, bench, deadlift progression',
      'Form-focused first 2 weeks',
      'Deload every 4th week',
    ],
    rating: 4.8,
    enrolledCount: 2340,
    featured: true,
    category: 'Strength',
  },
  {
    id: 'couch-to-10k',
    title: 'Couch to 10K',
    subtitle: 'From zero to distance',
    description:
      'Gradually build running endurance from walking intervals to a full 10K. Includes mobility work and cross-training days to keep you injury-free.',
    coverGradient: ['#1a5c3a', '#34a065'],
    coverEmoji: '🏃',
    duration: '12 weeks',
    frequency: '4x/week',
    level: 'Beginner',
    tags: [tag('Running'), tag('Cardio'), tag('Endurance')],
    weekSnapshot: [
      { day: 'Mon', type: 'cardio', label: 'Run' },
      { day: 'Tue', type: 'mobility', label: 'Stretch' },
      { day: 'Wed', type: 'cardio', label: 'Run' },
      { day: 'Thu', type: 'rest' },
      { day: 'Fri', type: 'cardio', label: 'Cross' },
      { day: 'Sat', type: 'cardio', label: 'Long Run' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      'Walk/run intervals → continuous',
      'Built-in mobility days',
      'Pace guidance each week',
    ],
    rating: 4.6,
    enrolledCount: 1870,
    category: 'Running',
  },
  {
    id: 'hiit-shred',
    title: 'HIIT Shred',
    subtitle: '20 min. Maximum effort.',
    description:
      'Short, brutal, effective. Bodyweight and minimal equipment HIIT circuits designed to torch calories and build functional conditioning.',
    coverGradient: ['#8b1a1a', '#d44444'],
    coverEmoji: '🔥',
    duration: '6 weeks',
    frequency: '5x/week',
    level: 'Intermediate',
    tags: [tag('HIIT'), tag('Bodyweight'), tag('Cardio')],
    weekSnapshot: [
      { day: 'Mon', type: 'hiit', label: 'Upper' },
      { day: 'Tue', type: 'hiit', label: 'Lower' },
      { day: 'Wed', type: 'hiit', label: 'Core' },
      { day: 'Thu', type: 'rest' },
      { day: 'Fri', type: 'hiit', label: 'Full' },
      { day: 'Sat', type: 'hiit', label: 'Finisher' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      'No equipment needed',
      'Under 25 min per session',
      'Tabata + AMRAP formats',
    ],
    rating: 4.5,
    enrolledCount: 3120,
    featured: true,
    category: 'HIIT',
  },
  {
    id: 'powerbuilding-intermediate',
    title: 'Powerbuilding',
    subtitle: 'Strength meets size',
    description:
      'Hybrid program combining powerlifting progression with hypertrophy volume. Heavy compounds early in the week, higher rep accessory work later.',
    coverGradient: ['#3d1a6e', '#7c3aed'],
    coverEmoji: '💪',
    duration: '10 weeks',
    frequency: '5x/week',
    level: 'Intermediate',
    tags: [tag('Strength'), tag('Hypertrophy'), tag('Powerlifting')],
    weekSnapshot: [
      { day: 'Mon', type: 'strength', label: 'Heavy Upper' },
      { day: 'Tue', type: 'strength', label: 'Heavy Lower' },
      { day: 'Wed', type: 'rest' },
      { day: 'Thu', type: 'strength', label: 'Volume Upper' },
      { day: 'Fri', type: 'strength', label: 'Volume Lower' },
      { day: 'Sat', type: 'strength', label: 'Arms/Weak' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      'RPE-based progression',
      'Weak point specialization day',
      'Peak test at week 10',
    ],
    rating: 4.9,
    enrolledCount: 1560,
    category: 'Strength',
  },
  {
    id: 'mobility-restore',
    title: 'Mobility Restore',
    subtitle: 'Move better, feel better',
    description:
      'Daily mobility flows targeting common trouble spots — hips, shoulders, thoracic spine. Great as a standalone program or alongside any training plan.',
    coverGradient: ['#0d4f5c', '#14a3a8'],
    coverEmoji: '🧘',
    duration: '4 weeks',
    frequency: '6x/week',
    level: 'All Levels',
    tags: [tag('Mobility'), tag('Flexibility'), tag('Recovery')],
    weekSnapshot: [
      { day: 'Mon', type: 'mobility', label: 'Hips' },
      { day: 'Tue', type: 'mobility', label: 'Shoulders' },
      { day: 'Wed', type: 'mobility', label: 'Spine' },
      { day: 'Thu', type: 'mobility', label: 'Full' },
      { day: 'Fri', type: 'mobility', label: 'Hips' },
      { day: 'Sat', type: 'mobility', label: 'Flow' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      '15 min daily sessions',
      'Follow-along cues',
      'Pairs with any strength plan',
    ],
    rating: 4.7,
    enrolledCount: 890,
    category: 'Mobility',
  },
  {
    id: 'marathon-prep',
    title: 'Marathon Prep',
    subtitle: '16 weeks to 26.2',
    description:
      'Periodized marathon training with tempo runs, long runs, speed work, and strategic recovery. Built for intermediate runners aiming for a strong finish.',
    coverGradient: ['#1a3c2a', '#2d8a52'],
    coverEmoji: '🥇',
    duration: '16 weeks',
    frequency: '5x/week',
    level: 'Advanced',
    tags: [tag('Running'), tag('Endurance'), tag('Cardio')],
    weekSnapshot: [
      { day: 'Mon', type: 'cardio', label: 'Easy' },
      { day: 'Tue', type: 'cardio', label: 'Tempo' },
      { day: 'Wed', type: 'mobility', label: 'Cross' },
      { day: 'Thu', type: 'cardio', label: 'Intervals' },
      { day: 'Fri', type: 'rest' },
      { day: 'Sat', type: 'cardio', label: 'Long Run' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      'Periodized mileage build',
      '3-week taper built in',
      'Race day pacing strategy',
    ],
    rating: 4.8,
    enrolledCount: 720,
    category: 'Running',
  },
  {
    id: 'sport-performance',
    title: 'Athletic Performance',
    subtitle: 'Train like an athlete',
    description:
      'Explosive power, agility, and sport-specific conditioning. Combines plyometrics, sprint work, and functional strength for competitive athletes.',
    coverGradient: ['#5c3a0d', '#d4880d'],
    coverEmoji: '⚡',
    duration: '8 weeks',
    frequency: '4x/week',
    level: 'Advanced',
    tags: [tag('Athletic'), tag('HIIT'), tag('Strength')],
    weekSnapshot: [
      { day: 'Mon', type: 'strength', label: 'Power' },
      { day: 'Tue', type: 'hiit', label: 'Agility' },
      { day: 'Wed', type: 'rest' },
      { day: 'Thu', type: 'strength', label: 'Strength' },
      { day: 'Fri', type: 'hiit', label: 'Conditioning' },
      { day: 'Sat', type: 'rest' },
      { day: 'Sun', type: 'rest' },
    ],
    highlights: [
      'Plyometric progressions',
      'Sprint & agility drills',
      'Sport-specific templates',
    ],
    rating: 4.6,
    enrolledCount: 540,
    category: 'Sport-Specific',
  },
];
