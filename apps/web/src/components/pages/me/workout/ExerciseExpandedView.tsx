'use client';

import { CheckCircle2, Timer, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  SetTrackingData,
  ActivityType,
  CardioTrackingData,
  MobilityTrackingData,
} from './types';
import type { WorkoutSetDetail } from '@gymtext/shared';

interface ExerciseExpandedViewProps {
  sets?: string;
  reps?: string;
  rest?: string;
  intensity?: string;
  rpe?: string;
  tempo?: string;
  notes?: string;
  setDetails?: WorkoutSetDetail[];
  activityType: ActivityType;
  trackingData: SetTrackingData[];
  cardioData?: CardioTrackingData;
  mobilityData?: MobilityTrackingData;
  onUpdateSet: (setId: string, field: keyof SetTrackingData, value: string | boolean) => void;
  onUpdateCardio?: (field: keyof CardioTrackingData, value: string | boolean) => void;
  onUpdateMobility?: (field: keyof MobilityTrackingData, value: string | boolean) => void;
  onBlur?: () => void;
  units?: 'imperial' | 'metric';
}

// Map set type to display label and styling
function getSetTypeStyle(setType?: string): { label: string; className: string } {
  switch (setType) {
    case 'warmup':
      return { label: 'W', className: 'text-orange-400' };
    case 'working':
      return { label: '', className: 'text-slate-400' };
    case 'backoff':
      return { label: 'B', className: 'text-cyan-400' };
    case 'drop':
      return { label: 'D', className: 'text-purple-400' };
    default:
      return { label: '', className: 'text-slate-400' };
  }
}

