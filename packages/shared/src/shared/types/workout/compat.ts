/**
 * Compatibility utilities for workout schema migration.
 *
 * The database may contain workout details in either V2 (exerciseGroups) or
 * V4 (blocks + items) format. These utilities detect the format and normalize
 * V4 data into V2 shape so existing UI components continue to work.
 *
 * TODO: Once WorkoutDetailSheet is refactored to use V4 types natively,
 * this file can be removed.
 */

import type { WorkoutDetails, WorkoutItem, WorkoutNestedItem } from './workoutDetails';

// ============================================================================
// V2 types (legacy, used by WorkoutDetailSheet)
// ============================================================================

export type WorkoutBlockType = 'warmup' | 'main' | 'conditioning' | 'cooldown';

export type WorkoutSectionStructure =
  | 'straight-sets'
  | 'circuit'
  | 'emom'
  | 'amrap'
  | 'for-time'
  | 'intervals';

export type WorkoutSetType = 'warmup' | 'working' | 'backoff' | 'drop';

/** Per-set detail for movements with varying weight/reps across sets */
export interface WorkoutSetDetail {
  reps: string;
  weight?: string;
  rpe?: string;
  type?: WorkoutSetType;
  notes?: string;
}

/** Display field for UI rendering (V2 schema) */
export interface WorkoutDisplayField {
  key: string;
  label: string;
  value: string;
  emphasis: 'primary' | 'secondary';
  meta?: string;
}

/** Tracking field for user input (V2 schema) */
export interface WorkoutTrackingField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  required?: boolean;
  defaultValue?: number | string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface LegacyMovement {
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
  setDetails?: WorkoutSetDetail[];
  display?: WorkoutDisplayField[];
  tracking?: WorkoutTrackingField[];
}

export interface LegacyExerciseGroup {
  block: WorkoutBlockType;
  title?: string;
  structure: WorkoutSectionStructure;
  notes?: string;
  rounds?: number;
  duration?: number;
  rest?: string;
  movements: LegacyMovement[];
}

export interface LegacyWorkoutDetails {
  date: string;
  dayOfWeek: string;
  focus: string;
  title: string;
  description?: string;
  estimatedDuration?: number;
  location?: string;
  exerciseGroups: LegacyExerciseGroup[];
}

// ============================================================================
// Format detection
// ============================================================================

/**
 * Detect whether workout details are V4 (blocks + items) or V2 (exerciseGroups)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isV4Format(details: any): details is WorkoutDetails {
  return details && Array.isArray(details.blocks) && Array.isArray(details.items);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isV2Format(details: any): details is LegacyWorkoutDetails {
  return details && Array.isArray(details.exerciseGroups);
}

// ============================================================================
// V4 → V2 conversion
// ============================================================================

/** Map common block IDs to V2 block types */
function mapBlockIdToType(blockId: string): WorkoutBlockType {
  const id = blockId.toLowerCase();
  if (id.includes('warm') || id.includes('prep') || id.includes('activation')) return 'warmup';
  if (id.includes('cool') || id.includes('stretch') || id.includes('recovery')) return 'cooldown';
  if (id.includes('condition') || id.includes('finish') || id.includes('metcon') || id.includes('cardio')) return 'conditioning';
  return 'main';
}

/** Infer V2 structure type from an item */
function inferStructure(item: WorkoutItem): WorkoutSectionStructure {
  if (item.items && item.items.length > 0) {
    // Has nested items — it's a circuit or superset
    const name = item.name.toLowerCase();
    if (name.includes('circuit') || name.includes('emom') || name.includes('amrap')) return 'circuit';
    return 'circuit'; // supersets rendered as circuits in V2
  }
  return 'straight-sets';
}

/** Convert a V4 nested item to a V2 movement */
function nestedItemToMovement(nested: WorkoutNestedItem): LegacyMovement {
  return {
    name: nested.name,
    reps: nested.short_detail,
    notes: nested.details?.map(d => d.text).join('. '),
  };
}

