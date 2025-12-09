'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { List, FileText, X } from 'lucide-react';
import { ExerciseAccordionCard } from './ExerciseAccordionCard';
import { ExerciseExpandedView } from './ExerciseExpandedView';
import { WorkoutTextView } from './WorkoutTextView';
import type { WorkoutStructure, WorkoutActivity } from '@/server/agents/training/schemas';

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
  formatted: string | null;
  description: string | null;
  structure?: WorkoutStructure;
}

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

  // Fetch workout details when sheet opens
  useEffect(() => {
    if (open && workoutId) {
      const fetchWorkout = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/users/${userId}/workouts/${workoutId}`);
          if (response.ok) {
            const data = await response.json();
            setWorkout(data.data);
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWorkout();
    }
  }, [open, workoutId, userId]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setExpandedExercise(null);
    }
  }, [open]);

  // Flatten exercises from all sections
  const getAllExercises = (): (WorkoutActivity & { sectionTitle: string })[] => {
    if (!workout?.structure?.sections) return [];

    return workout.structure.sections.flatMap((section) =>
      section.exercises.map((exercise) => ({
        ...exercise,
        sectionTitle: section.title,
      }))
    );
  };

  const exercises = getAllExercises();

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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-foreground))] border-l-0"
      >
        {/* Custom header (we override the default close button) */}
        <SheetHeader className="p-4 border-b border-[hsl(var(--sidebar-border))] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[hsl(var(--sidebar-accent))] uppercase tracking-wide">
                {dayLabel}
              </span>
              <SheetTitle className="text-lg font-bold text-[hsl(var(--sidebar-foreground))] mt-1">
                {isLoading ? (
                  <Skeleton className="h-6 w-40 bg-[hsl(var(--sidebar-muted))]" />
                ) : (
                  workout?.structure?.title || workout?.goal || 'Workout'
                )}
              </SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full bg-[hsl(var(--sidebar-muted))]" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full bg-[hsl(var(--sidebar-muted))]"
                />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="breakdown" className="flex flex-col h-full">
              <div className="px-4 pt-4 pb-2">
                <TabsList className="w-full bg-[hsl(var(--sidebar-muted))]">
                  <TabsTrigger
                    value="breakdown"
                    className="flex-1 gap-2 data-[state=active]:bg-[hsl(var(--sidebar-accent))] data-[state=active]:text-white"
                  >
                    <List className="h-4 w-4" />
                    Breakdown
                  </TabsTrigger>
                  <TabsTrigger
                    value="text"
                    className="flex-1 gap-2 data-[state=active]:bg-[hsl(var(--sidebar-muted))] data-[state=active]:text-[hsl(var(--sidebar-foreground))]"
                  >
                    <FileText className="h-4 w-4" />
                    Text View
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="breakdown" className="flex-1 p-4 pt-2 mt-0">
                {exercises.length === 0 ? (
                  <div className="text-center py-8 text-[hsl(var(--sidebar-foreground))]/60">
                    <p>No structured breakdown available.</p>
                    <p className="text-sm mt-1">Try the Text View instead.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exercises.map((exercise, index) => (
                      <ExerciseAccordionCard
                        key={exercise.id || index}
                        number={index + 1}
                        name={exercise.name}
                        setsReps={formatSetsReps(exercise)}
                        tags={exercise.tags}
                        isOpen={expandedExercise === (exercise.id || String(index))}
                        onToggle={() =>
                          setExpandedExercise(
                            expandedExercise === (exercise.id || String(index))
                              ? null
                              : exercise.id || String(index)
                          )
                        }
                      >
                        <ExerciseExpandedView
                          tags={exercise.tags}
                          sets={exercise.sets}
                          reps={exercise.reps}
                          rest={exercise.rest}
                          intensity={exercise.intensity}
                          notes={exercise.notes}
                        />
                      </ExerciseAccordionCard>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="text" className="flex-1 p-4 pt-2 mt-0">
                <div className="bg-[hsl(var(--sidebar-muted))] rounded-lg p-4">
                  <WorkoutTextView
                    formatted={workout?.formatted || undefined}
                    description={workout?.description || undefined}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-[hsl(var(--sidebar-accent))] hover:bg-[hsl(var(--sidebar-accent))]/90 text-white"
          >
            Close Details
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