export function ExerciseExpandedView(props: ExerciseExpandedViewProps) {
  const {
    intensity,
    rpe,
    tempo,
    notes,
    setDetails,
    activityType,
    trackingData,
    cardioData,
    mobilityData,
    onUpdateSet,
    onUpdateCardio,
    onUpdateMobility,
    onBlur,
    units = 'imperial',
  } = props;

  // Handle weight input change with auto-complete logic
  const handleWeightChange = (set: SetTrackingData, newWeight: string) => {
    onUpdateSet(set.id, 'weight', newWeight);
    const hasWeight = newWeight !== '';
    const hasReps = set.reps !== '';
    if (hasWeight && hasReps && !set.completed) {
      onUpdateSet(set.id, 'completed', true);
    } else if ((!hasWeight || !hasReps) && set.completed) {
      onUpdateSet(set.id, 'completed', false);
    }
  };

  // Handle reps input change with auto-complete logic
  const handleRepsChange = (set: SetTrackingData, newReps: string) => {
    onUpdateSet(set.id, 'reps', newReps);
    const hasReps = newReps !== '';
    if (set.weightOptional) {
      // Bodyweight: complete when reps are entered
      if (hasReps && !set.completed) {
        onUpdateSet(set.id, 'completed', true);
      } else if (!hasReps && set.completed) {
        onUpdateSet(set.id, 'completed', false);
      }
    } else {
      const hasWeight = set.weight !== '';
      if (hasWeight && hasReps && !set.completed) {
        onUpdateSet(set.id, 'completed', true);
      } else if ((!hasWeight || !hasReps) && set.completed) {
        onUpdateSet(set.id, 'completed', false);
      }
    }
  };

  // Show intensity/RPE/tempo metadata if present
  const hasMetadata = intensity || rpe || tempo || notes;

  return (
    <div className="space-y-4">
      {/* Metadata row */}
      {hasMetadata && (
        <div className="flex flex-wrap gap-2 text-xs">
          {intensity && (
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
              Intensity: {intensity}
            </span>
          )}
          {rpe && (
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
              RPE {rpe}
            </span>
          )}
          {tempo && (
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
              Tempo: {tempo}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <p className="text-xs text-slate-500 italic">{notes}</p>
      )}

      {/* Cardio Tracking */}
      {activityType === 'cardio' && cardioData && onUpdateCardio && (
        <div className="w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 p-4 space-y-4">
          {/* Duration Input */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Timer size={14} />
              Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                value={cardioData.durationMinutes}
                onChange={(e) => onUpdateCardio('durationMinutes', e.target.value)}
                onBlur={onBlur}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-400 text-sm">min</span>
              <input
                type="number"
                placeholder="0"
                value={cardioData.durationSeconds}
                onChange={(e) => onUpdateCardio('durationSeconds', e.target.value)}
                onBlur={onBlur}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-400 text-sm">sec</span>
            </div>
          </div>

          {/* Distance Input */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <MapPin size={14} />
              Distance
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={cardioData.distance}
                onChange={(e) => onUpdateCardio('distance', e.target.value)}
                onBlur={onBlur}
                className="w-24 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={cardioData.distanceUnit}
                onChange={(e) => {
                  onUpdateCardio('distanceUnit', e.target.value);
                  onBlur?.();
                }}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="km">km</option>
                <option value="mi">mi</option>
              </select>
            </div>
          </div>

          {/* Completion Toggle */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                onUpdateCardio('completed', !cardioData.completed);
                onBlur?.();
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                cardioData.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              )}
            >
              {cardioData.completed ? (
                <>
                  <CheckCircle2 size={18} />
                  Completed
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                  Mark Complete
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobility Tracking */}
      {activityType === 'mobility' && mobilityData && onUpdateMobility && (
        <div className="w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 p-4 space-y-4">
          {/* Duration Input */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Timer size={14} />
              Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                value={mobilityData.durationMinutes}
                onChange={(e) => onUpdateMobility('durationMinutes', e.target.value)}
                onBlur={onBlur}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-400 text-sm">min</span>
              <input
                type="number"
                placeholder="0"
                value={mobilityData.durationSeconds}
                onChange={(e) => onUpdateMobility('durationSeconds', e.target.value)}
                onBlur={onBlur}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-400 text-sm">sec</span>
            </div>
          </div>

          {/* Completion Toggle */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                onUpdateMobility('completed', !mobilityData.completed);
                onBlur?.();
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                mobilityData.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              )}
            >
              {mobilityData.completed ? (
                <>
                  <CheckCircle2 size={18} />
                  Completed
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                  Mark Complete
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Strength Tracking Table */}
      {activityType === 'strength' && trackingData.length > 0 && (() => {
        const isWeightOptional = trackingData.every(s => s.weightOptional);
        const gridCols = isWeightOptional ? 'grid-cols-[40px_1fr]' : 'grid-cols-[40px_1fr_1fr]';

        return (
          <div className="w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50">
            {/* Table Header */}
            <div className={cn('grid gap-2 p-2 bg-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center items-center', gridCols)}>
              <span>Set</span>
              {!isWeightOptional && <span>{units === 'imperial' ? 'LBS' : 'KG'}</span>}
              <span>Reps</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-700/50">
              {trackingData.map((set, index) => {
                const setDetail = setDetails?.[index];
                const typeStyle = getSetTypeStyle(set.setType || setDetail?.type);

                return (
                  <div
                    key={set.id}
                    className={cn(
                      'grid gap-2 p-3 items-center transition-colors',
                      gridCols,
                      set.completed && 'bg-green-900/10',
                      set.setType === 'warmup' && 'opacity-75'
                    )}
                  >
                    {/* Set Number / Type */}
                    <div className="flex items-center justify-center">
                      <span className={cn('font-mono text-sm', typeStyle.className)}>
                        {typeStyle.label || (index + 1)}
                      </span>
                    </div>

                    {/* Weight Input (hidden for bodyweight) */}
                    {!isWeightOptional && (
                      <div>
                        <input
                          type="number"
                          placeholder={set.targetWeight || set.prevWeight?.toString() || '-'}
                          value={set.weight}
                          onChange={(e) => handleWeightChange(set, e.target.value)}
                          onBlur={onBlur}
                          className={cn(
                            'w-full bg-slate-800 border rounded px-2 py-2 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all',
                            set.completed
                              ? 'border-green-600 text-green-400 shadow-[0_0_10px_rgba(22,163,74,0.15)]'
                              : 'border-slate-700 text-white'
                          )}
                        />
                      </div>
                    )}

                    {/* Reps Input */}
                    <div>
                      <input
                        type="number"
                        placeholder={set.targetReps}
                        value={set.reps}
                        onChange={(e) => handleRepsChange(set, e.target.value)}
                        onBlur={onBlur}
                        className={cn(
                          'w-full bg-slate-800 border rounded px-2 py-2 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all',
                          set.completed
                            ? 'border-green-600 text-green-400 shadow-[0_0_10px_rgba(22,163,74,0.15)]'
                            : 'border-slate-700 text-white'
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