/** Convert a V4 item (with feedbackRows) to a V2 movement */
function itemToMovement(item: WorkoutItem): LegacyMovement {
  const movement: LegacyMovement = {
    name: item.name,
    notes: item.notes,
  };

  // Parse short_detail for sets/reps (e.g. "5x5", "3x8-10", "30 min")
  if (item.short_detail) {
    const setsRepsMatch = item.short_detail.match(/^(\d+)\s*[x×]\s*(.+)$/i);
    if (setsRepsMatch) {
      movement.sets = setsRepsMatch[1];
      movement.reps = setsRepsMatch[2];
    } else if (item.short_detail.match(/\d+\s*min/i)) {
      movement.duration = item.short_detail;
    } else {
      movement.reps = item.short_detail;
    }
  }

  // Extract rest/intensity from details
  if (item.details) {
    for (const detail of item.details) {
      const text = detail.text.toLowerCase();
      if (text.includes('rest:')) {
        movement.rest = detail.text.replace(/rest:\s*/i, '');
      } else if (text.includes('rpe:') || text.includes('intensity:')) {
        movement.intensity = detail.text;
      } else if (text.includes('tempo:')) {
        movement.tempo = detail.text.replace(/tempo:\s*/i, '');
      }
    }
  }

  // Convert feedbackRows to setDetails if present
  if (item.feedbackFields && item.feedbackRows && item.feedbackRows.length > 0) {
    const fields = item.feedbackFields;
    const weightIdx = fields.findIndex(f => f.key === 'weight');
    const repsIdx = fields.findIndex(f => f.key === 'reps');

    if (weightIdx >= 0 || repsIdx >= 0) {
      movement.setDetails = item.feedbackRows.map(row => {
        const rowMap = Object.fromEntries(row);
        return {
          reps: rowMap.reps || '',
          weight: rowMap.weight,
          rpe: rowMap.rpe,
        };
      });
      movement.sets = String(item.feedbackRows.length);
    }
  }

  return movement;
}

/**
 * Convert V4 workout details (blocks + items) to V2 format (exerciseGroups).
 * This allows existing UI components to render V4 data without refactoring.
 */
export function convertV4toV2(details: WorkoutDetails): LegacyWorkoutDetails {
  // Group items by blockId
  const itemsByBlock = new Map<string, WorkoutItem[]>();
  for (const item of details.items) {
    const existing = itemsByBlock.get(item.blockId) || [];
    existing.push(item);
    itemsByBlock.set(item.blockId, existing);
  }

  const exerciseGroups: LegacyExerciseGroup[] = [];

  for (const block of details.blocks) {
    const blockItems = itemsByBlock.get(block.id) || [];
    const blockType = mapBlockIdToType(block.id);

    for (const item of blockItems) {
      if (item.items && item.items.length > 0) {
        // Nested item → one exercise group with multiple movements
        exerciseGroups.push({
          block: blockType,
          title: item.name,
          structure: inferStructure(item),
          notes: item.notes,
          movements: item.items.map(nestedItemToMovement),
        });
      } else {
        // Single item → one exercise group with one movement
        exerciseGroups.push({
          block: blockType,
          title: item.name,
          structure: 'straight-sets',
          notes: item.notes,
          movements: [itemToMovement(item)],
        });
      }
    }
  }

  return {
    date: details.date,
    dayOfWeek: details.dayOfWeek,
    focus: details.focus,
    title: details.title,
    description: details.description,
    estimatedDuration: details.estimatedDuration,
    location: details.location,
    exerciseGroups,
  };
}

/**
 * Normalize workout details from any format to V2 (for WorkoutDetailSheet compatibility).
 * Returns the data unchanged if already V2, converts if V4.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeToV2(details: any): LegacyWorkoutDetails | null {
  if (!details) return null;
  if (isV2Format(details)) return details;
  if (isV4Format(details)) return convertV4toV2(details);
  return null;
}

/**
 * Normalize workout details from any format to V4 (canonical).
 * Returns the data unchanged if already V4.
 * Returns null if V2 (no lossless V2→V4 conversion since V2 lacks block labels).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeToV4(details: any): WorkoutDetails | null {
  if (!details) return null;
  if (isV4Format(details)) return details;
  // V2 → V4 conversion would lose data (block labels, detail types, feedback fields)
  // Old workouts should be re-generated via the regeneration service
  return null;
}
