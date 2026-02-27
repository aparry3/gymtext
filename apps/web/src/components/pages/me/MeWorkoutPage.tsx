'use client';

import { useEffect, useState } from 'react';
import { AntWorkoutView } from './ant/AntWorkoutView';
import type { Workout, Block, WorkoutItem, NestedItem, FeedbackField, Detail } from './ant/mockData';

interface WorkoutData {
  id: string;
  date: string;
  message: string | null;
  details: Record<string, unknown> | null;
}

// V2 types (from API response)
interface V2Movement {
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
  setDetails?: { reps: string; weight?: string; rpe?: string; type?: string; notes?: string }[];
  display?: { key: string; label: string; value: string; emphasis: string; meta?: string }[];
  tracking?: { key: string; label: string; type: string; unit?: string; required?: boolean; defaultValue?: number | string; placeholder?: string }[];
}

interface V2Section {
  block: string;
  title?: string;
  structure: string;
  notes?: string;
  rounds?: number;
  duration?: number;
  rest?: string;
  movements: V2Movement[];
  groupDisplay?: { key: string; label: string; value: string; emphasis: string }[];
  groupTracking?: { key: string; label: string; type: string; unit?: string; required?: boolean }[];
}

interface V2Details {
  date: string;
  dayOfWeek: string;
  focus: string;
  title: string;
  description?: string;
  estimatedDuration?: number;
  location?: string;
  exerciseGroups: V2Section[];
}

// V3 types (for AntWorkoutView) — re-exported from mockData

const BLOCK_LABELS: Record<string, string> = {
  warmup: 'Warmup',
  main: 'Main Lifts',
  conditioning: 'Conditioning',
  cooldown: 'Cooldown',
};

function buildShortDetail(m: V2Movement): string {
  const parts: string[] = [];
  if (m.sets && m.reps) parts.push(`${m.sets}×${m.reps}`);
  else if (m.reps) parts.push(m.reps);
  else if (m.sets) parts.push(`${m.sets} sets`);
  if (m.weight) parts.push(`@ ${m.weight}`);
  if (m.duration) parts.push(m.duration);
  if (m.distance) parts.push(m.distance);
  return parts.join(' ') || '';
}

function buildDetails(m: V2Movement): Detail[] {
  const details: Detail[] = [];
  if (m.tempo) details.push({ text: `Tempo: ${m.tempo}`, type: 'context' });
  if (m.rpe) details.push({ text: `RPE ${m.rpe}`, type: 'context' });
  if (m.intensity) details.push({ text: m.intensity, type: 'context' });
  if (m.rest) details.push({ text: `Rest: ${m.rest}`, type: 'note' });
  return details;
}

function buildFeedbackFields(m: V2Movement): FeedbackField[] | undefined {
  if (m.tracking && m.tracking.length > 0) {
    return m.tracking.map((t) => ({
      key: t.key,
      label: t.label,
      type: t.type as FeedbackField['type'],
      required: t.required,
    }));
  }

  // If there are set details, build set-based feedback
  if (m.setDetails && m.setDetails.length > 0) {
    return [
      { key: 'set', label: 'Set', type: 'number' as const, editable: false },
      { key: 'weight', label: 'Weight', type: 'number' as const, required: true },
      { key: 'reps', label: 'Reps', type: 'number' as const, required: true },
    ];
  }

  return undefined;
}

function buildFeedbackRows(m: V2Movement): Record<string, string | number>[] | undefined {
  if (m.setDetails && m.setDetails.length > 0) {
    return m.setDetails.map((sd, i) => ({
      set: i + 1,
      weight: sd.weight || '',
      reps: sd.reps || '',
    }));
  }
  return undefined;
}

