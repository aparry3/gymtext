'use client';

import { createContext, useContext, useState } from 'react';
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

// ─── Theme ────────────────────────────────────────────────────────────────

interface Theme {
  bg: string;
  blockBg: string;
  blockBorder: string;
  blockHover: string;
  rowHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  divider: string;
  inputBg: string;
  inputBorder: string;
  inputFilledBg: string;
  inputFilledBorder: string;
  inputText: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  tabActive: string;
  tabInactive: string;
  nestedBorder: string;
  nestedText: string;
  ringTrack: string;
  ringFill: string;
  ringText: string;
  checkBorder: string;
  checkIcon: string;
  detailContext: string;
  detailNote: string;
  detailInstruction: string;
  detailWarning: string;
}

const darkTheme: Theme = {
  bg: 'bg-[#0F0F0F]',
  blockBg: 'bg-[#1A1A1A]',
  blockBorder: 'border-[#2A2A2A]',
  blockHover: 'hover:bg-[#222]',
  rowHover: 'hover:bg-[#222]/30',
  textPrimary: 'text-zinc-100',
  textSecondary: 'text-zinc-400',
  textMuted: 'text-zinc-600',
  divider: 'border-[#2A2A2A]',
  inputBg: 'bg-zinc-800/50',
  inputBorder: 'border-zinc-700',
  inputFilledBg: 'bg-zinc-800/80',
  inputFilledBorder: 'border-zinc-700/50',
  inputText: 'text-zinc-200',
  pillBg: 'bg-blue-500/15',
  pillText: 'text-blue-400',
  pillBorder: 'border-blue-500/20',
  tabActive: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  tabInactive: 'text-zinc-500 hover:text-zinc-300 border border-transparent',
  nestedBorder: 'border-blue-500/30',
  nestedText: 'text-zinc-300',
  ringTrack: 'hsl(217,33%,15%)',
  ringFill: 'hsl(213,94%,68%)',
  ringText: 'text-zinc-300',
  checkBorder: 'border-zinc-700',
  checkIcon: 'text-zinc-600',
  detailContext: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  detailNote: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  detailInstruction: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  detailWarning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const lightTheme: Theme = {
  bg: 'bg-[#F7F5F2]',
  blockBg: 'bg-white',
  blockBorder: 'border-stone-200',
  blockHover: 'hover:bg-stone-50',
  rowHover: 'hover:bg-stone-50',
  textPrimary: 'text-stone-900',
  textSecondary: 'text-stone-500',
  textMuted: 'text-stone-400',
  divider: 'border-stone-200',
  inputBg: 'bg-stone-100',
  inputBorder: 'border-stone-200',
  inputFilledBg: 'bg-stone-50',
  inputFilledBorder: 'border-stone-200',
  inputText: 'text-stone-800',
  pillBg: 'bg-blue-50',
  pillText: 'text-blue-600',
  pillBorder: 'border-blue-200',
  tabActive: 'bg-blue-50 text-blue-600 border border-blue-200',
  tabInactive: 'text-stone-400 hover:text-stone-600 border border-transparent',
  nestedBorder: 'border-blue-300/50',
  nestedText: 'text-stone-700',
  ringTrack: 'hsl(30,10%,90%)',
  ringFill: 'hsl(213,94%,55%)',
  ringText: 'text-stone-700',
  checkBorder: 'border-stone-300',
  checkIcon: 'text-stone-400',
  detailContext: 'bg-blue-50 text-blue-600 border-blue-200',
  detailNote: 'bg-stone-100 text-stone-500 border-stone-200',
  detailInstruction: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  detailWarning: 'bg-amber-50 text-amber-600 border-amber-200',
};

const ThemeCtx = createContext<Theme>(darkTheme);
const useTheme = () => useContext(ThemeCtx);

// ─── Icons ────────────────────────────────────────────────────────────────

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

// ─── Detail Pill ──────────────────────────────────────────────────────────

function DetailPill({ detail }: { detail: Detail }) {
  const t = useTheme();
  const styles: Record<string, string> = {
    context: t.detailContext,
    note: t.detailNote,
    instruction: t.detailInstruction,
    warning: t.detailWarning,
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] leading-tight px-2 py-0.5 rounded-full border ${styles[detail.type] || styles.note}`}>
      {detail.type === 'warning' && <AlertTriangle className="w-3 h-3 shrink-0" />}
      {detail.text}
    </span>
  );
}

// ─── Nested Item ──────────────────────────────────────────────────────────

function NestedItemRow({ item }: { item: NestedItem }) {
  const t = useTheme();
  return (
    <div className={`flex items-baseline justify-between py-1.5 pl-3 border-l-2 ${t.nestedBorder}`}>
      <span className={`text-[13px] ${t.nestedText}`}>{item.name}</span>
      <span className={`text-[12px] ${t.textMuted} font-mono ml-2 shrink-0`}>{item.short_detail}</span>
    </div>
  );
}

// ─── Feedback Table ───────────────────────────────────────────────────────

function FeedbackTable({ item }: { item: WorkoutItem }) {
  const t = useTheme();
  if (!item.feedbackFields || !item.feedbackRows || item.feedbackRows.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1 px-1 pb-1.5">
        <span className={`w-8 text-[10px] ${t.textMuted} font-medium uppercase tracking-wider text-center`}>Set</span>
        {item.feedbackFields.map((f) => (
          <span key={f.key} className={`flex-1 text-[10px] ${t.textMuted} font-medium uppercase tracking-wider text-center`}>
            {f.label}
          </span>
        ))}
        <span className="w-8" />
      </div>
      <div className="space-y-1">
        {item.feedbackRows.map((row, i) => (
          <div key={i} className="flex items-center gap-1 group">
            <span className={`w-8 text-[11px] ${t.textMuted} text-center font-mono`}>{i + 1}</span>
            {item.feedbackFields!.map((f) => {
              const val = row[f.key];
              const isEmpty = val === '' || val === null || val === undefined;
              return (
                <div key={f.key} className="flex-1">
                  <div className={`h-8 rounded-md flex items-center justify-center text-[13px] font-mono transition-colors ${
                    isEmpty
                      ? `${t.inputBg} border border-dashed ${t.inputBorder} ${t.textMuted}`
                      : `${t.inputFilledBg} border ${t.inputFilledBorder} ${t.inputText}`
                  }`}>
                    {isEmpty ? '—' : String(val)}
                  </div>
                </div>
              );
            })}
            <div className="w-8 flex items-center justify-center">
              <button className={`w-6 h-6 rounded-full border ${t.checkBorder} flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors`}>
                <CheckCircle className={`w-3.5 h-3.5 ${t.checkIcon} group-hover:text-emerald-400`} />
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
  const t = useTheme();
  const [expanded, setExpanded] = useState(!!item.feedbackRows?.length);
  const hasDetails = (item.details && item.details.length > 0) || item.notes || item.items?.length;
  const hasTracking = item.feedbackRows && item.feedbackRows.length > 0;

  return (
    <div className={`${!isLast ? `border-b ${t.divider}` : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between py-3 px-4 text-left ${t.rowHover} transition-colors`}
      >
        <div className="flex-1 min-w-0">
          <span className={`text-[14px] font-medium ${t.textPrimary} truncate`}>{item.name}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className={`text-[12px] ${t.textMuted} font-mono`}>{item.short_detail}</span>
          {(hasDetails || hasTracking) && (
            <ChevronDown className={`w-4 h-4 ${t.textMuted} transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {item.notes && <p className={`text-[12px] ${t.textSecondary} italic leading-relaxed`}>{item.notes}</p>}
          {item.details && item.details.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.details.map((d, i) => <DetailPill key={i} detail={d} />)}
            </div>
          )}
          {item.items && item.items.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {item.items.map((sub, i) => <NestedItemRow key={i} item={sub} />)}
            </div>
          )}
          <FeedbackTable item={item} />
        </div>
      )}
    </div>
  );
}

