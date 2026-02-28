'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  XCircle,
  ChevronLeft,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACTIVE_PLAN, type PlanWorkoutDay, type PlanWeek, type WorkoutStatus } from './planMockData';

// ─── Status helpers ──────────────────────────────────────────────────

const STATUS_COLORS: Record<WorkoutStatus, string> = {
  completed: 'bg-emerald-500',
  skipped: 'bg-red-400/60',
  upcoming: 'bg-white/10',
  today: 'bg-amber-400',
  rest: 'bg-white/[0.04]',
};

const STATUS_RING: Record<WorkoutStatus, string> = {
  completed: 'ring-emerald-500/30',
  skipped: 'ring-red-400/20',
  upcoming: 'ring-white/5',
  today: 'ring-amber-400/40',
  rest: 'ring-transparent',
};

function StatusIcon({ status, size = 16 }: { status: WorkoutStatus; size?: number }) {
  if (status === 'completed') return <CheckCircle2 size={size} className="text-emerald-400" />;
  if (status === 'skipped') return <XCircle size={size} className="text-red-400/60" />;
  if (status === 'today') return <Flame size={size} className="text-amber-400" />;
  if (status === 'rest') return <span className="text-white/20 text-xs">—</span>;
  return <Circle size={size} className="text-white/15" />;
}

// ─── Progress Ring ───────────────────────────────────────────────────

function ProgressRing({ percent, size = 80, strokeWidth = 6 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#progress-gradient)" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{percent}%</span>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Flame; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-white/40">
        <Icon size={13} />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-white leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-white/30">{sub}</div>}
    </div>
  );
}

// ─── Week Calendar Row ───────────────────────────────────────────────

