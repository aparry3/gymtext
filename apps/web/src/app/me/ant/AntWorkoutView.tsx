'use client';

import { useState } from 'react';
import {
  strengthWorkout,
  supersetWorkout,
  amrapWorkout,
  type Workout,
  type WorkoutItem,
  type Detail,
  type NestedItem,
  type Block,
} from './mockData';

// ─── Icons (inline SVG to avoid import issues) ────────────────────────────

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function AlertTriangle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Detail Pill ───────────────────────────────────────────────────────────

function DetailPill({ detail }: { detail: Detail }) {
  const styles: Record<string, string> = {
    context: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    note: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    instruction: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] leading-tight px-2 py-0.5 rounded-full border ${styles[detail.type] || styles.note}`}>
      {detail.type === 'warning' && <AlertTriangle className="w-3 h-3 shrink-0" />}
      {detail.text}
    </span>
  );
}

// ─── Nested Item (superset/circuit sub-exercise) ──────────────────────────

function NestedItemRow({ item, index }: { item: NestedItem; index: number }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 pl-3 border-l-2 border-blue-500/30">
      <span className="text-[13px] text-zinc-300">{item.name}</span>
      <span className="text-[12px] text-zinc-500 font-mono ml-2 shrink-0">{item.short_detail}</span>
    </div>
  );
}

// ─── Feedback Table ───────────────────────────────────────────────────────

function FeedbackTable({ item }: { item: WorkoutItem }) {
  if (!item.feedbackFields || !item.feedbackRows || item.feedbackRows.length === 0) return null;

  const fields = item.feedbackFields;
  const rows = item.feedbackRows;

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="flex items-center gap-1 px-1 pb-1.5">
        <span className="w-8 text-[10px] text-zinc-600 font-medium uppercase tracking-wider text-center">Set</span>
        {fields.map((f) => (
          <span key={f.key} className="flex-1 text-[10px] text-zinc-600 font-medium uppercase tracking-wider text-center">
            {f.label}
          </span>
        ))}
        <span className="w-8" /> {/* check col */}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1 group">
            <span className="w-8 text-[11px] text-zinc-600 text-center font-mono">{i + 1}</span>
            {fields.map((f) => {
              const val = row[f.key];
              const isEmpty = val === '' || val === null || val === undefined;
              return (
                <div key={f.key} className="flex-1">
                  <div className={`
                    h-8 rounded-md flex items-center justify-center text-[13px] font-mono
                    transition-colors
                    ${isEmpty
                      ? 'bg-zinc-800/50 border border-dashed border-zinc-700 text-zinc-600'
                      : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-200'
                    }
                  `}>
                    {isEmpty ? '—' : String(val)}
                  </div>
                </div>
              );
            })}
            <div className="w-8 flex items-center justify-center">
              <button className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────

function ExerciseCard({ item, isLast }: { item: WorkoutItem; isLast: boolean }) {
  const [expanded, setExpanded] = useState(!!item.feedbackRows?.length);
  const hasDetails = (item.details && item.details.length > 0) || item.notes || item.items?.length;
  const hasTracking = item.feedbackRows && item.feedbackRows.length > 0;

  return (
    <div className={`${!isLast ? 'border-b border-zinc-800/50' : ''}`}>
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-medium text-zinc-100 truncate">{item.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className="text-[12px] text-zinc-500 font-mono">{item.short_detail}</span>
          {(hasDetails || hasTracking) && (
            <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Notes (coaching context) */}
          {item.notes && (
            <p className="text-[12px] text-zinc-500 italic leading-relaxed">{item.notes}</p>
          )}

          {/* Details as pills */}
          {item.details && item.details.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.details.map((d, i) => (
                <DetailPill key={i} detail={d} />
              ))}
            </div>
          )}

          {/* Nested items (supersets/circuits) */}
          {item.items && item.items.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {item.items.map((sub, i) => (
                <NestedItemRow key={i} item={sub} index={i} />
              ))}
            </div>
          )}

          {/* Feedback tracking */}
          <FeedbackTable item={item} />
        </div>
      )}
    </div>
  );
}

// ─── Block Section ────────────────────────────────────────────────────────

function BlockSection({ block, items }: { block: Block; items: WorkoutItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  // Block accent colors
  const accents: Record<string, { dot: string; border: string }> = {
    warmup: { dot: 'bg-amber-500', border: 'border-l-amber-500/40' },
    main: { dot: 'bg-blue-500', border: 'border-l-blue-500/40' },
    accessory: { dot: 'bg-purple-500', border: 'border-l-purple-500/40' },
    cooldown: { dot: 'bg-emerald-500', border: 'border-l-emerald-500/40' },
    conditioning: { dot: 'bg-red-500', border: 'border-l-red-500/40' },
    skills: { dot: 'bg-cyan-500', border: 'border-l-cyan-500/40' },
    scrimmage: { dot: 'bg-orange-500', border: 'border-l-orange-500/40' },
  };

  // Match block id to accent (strip "block-" prefix)
  const key = block.id.replace('block-', '');
  const accent = accents[key] || { dot: 'bg-zinc-500', border: 'border-l-zinc-500/40' };

  return (
    <div className={`bg-[hsl(222,47%,8%)] rounded-xl border border-zinc-800/60 overflow-hidden border-l-2 ${accent.border}`}>
      {/* Block header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <span className="text-[13px] font-semibold uppercase tracking-wide text-zinc-300">
            {block.label}
          </span>
          <span className="text-[11px] text-zinc-600">{items.length} {items.length === 1 ? 'exercise' : 'exercises'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="border-t border-zinc-800/40">
          {items.map((item, i) => (
            <ExerciseCard key={i} item={item} isLast={i === items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Workout Selector Tab ─────────────────────────────────────────────────

function WorkoutTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all
        ${active
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
        }
      `}
    >
      {label}
    </button>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(217,33%,15%)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke="hsl(213,94%,68%)" strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-zinc-300">{Math.round(pct)}%</span>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────

