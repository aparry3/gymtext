'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, Flame, MapPin, Target } from 'lucide-react';

type DetailType = 'instruction' | 'note' | 'context' | 'warning';

interface WorkoutDetail {
  text: string;
  type?: DetailType;
}

interface FeedbackField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'boolean' | 'select';
  required?: boolean;
}

type FeedbackRow = Array<[string, string]>;

interface WorkoutItem {
  blockId: string;
  name: string;
  short_detail?: string;
  details?: WorkoutDetail[];
  notes?: string;
  items?: Array<Pick<WorkoutItem, 'name' | 'short_detail' | 'details'>>;
  feedbackFields?: FeedbackField[];
  feedbackRows?: FeedbackRow[];
}

interface WorkoutBlock {
  id: string;
  label: string;
}

interface WorkoutDetailsV3 {
  date: string;
  dayOfWeek: string;
  focus: string;
  title: string;
  description?: string;
  estimatedDuration?: number;
  location?: string;
  blocks: WorkoutBlock[];
  items: WorkoutItem[];
}

const SAMPLE_WORKOUT: WorkoutDetailsV3 = {
  date: '2026-02-26',
  dayOfWeek: 'Thursday',
  focus: 'Upper Strength + Hypertrophy',
  title: 'Push Day Builder',
  description: 'Main strength work first, then chest/triceps supersets. Move with intent and keep rest honest.',
  estimatedDuration: 65,
  location: 'Home Gym',
  blocks: [
    { id: 'warmup', label: 'Warmup' },
    { id: 'main', label: 'Main Lift' },
    { id: 'superset', label: 'Hypertrophy Supersets' },
    { id: 'cooldown', label: 'Cooldown' },
  ],
  items: [
    {
      blockId: 'warmup',
      name: 'Shoulder Prep',
      short_detail: '2 rounds',
      details: [{ text: 'All movements pain-free', type: 'warning' }],
      items: [
        { name: 'Band External Rotation', short_detail: '20/side' },
        { name: 'Band Pull-Apart', short_detail: '20' },
        { name: 'Serratus Wall Slide', short_detail: '10' },
      ],
    },
    {
      blockId: 'main',
      name: 'Barbell Bench Press',
      short_detail: '5 x 5',
      details: [
        { text: 'RPE 8, leave 1-2 reps in reserve', type: 'context' },
        { text: 'Rest 3 min between work sets', type: 'context' },
      ],
      notes: 'Last week: 220 x 5 x 5. Today target: 225.',
      feedbackFields: [
        { key: 'weight', label: 'Weight (lb)', type: 'number', required: true },
        { key: 'reps', label: 'Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        [['weight', '185'], ['reps', '5']],
        [['weight', '205'], ['reps', '5']],
        [['weight', '225'], ['reps', '5']],
        [['weight', '225'], ['reps', '5']],
        [['weight', '225'], ['reps', '5']],
      ],
    },
    {
      blockId: 'superset',
      name: 'Superset A',
      short_detail: '4 rounds',
      details: [{ text: 'A1 then A2, rest 90 sec', type: 'instruction' }],
      items: [
        { name: 'Incline Dumbbell Press', short_detail: '10-12 reps', details: [{ text: '40 lb DBs', type: 'context' }] },
        { name: 'Rope Tricep Pushdown', short_detail: '12-15 reps', details: [{ text: '50 lb', type: 'context' }] },
      ],
      feedbackFields: [
        { key: 'round', label: 'Round', type: 'number', required: true },
        { key: 'reps', label: 'Total Reps', type: 'number', required: true },
      ],
      feedbackRows: [
        [['round', '1'], ['reps', '']],
        [['round', '2'], ['reps', '']],
        [['round', '3'], ['reps', '']],
        [['round', '4'], ['reps', '']],
      ],
    },
    {
      blockId: 'cooldown',
      name: 'Downshift Walk + Stretch',
      short_detail: '6 min',
      details: [
        { text: 'Easy pace breathing through nose', type: 'note' },
        { text: 'If shoulder pinches, skip overhead stretch', type: 'warning' },
      ],
    },
  ],
};

const detailTone: Record<DetailType, string> = {
  instruction: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
  note: 'bg-slate-700/40 text-slate-200 border-slate-500/40',
  context: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
};

export function OpalWorkoutDashboard() {
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    warmup: false,
    main: true,
    superset: true,
    cooldown: false,
  });

  const grouped = useMemo(() => {
    return SAMPLE_WORKOUT.blocks.map((block) => ({
      ...block,
      items: SAMPLE_WORKOUT.items.filter((item) => item.blockId === block.id),
    }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl p-4 pb-20 text-white md:p-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">/me/opal</p>
        <h1 className="mt-1 text-2xl font-bold">{SAMPLE_WORKOUT.title}</h1>
        <p className="mt-1 text-sm text-slate-300">{SAMPLE_WORKOUT.focus}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <InfoChip icon={<Clock3 className="h-3.5 w-3.5" />} label={`${SAMPLE_WORKOUT.estimatedDuration} min`} />
          <InfoChip icon={<MapPin className="h-3.5 w-3.5" />} label={SAMPLE_WORKOUT.location || 'Gym'} />
          <InfoChip icon={<Target className="h-3.5 w-3.5" />} label={SAMPLE_WORKOUT.dayOfWeek} />
          <InfoChip icon={<Flame className="h-3.5 w-3.5" />} label="High Intent" />
        </div>

        {SAMPLE_WORKOUT.description && (
          <p className="mt-3 rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-300">
            {SAMPLE_WORKOUT.description}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {grouped.map((block) => {
          const isOpen = !!openBlocks[block.id];
          const completeCount = block.items.filter((item) => item.feedbackRows?.every((r) => r.every(([, v]) => v !== ''))).length;

          return (
            <section key={block.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
              <button
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setOpenBlocks((prev) => ({ ...prev, [block.id]: !prev[block.id] }))}
              >
                <div>
                  <h2 className="text-base font-semibold">{block.label}</h2>
                  <p className="text-xs text-slate-400">{block.items.length} items • {completeCount} complete</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-slate-800 px-3 pb-3 pt-2">
                  {block.items.map((item, idx) => (
                    <article key={`${item.name}-${idx}`} className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          {item.short_detail && <p className="text-sm text-slate-300">{item.short_detail}</p>}
                        </div>
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                      </div>

                      {item.details?.length ? (
                        <div className="mt-2 space-y-1.5">
                          {item.details.map((d, dIdx) => (
                            <div key={dIdx} className={`rounded-lg border px-2 py-1 text-xs ${detailTone[d.type || 'note']}`}>
                              {d.type === 'warning' && <AlertTriangle className="mr-1 inline h-3 w-3" />}
                              {d.text}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {item.items?.length ? (
                        <div className="mt-2 space-y-1 rounded-lg border border-slate-700/70 bg-slate-900/60 p-2">
                          {item.items.map((nested, nestedIdx) => (
                            <div key={nestedIdx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-200">{nested.name}</span>
                              <span className="text-slate-400">{nested.short_detail}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {item.feedbackFields?.length && item.feedbackRows?.length ? (
                        <div className="mt-3 overflow-hidden rounded-lg border border-slate-700">
                          <div className="grid grid-cols-2 bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-400">
                            {item.feedbackFields.map((f) => (
                              <div key={f.key}>{f.label}</div>
                            ))}
                          </div>
                          {item.feedbackRows.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-2 border-t border-slate-700/70 px-2 py-1.5 text-sm">
                              {row.map(([k, v]) => (
                                <div key={k} className={v ? 'text-slate-100' : 'text-slate-500'}>{v || '—'}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {item.notes && <p className="mt-2 text-xs italic text-slate-400">{item.notes}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function InfoChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-1.5 text-slate-200">
      {icon}
      <span>{label}</span>
    </div>
  );
}
