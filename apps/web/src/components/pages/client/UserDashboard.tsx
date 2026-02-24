'use client';

import { useState, useEffect, useCallback } from 'react';
import { MeHeader } from '@/components/pages/me/layout';
import {
  TodaysMissionCard,
  TomorrowPreviewCard,
  QuoteCard,
  TrackOfDayCard,
  DashboardSkeleton,
  ReferralBanner,
} from '@/components/pages/me/dashboard';
import { WorkoutDetailSheet } from '@/components/pages/me/workout/WorkoutDetailSheet';
import type { WorkoutDetails } from '@gymtext/shared';
import type { WeekDetailsDay } from '@gymtext/shared';

interface UserDashboardProps {
  userId: string;
  initialWorkoutId?: string;
}

interface WorkoutData {
  id: string;
  date: string;
  message: string | null;
  details: WorkoutDetails | null;
}

interface DayFocus {
  focus?: string;
  title?: string;
  activityType?: string;
  sessionType?: string;
  estimatedDuration?: number;
  mainMovements?: string[];
}

interface DashboardData {
  todayWorkout: WorkoutData | null;
  tomorrowWorkout: WorkoutData | null;
  isRestDayToday: boolean;
  isRestDayTomorrow: boolean;
  weekNumber: number;
  programPhase: string;
  todayFocus?: DayFocus;
  tomorrowFocus?: DayFocus;
}

// Get day label from date
function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
}

// Map a WeekDetailsDay to a DayFocus
function toDayFocus(day: WeekDetailsDay): DayFocus {
  return {
    focus: day.focus,
    title: day.title,
    activityType: day.activityType,
    sessionType: day.sessionType,
    estimatedDuration: day.estimatedDuration,
    mainMovements: day.mainMovements,
  };
}

