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
import { Dumbbell, MoreVertical, X, Clock } from 'lucide-react';
import { ExerciseAccordionCard } from './ExerciseAccordionCard';
import { ExerciseExpandedView } from './ExerciseExpandedView';
import { SectionAccordion } from './SectionAccordion';
import type {
  WorkoutDetails,
  WorkoutDetailsMovement,
  WorkoutDetailsSection,
  WorkoutSectionType,
} from '@gymtext/shared';
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

interface WorkoutData {
  id: string;
  date: string;
  message: string | null;
  details: WorkoutDetails | null;
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

// Infer activity type from section context and movement fields
const inferActivityType = (
  sectionType: WorkoutSectionType,
  movement: WorkoutDetailsMovement
): ActivityType => {
  // Cardio indicators: has pace or distance without sets
  if ((movement.pace || movement.distance) && !movement.sets) {
    return 'cardio';
  }
  // Conditioning sections with duration-only movements → cardio
  if (sectionType === 'conditioning' && movement.duration && !movement.sets) {
    return 'cardio';
  }
  // Warmup/cooldown with only duration → mobility
  if ((sectionType === 'warmup' || sectionType === 'cooldown') && movement.duration && !movement.sets && !movement.reps) {
    return 'mobility';
  }
  // Default → strength
  return 'strength';
};

// Generate tracking state for a movement
const generateMovementTrackingState = (
  exerciseKey: string,
  sectionType: WorkoutSectionType,
  movement: WorkoutDetailsMovement,
  savedMetric?: SavedMetricData
): ExerciseTrackingState => {
  const activityType = inferActivityType(sectionType, movement);

  if (activityType === 'cardio') {
    const savedCardio = savedMetric?.type === 'cardio' ? savedMetric : undefined;
    const durationSeconds = savedCardio?.durationSeconds ?? 0;
    const distanceMeters = savedCardio?.distanceMeters ?? 0;

    return {
      exerciseId: exerciseKey,
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
      activityType,
      sets: [],
      mobility: {
        durationMinutes: durationSeconds ? Math.floor(durationSeconds / 60).toString() : '',
        durationSeconds: durationSeconds ? (durationSeconds % 60).toString() : '',
        completed: savedMobility?.completed ?? false,
      },
    };
  }

  // Strength: use setDetails if present, otherwise simple sets/reps
  const savedStrength = savedMetric?.type === 'strength' ? savedMetric : undefined;

  let sets: SetTrackingData[];

  if (movement.setDetails && movement.setDetails.length > 0) {
    sets = movement.setDetails.map((sd, i) => {
      const savedSet = savedStrength?.sets?.find((s) => s.setNumber === i + 1);
      return {
        id: `${exerciseKey}-set-${i + 1}`,
        setNumber: i + 1,
        targetReps: sd.reps || movement.reps || '10',
        targetWeight: sd.weight,
        setType: sd.type,
        weight: savedSet?.weight?.toString() || '',
        reps: savedSet?.reps?.toString() || '',
        completed: savedSet?.completed ?? false,
      };
    });
  } else {
    const setsCount = parseInt(movement.sets || '3', 10) || 3;
    sets = Array.from({ length: setsCount }, (_, i) => {
      const savedSet = savedStrength?.sets?.find((s) => s.setNumber === i + 1);
      return {
        id: `${exerciseKey}-set-${i + 1}`,
        setNumber: i + 1,
        targetReps: movement.reps || '10',
        weight: savedSet?.weight?.toString() || '',
        reps: savedSet?.reps?.toString() || '',
        completed: savedSet?.completed ?? false,
      };
    });
  }

  return {
    exerciseId: exerciseKey,
    activityType,
    sets,
  };
};

// Group consecutive sections with the same type into a single group
interface GroupedSection {
  type: WorkoutSectionType;
  title: string;
  entries: Array<{ originalSectionIdx: number; section: WorkoutDetailsSection }>;
  totalMovements: number;
}

function groupConsecutiveSections(sections: WorkoutDetailsSection[]): GroupedSection[] {
  const groups: GroupedSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.type === section.type) {
      lastGroup.entries.push({ originalSectionIdx: i, section });
      lastGroup.totalMovements += section.movements.length;
    } else {
      const typeLabels: Record<WorkoutSectionType, string> = {
        warmup: 'Warm-Up',
        main: 'Main',
        conditioning: 'Conditioning',
        cooldown: 'Cool Down',
      };
      groups.push({
        type: section.type,
        title: section.title || typeLabels[section.type] || section.type,
        entries: [{ originalSectionIdx: i, section }],
        totalMovements: section.movements.length,
      });
    }
  }

  return groups;
}

