'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Clock3, Flame, MapPin, Target } from 'lucide-react';

type Mode = 'light' | 'dark';
type DetailTone = 'instruction' | 'context' | 'note' | 'warning';

interface WorkoutDetail {
  text: string;
  tone: DetailTone;
}

interface Exercise {
  id: string;
  blockId: string;
  name: string;
  prescription: string;
  notes?: string;
  details?: WorkoutDetail[];
  nested?: Array<{ name: string; prescription: string }>;
  sets?: Array<{ load?: string; reps?: string; rir?: string }>;
}

interface WorkoutBlock {
  id: string;
  label: string;
}

const WORKOUT = {
  date: 'Thursday',
  title: 'Upper Strength Builder',
  focus: 'Push emphasis • quality reps • controlled tempo',
  duration: 68,
  location: 'Home Gym',
  intensity: 'Moderate-High',
  blocks: [
    { id: 'warmup', label: 'Warmup' },
    { id: 'main', label: 'Main Lift' },
    { id: 'accessory', label: 'Accessory Work' },
    { id: 'finish', label: 'Finisher' },
  ] as WorkoutBlock[],
  exercises: [
    {
      id: 'band-prep',
      blockId: 'warmup',
      name: 'Scap + Rotator Prep',
      prescription: '2 rounds',
      nested: [
        { name: 'Band External Rotation', prescription: '15 / side' },
        { name: 'Serratus Wall Slide', prescription: '10 reps' },
        { name: 'Band Pull-Apart', prescription: '20 reps' },
      ],
      details: [{ text: 'Stay below shoulder pain threshold', tone: 'warning' }],
    },
    {
      id: 'bench',
      blockId: 'main',
      name: 'Barbell Bench Press',
      prescription: '5 × 5',
      notes: 'Last week: 220 × 5 across. Progress to 225 if bar speed stays clean.',
      details: [
        { text: 'Target RPE 8 on top sets', tone: 'context' },
        { text: '2.5–3:00 rest between working sets', tone: 'instruction' },
      ],
      sets: [
        { load: '185', reps: '5', rir: '4' },
        { load: '205', reps: '5', rir: '3' },
        { load: '225', reps: '5', rir: '2' },
        { load: '225', reps: '', rir: '' },
        { load: '225', reps: '', rir: '' },
      ],
    },
    {
      id: 'superset',
      blockId: 'accessory',
      name: 'Superset A',
      prescription: '4 rounds',
      details: [{ text: 'Move A1 → A2 with minimal transition', tone: 'instruction' }],
      nested: [
        { name: 'Incline DB Press', prescription: '10–12 reps' },
        { name: 'Cable Triceps Pressdown', prescription: '12–15 reps' },
      ],
      sets: [
        { load: '40s', reps: '24', rir: '3' },
        { load: '40s', reps: '', rir: '' },
        { load: '40s', reps: '', rir: '' },
        { load: '40s', reps: '', rir: '' },
      ],
    },
    {
      id: 'carry',
      blockId: 'finish',
      name: 'Suitcase Carry',
      prescription: '4 × 30m / side',
      details: [
        { text: 'Tall posture, no torso lean', tone: 'note' },
        { text: 'Slow nasal breathing only', tone: 'context' },
      ],
    },
  ] as Exercise[],
};

const palette = {
  light: {
    page: 'bg-[#F8F9FB] text-[#0F172A]',
    shell: 'border-[#E2E8F0] bg-white',
    shellSub: 'text-[#475569]',
    card: 'border-[#E2E8F0] bg-white',
    cardSubtle: 'bg-[#F8FAFC] border-[#E2E8F0]',
    muted: 'text-[#64748B]',
    strongMuted: 'text-[#475569]',
    blockHeader: 'hover:bg-[#F8FAFC]',
    divider: 'border-[#E2E8F0]',
    accentChip: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
    button: 'bg-[#111827] hover:bg-[#0B1220] text-white',
    rowEmpty: 'text-[#94A3B8]',
  },
  dark: {
    page: 'bg-[#0B1020] text-[#E5E7EB]',
    shell: 'border-[#1F2937] bg-[#0F172A]',
    shellSub: 'text-[#9CA3AF]',
    card: 'border-[#1F2937] bg-[#111827]',
    cardSubtle: 'bg-[#0F172A] border-[#1F2937]',
    muted: 'text-[#9CA3AF]',
    strongMuted: 'text-[#CBD5E1]',
    blockHeader: 'hover:bg-[#1A2235]',
    divider: 'border-[#1F2937]',
    accentChip: 'bg-[#1E293B] text-[#BFDBFE] border-[#334155]',
    button: 'bg-[#F8FAFC] hover:bg-white text-[#0F172A]',
    rowEmpty: 'text-[#64748B]',
  },
} as const;

