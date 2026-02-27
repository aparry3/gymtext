'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AntWorkoutView } from './ant/AntWorkoutView';
import type { Workout, Block, WorkoutItem } from './ant/mockData';

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

export function MeWorkoutDetail({ userId, workoutId }: { userId: string; workoutId: string }) {
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
        const res = await fetch(`/api/users/${userId}/workouts/${workoutId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = await res.json();
        const data: WorkoutData = json.data;

        if (!data?.details) {
          setLoading(false);
          return;
        }

        const details = data.details;
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
  }, [userId, workoutId]);

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
          <Link href="/me" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-stone-900 mt-1">Workout Not Found</h1>
              <p className="text-[13px] text-stone-500 mt-2">This workout could not be loaded.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="max-w-lg mx-auto px-4 pt-4">
        <Link href="/me" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <AntWorkoutView
        mode="light"
        workout={workoutData.workout}
        title={workoutData.title}
        sessionType={workoutData.sessionType}
        duration={workoutData.duration}
      />
    </div>
  );
}
