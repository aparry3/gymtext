'use client';

import { useEffect, useState } from 'react';
import { AntWorkoutView } from './ant/AntWorkoutView';
import type { Workout, Block, WorkoutItem } from './ant/mockData';

interface WorkoutData {
  id: string;
  date: string;
  message: string | null;
  details: Record<string, unknown> | null;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function MeWorkoutPage({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState<{
    workout: Workout;
    title: string;
    sessionType: string;
    duration?: number;
  } | null>(null);

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const res = await fetch(`/api/users/${userId}/workouts`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = await res.json();
        const workouts: WorkoutData[] = json.data || [];

        // Find today's workout
        const today = getTodayDateString();
        const todayWorkout = workouts.find((w) => w.date === today);

        if (!todayWorkout?.details) {
          setLoading(false);
          return;
        }

        const details = todayWorkout.details as { blocks: Block[]; items: WorkoutItem[]; title?: string; focus?: string; estimatedDuration?: number };
        setWorkoutData({
          workout: { blocks: details.blocks, items: details.items },
          title: details.title || 'Workout',
          sessionType: details.focus || 'Training',
          duration: details.estimatedDuration,
        });
      } catch (err) {
        console.error('Failed to fetch workout:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkout();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-sm">Loading workout...</div>
      </div>
    );
  }

  if (!workoutData) {
    return (
      <div className="min-h-screen bg-[#F7F5F2]">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">Today</p>
              <h1 className="text-xl font-bold text-stone-900 mt-1">Rest Day</h1>
              <p className="text-[13px] text-stone-500 mt-2">No workout scheduled for today. Enjoy your recovery!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AntWorkoutView
      mode="light"
      workout={workoutData.workout}
      title={workoutData.title}
      sessionType={workoutData.sessionType}
      duration={workoutData.duration}
    />
  );
}
