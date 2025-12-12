'use client';

import { useState, useEffect, useCallback } from 'react';
import { MeHeader } from '@/components/pages/me/layout';
import {
  CoreStrategyCard,
  ProgressionCard,
  AdjustmentCard,
  WeeklyRhythmCard,
  ConditioningCard,
  PlanSkeleton,
} from '@/components/pages/me/plan';
import type { PlanStructure } from '@/server/agents/training/schemas';

interface UserPlanViewProps {
  userId: string;
}

interface PlanData {
  description: string | null;
  formatted: string | null;
  structure?: PlanStructure;
  startDate: string;
}

interface MicrocycleData {
  absoluteWeek?: number;
  structured?: {
    days?: Array<{
      day: string;
      focus: string;
      activityType: string;
      isRest: boolean;
    }>;
  };
}

export function UserPlanView({ userId }: UserPlanViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [microcycle, setMicrocycle] = useState<MicrocycleData | null>(null);

  const fetchPlanData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch fitness plan
      const planResponse = await fetch(`/api/users/${userId}/fitness-plan`);
      if (planResponse.ok) {
        const planData = await planResponse.json();
        setPlan(planData.data);
      }

      // Fetch current microcycle (API defaults to current week using user's timezone)
      const microcycleResponse = await fetch(`/api/users/${userId}/microcycle`);
      if (microcycleResponse.ok) {
        const microcycleData = await microcycleResponse.json();
        setMicrocycle(microcycleData.data);
      }
    } catch (err) {
      console.error('Error fetching plan data:', err);
      setError('Failed to load plan data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPlanData();
  }, [fetchPlanData]);

  if (isLoading) {
    return <PlanSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchPlanData}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Get structured data or fall back to empty
  const structure = plan?.structure;

  // Build weekly rhythm from microcycle structured data or plan schedule template
  const weeklyDays = microcycle?.structured?.days?.map((d) => ({
    day: d.day,
    focus: d.focus || (d.isRest ? 'Rest' : d.activityType),
    isRest: d.isRest,
  })) || structure?.scheduleTemplate?.map((s) => ({
    day: s.day,
    focus: s.focus,
    isRest: s.focus?.toLowerCase().includes('rest') ?? false,
  })) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <MeHeader
        title="Program Blueprint"
        subtitle={structure?.name || 'Your Fitness Plan'}
        status={{
          label: 'Active',
          weekNumber: microcycle?.absoluteWeek || 1,
        }}
      />

      {/* Program type subtitle */}
      {structure?.type && (
        <p className="text-sm text-muted-foreground">
          {structure.type}
        </p>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <CoreStrategyCard description={structure?.coreStrategy} />
          <ProgressionCard strategies={structure?.progressionStrategy} />
          <AdjustmentCard description={structure?.adjustmentStrategy} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <WeeklyRhythmCard days={weeklyDays} />
          <ConditioningCard guidelines={structure?.conditioning} />
        </div>
      </div>
    </div>
  );
}