export function UserDashboard({ userId, initialWorkoutId }: UserDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [workoutSheetOpen, setWorkoutSheetOpen] = useState(!!initialWorkoutId);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(initialWorkoutId || null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch recent workouts (ordered by date DESC)
      const workoutsResponse = await fetch(`/api/users/${userId}/workouts`);

      if (!workoutsResponse.ok) {
        throw new Error('Failed to fetch workouts');
      }

      const workoutsData = await workoutsResponse.json();
      const workouts: WorkoutData[] = workoutsData.data || [];

      // Use browser timezone for date comparison
      const todayStr = today.toLocaleDateString('en-CA');
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

      // Find today's and tomorrow's workout by comparing dates
      const todayWorkout = workouts.find(w => String(w.date).startsWith(todayStr)) || null;
      const tomorrowWorkout = workouts.find(w => String(w.date).startsWith(tomorrowStr)) || null;

      // Fetch fitness plan for program info
      const planResponse = await fetch(`/api/users/${userId}/fitness-plan`);
      let programPhase = 'Strength + Lean Build Phase';
      let weekNumber = 1;

      if (planResponse.ok) {
        const planData = await planResponse.json();
        if (planData.data) {
          programPhase = planData.data.structure?.name || programPhase;
        }
      }

      // Fetch current microcycle
      let todayFocus: DayFocus | undefined;
      let tomorrowFocus: DayFocus | undefined;

      const microcycleResponse = await fetch(`/api/users/${userId}/microcycle`);
      if (microcycleResponse.ok) {
        const microcycleData = await microcycleResponse.json();
        if (microcycleData.data?.absoluteWeek) {
          weekNumber = microcycleData.data.absoluteWeek;
        }

        // Try new details format first, fall back to structured
        const days: WeekDetailsDay[] = microcycleData.data?.details?.days || [];
        if (days.length > 0) {
          const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
          const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

          const todayDayInfo = days.find((d) => d.dayOfWeek === todayDayName);
          const tomorrowDayInfo = days.find((d) => d.dayOfWeek === tomorrowDayName);

          if (todayDayInfo) todayFocus = toDayFocus(todayDayInfo);
          if (tomorrowDayInfo) tomorrowFocus = toDayFocus(tomorrowDayInfo);
        } else {
          // Fallback: old structured format
          const oldDays = microcycleData.data?.structured?.days || [];
          if (oldDays.length > 0) {
            const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
            const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

            const todayDayInfo = oldDays.find((d: { day: string }) => d.day === todayDayName);
            const tomorrowDayInfo = oldDays.find((d: { day: string }) => d.day === tomorrowDayName);

            if (todayDayInfo) {
              todayFocus = { focus: todayDayInfo.focus, activityType: todayDayInfo.activityType };
            }
            if (tomorrowDayInfo) {
              tomorrowFocus = { focus: tomorrowDayInfo.focus, activityType: tomorrowDayInfo.activityType };
            }
          }
        }
      }

      // Helper to determine if a day is a rest day
      const isRestDay = (focus: DayFocus | undefined, workout: WorkoutData | null): boolean => {
        // If workout details exist, check activityType from details
        if (workout?.details) return false; // Has workout details = not a rest day
        // Fall back to microcycle focus
        if (focus?.activityType) {
          return focus.activityType === 'rest' || focus.activityType === 'REST';
        }
        return false;
      };

      setDashboardData({
        todayWorkout,
        tomorrowWorkout,
        isRestDayToday: isRestDay(todayFocus, todayWorkout),
        isRestDayTomorrow: isRestDay(tomorrowFocus, tomorrowWorkout),
        weekNumber,
        programPhase,
        todayFocus,
        tomorrowFocus,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStartWorkout = () => {
    if (dashboardData?.todayWorkout) {
      setSelectedWorkoutId(dashboardData.todayWorkout.id);
      setWorkoutSheetOpen(true);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dayLabel = getDayLabel(today);

  // Derive display values from workout details or microcycle focus
  const todayTitle = dashboardData?.todayWorkout?.details?.title
    || dashboardData?.todayFocus?.title
    || dashboardData?.todayFocus?.focus
    || 'Workout';

  const todayFocusLabel = dashboardData?.todayWorkout?.details?.focus
    || dashboardData?.todayFocus?.focus;

  const tomorrowTitle = dashboardData?.tomorrowFocus?.title
    || dashboardData?.tomorrowFocus?.focus;

  const tomorrowFocusLabel = dashboardData?.tomorrowFocus?.focus;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <MeHeader
        title="Dashboard"
        subtitle={dashboardData?.programPhase}
        status={{
          label: 'Active',
          weekNumber: dashboardData?.weekNumber,
        }}
      />

      {/* Referral Banner */}
      <ReferralBanner userId={userId} />

      {/* Today's Mission Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Today&apos;s Mission</h2>
          <span className="text-sm font-bold text-blue-400 uppercase tracking-wide">
            {dayLabel}
          </span>
        </div>

        {/* Hero workout card - full width */}
        <TodaysMissionCard
          dayLabel={dayLabel}
          workoutTitle={todayTitle}
          workoutFocus={todayFocusLabel}
          isRestDay={dashboardData?.isRestDayToday}
          onStartWorkout={handleStartWorkout}
          estimatedDuration={dashboardData?.todayWorkout?.details?.estimatedDuration || dashboardData?.todayFocus?.estimatedDuration}
          mainMovements={dashboardData?.todayFocus?.mainMovements}
        />

        {/* Widget cards - 3 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TomorrowPreviewCard
            title={tomorrowTitle}
            focus={tomorrowFocusLabel}
            isRestDay={dashboardData?.isRestDayTomorrow}
            estimatedDuration={dashboardData?.tomorrowFocus?.estimatedDuration}
            mainMovements={dashboardData?.tomorrowFocus?.mainMovements}
          />

          <QuoteCard />

          <TrackOfDayCard />
        </div>
      </div>

      {/* Workout Detail Sheet */}
      <WorkoutDetailSheet
        open={workoutSheetOpen}
        onClose={() => setWorkoutSheetOpen(false)}
        workoutId={selectedWorkoutId}
        userId={userId}
        dayLabel={dayLabel}
      />
    </div>
  );
}