function WeekCalendar({ week }: { week: PlanWeek }) {
  return (
    <div className="flex gap-1.5">
      {week.days.map((day, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all',
            day.status === 'today' && 'bg-amber-400/10 ring-1 ring-amber-400/30',
            day.status === 'completed' && 'bg-emerald-500/5',
          )}
        >
          <span className={cn(
            'text-[10px] font-medium',
            day.status === 'today' ? 'text-amber-400' : 'text-white/30'
          )}>
            {day.dayOfWeek}
          </span>
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center ring-2',
            STATUS_COLORS[day.status],
            STATUS_RING[day.status],
          )}>
            {day.status === 'rest' ? (
              <span className="text-[9px] text-white/20">R</span>
            ) : (
              <StatusIcon status={day.status} size={14} />
            )}
          </div>
          <span className={cn(
            'text-[9px] text-center leading-tight line-clamp-1',
            day.status === 'today' ? 'text-amber-300/80' : 'text-white/25'
          )}>
            {day.type === 'rest' ? '' : day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Today's Workout Card ────────────────────────────────────────────

function TodaysWorkout() {
  const { nextWorkout } = ACTIVE_PLAN;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-white/[0.08]">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
              <Dumbbell size={16} className="text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">Today&apos;s Workout</div>
              <div className="text-xs text-white/30">{nextWorkout.dayOfWeek} · ~{nextWorkout.estimatedDuration} min</div>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium text-white transition-colors">
            Start
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-0.5">{nextWorkout.label}</h3>
        <p className="text-xs text-white/40 mb-4">{nextWorkout.focus}</p>

        <div className="space-y-1.5">
          {nextWorkout.exercises.map((ex, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/50">
              <span className="text-white/15 text-xs w-4 text-right">{i + 1}</span>
              <span>{ex}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Week Timeline ───────────────────────────────────────────────────

function WeekTimeline({ weeks, currentWeek, onSelectWeek }: { weeks: PlanWeek[]; currentWeek: number; onSelectWeek: (w: number) => void }) {
  return (
    <div className="flex gap-0.5 items-center">
      {weeks.map((week) => (
        <button
          key={week.weekNumber}
          onClick={() => onSelectWeek(week.weekNumber)}
          className={cn(
            'flex-1 h-2 rounded-full transition-all',
            week.status === 'completed' && 'bg-emerald-500/60',
            week.status === 'current' && 'bg-amber-400 animate-pulse',
            week.status === 'upcoming' && 'bg-white/8',
            week.weekNumber === currentWeek && 'ring-1 ring-white/20',
          )}
          title={`Week ${week.weekNumber}: ${week.label}`}
        />
      ))}
    </div>
  );
}

// ─── Workout History List ────────────────────────────────────────────

function WorkoutHistory({ weeks }: { weeks: PlanWeek[] }) {
  const completedDays = weeks
    .flatMap((w) => w.days.map((d) => ({ ...d, week: w.weekNumber, weekLabel: w.label })))
    .filter((d) => d.status === 'completed')
    .reverse()
    .slice(0, 8);

  return (
    <div className="space-y-1">
      {completedDays.map((day, i) => (
        <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors group cursor-pointer">
          <CheckCircle2 size={14} className="text-emerald-400/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/70 truncate">{day.label}</div>
            <div className="text-[11px] text-white/25">Week {day.week} · {day.dayOfWeek} · {day.date}</div>
          </div>
          {day.adherenceScore && (
            <span className={cn(
              'text-[11px] font-medium px-1.5 py-0.5 rounded',
              day.adherenceScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            )}>
              {day.adherenceScore}%
            </span>
          )}
          <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export function AntPlanPage() {
  const plan = ACTIVE_PLAN;
  const [selectedWeek, setSelectedWeek] = useState(plan.currentWeek);
  const displayWeek = plan.weeks[selectedWeek - 1];
  const weeksRemaining = plan.totalWeeks - plan.currentWeek;
  const overallProgress = Math.round((plan.currentWeek / plan.totalWeeks) * 100);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{plan.title}</h1>
            <p className="text-sm text-white/35 mt-0.5">{plan.subtitle}</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* ── Progress Overview ── */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-5">
            <ProgressRing percent={overallProgress} />
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-sm font-semibold text-white">Week {plan.currentWeek} of {plan.totalWeeks}</div>
                <div className="text-xs text-white/30">{displayWeek.label} · {weeksRemaining} weeks remaining</div>
              </div>
              {/* Week timeline */}
              <WeekTimeline weeks={plan.weeks} currentWeek={selectedWeek} onSelectWeek={setSelectedWeek} />
              <div className="flex gap-3 text-[11px] text-white/25">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/60" /> Done</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/8" /> Upcoming</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard icon={CheckCircle2} label="Completed" value={plan.completedWorkouts} sub={`of ${plan.totalWorkouts} total`} />
          <StatCard icon={Target} label="Adherence" value={`${plan.adherencePercent}%`} sub={`${plan.skippedWorkouts} skipped`} />
          <StatCard icon={Flame} label="Streak" value={plan.currentStreak} sub={`Best: ${plan.longestStreak}`} />
        </div>

        {/* ── Today's Workout ── */}
        <TodaysWorkout />

        {/* ── Week Detail ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors"
                disabled={selectedWeek <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-white">
                Week {selectedWeek}
                <span className="text-white/30 font-normal ml-1.5">{displayWeek.label}</span>
              </span>
              <button
                onClick={() => setSelectedWeek(Math.min(plan.totalWeeks, selectedWeek + 1))}
                className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors"
                disabled={selectedWeek >= plan.totalWeeks}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            {selectedWeek !== plan.currentWeek && (
              <button onClick={() => setSelectedWeek(plan.currentWeek)} className="text-[11px] text-white/30 hover:text-white/50 underline underline-offset-2">
                Back to current
              </button>
            )}
          </div>
          <WeekCalendar week={displayWeek} />
        </div>

        {/* ── Plan Info ── */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">Plan Details</h3>
          <p className="text-sm text-white/45 leading-relaxed">{plan.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/30">
            <span className="flex items-center gap-1"><Target size={12} /> {plan.goal}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {plan.frequency}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {plan.startDate} → {plan.expectedEndDate}</span>
          </div>
          <div className="flex gap-1.5 pt-1">
            {plan.schedule.map((day) => (
              <span key={day} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/70">{day}</span>
            ))}
          </div>
        </div>

        {/* ── Recent Workouts ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">Recent Workouts</h3>
            <button className="text-[11px] text-white/25 hover:text-white/50 transition-colors">View all</button>
          </div>
          <WorkoutHistory weeks={plan.weeks} />
        </div>

      </div>
    </div>
  );
}
