'use client'

import { cn } from '@/lib/utils'
import type { WorkoutDisplayField, WorkoutTrackingField, WorkoutSectionStructure } from '@gymtext/shared'

type FieldValue = string | number | boolean

interface FlexibleExerciseExpandedViewProps {
  structure: WorkoutSectionStructure
  display: WorkoutDisplayField[]
  tracking: WorkoutTrackingField[]
  rows: Array<Record<string, FieldValue>>
  onUpdateRowField: (rowIndex: number, fieldKey: string, value: FieldValue) => void
  title?: string
}

const PER_SET_STRUCTURES = new Set<WorkoutSectionStructure>(['straight-sets', 'circuit'])

function toStringValue(value: FieldValue | undefined): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

export function FlexibleExerciseExpandedView({
  structure,
  display,
  tracking,
  rows,
  onUpdateRowField,
  title,
}: FlexibleExerciseExpandedViewProps) {
  const primaryDisplay = display.filter((field) => field.emphasis === 'primary')
  const secondaryDisplay = display.filter((field) => field.emphasis !== 'primary')
  const perSet = PER_SET_STRUCTURES.has(structure)

  return (
    <div className="space-y-4">
      {display.length > 0 && (
        <div className="space-y-2 rounded-lg border border-slate-700/70 bg-slate-900/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Prescription
          </p>
          {primaryDisplay.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {primaryDisplay.map((field) => (
                <span
                  key={field.key}
                  className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200"
                >
                  {field.label}: {field.value}
                </span>
              ))}
            </div>
          )}
          {secondaryDisplay.length > 0 && (
            <div className="space-y-1">
              {secondaryDisplay.map((field) => (
                <p key={field.key} className="text-xs text-slate-400">
                  {field.label}: {field.value}
                  {field.meta ? (
                    <span className="ml-2 rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                      {field.meta}
                    </span>
                  ) : null}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {tracking.length > 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {title || 'Tracking'}
            </p>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              {perSet ? 'Per Set' : 'Session'}
            </span>
          </div>

          <div className="space-y-3">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="rounded-md border border-slate-700/70 bg-slate-800/40 p-3">
                {perSet && (
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Set {rowIndex + 1}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {tracking.map((field) => {
                    const currentValue = row[field.key]
                    const inputId = `${field.key}-${rowIndex}`

                    if (field.type === 'boolean') {
                      return (
                        <label
                          key={field.key}
                          htmlFor={inputId}
                          className="flex cursor-pointer items-center gap-2 rounded border border-slate-700 px-3 py-2.5 text-sm text-slate-200"
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={Boolean(currentValue)}
                            onChange={(e) => onUpdateRowField(rowIndex, field.key, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-cyan-500"
                          />
                          <span>{field.label}</span>
                        </label>
                      )
                    }

                    return (
                      <label key={field.key} htmlFor={inputId} className="space-y-1">
                        <span className="text-xs text-slate-400">
                          {field.label}
                          {field.required ? <span className="ml-1 text-red-400">*</span> : null}
                        </span>
                        <div className="relative">
                          <input
                            id={inputId}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={toStringValue(currentValue)}
                            onChange={(e) => {
                              const nextValue =
                                field.type === 'number'
                                  ? (e.target.value === '' ? '' : Number(e.target.value))
                                  : e.target.value
                              onUpdateRowField(rowIndex, field.key, nextValue)
                            }}
                            placeholder={field.placeholder}
                            min={field.min}
                            max={field.max}
                            className={cn(
                              'w-full rounded border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500',
                              field.unit ? 'pr-12' : ''
                            )}
                          />
                          {field.unit && (
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
