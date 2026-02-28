// Mock data for "My Plan" dashboard - showing the user's ACTIVE plan

export type WorkoutStatus = 'completed' | 'skipped' | 'upcoming' | 'today' | 'rest';

export interface PlanWorkoutDay {
  date: string;
  dayOfWeek: string;
  label: string;
  type: 'strength' | 'cardio' | 'mobility' | 'rest' | 'hiit';
  status: WorkoutStatus;
  duration?: number;
  exercises?: number;
  completedAt?: string;
  adherenceScore?: number;
}

export interface PlanWeek {
  weekNumber: number;
  label: string;
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
  /** undefined or 0 = open-ended plan */
  totalWeeks?: number;
  currentWeek: number;
  currentDay: number;
  frequency: string;
  startDate: string;
  expectedEndDate?: string;
  // Stats
  totalWorkouts?: number;
  completedWorkouts: number;
  skippedWorkouts: number;
  adherencePercent: number;
  currentStreak: number;
  longestStreak: number;
  // Streak milestones hit
  streakMilestones?: number[]; // e.g. [3, 5, 7, 10, 14, 21, 30]
  // Schedule
  schedule: string[];
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
  // Week data (recent weeks for open-ended, all weeks for fixed)
  weeks: PlanWeek[];
}

// ─── Build mock weeks for fixed-length plan ──────

function buildFixedWeeks(): PlanWeek[] {
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
    const weekStart = new Date(2026, 1, 2 + w * 7);
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
        status = tmpl.type === 'rest' ? 'rest' : (Math.random() > 0.1 ? 'completed' : 'skipped');
      } else if (w === 2) {
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

// ─── Build mock weeks for open-ended plan ──────

function buildOpenEndedWeeks(): PlanWeek[] {
  const weeks: PlanWeek[] = [];
  const dayTemplates = [
    { dayOfWeek: 'Mon', label: 'Full Body A', type: 'strength' as const },
    { dayOfWeek: 'Tue', label: 'Rest', type: 'rest' as const },
    { dayOfWeek: 'Wed', label: 'Full Body B', type: 'strength' as const },
    { dayOfWeek: 'Thu', label: 'Rest', type: 'rest' as const },
    { dayOfWeek: 'Fri', label: 'Full Body C', type: 'strength' as const },
    { dayOfWeek: 'Sat', label: 'Conditioning', type: 'cardio' as const },
    { dayOfWeek: 'Sun', label: 'Rest', type: 'rest' as const },
  ];

  // Show last 4 weeks
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(2026, 1, 2 + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let weekStatus: PlanWeek['status'] = 'upcoming';
    if (w < 3) weekStatus = 'completed';
    else weekStatus = 'current';

    const days: PlanWorkoutDay[] = dayTemplates.map((tmpl, di) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + di);
      const iso = date.toISOString().split('T')[0];

      let status: WorkoutStatus = 'upcoming';
      if (w < 3) {
        status = tmpl.type === 'rest' ? 'rest' : 'completed';
      } else {
        if (di < 3) {
          status = tmpl.type === 'rest' ? 'rest' : 'completed';
        } else if (di === 3) {
          status = tmpl.type === 'rest' ? 'rest' : 'today';
        } else {
          status = tmpl.type === 'rest' ? 'rest' : 'upcoming';
        }
      }

      return {
        date: iso,
        dayOfWeek: tmpl.dayOfWeek,
        label: tmpl.label,
        type: tmpl.type,
        status,
        duration: tmpl.type === 'rest' ? undefined : (tmpl.type === 'cardio' ? 30 : 50),
        exercises: tmpl.type === 'rest' ? undefined : 5,
        ...(status === 'completed' ? {
          completedAt: iso,
          adherenceScore: 85 + Math.floor(Math.random() * 15),
        } : {}),
      };
    });

    weeks.push({
      weekNumber: w + 1,
      label: `Week ${w + 1}`,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      status: weekStatus,
      days,
    });
  }

  return weeks;
}

// ─── Fixed-length plan (12-week program) ──────

export const ACTIVE_PLAN: ActivePlan = {
  id: 'powerbuilding-12wk',
  title: 'Powerbuilding: Size & Strength',
  subtitle: '12-Week Progressive Program',
  description: 'A hybrid program combining powerlifting progression with hypertrophy volume. Heavy compounds build strength while accessory work drives muscle growth.',
  goal: 'Build strength on main lifts while adding muscle mass',
  totalWeeks: 12,
  currentWeek: 3,
  currentDay: 4,
  frequency: '5x/week',
  startDate: '2026-02-02',
  expectedEndDate: '2026-04-26',
  totalWorkouts: 60,
  completedWorkouts: 11,
  skippedWorkouts: 1,
  adherencePercent: 92,
  currentStreak: 5,
  longestStreak: 7,
  streakMilestones: [3, 5],
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
  weeks: buildFixedWeeks(),
};

// ─── Open-ended plan (ongoing training) ──────

export const OPEN_ENDED_PLAN: ActivePlan = {
  id: 'general-strength',
  title: 'General Strength Training',
  subtitle: 'Ongoing Program',
  description: 'A sustainable full-body strength program focused on progressive overload on compound movements. No fixed end date — just consistent progress.',
  goal: 'Get stronger and build a consistent training habit',
  // No totalWeeks — this is open-ended
  currentWeek: 4,
  currentDay: 4,
  frequency: '4x/week',
  startDate: '2026-02-02',
  completedWorkouts: 14,
  skippedWorkouts: 0,
  adherencePercent: 100,
  currentStreak: 14,
  longestStreak: 14,
  streakMilestones: [3, 5, 7, 10, 14],
  schedule: ['Mon', 'Wed', 'Fri', 'Sat'],
  nextWorkout: {
    label: 'Full Body B',
    dayOfWeek: 'Wednesday',
    date: '2026-02-25',
    type: 'strength',
    focus: 'Squat & Press Focus',
    estimatedDuration: 50,
    exercises: [
      'Back Squat — 3×5 @ RPE 8',
      'Overhead Press — 3×8',
      'Romanian Deadlift — 3×10',
      'Dips — 3×8',
      'Plank — 3×45s',
    ],
  },
  weeks: buildOpenEndedWeeks(),
};
