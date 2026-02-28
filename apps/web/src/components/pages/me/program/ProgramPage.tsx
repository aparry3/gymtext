'use client';

import { useEffect, useState } from 'react';
import { AntPlanPage } from '@/components/pages/me/ant/AntPlanPage';
import type { ActivePlan, PlanWeek, PlanWorkoutDay, WorkoutStatus } from '@/components/pages/me/ant/planMockData';

interface ProgramPageProps {
  userId: string;
}

interface PlanDetailsResponse {
  title?: string;
  subtitle?: string;
  description?: string;
  goal?: string;
  frequency?: string;
  schedule?: string[];
  startDate?: string;
  totalWeeks?: number;
  expectedEndDate?: string;
  totalWorkouts?: number;
  weekLabels?: string[];
}

interface FitnessPlanResponse {
  id: string;
  description: string;
  content: string;
  details?: PlanDetailsResponse | null;
  startDate: string;
  absoluteWeek: number;
}

interface WeekDayResponse {
  dayOfWeek: string;
  focus: string;
  activityType: string;
}

interface WeekDetailsResponse {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  days: WeekDayResponse[];
}

const DAY_ABBREVS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function mapToActivePlan(
  fitnessPlan: FitnessPlanResponse,
  weekDetails: WeekDetailsResponse | null,
): ActivePlan {
  const today = new Date();
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayAbbrev = DAY_ABBREVS[todayDayName] || todayDayName.slice(0, 3);

  // Build days from week details
  const days: PlanWorkoutDay[] = (weekDetails?.days || []).map((d) => {
    const abbrev = DAY_ABBREVS[d.dayOfWeek] || d.dayOfWeek;
    const isRest = d.activityType === 'rest' || d.activityType === 'REST';
    const isToday = abbrev === todayAbbrev;

    let status: WorkoutStatus;
    if (isRest) {
      status = 'rest';
    } else if (isToday) {
      status = 'today';
    } else {
      status = 'upcoming';
    }

    return {
      date: '',
      dayOfWeek: abbrev,
      label: isRest ? 'Rest' : d.focus,
      type: isRest ? 'rest' as const : 'strength' as const,
      status,
    };
  });

  // Derive schedule from non-rest days
  const scheduleDays = days
    .filter((d) => d.type !== 'rest')
    .map((d) => d.dayOfWeek)
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  // Find today's workout for nextWorkout
  const todayDay = days.find((d) => d.status === 'today');

  const currentWeek = fitnessPlan.absoluteWeek || 1;

  // Build a single PlanWeek from the week details
  const planWeek: PlanWeek = {
    weekNumber: currentWeek,
    label: weekDetails?.label || `Week ${currentWeek}`,
    startDate: weekDetails?.startDate || '',
    endDate: weekDetails?.endDate || '',
    status: 'current',
    days,
  };

  // Format start date
  const startDate = fitnessPlan.startDate
    ? new Date(fitnessPlan.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const details = fitnessPlan.details;

  return {
    id: fitnessPlan.id,
    title: details?.title || 'My Training Plan',
    subtitle: `Week ${currentWeek}`,
    description: details?.description || '',
    goal: details?.goal || '',
    currentWeek,
    currentDay: today.getDay(),
    frequency: details?.frequency || `${scheduleDays.length}x/week`,
    startDate,
    totalWeeks: details?.totalWeeks,
    completedWorkouts: 0,
    skippedWorkouts: 0,
    adherencePercent: 0,
    currentStreak: 0,
    longestStreak: 0,
    schedule: details?.schedule || scheduleDays,
    nextWorkout: {
      label: todayDay?.label || 'Rest Day',
      dayOfWeek: todayDayName,
      date: today.toISOString().split('T')[0],
      type: 'strength',
      focus: todayDay?.label || 'Rest',
      estimatedDuration: 0,
      exercises: [],
    },
    weeks: [planWeek],
  };
}

export function ProgramPage({ userId }: ProgramPageProps) {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setMode(mq.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [planRes, microcycleRes] = await Promise.all([
          fetch(`/api/users/${userId}/fitness-plan`),
          fetch(`/api/users/${userId}/microcycle`),
        ]);

        if (!planRes.ok) {
          throw new Error('Failed to fetch fitness plan');
        }

        const planData = await planRes.json();
        const fitnessPlan: FitnessPlanResponse = planData.data;

        let weekDetails: WeekDetailsResponse | null = null;
        if (microcycleRes.ok) {
          const microcycleData = await microcycleRes.json();
          weekDetails = microcycleData.data?.details || null;
          if (microcycleData.data?.absoluteWeek) {
            fitnessPlan.absoluteWeek = microcycleData.data.absoluteWeek;
          }
        }

        setPlan(mapToActivePlan(fitnessPlan, weekDetails));
      } catch (err) {
        console.error('Error fetching program data:', err);
        setError('Failed to load your program');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className={mode === 'dark' ? 'bg-[hsl(222,47%,5%)]' : 'bg-[#F7F5F2]'}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
            <div className={`h-8 rounded-lg w-2/3 ${mode === 'dark' ? 'bg-white/5' : 'bg-stone-200'}`} />
            <div className={`h-4 rounded w-1/3 ${mode === 'dark' ? 'bg-white/5' : 'bg-stone-200'}`} />
            <div className={`h-24 rounded-2xl ${mode === 'dark' ? 'bg-white/5' : 'bg-stone-200'}`} />
            <div className={`h-40 rounded-2xl ${mode === 'dark' ? 'bg-white/5' : 'bg-stone-200'}`} />
            <div className={`h-32 rounded-2xl ${mode === 'dark' ? 'bg-white/5' : 'bg-stone-200'}`} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className={mode === 'dark' ? 'bg-[hsl(222,47%,5%)]' : 'bg-[#F7F5F2]'}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className={mode === 'dark' ? 'text-white/60' : 'text-stone-500'}>
              {error || 'No active program found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AntPlanPage plan={plan} hideTracking mode={mode} />;
}
