'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell, MoreVertical, X } from 'lucide-react';
import { ExerciseAccordionCard } from './ExerciseAccordionCard';
import { ExerciseExpandedView } from './ExerciseExpandedView';
import { SectionAccordion } from './SectionAccordion';
import type {
  SetTrackingData,
  WorkoutTrackingState,
  ExerciseTrackingState,
  ActivityType,
  CardioTrackingData,
  MobilityTrackingData,
} from './types';

interface WorkoutDetailSheetProps {
  open: boolean;
  onClose: () => void;
  workoutId: string | null;
  userId: string;
  dayLabel: string;
  units?: 'imperial' | 'metric';
}

// Types for the new exerciseGroups schema (V2)
interface ExerciseGroupMovement {
  name: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  pace?: string;
  duration?: string;
  intensity?: string;
  tempo?: string;
  rpe?: string;
  rest?: string;
  notes?: string;
  setDetails?: Array<{
    reps: string;
    weight?: string;
    rpe?: string;
    type?: 'warmup' | 'working' | 'backoff' | 'drop';
    notes?: string;
  }>;
}

interface ExerciseGroup {
  block: 'warmup' | 'main' | 'conditioning' | 'cooldown';
  title?: string;
  structure: 'straight-sets' | 'circuit' | 'emom' | 'amrap' | 'for-time' | 'intervals';
  notes?: string;
  rounds?: number;
  duration?: number;
  rest?: string;
  movements: ExerciseGroupMovement[];
}

// V2 Exercise Groups format only
interface WorkoutData {
  id: string;
  date: string;
  sessionType: string;
  goal: string | null;
  description: string | null;
  details?: {
    exerciseGroups: ExerciseGroup[];
    date?: string;
    dayOfWeek?: string;
    focus?: string;
    title?: string;
    description?: string;
    estimatedDuration?: number;
    location?: string;
  };
}

// Types for saved metrics from API
interface SavedStrengthMetric {
  type: 'strength';
  sets: Array<{
    setNumber: number;
    weight: number | null;
    weightUnit: 'lbs' | 'kg';
    reps: number | null;
    completed: boolean;
  }>;
}

interface SavedCardioMetric {
  type: 'cardio';
  durationSeconds: number | null;
  distanceMeters: number | null;
  distanceUnit?: 'km' | 'mi';
  completed: boolean;
}

interface SavedMobilityMetric {
  type: 'mobility';
  durationSeconds: number | null;
  completed: boolean;
}

type SavedMetricData = SavedStrengthMetric | SavedCardioMetric | SavedMobilityMetric;

// Determine if a section should be collapsed by default based on title
const shouldCollapseByDefault = (title: string): boolean => {
  const lower = title.toLowerCase();
  return lower.includes('warm') || lower.includes('cool');
};

// Map activity type
const getActivityType = (block?: string): ActivityType => {
  switch (block) {
    case 'conditioning':
      return 'cardio';
    case 'cooldown':
      return 'mobility';
    default:
      return 'strength';
  }
};

