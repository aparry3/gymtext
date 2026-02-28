// Mock data for "My Plan" dashboard - showing the user's ACTIVE plan

export type WorkoutStatus = 'completed' | 'skipped' | 'upcoming' | 'today' | 'rest';

export interface PlanWorkoutDay {
  date: string; // ISO date
  dayOfWeek: string; // Mon, Tue, etc.
  label: string; // "Upper Body Strength", "Rest Day", etc.
  type: 'strength' | 'cardio' | 'mobility' | 'rest' | 'hiit';
  status: WorkoutStatus;
  duration?: number; // minutes
  exercises?: number; // count
  // For completed workouts
  completedAt?: string;
  adherenceScore?: number; // 0-100
}

export interface PlanWeek {
  weekNumber: number;
  label: string; // "Hypertrophy Focus", "Strength Block", etc.
  startDate: string;
  endDate: string;
  status: 'completed' | 'current' | 'upcoming';
  days: PlanWorkoutDay[];
}

export interface ActivePlan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  goal: string;
  totalWeeks: number;
  currentWeek: number;
  currentDay: number; // day within the week (1-7)
  frequency: string; // "4x/week"
  startDate: string;
  expectedEndDate: string;
  // Stats
  totalWorkouts: number;
  completedWorkouts: number;
  skippedWorkouts: number;
  adherencePercent: number;
  currentStreak: number; // consecutive completed
  longestStreak: number;
  // Schedule
  schedule: string[]; // e.g. ["Mon", "Tue", "Thu", "Fri"]
  // Current/next workout
  nextWorkout: {
    label: string;
    dayOfWeek: string;
    date: string;
    type: 'strength' | 'cardio' | 'mobility' | 'hiit';
    focus: string;
    estimatedDuration: number;
    exercises: string[];
  };
  // Week data
  weeks: PlanWeek[];
}

// ─── Build mock data for a user in Week 3 of a 12-week program ──────

function buildWeeks(): PlanWeek[] {
  const weeks: PlanWeek[] = [];
  const weekLabels = [
    'Foundation', 'Foundation', 'Hypertrophy I', 'Hypertrophy I',
    'Strength I', 'Strength I', 'Deload', 'Hypertrophy II',
    'Hypertrophy II', 'Strength II', 'Peak', 'Test Week',
  ];

  const dayTemplates = [
    { dayOfWeek: 'Mon', label: 'Upper Push', type: 'strength' as const },
    { dayOfWeek: 'Tue', label: 'Lower Strength', type: 'strength' as const },
    { dayOfWeek: 'Wed', label: 'Rest', type: 'rest' as const },
    { dayOfWeek: 'Thu', label: 'Upper Pull', type: 'strength' as const },
    { dayOfWeek: 'Fri', label: 'Lower Hypertrophy', type: 'strength' as const },
    { dayOfWeek: 'Sat', label: 'Conditioning', type: 'cardio' as const },
    { dayOfWeek: 'Sun', label: 'Rest / Mobility', type: 'rest' as const },
  ];

  for (let w = 0; w < 12; w++) {
    const weekStart = new Date(2026, 1, 2 + w * 7); // Feb 2, 2026 is a Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let weekStatus: PlanWeek['status'] = 'upcoming';
    if (w < 2) weekStatus = 'completed';
    else if (w === 2) weekStatus = 'current';

    const days: PlanWorkoutDay[] = dayTemplates.map((tmpl, di) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + di);
      const iso = date.toISOString().split('T')[0];

      let status: WorkoutStatus = 'upcoming';
      if (w < 2) {
        // Past weeks - all done or skipped
        status = tmpl.type === 'rest' ? 'rest' : (Math.random() > 0.1 ? 'completed' : 'skipped');
      } else if (w === 2) {
        // Current week (week 3) - today is Thursday (day index 3)
        if (di < 3) {
          status = tmpl.type === 'rest' ? 'rest' : 'completed';
        } else if (di === 3) {
          status = 'today';
        } else {
          status = tmpl.type === 'rest' ? 'rest' : 'upcoming';
        }
      } else {
        status = tmpl.type === 'rest' ? 'rest' : 'upcoming';
      }

      return {
        date: iso,
        dayOfWeek: tmpl.dayOfWeek,
        label: tmpl.label,
        type: tmpl.type,
        status,
        duration: tmpl.type === 'rest' ? undefined : (tmpl.type === 'cardio' ? 30 : 55),
        exercises: tmpl.type === 'rest' ? undefined : (tmpl.type === 'cardio' ? 4 : 6),
        ...(status === 'completed' ? {
          completedAt: iso,
          adherenceScore: 80 + Math.floor(Math.random() * 20),
        } : {}),
      };
    });

    weeks.push({
      weekNumber: w + 1,
      label: weekLabels[w],
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      status: weekStatus,
      days,
    });
  }

  return weeks;
}

export const ACTIVE_PLAN: ActivePlan = {
  id: 'powerbuilding-12wk',
  title: 'Powerbuilding: Size & Strength',
  subtitle: '12-Week Progressive Program',
  description: 'A hybrid program combining powerlifting progression with hypertrophy volume. Heavy compounds build strength while accessory work drives muscle growth. Includes strategic deload and peak phases.',
  goal: 'Build strength on main lifts while adding muscle mass',
  totalWeeks: 12,
  currentWeek: 3,
  currentDay: 4, // Thursday
  frequency: '5x/week',
  startDate: '2026-02-02',
  expectedEndDate: '2026-04-26',
  totalWorkouts: 60, // 5 per week × 12 weeks
  completedWorkouts: 11,
  skippedWorkouts: 1,
  adherencePercent: 92,
  currentStreak: 5,
  longestStreak: 7,
  schedule: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
  nextWorkout: {
    label: 'Upper Pull',
    dayOfWeek: 'Thursday',
    date: '2026-02-19',
    type: 'strength',
    focus: 'Back & Biceps — Hypertrophy Focus',
    estimatedDuration: 55,
    exercises: [
      'Barbell Row — 4×8 @ RPE 7',
      'Weighted Pull-ups — 3×6',
      'Cable Row — 3×12',
      'Face Pulls — 3×15',
      'Barbell Curl — 3×10',
      'Hammer Curl — 2×12',
    ],
  },
  weeks: buildWeeks(),
};