const workouts = {
  strength: { data: strengthWorkout, label: 'Strength', title: 'Upper/Lower Strength', sessionType: 'Strength', duration: 75 },
  supersets: { data: supersetWorkout, label: 'Supersets', title: 'Chest & Triceps', sessionType: 'Hypertrophy', duration: 60 },
  amrap: { data: amrapWorkout, label: 'AMRAP', title: 'MetCon Day', sessionType: 'HIIT', duration: 35 },
};

type WorkoutKey = keyof typeof workouts;

export function AntWorkoutView() {
  const [activeKey, setActiveKey] = useState<WorkoutKey>('strength');
  const active = workouts[activeKey];
  const workout = active.data;

  // Group items by block
  const blockItems = workout.blocks.map((block) => ({
    block,
    items: workout.items.filter((item) => item.blockId === block.id),
  }));

  // Count exercises with tracking
  const totalTracked = workout.items.filter((i) => i.feedbackRows?.length).length;
  const totalExercises = workout.items.length;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-medium">Today&apos;s Workout</p>
            <h1 className="text-xl font-bold text-zinc-100 mt-1">{active.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">
                {active.sessionType}
              </span>
              <span className="text-[12px] text-zinc-500">~{active.duration} min</span>
            </div>
          </div>
          <ProgressRing completed={0} total={totalTracked} />
        </div>

        {/* Workout selector */}
        <div className="flex gap-2">
          {(Object.keys(workouts) as WorkoutKey[]).map((key) => (
            <WorkoutTab
              key={key}
              label={workouts[key].label}
              active={key === activeKey}
              onClick={() => setActiveKey(key)}
            />
          ))}
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {blockItems.map(({ block, items }) => (
          items.length > 0 && (
            <BlockSection key={block.id} block={block} items={items} />
          )
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 pb-8">
        <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] transition-colors">
          Complete Workout
        </button>
      </div>
    </div>
  );
}
