// ─── Profile Mock Data ─────────────────────────────────────────────

export interface UserIdentity {
  name: string;
  age: number;
  gender: string;
  experience: string;
  experienceYears: number;
  memberSince: string;
}

export interface Goal {
  id: string;
  type: 'primary' | 'secondary';
  label: string;
  description: string;
  target?: string;
  deadline?: string;
  progress?: number; // 0-100
}

export interface ScheduleDay {
  day: string;
  short: string;
  available: boolean;
  timeWindow?: string;
}

export interface Equipment {
  name: string;
  category: 'barbell' | 'dumbbell' | 'machine' | 'cardio' | 'accessory' | 'bodyweight';
  location?: string;
}

export interface TrainingEnvironment {
  name: string;
  type: 'home' | 'commercial' | 'crossfit' | 'powerlifting';
  equipment: Equipment[];
}

export interface Constraint {
  id: string;
  status: 'active' | 'resolved' | 'monitoring';
  description: string;
  management?: string;
  since?: string;
  resolvedDate?: string;
}

export interface Preference {
  category: 'likes' | 'dislikes' | 'style';
  items: string[];
}

export interface StrengthMetric {
  exercise: string;
  value: string;
  date: string;
  trend?: 'up' | 'down' | 'stable';
  previousValue?: string;
}

export interface BodyMetric {
  label: string;
  value: string;
  date: string;
  startValue?: string;
  startDate?: string;
}

export interface LogEntry {
  date: string;
  title: string;
  notes: string[];
}

export interface UserProfile {
  identity: UserIdentity;
  goals: Goal[];
  schedule: {
    days: ScheduleDay[];
    sessionDuration: string;
    frequency: number;
  };
  environments: TrainingEnvironment[];
  constraints: Constraint[];
  preferences: Preference[];
  strengthMetrics: StrengthMetric[];
  bodyMetrics: BodyMetric[];
  recentLog: LogEntry[];
}

// ─── Mock Data ─────────────────────────────────────────────────────

export const MOCK_PROFILE: UserProfile = {
  identity: {
    name: 'Alex Martinez',
    age: 28,
    gender: 'Male',
    experience: 'Intermediate',
    experienceYears: 2,
    memberSince: '2025-12-01',
  },
  goals: [
    {
      id: '1',
      type: 'primary',
      label: 'Build Muscle & Strength',
      description: 'Increase overall muscle mass and compound lift numbers',
      progress: 65,
    },
    {
      id: '2',
      type: 'primary',
      label: 'Lose Body Fat',
      description: 'Lose 10 lbs of body fat while maintaining muscle',
      target: '170 lbs',
      progress: 40,
    },
    {
      id: '3',
      type: 'secondary',
      label: '5K Under 25:00',
      description: 'Complete a 5K race in under 25 minutes',
      deadline: 'March 2026',
      progress: 15,
    },
  ],
  schedule: {
    days: [
      { day: 'Monday', short: 'M', available: true, timeWindow: '6-7 AM' },
      { day: 'Tuesday', short: 'T', available: false },
      { day: 'Wednesday', short: 'W', available: true, timeWindow: '6-7 AM' },
      { day: 'Thursday', short: 'T', available: false },
      { day: 'Friday', short: 'F', available: true, timeWindow: '6-7 AM' },
      { day: 'Saturday', short: 'S', available: true, timeWindow: '8-9 AM' },
      { day: 'Sunday', short: 'S', available: false },
    ],
    sessionDuration: '45-60 min',
    frequency: 4,
  },
  environments: [
    {
      name: 'Home Gym',
      type: 'home',
      equipment: [
        { name: 'Olympic Barbell', category: 'barbell' },
        { name: 'Dumbbells (5-50 lb)', category: 'dumbbell' },
        { name: 'Squat Rack w/ Pull-up Bar', category: 'machine' },
        { name: 'Adjustable Bench', category: 'machine' },
        { name: 'Resistance Bands', category: 'accessory' },
      ],
    },
    {
      name: 'LA Fitness',
      type: 'commercial',
      equipment: [
        { name: 'Full Machine Selection', category: 'machine' },
        { name: 'Cable Machines', category: 'machine' },
        { name: 'Cardio Equipment', category: 'cardio' },
        { name: 'Free Weights', category: 'dumbbell' },
      ],
    },
  ],
  constraints: [
    {
      id: '1',
      status: 'active',
      description: 'Knee discomfort with barbell squats',
      management: 'Using goblet/front squats instead',
      since: '2026-02-16',
    },
    {
      id: '2',
      status: 'resolved',
      description: 'Right shoulder strain',
      management: 'Fully healed',
      resolvedDate: '2024',
    },
  ],
  preferences: [
    {
      category: 'likes',
      items: ['Compound movements', 'Accessory variety', 'HIIT over steady-state'],
    },
    {
      category: 'dislikes',
      items: ['Long cardio', 'Repetitive routines'],
    },
    {
      category: 'style',
      items: ['Direct communication', 'Concise', 'Data-driven'],
    },
  ],
  strengthMetrics: [
    { exercise: 'Goblet Squat', value: '50 lb × 8', date: '2026-02-16', trend: 'up', previousValue: '135 lb × 5 (barbell)' },
    { exercise: 'Bench Press', value: '145 lb × 5', date: '2026-01-15', trend: 'up', previousValue: '115 lb × 5' },
    { exercise: 'Deadlift', value: '225 lb × 5', date: '2026-01-15', trend: 'up', previousValue: '185 lb × 5' },
  ],
  bodyMetrics: [
    { label: 'Weight', value: '176 lb', date: '2026-01-15', startValue: '180 lb', startDate: '2025-12-01' },
    { label: 'Body Fat', value: '~16%', date: '2026-01-15', startValue: '~18%', startDate: '2025-12-01' },
  ],
  recentLog: [
    {
      date: '2026-02-16',
      title: 'Constraint Update',
      notes: [
        'Reported knee discomfort during barbell squats',
        'Switched to goblet squats — pain-free',
        'Added active constraint',
      ],
    },
    {
      date: '2026-01-15',
      title: 'Progress Check',
      notes: [
        'Down 4 lbs (180 → 176)',
        'All lifts up significantly',
        'Added 5K goal (March race)',
        'Wants more variety in accessories',
      ],
    },
    {
      date: '2025-12-01',
      title: 'Initial Assessment',
      notes: [
        'Baseline recorded: 180 lbs, ~18% BF',
        'Set up 4-day Upper/Lower split',
      ],
    },
  ],
};