// ─── Block Section ────────────────────────────────────────────────────────

function BlockSection({ block, items }: { block: Block; items: WorkoutItem[] }) {
  const t = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const accents: Record<string, { dot: string; border: string }> = {
    warmup: { dot: 'bg-amber-500', border: 'border-l-amber-500/40' },
    main: { dot: 'bg-blue-500', border: 'border-l-blue-500/40' },
    accessory: { dot: 'bg-purple-500', border: 'border-l-purple-500/40' },
    cooldown: { dot: 'bg-emerald-500', border: 'border-l-emerald-500/40' },
    conditioning: { dot: 'bg-red-500', border: 'border-l-red-500/40' },
    skills: { dot: 'bg-cyan-500', border: 'border-l-cyan-500/40' },
    scrimmage: { dot: 'bg-orange-500', border: 'border-l-orange-500/40' },
  };

  const key = block.id.replace('block-', '');
  const accent = accents[key] || { dot: 'bg-zinc-500', border: 'border-l-zinc-500/40' };

  return (
    <div className={`${t.blockBg} rounded-xl border ${t.blockBorder} overflow-hidden border-l-2 ${accent.border}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full flex items-center justify-between px-4 py-3 ${t.blockHover} transition-colors`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <span className={`text-[13px] font-semibold uppercase tracking-wide ${t.textSecondary}`}>{block.label}</span>
          <span className={`text-[11px] ${t.textMuted}`}>{items.length} {items.length === 1 ? 'exercise' : 'exercises'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ${t.textMuted} transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>
      {!collapsed && (
        <div className={`border-t ${t.divider}`}>
          {items.map((item, i) => <ExerciseCard key={i} item={item} isLast={i === items.length - 1} />)}
        </div>
      )}
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const t = useTheme();
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke={t.ringTrack} strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={t.ringFill} strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
      </svg>
      <span className={`absolute text-[11px] font-bold ${t.ringText}`}>{Math.round(pct)}%</span>
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

export function AntWorkoutView({ mode = 'dark' }: { mode?: 'light' | 'dark' }) {
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const [activeKey, setActiveKey] = useState<WorkoutKey>('strength');
  const active = workouts[activeKey];
  const workout = active.data;

  const blockItems = workout.blocks.map((block) => ({
    block,
    items: workout.items.filter((item) => item.blockId === block.id),
  }));

  const totalTracked = workout.items.filter((i) => i.feedbackRows?.length).length;

  return (
    <ThemeCtx.Provider value={theme}>
      <div className={`min-h-screen ${theme.bg}`}>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-[11px] uppercase tracking-widest ${theme.textMuted} font-medium`}>Today&apos;s Workout</p>
                <h1 className={`text-xl font-bold ${theme.textPrimary} mt-1`}>{active.title}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${theme.pillBg} ${theme.pillText} border ${theme.pillBorder} font-medium`}>
                    {active.sessionType}
                  </span>
                  <span className={`text-[12px] ${theme.textSecondary}`}>~{active.duration} min</span>
                </div>
              </div>
              <ProgressRing completed={0} total={totalTracked} />
            </div>

            {/* Workout selector */}
            <div className="flex gap-2">
              {(Object.keys(workouts) as WorkoutKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveKey(key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    key === activeKey ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  {workouts[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            {blockItems.map(({ block, items }) => (
              items.length > 0 && <BlockSection key={block.id} block={block} items={items} />
            ))}
          </div>

          {/* Footer */}
          <div className="pt-2 pb-8">
            <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] transition-colors">
              Complete Workout
            </button>
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
