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
import type { WorkoutStructure, WorkoutActivity } from '@/server/models/workout';
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
}

interface WorkoutData {
  id: string;
  date: string;
  sessionType: string;
  goal: string | null;
  description: string | null;
  structured?: WorkoutStructure;
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

// Map workout activity type to tracking activity type
const getActivityType = (exerciseType: string | undefined): ActivityType => {
  switch (exerciseType) {
    case 'Cardio':
      return 'cardio';
    case 'Mobility':
      return 'mobility';
    case 'Strength':
    case 'Plyometric':
    default:
      return 'strength';
  }
};

// Generate tracking state for an exercise
const generateExerciseTrackingState = (
  exerciseKey: string,
  exercise: WorkoutActivity,
  savedMetric?: SavedMetricData
): ExerciseTrackingState => {
  const activityType = getActivityType(exercise.type);
  const resolvedExerciseId = exercise.exerciseId || undefined;

  if (activityType === 'cardio') {
    const savedCardio = savedMetric?.type === 'cardio' ? savedMetric : undefined;
    const durationSeconds = savedCardio?.durationSeconds ?? 0;
    const distanceMeters = savedCardio?.distanceMeters ?? 0;

    return {
      exerciseId: exerciseKey,
      resolvedExerciseId,
      activityType,
      sets: [],
      cardio: {
        durationMinutes: durationSeconds ? Math.floor(durationSeconds / 60).toString() : '',
        durationSeconds: durationSeconds ? (durationSeconds % 60).toString() : '',
        distance: distanceMeters ? (distanceMeters / 1000).toString() : '',
        distanceUnit: savedCardio?.distanceUnit || 'km',
        completed: savedCardio?.completed ?? false,
      },
    };
  }

  if (activityType === 'mobility') {
    const savedMobility = savedMetric?.type === 'mobility' ? savedMetric : undefined;
    const durationSeconds = savedMobility?.durationSeconds ?? 0;

    return {
      exerciseId: exerciseKey,
      resolvedExerciseId,
      activityType,
      sets: [],
      mobility: {
        durationMinutes: durationSeconds ? Math.floor(durationSeconds / 60).toString() : '',
        durationSeconds: durationSeconds ? (durationSeconds % 60).toString() : '',
        completed: savedMobility?.completed ?? false,
      },
    };
  }

  // Strength exercises
  const setsCount = parseInt(exercise.sets || '3', 10) || 3;
  const savedStrength = savedMetric?.type === 'strength' ? savedMetric : undefined;

  const sets: SetTrackingData[] = Array.from({ length: setsCount }, (_, i) => {
    const savedSet = savedStrength?.sets?.find((s) => s.setNumber === i + 1);
    return {
      id: `${exerciseKey}-set-${i + 1}`,
      setNumber: i + 1,
      targetReps: exercise.reps || '10',
      weight: savedSet?.weight?.toString() || '',
      reps: savedSet?.reps?.toString() || '',
      completed: savedSet?.completed ?? false,
    };
  });

  return {
    exerciseId: exerciseKey,
    resolvedExerciseId,
    activityType,
    sets,
  };
};

export function WorkoutDetailSheet({
  open,
  onClose,
  workoutId,
  userId,
  dayLabel,
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

  // Initialize expanded sections and tracking state when workout data loads
  useEffect(() => {
    if (workout?.structured?.sections) {
      const initialExpanded = new Set<number>();
      const initialTracking: WorkoutTrackingState = {};

      workout.structured.sections.forEach((section, sectionIdx) => {
        if (!shouldCollapseByDefault(section.title)) {
          initialExpanded.add(sectionIdx);
        }

        section.exercises.forEach((exercise, exerciseIdx) => {
          const exerciseKey = exercise.id || `${sectionIdx}-${exerciseIdx}`;
          // Use resolved exerciseId to look up saved metrics
          const resolvedId = exercise.exerciseId;
          const savedMetric = resolvedId ? savedMetrics[resolvedId] : undefined;

          initialTracking[exerciseKey] = generateExerciseTrackingState(
            exerciseKey,
            exercise,
            savedMetric
          );
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
              weightUnit: 'lbs' as const,
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
    [workoutId, userId]
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

  const sections = workout?.structured?.sections || [];

  // Check if there are any exercises across all sections
  const hasExercises = useMemo(() => {
    return sections.some((section) => section.exercises.length > 0);
  }, [sections]);

  // Format sets x reps for display
  const formatSetsReps = (exercise: WorkoutActivity): string => {
    if (exercise.sets && exercise.reps) {
      return `${exercise.sets} × ${exercise.reps}`;
    }
    if (exercise.duration) {
      return exercise.duration;
    }
    if (exercise.distance) {
      return exercise.distance;
    }
    return '';
  };

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

  // Create a unique key for exercises that combines section and exercise index
  const getExerciseKey = (sectionIdx: number, exerciseIdx: number, exercise: WorkoutActivity) => {
    return exercise.id || `${sectionIdx}-${exerciseIdx}`;
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
                  workout?.structured?.title || workout?.goal || 'Workout'
                )}
              </SheetTitle>
              {!isLoading && workout?.structured?.focus && (
                <p className="text-sm text-slate-400 mt-1">
                  {workout.structured.focus}
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
              {sections.map((section, sectionIdx) => {
                if (section.exercises.length === 0) return null;

                return (
                  <div key={sectionIdx} className="mb-2">
                    <SectionAccordion
                      title={section.title}
                      exerciseCount={section.exercises.length}
                      isOpen={expandedSections.has(sectionIdx)}
                      onToggle={() => toggleSection(sectionIdx)}
                    >
                      {section.exercises.map((exercise, exerciseIdx) => {
                        const exerciseKey = getExerciseKey(sectionIdx, exerciseIdx, exercise);
                        const completion = getExerciseCompletion(exerciseKey);
                        const exerciseTracking = trackingState[exerciseKey];

                        return (
                          <ExerciseAccordionCard
                            key={exerciseKey}
                            number={exerciseIdx + 1}
                            name={exercise.name}
                            setsReps={formatSetsReps(exercise)}
                            tags={exercise.tags}
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
                              tags={exercise.tags}
                              sets={exercise.sets}
                              reps={exercise.reps}
                              rest={exercise.rest}
                              intensity={exercise.intensity}
                              notes={exercise.notes}
                              activityType={exerciseTracking?.activityType || 'strength'}
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
