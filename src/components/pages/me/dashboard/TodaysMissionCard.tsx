'use client';

import { Button } from '@/components/ui/button';
import { Play, Dumbbell, Moon } from 'lucide-react';

interface TodaysMissionCardProps {
  dayLabel: string;
  workoutTitle?: string;
  workoutFocus?: string;
  isRestDay?: boolean;
  isLoading?: boolean;
  onStartWorkout?: () => void;
}

export function TodaysMissionCard({
  dayLabel,
  workoutTitle,
  workoutFocus,
  isRestDay = false,
  isLoading = false,
  onStartWorkout,
}: TodaysMissionCardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(213,94%,58%)] to-[hsl(213,94%,48%)] p-6 text-white animate-pulse">
        <div className="relative z-10 space-y-4">
          <div className="h-4 w-20 bg-white/20 rounded" />
          <div className="h-10 w-3/4 bg-white/20 rounded" />
          <div className="h-10 w-40 bg-white/20 rounded" />
          <div className="h-4 w-64 bg-white/20 rounded mt-6" />
        </div>
      </div>
    );
  }

  if (isRestDay) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-6 text-white">
        {/* Moon watermark */}
        <div className="absolute right-4 bottom-4 opacity-10">
          <Moon className="h-32 w-32" />
        </div>

        <div className="relative z-10">
          <span className="text-xs font-semibold tracking-wider opacity-80 uppercase">
            {dayLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Rest Day</h2>
          <p className="text-sm opacity-70 max-w-md">
            Recovery is when growth happens. Take it easy, stay active with light movement, and come back stronger.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(213,94%,58%)] to-[hsl(213,94%,48%)] p-6 text-white">
      {/* Dumbbell watermark */}
      <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
        <Dumbbell className="h-48 w-48" />
      </div>

      <div className="relative z-10">
        <span className="text-xs font-semibold tracking-wider opacity-80 uppercase">
          {dayLabel}
        </span>

        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-2">
          {workoutTitle || 'Workout'}
        </h2>

        {workoutFocus && (
          <p className="text-sm opacity-80 mb-4">{workoutFocus}</p>
        )}

        <Button
          onClick={onStartWorkout}
          variant="secondary"
          className="bg-white text-[hsl(213,94%,48%)] hover:bg-white/90 font-semibold"
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          START WORKOUT
        </Button>

        <p className="text-sm mt-6 opacity-70">
          Tap to view full breakdown, set execution cues, and tracking details.
        </p>
      </div>
    </div>
  );
}