// Format sets x reps for display
const formatSetsReps = (movement: WorkoutDetailsMovement): string => {
  if (movement.sets && movement.reps) {
    return `${movement.sets} \u00D7 ${movement.reps}`;
  }
  if (movement.duration) {
    return movement.duration;
  }
  if (movement.distance) {
    return movement.distance;
  }
  if (movement.reps) {
    return movement.reps;
  }
  return '';
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

  // Initialize expanded sections and tracking state when workout data loads
  useEffect(() => {
    if (workout?.details?.sections) {
      const initialExpanded = new Set<number>();
      const initialTracking: WorkoutTrackingState = {};
      const groups = groupConsecutiveSections(workout.details.sections);

      // Expand/collapse based on group indices (which is what the UI iterates)
      groups.forEach((group, groupIdx) => {
        if (group.type !== 'warmup' && group.type !== 'cooldown') {
          initialExpanded.add(groupIdx);
        }
      });

      // Tracking state still uses originalSectionIdx for backward-compatible keys
      workout.details.sections.forEach((section, sectionIdx) => {
        section.movements.forEach((movement, movementIdx) => {
          const exerciseKey = `${sectionIdx}-${movementIdx}`;
          initialTracking[exerciseKey] = generateMovementTrackingState(
            exerciseKey,
            section.type,
            movement,
            undefined // savedMetrics lookup would need movement-level IDs
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
      Object.values(saveTimeoutRef.current).forEach(clearTimeout);
      saveTimeoutRef.current = {};
    }
  }, [open]);

  // Save metrics for an exercise
  const saveExerciseMetrics = useCallback(
    async (exerciseKey: string, exerciseState: ExerciseTrackingState) => {
      if (!workoutId || !exerciseState.resolvedExerciseId) {
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

      if (saveTimeoutRef.current[exerciseKey]) {
        clearTimeout(saveTimeoutRef.current[exerciseKey]);
      }

      saveTimeoutRef.current[exerciseKey] = setTimeout(() => {
        saveExerciseMetrics(exerciseKey, exerciseState);
        delete saveTimeoutRef.current[exerciseKey];
      }, 300);
    },
    [trackingState, saveExerciseMetrics]
  );

  const sections = workout?.details?.sections || [];

  const groupedSections = useMemo(() => groupConsecutiveSections(sections), [sections]);

  // Check if there are any movements across all sections
  const hasMovements = useMemo(() => {
    return sections.some((section) => section.movements.length > 0);
  }, [sections]);

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
                  workout?.details?.title || 'Workout'
                )}
              </SheetTitle>
              {!isLoading && (
                <div className="flex items-center gap-3 mt-1">
                  {workout?.details?.focus && (
                    <p className="text-sm text-slate-400">
                      {workout.details.focus}
                    </p>
                  )}
                  {workout?.details?.estimatedDuration && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      ~{workout.details.estimatedDuration} min
                    </span>
                  )}
                </div>
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
          ) : !hasMovements ? (
            // Fallback: show message text if no structured details
            <div className="p-6">
              {workout?.message ? (
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300">
                  {workout.message}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>No workout details available.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {groupedSections.map((group, groupIdx) => {
                if (group.totalMovements === 0) return null;

                const isSingleEntry = group.entries.length === 1;
                const firstEntry = group.entries[0];

                // Single-entry group: render exactly like before
                if (isSingleEntry) {
                  const { originalSectionIdx, section } = firstEntry;
                  return (
                    <div key={groupIdx} className="mb-2">
                      <SectionAccordion
                        title={section.title || section.type}
                        exerciseCount={section.movements.length}
                        isOpen={expandedSections.has(groupIdx)}
                        onToggle={() => toggleSection(groupIdx)}
                        sectionType={section.type}
                        structure={section.structure}
                        rounds={section.rounds}
                        sectionNotes={section.notes}
                      >
                        {section.movements.map((movement, movementIdx) => {
                          const exerciseKey = `${originalSectionIdx}-${movementIdx}`;
                          const completion = getExerciseCompletion(exerciseKey);
                          const exerciseTracking = trackingState[exerciseKey];

                          return (
                            <ExerciseAccordionCard
                              key={exerciseKey}
                              number={movementIdx + 1}
                              name={movement.name}
                              setsReps={formatSetsReps(movement)}
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
                                rpe={movement.rpe}
                                tempo={movement.tempo}
                                notes={movement.notes}
                                setDetails={movement.setDetails}
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
                                units={units}
                              />
                            </ExerciseAccordionCard>
                          );
                        })}
                      </SectionAccordion>
                    </div>
                  );
                }

                // Multi-entry group: merge all entries under one collapsible
                let runningNumber = 0;
                return (
                  <div key={groupIdx} className="mb-2">
                    <SectionAccordion
                      title={group.title}
                      exerciseCount={group.totalMovements}
                      isOpen={expandedSections.has(groupIdx)}
                      onToggle={() => toggleSection(groupIdx)}
                      sectionType={group.type}
                    >
                      {group.entries.map(({ originalSectionIdx, section }) => (
                        section.movements.map((movement, movementIdx) => {
                          runningNumber++;
                          const exerciseKey = `${originalSectionIdx}-${movementIdx}`;
                          const completion = getExerciseCompletion(exerciseKey);
                          const exerciseTracking = trackingState[exerciseKey];
                          const showStructureBadge =
                            section.structure && section.structure !== 'straight-sets';

                          return (
                            <div key={exerciseKey}>
                              {section.notes && movementIdx === 0 && (
                                <p className="px-4 py-1 text-xs text-slate-500 italic">
                                  {section.notes}
                                </p>
                              )}
                              {showStructureBadge && movementIdx === 0 && (
                                <div className="px-4 py-1">
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                                    {section.structure}{section.rounds && section.rounds > 1 ? ` · ${section.rounds} rounds` : ''}
                                  </span>
                                </div>
                              )}
                              <ExerciseAccordionCard
                                number={runningNumber}
                                name={movement.name}
                                setsReps={formatSetsReps(movement)}
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
                                  rest={movement.rest || section.rest}
                                  intensity={movement.intensity}
                                  rpe={movement.rpe}
                                  tempo={movement.tempo}
                                  notes={movement.notes}
                                  setDetails={movement.setDetails}
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
                                  units={units}
                                />
                              </ExerciseAccordionCard>
                            </div>
                          );
                        })
                      ))}
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