const detailToneStyles: Record<Mode, Record<DetailTone, string>> = {
  light: {
    instruction: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    context: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
    note: 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]',
    warning: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  },
  dark: {
    instruction: 'bg-[#172554] text-[#BFDBFE] border-[#1D4ED8]',
    context: 'bg-[#052E2B] text-[#A7F3D0] border-[#065F46]',
    note: 'bg-[#1E293B] text-[#CBD5E1] border-[#334155]',
    warning: 'bg-[#451A03] text-[#FCD34D] border-[#92400E]',
  },
};

export function OpalWorkoutDetailDesign({ mode }: { mode: Mode }) {
  const theme = palette[mode];
  const [open, setOpen] = useState<Record<string, boolean>>({ warmup: true, main: true, accessory: true, finish: false });

  const byBlock = useMemo(
    () =>
      WORKOUT.blocks.map((block) => ({
        block,
        exercises: WORKOUT.exercises.filter((exercise) => exercise.blockId === block.id),
      })),
    [],
  );

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
        <div className={`rounded-3xl border p-5 md:p-6 ${theme.shell}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.shellSub}`}>/me/opal/{mode}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{WORKOUT.title}</h1>
          <p className={`mt-1 text-sm ${theme.shellSub}`}>{WORKOUT.focus}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <MetaChip mode={mode} icon={<Clock3 className="h-3.5 w-3.5" />} label={`${WORKOUT.duration} min`} />
            <MetaChip mode={mode} icon={<MapPin className="h-3.5 w-3.5" />} label={WORKOUT.location} />
            <MetaChip mode={mode} icon={<Target className="h-3.5 w-3.5" />} label={WORKOUT.date} />
            <MetaChip mode={mode} icon={<Flame className="h-3.5 w-3.5" />} label={WORKOUT.intensity} />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {byBlock.map(({ block, exercises }) => (
            <section key={block.id} className={`overflow-hidden rounded-2xl border ${theme.card}`}>
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [block.id]: !prev[block.id] }))}
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${theme.blockHeader}`}
              >
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.1em]">{block.label}</h2>
                  <p className={`mt-0.5 text-xs ${theme.muted}`}>{exercises.length} exercise{exercises.length === 1 ? '' : 's'}</p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${open[block.id] ? 'rotate-180' : ''} ${theme.muted}`} />
              </button>

              {open[block.id] && (
                <div className={`space-y-2 border-t p-2 md:p-3 ${theme.divider}`}>
                  {exercises.map((exercise) => (
                    <article key={exercise.id} className={`rounded-xl border p-3 ${theme.cardSubtle}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold">{exercise.name}</h3>
                          <p className={`text-sm ${theme.strongMuted}`}>{exercise.prescription}</p>
                        </div>
                        <button className={`rounded-full border p-1.5 ${theme.divider}`} aria-label="Mark complete">
                          <Check className={`h-3.5 w-3.5 ${theme.muted}`} />
                        </button>
                      </div>

                      {exercise.details?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {exercise.details.map((detail, idx) => (
                            <span key={idx} className={`rounded-full border px-2 py-1 text-[11px] ${detailToneStyles[mode][detail.tone]}`}>
                              {detail.text}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {exercise.nested?.length ? (
                        <div className={`mt-2 rounded-lg border ${theme.divider}`}>
                          {exercise.nested.map((entry, idx) => (
                            <div key={entry.name} className={`flex items-center justify-between px-2.5 py-2 text-sm ${idx > 0 ? `border-t ${theme.divider}` : ''}`}>
                              <span>{entry.name}</span>
                              <span className={theme.muted}>{entry.prescription}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {exercise.sets?.length ? (
                        <div className={`mt-2 overflow-hidden rounded-lg border ${theme.divider}`}>
                          <div className={`grid grid-cols-4 border-b px-2.5 py-1.5 text-[11px] uppercase tracking-wide ${theme.divider} ${theme.muted}`}>
                            <span>Set</span>
                            <span>Load</span>
                            <span>Reps</span>
                            <span>RIR</span>
                          </div>
                          {exercise.sets.map((set, idx) => (
                            <div key={idx} className={`grid grid-cols-4 px-2.5 py-1.5 text-sm ${idx > 0 ? `border-t ${theme.divider}` : ''}`}>
                              <span className={theme.muted}>{idx + 1}</span>
                              <span className={set.load ? '' : theme.rowEmpty}>{set.load || '—'}</span>
                              <span className={set.reps ? '' : theme.rowEmpty}>{set.reps || '—'}</span>
                              <span className={set.rir ? '' : theme.rowEmpty}>{set.rir || '—'}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {exercise.notes ? <p className={`mt-2 text-xs italic ${theme.muted}`}>{exercise.notes}</p> : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="pt-5 pb-12">
          <button className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${theme.button}`}>
            Complete Workout
          </button>
        </div>
      </div>
    </main>
  );
}

function MetaChip({ mode, icon, label }: { mode: Mode; icon: ReactNode; label: string }) {
  const theme = palette[mode];

  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs ${theme.accentChip}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
