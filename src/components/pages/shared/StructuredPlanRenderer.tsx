'use client';

import {
  CoreStrategyCard,
  ProgressionCard,
  AdjustmentCard,
  WeeklyRhythmCard,
  ConditioningCard,
} from '@/components/pages/me/plan';
import type { PlanStructure } from '@/server/services/agents/schemas/training';

interface StructuredPlanRendererProps {
  structure: PlanStructure | null | undefined;
  showHeader?: boolean;
  className?: string;
}

/**
 * Renders a PlanStructure using the existing plan card components.
 * Used in admin views and shared components to display fitness plan data.
 */
export function StructuredPlanRenderer({
  structure,
  showHeader = true,
  className = '',
}: StructuredPlanRendererProps) {
  if (!structure) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No plan structure available.</p>
      </div>
    );
  }

  // Convert schedule template to weekly rhythm format
  const weeklyDays = structure.scheduleTemplate?.map((s) => ({
    day: s.day,
    focus: s.focus,
    isRest: s.focus?.toLowerCase().includes('rest') ?? false,
  })) || [];

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {structure.name || 'Fitness Plan'}
          </h2>
          {structure.type && (
            <p className="text-sm text-muted-foreground mt-1">{structure.type}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <CoreStrategyCard description={structure.coreStrategy} />
          <ProgressionCard strategies={structure.progressionStrategy} />
          <AdjustmentCard description={structure.adjustmentStrategy} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <WeeklyRhythmCard days={weeklyDays} />
          <ConditioningCard guidelines={structure.conditioning} />
        </div>
      </div>
    </div>
  );
}
