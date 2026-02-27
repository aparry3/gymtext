'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TodaysMissionCard } from './dashboard/TodaysMissionCard';
import { TomorrowPreviewCard } from './dashboard/TomorrowPreviewCard';
import { TrackOfDayCard } from './dashboard/TrackOfDayCard';
import { QuoteCard } from './dashboard/QuoteCard';
import { ReferralCard } from './dashboard/ReferralCard';
import { isToday, isSameDay } from '@/shared/utils/date';
import type { Block, WorkoutItem } from './ant/mockData';

interface WorkoutData {
  id: string;
  date: string;
  message: string | null;
  details: {
    blocks: Block[];
    items: WorkoutItem[];
    title?: string;
    focus?: string;
    estimatedDuration?: number;
  } | null;
}

function getDayLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function extractMainMovements(details: WorkoutData['details']): string[] {
  if (!details?.items) return [];
  const mainBlock = details.blocks.find((b) => b.id === 'main');
  const mainItems = mainBlock
    ? details.items.filter((item) => item.blockId === mainBlock.id)
    : details.items;
  return mainItems.slice(0, 3).map((item) => item.name);
}

export function MeDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutData | null>(null);
  const [tomorrowWorkout, setTomorrowWorkout] = useState<WorkoutData | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await fetch(`/api/users/${userId}/workouts`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = await res.json();
        const workouts: WorkoutData[] = json.data || [];

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setTodayWorkout(workouts.find((w) => isToday(w.date)) || null);
        setTomorrowWorkout(workouts.find((w) => isSameDay(w.date, tomorrow)) || null);
      } catch (err) {
        console.error('Failed to fetch workouts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [userId]);

  const todayHasWorkout = !!todayWorkout?.details;
  const tomorrowHasWorkout = !!tomorrowWorkout?.details;

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Today's Workout */}
        <TodaysMissionCard
          dayLabel={getDayLabel(0)}
          isLoading={loading}
          isRestDay={!loading && !todayHasWorkout}
          workoutTitle={todayWorkout?.details?.title}
          workoutFocus={todayWorkout?.details?.focus}
          estimatedDuration={todayWorkout?.details?.estimatedDuration}
          mainMovements={todayWorkout?.details ? extractMainMovements(todayWorkout.details) : undefined}
          onStartWorkout={todayWorkout ? () => router.push(`/me/workouts/${todayWorkout.id}`) : undefined}
        />

        {/* Two-column row: Tomorrow + Track of Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TomorrowPreviewCard
            isLoading={loading}
            isRestDay={!loading && !tomorrowHasWorkout}
            title={tomorrowWorkout?.details?.title}
            focus={tomorrowWorkout?.details?.focus}
            estimatedDuration={tomorrowWorkout?.details?.estimatedDuration}
            mainMovements={tomorrowWorkout?.details ? extractMainMovements(tomorrowWorkout.details) : undefined}
          />
          <TrackOfDayCard isLoading={loading} />
        </div>

        {/* Quote + Referral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuoteCard isLoading={loading} />
          <ReferralCard userId={userId} />
        </div>
      </div>
    </div>
  );
}