export function WorkoutDetailSheet({
  open,
  onClose,
  workoutId,
  userId,
  dayLabel,
  units = 'imperial',
}: WorkoutDetailSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [trackingState, setTrackingState] = useState<WorkoutTrackingState>({});
  const [savedMetrics, setSavedMetrics] = useState<Record<string, SavedMetricData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Track pending saves to debounce
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch workout details and metrics when sheet opens
  useEffect(() => {
    if (open && workoutId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch workout and metrics in parallel
          const [workoutRes, metricsRes] = await Promise.all([
            fetch(`/api/users/${userId}/workouts/${workoutId}`),
            fetch(`/api/users/${userId}/workouts/${workoutId}/metrics`),
          ]);

          if (workoutRes.ok) {
            const workoutData = await workoutRes.json();
            setWorkout(workoutData.data);
          }

          if (metricsRes.ok) {
            const metricsData = await metricsRes.json();
            setSavedMetrics(metricsData.data || {});
          }
        } catch (error) {
          console.error('Error fetching workout data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [open, workoutId, userId]);

  // Initialize expanded sections and tracking state when workout data loads (V2 only)
  useEffect(() => {
    if (workout?.details?.exerciseGroups && workout.details.exerciseGroups.length > 0) {
      const initialExpanded = new Set<number>();
      const initialTracking: WorkoutTrackingState = {};

      workout.details.exerciseGroups.forEach((group, groupIdx) => {
        if (!shouldCollapseByDefault(group.title || group.block)) {
          initialExpanded.add(groupIdx);
        }

        group.movements.forEach((movement, movementIdx) => {
          const exerciseKey = `${group.block}-${groupIdx}-${movementIdx}`;
          const activityType = group.block === 'conditioning' ? 'cardio' : 
                              group.block === 'cooldown' ? 'mobility' : 'strength';

          // Create tracking state for V2 format
          const setsCount = parseInt(movement.sets || '3', 10) || 3;
          initialTracking[exerciseKey] = {
            exerciseId: exerciseKey,
            resolvedExerciseId: undefined,
            activityType,
            sets: Array.from({ length: setsCount }, (_, i) => ({
              id: `${exerciseKey}-set-${i + 1}`,
              setNumber: i + 1,
              targetReps: movement.reps || '10',
              weight: '',
              reps: '',
              completed: false,
            })),
          };
        });
      });

      setExpandedSections(initialExpanded);
      setTrackingState(initialTracking);
    }
  }, [workout, savedMetrics]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setExpandedExercise(null);
      setTrackingState({});
      setSavedMetrics({});
      // Clear any pending saves
      Object.values(saveTimeoutRef.current).forEach(clearTimeout);
      saveTimeoutRef.current = {};
    }
  }, [open]);

  // Save metrics for an exercise
  const saveExerciseMetrics = useCallback(
    async (exerciseKey: string, exerciseState: ExerciseTrackingState) => {
      if (!workoutId || !exerciseState.resolvedExerciseId) {
        // Can't save without a resolved exercise ID
        return;
      }

      setIsSaving(true);
      try {
        let data: SavedMetricData;

        if (exerciseState.activityType === 'cardio' && exerciseState.cardio) {
          const { durationMinutes, durationSeconds, distance, distanceUnit, completed } =
            exerciseState.cardio;
          const totalSeconds =
            (parseInt(durationMinutes || '0', 10) || 0) * 60 +
            (parseInt(durationSeconds || '0', 10) || 0);
          const distanceMeters = (parseFloat(distance || '0') || 0) * 1000;

          data = {
            type: 'cardio',
            durationSeconds: totalSeconds || null,
            distanceMeters: distanceMeters || null,
            distanceUnit,
            completed,
          };
        } else if (exerciseState.activityType === 'mobility' && exerciseState.mobility) {
          const { durationMinutes, durationSeconds, completed } = exerciseState.mobility;
          const totalSeconds =
            (parseInt(durationMinutes || '0', 10) || 0) * 60 +
            (parseInt(durationSeconds || '0', 10) || 0);

          data = {
            type: 'mobility',
            durationSeconds: totalSeconds || null,
            completed,
          };
        } else {
          // Strength
          data = {
            type: 'strength',
            sets: exerciseState.sets.map((set) => ({
              setNumber: set.setNumber,
              weight: set.weight ? parseFloat(set.weight) : null,
              weightUnit: (units === 'imperial' ? 'lbs' : 'kg') as 'lbs' | 'kg',
              reps: set.reps ? parseInt(set.reps, 10) : null,
              completed: set.completed,
            })),
          };
        }

        await fetch(`/api/users/${userId}/workouts/${workoutId}/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: exerciseState.resolvedExerciseId,
            data,
          }),
        });
      } catch (error) {
        console.error('Error saving metrics:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [workoutId, userId, units]
  );

  // Debounced save on blur
  const handleSaveOnBlur = useCallback(
    (exerciseKey: string) => {
      const exerciseState = trackingState[exerciseKey];
      if (!exerciseState) return;

      // Clear existing timeout for this exercise
      if (saveTimeoutRef.current[exerciseKey]) {
        clearTimeout(saveTimeoutRef.current[exerciseKey]);
      }

      // Set a short delay to batch rapid changes
      saveTimeoutRef.current[exerciseKey] = setTimeout(() => {
        saveExerciseMetrics(exerciseKey, exerciseState);
        delete saveTimeoutRef.current[exerciseKey];
      }, 300);
    },
    [trackingState, saveExerciseMetrics]
  );

  const exerciseGroups = workout?.details?.exerciseGroups || [];

  // Check if there are any exercises across all groups
  const hasExercises = useMemo(() => {
    return exerciseGroups.some((group) => group.movements.length > 0);
  }, [exerciseGroups]);

  const toggleSection = (sectionIdx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionIdx)) {
        next.delete(sectionIdx);
      } else {
        next.add(sectionIdx);
      }
      return next;
    });
  };

  // Update set tracking data
  const updateSetData = useCallback(
    (exerciseKey: string, setId: string, field: keyof SetTrackingData, value: string | boolean) => {
      setTrackingState((prev) => {
        const exerciseState = prev[exerciseKey];
        if (!exerciseState) return prev;

        return {
          ...prev,
          [exerciseKey]: {
            ...exerciseState,
            sets: exerciseState.sets.map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          },
        };
      });
    },
    []
  );

  // Update cardio tracking data
  const updateCardioData = useCallback(
    (exerciseKey: string, field: keyof CardioTrackingData, value: string | boolean) => {
      setTrackingState((prev) => {
        const exerciseState = prev[exerciseKey];
        if (!exerciseState || !exerciseState.cardio) return prev;

        return {
          ...prev,
          [exerciseKey]: {
            ...exerciseState,
            cardio: {
              ...exerciseState.cardio,
              [field]: value,
            },
          },
        };
      });
    },
    []
  );

  // Update mobility tracking data
  const updateMobilityData = useCallback(
    (exerciseKey: string, field: keyof MobilityTrackingData, value: string | boolean) => {
      setTrackingState((prev) => {
        const exerciseState = prev[exerciseKey];
        if (!exerciseState || !exerciseState.mobility) return prev;

        return {
          ...prev,
          [exerciseKey]: {
            ...exerciseState,
            mobility: {
              ...exerciseState.mobility,
              [field]: value,
            },
          },
        };
      });
    },
    []
  );

  // Get completion status for an exercise
  const getExerciseCompletion = useCallback(
    (exerciseKey: string) => {
      const exerciseState = trackingState[exerciseKey];
      if (!exerciseState) return { completed: 0, total: 0, isFullyComplete: false };

      if (exerciseState.activityType === 'cardio' && exerciseState.cardio) {
        return {
          completed: exerciseState.cardio.completed ? 1 : 0,
          total: 1,
          isFullyComplete: exerciseState.cardio.completed,
        };
      }

      if (exerciseState.activityType === 'mobility' && exerciseState.mobility) {
        return {
          completed: exerciseState.mobility.completed ? 1 : 0,
          total: 1,
          isFullyComplete: exerciseState.mobility.completed,
        };
      }

      const completed = exerciseState.sets.filter((s) => s.completed).length;
      const total = exerciseState.sets.length;
      return { completed, total, isFullyComplete: completed === total && total > 0 };
    },
    [trackingState]
  );

  // Handle finish workout
  const handleFinishWorkout = () => {
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col bg-slate-900 text-slate-100 border-l border-slate-800"
        hideCloseButton
      >
        {/* Custom header */}
        <SheetHeader className="p-6 border-b border-slate-800 flex-shrink-0 text-left bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Dumbbell size={16} />
                <span className="text-xs font-bold tracking-wider uppercase">
                  {dayLabel}
                </span>
                {isSaving && (
                  <span className="text-xs text-slate-500 ml-2">Saving...</span>
                )}
              </div>
              <SheetTitle className="text-2xl font-bold text-white mt-1">
                {isLoading ? (
                  <Skeleton className="h-7 w-48 bg-slate-800" />
                ) : (
                  workout?.details?.title || workout?.goal || 'Workout'
                )}
              </SheetTitle>
              {!isLoading && workout?.details?.focus && (
                <p className="text-sm text-slate-400 mt-1">
                  {workout.details.focus}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full bg-slate-800"
                />
              ))}
            </div>
          ) : !hasExercises ? (
            <div className="text-center py-12 text-slate-400">
              <p>No structured breakdown available.</p>
            </div>
          ) : (
            <div>
              {exerciseGroups.map((group, groupIdx) => {
                if (group.movements.length === 0) return null;

                // Get block label for V2 format
                const blockLabel = group.block 
                  ? `[${group.block.charAt(0).toUpperCase() + group.block.slice(1)}] `
                  : '';
                const groupTitle = blockLabel + (group.title || group.block);

                return (
                  <div key={groupIdx} className="mb-2">
                    <SectionAccordion
                      title={groupTitle}
                      exerciseCount={group.movements.length}
                      isOpen={expandedSections.has(groupIdx)}
                      onToggle={() => toggleSection(groupIdx)}
                    >
                      {group.movements.map((movement, movementIdx) => {
                        const exerciseKey = `${group.block}-${groupIdx}-${movementIdx}`;
                        const completion = getExerciseCompletion(exerciseKey);
                        const exerciseTracking = trackingState[exerciseKey];

                        return (
                          <ExerciseAccordionCard
                            key={exerciseKey}
                            number={movementIdx + 1}
                            name={movement.name}
                            setsReps={movement.sets && movement.reps ? `${movement.sets} × ${movement.reps}` : movement.duration || movement.distance || ''}
                            tags={[]}
                            isOpen={expandedExercise === exerciseKey}
                            onToggle={() =>
                              setExpandedExercise(
                                expandedExercise === exerciseKey ? null : exerciseKey
                              )
                            }
                            completedSets={completion.completed}
                            totalSets={completion.total}
                            isFullyComplete={completion.isFullyComplete}
                          >
                            <ExerciseExpandedView
                              sets={movement.sets}
                              reps={movement.reps}
                              rest={movement.rest}
                              intensity={movement.intensity}
                              notes={movement.notes}
                              rpe={movement.rpe}
                              tempo={movement.tempo}
                              setDetails={movement.setDetails}
                              activityType={exerciseTracking?.activityType || (group.block === 'conditioning' ? 'cardio' : group.block === 'cooldown' ? 'mobility' : 'strength')}
                              trackingData={exerciseTracking?.sets || []}
                              cardioData={exerciseTracking?.cardio}
                              mobilityData={exerciseTracking?.mobility}
                              onUpdateSet={(setId, field, value) =>
                                updateSetData(exerciseKey, setId, field, value)
                              }
                              onUpdateCardio={(field, value) =>
                                updateCardioData(exerciseKey, field, value)
                              }
                              onUpdateMobility={(field, value) =>
                                updateMobilityData(exerciseKey, field, value)
                              }
                              onBlur={() => handleSaveOnBlur(exerciseKey)}
                              units={units}
                            />
                          </ExerciseAccordionCard>
                        );
                      })}
                    </SectionAccordion>
                  </div>
                );
              })}

              {/* Finish Workout Action */}
              <div className="p-6">
                <Button
                  onClick={handleFinishWorkout}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98]"
                >
                  Finish Workout
                </Button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  All progress is automatically saved.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