function transformV2ToV3(details: V2Details): { workout: Workout; title: string; sessionType: string; duration?: number } {
  // Collect unique blocks in order
  const seenBlocks = new Set<string>();
  const blocks: Block[] = [];
  const items: WorkoutItem[] = [];

  for (const section of details.exerciseGroups) {
    const blockKey = section.block;
    const blockId = `block-${blockKey}`;

    if (!seenBlocks.has(blockKey)) {
      seenBlocks.add(blockKey);
      blocks.push({
        id: blockId,
        label: section.title || BLOCK_LABELS[blockKey] || blockKey,
      });
    }

    const isGrouped = section.structure === 'circuit' || section.structure === 'amrap' || section.structure === 'emom' || section.structure === 'for-time';

    if (isGrouped && section.movements.length > 1) {
      // Group as a single item with nested items
      const groupLabel = section.title || `${section.structure.toUpperCase()}${section.rounds ? ` × ${section.rounds}` : ''}${section.duration ? ` ${section.duration} min` : ''}`;
      const groupShort = section.rounds ? `${section.rounds} rounds` : section.duration ? `${section.duration} min` : '';

      const nestedItems: NestedItem[] = section.movements.map((m) => ({
        name: m.name,
        short_detail: buildShortDetail(m),
        details: buildDetails(m).length > 0 ? buildDetails(m) : undefined,
        feedbackFields: buildFeedbackFields(m),
        feedbackRows: buildFeedbackRows(m),
      }));

      const groupDetails: Detail[] = [];
      if (section.notes) groupDetails.push({ text: section.notes, type: 'note' });
      if (section.rest) groupDetails.push({ text: `Rest: ${section.rest}`, type: 'note' });

      // Group-level feedback (e.g., AMRAP rounds)
      let groupFeedbackFields: FeedbackField[] | undefined;
      let groupFeedbackRows: Record<string, string | number>[] | undefined;
      if (section.groupTracking && section.groupTracking.length > 0) {
        groupFeedbackFields = section.groupTracking.map((t) => ({
          key: t.key,
          label: t.label,
          type: t.type as FeedbackField['type'],
          required: t.required,
        }));
        groupFeedbackRows = [Object.fromEntries(section.groupTracking.map((t) => [t.key, '']))];
      }

      items.push({
        blockId,
        name: groupLabel,
        short_detail: groupShort,
        details: groupDetails.length > 0 ? groupDetails : undefined,
        items: nestedItems,
        feedbackFields: groupFeedbackFields,
        feedbackRows: groupFeedbackRows,
      });
    } else {
      // Each movement is its own item
      for (const m of section.movements) {
        const notes = [m.notes, section.notes].filter(Boolean).join('. ') || undefined;
        const details = buildDetails(m);

        items.push({
          blockId,
          name: m.name,
          short_detail: buildShortDetail(m),
          details: details.length > 0 ? details : undefined,
          notes,
          feedbackFields: buildFeedbackFields(m),
          feedbackRows: buildFeedbackRows(m),
        });
      }
    }
  }

  return {
    workout: { blocks, items },
    title: details.title,
    sessionType: details.focus,
    duration: details.estimatedDuration,
  };
}

function isV2Details(details: Record<string, unknown>): boolean {
  return Array.isArray((details as unknown as V2Details).exerciseGroups);
}

function isV3Workout(details: Record<string, unknown>): boolean {
  return Array.isArray(details.blocks) && Array.isArray(details.items);
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

        const details = todayWorkout.details as Record<string, unknown>;

        if (isV3Workout(details)) {
          // Already V3 format (blocks + items)
          const v3 = details as unknown as { blocks: Block[]; items: WorkoutItem[]; title?: string; focus?: string; estimatedDuration?: number };
          setWorkoutData({
            workout: { blocks: v3.blocks, items: v3.items },
            title: v3.title || (details.title as string) || 'Workout',
            sessionType: v3.focus || (details.focus as string) || 'Training',
            duration: v3.estimatedDuration || (details.estimatedDuration as number | undefined),
          });
        } else if (isV2Details(details)) {
          // V2 format — transform
          setWorkoutData(transformV2ToV3(details as unknown as V2Details));
        }
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
