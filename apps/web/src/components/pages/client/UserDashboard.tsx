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
import type { WorkoutStructure } from '@/server/models/workout';

interface UserDashboardProps {
  userId: string;
  initialWorkoutId?: string;
}

interface WorkoutData {
  id: string;
  date: string;
  sessionType: string;
  goal: string | null;
  formatted: string | null;
  structure?: WorkoutStructure;
}

interface DayFocus {
  focus: string;
  activityType: 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | string;
}

interface DashboardData {
  todayWorkout: WorkoutData | null;
  tomorrowWorkout: WorkoutData | null;
  isRestDayToday: boolean;
  isRestDayTomorrow: boolean;
  weekNumber: number;
  programPhase: string;
  quote?: { text: string; author: string };
  todayFocus?: DayFocus;
  tomorrowFocus?: DayFocus;
}

// Get day label from date
function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
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
      // toLocaleDateString('en-CA') gives YYYY-MM-DD in local timezone
      const todayStr = today.toLocaleDateString('en-CA');
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

      // Find today's and tomorrow's workout by comparing dates
      const todayWorkout = workouts.find(w => w.date.startsWith(todayStr)) || null;
      const tomorrowWorkout = workouts.find(w => w.date.startsWith(tomorrowStr)) || null;

      // Fetch fitness plan for program info
      const planResponse = await fetch(`/api/users/${userId}/fitness-plan`);
      let programPhase = 'Strength + Lean Build Phase';
      let weekNumber = 1;

      if (planResponse.ok) {
        const planData = await planResponse.json();
        if (planData.data) {
          // Try to extract phase from plan name or description
          programPhase = planData.data.structure?.name || programPhase;
        }
      }

      // Fetch current microcycle (API defaults to current week using user's timezone)
      let todayFocus: DayFocus | undefined;
      let tomorrowFocus: DayFocus | undefined;

      const microcycleResponse = await fetch(`/api/users/${userId}/microcycle`);
      if (microcycleResponse.ok) {
        const microcycleData = await microcycleResponse.json();
        // Use absoluteWeek from microcycle response
        if (microcycleData.data?.absoluteWeek) {
          weekNumber = microcycleData.data.absoluteWeek;
        }

        // Extract today's and tomorrow's focus from microcycle days
        const days = microcycleData.data?.structured?.days || [];
        if (days.length > 0) {
          const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
          const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

          const todayDayInfo = days.find((d: { day: string }) => d.day === todayDayName);
          const tomorrowDayInfo = days.find((d: { day: string }) => d.day === tomorrowDayName);

          if (todayDayInfo) {
            todayFocus = {
              focus: todayDayInfo.focus,
              activityType: todayDayInfo.activityType,
            };
          }
          if (tomorrowDayInfo) {
            tomorrowFocus = {
              focus: tomorrowDayInfo.focus,
              activityType: tomorrowDayInfo.activityType,
            };
          }
        }
      }

      // Helper to determine if a day is a rest day
      // Priority: microcycle activityType > workout sessionType > default to training
      const isRestDay = (focus: DayFocus | undefined, workout: WorkoutData | null): boolean => {
        // If we have microcycle focus data, use its activityType as source of truth
        if (focus?.activityType) {
          return focus.activityType === 'REST';
        }
        // Otherwise, only mark as rest if workout explicitly says so
        return workout?.sessionType === 'rest';
      };

      setDashboardData({
        todayWorkout,
        tomorrowWorkout,
        isRestDayToday: isRestDay(todayFocus, todayWorkout),
        isRestDayTomorrow: isRestDay(tomorrowFocus, tomorrowWorkout),
        weekNumber,
        programPhase,
        quote: todayWorkout?.structure?.quote,
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
          workoutTitle={dashboardData?.todayFocus?.focus || dashboardData?.todayWorkout?.structure?.title || dashboardData?.todayWorkout?.goal || 'Workout'}
          workoutFocus={dashboardData?.todayFocus?.activityType || dashboardData?.todayWorkout?.structure?.focus}
          isRestDay={dashboardData?.isRestDayToday}
          onStartWorkout={handleStartWorkout}
        />

        {/* Widget cards - 3 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TomorrowPreviewCard
            title={dashboardData?.tomorrowFocus?.focus || dashboardData?.tomorrowWorkout?.structure?.title || dashboardData?.tomorrowWorkout?.goal || undefined}
            focus={dashboardData?.tomorrowFocus?.activityType || dashboardData?.tomorrowWorkout?.structure?.focus}
            description={dashboardData?.tomorrowWorkout?.structure?.description}
            isRestDay={dashboardData?.isRestDayTomorrow}
          />

          <QuoteCard
            text={dashboardData?.quote?.text}
            author={dashboardData?.quote?.author}
          />

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
