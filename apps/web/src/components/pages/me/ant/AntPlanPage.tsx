'use client';

import { createContext, useContext, useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Target,
  CheckCircle2,
  Circle,
  XCircle,
  ChevronLeft,
  MoreHorizontal,
  Trophy,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACTIVE_PLAN, OPEN_ENDED_PLAN, type WorkoutStatus, type ActivePlan } from './planMockData';

// ─── Theme ───────────────────────────────────────────────────────────

interface PlanTheme {
  bg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  cardBg: string;
  cardBorder: string;
  hoverBg: string;
  buttonBg: string;
  buttonHoverBg: string;
  iconBg: string;
  ringTrack: string;
  ringTextColor: string;
  statusCompleted: string;
  statusSkipped: string;
  statusUpcoming: string;
  statusToday: string;
  statusRest: string;
  statusRingCompleted: string;
  statusRingSkipped: string;
  statusRingUpcoming: string;
  statusRingToday: string;
  todayCardBg: string;
  todayCardBorder: string;
  planDetailsBg: string;
  planDetailsBorder: string;
  schedulePillBg: string;
  schedulePillText: string;
  adherenceGoodBg: string;
  adherenceGoodText: string;
  adherenceOkBg: string;
  adherenceOkText: string;
  weekCompletedBg: string;
  weekCurrentBg: string;
  weekUpcomingBg: string;
  completedIcon: string;
  skippedIcon: string;
  todayIcon: string;
  upcomingIcon: string;
  restDash: string;
  todayDayBg: string;
  todayDayRing: string;
  completedDayBg: string;
  sectionHeaderText: string;
  // Streak card
  streakCardBg: string;
  streakCardBorder: string;
  streakFireColor: string;
  streakFireGlow: string;
  streakMilestoneBg: string;
  streakMilestoneText: string;
  streakMilestoneReachedBg: string;
  streakMilestoneReachedText: string;
}

const darkTheme: PlanTheme = {
  bg: 'bg-[hsl(222,47%,5%)]',
  textPrimary: 'text-white',
  textSecondary: 'text-white/40',
  textMuted: 'text-white/30',
  textFaint: 'text-white/20',
  cardBg: 'bg-white/[0.03]',
  cardBorder: 'border-white/[0.06]',
  hoverBg: 'hover:bg-white/[0.03]',
  buttonBg: 'bg-white/10',
  buttonHoverBg: 'hover:bg-white/15',
  iconBg: 'bg-amber-400/15',
  ringTrack: 'rgba(255,255,255,0.06)',
  ringTextColor: 'text-white',
  statusCompleted: 'bg-emerald-500',
  statusSkipped: 'bg-red-400/60',
  statusUpcoming: 'bg-white/10',
  statusToday: 'bg-amber-400',
  statusRest: 'bg-white/[0.04]',
  statusRingCompleted: 'ring-emerald-500/30',
  statusRingSkipped: 'ring-red-400/20',
  statusRingUpcoming: 'ring-white/5',
  statusRingToday: 'ring-amber-400/40',
  todayCardBg: 'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent',
  todayCardBorder: 'border-white/[0.08]',
  planDetailsBg: 'bg-white/[0.02]',
  planDetailsBorder: 'border-white/[0.05]',
  schedulePillBg: 'bg-blue-500/10',
  schedulePillText: 'text-blue-300/70',
  adherenceGoodBg: 'bg-emerald-500/10',
  adherenceGoodText: 'text-emerald-400',
  adherenceOkBg: 'bg-amber-500/10',
  adherenceOkText: 'text-amber-400',
  weekCompletedBg: 'bg-emerald-500/60',
  weekCurrentBg: 'bg-amber-400',
  weekUpcomingBg: 'bg-white/8',
  completedIcon: 'text-emerald-400',
  skippedIcon: 'text-red-400/60',
  todayIcon: 'text-amber-400',
  upcomingIcon: 'text-white/15',
  restDash: 'text-white/20',
  todayDayBg: 'bg-amber-400/10',
  todayDayRing: 'ring-1 ring-amber-400/30',
  completedDayBg: 'bg-emerald-500/5',
  sectionHeaderText: 'text-white/30',
  streakCardBg: 'bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent',
  streakCardBorder: 'border-orange-500/20',
  streakFireColor: 'text-orange-400',
  streakFireGlow: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]',
  streakMilestoneBg: 'bg-white/[0.05]',
  streakMilestoneText: 'text-white/30',
  streakMilestoneReachedBg: 'bg-orange-500/20',
  streakMilestoneReachedText: 'text-orange-300',
};

const lightTheme: PlanTheme = {
  bg: 'bg-[#F7F5F2]',
  textPrimary: 'text-stone-900',
  textSecondary: 'text-stone-500',
  textMuted: 'text-stone-400',
  textFaint: 'text-stone-300',
  cardBg: 'bg-white',
  cardBorder: 'border-stone-200',
  hoverBg: 'hover:bg-stone-50',
  buttonBg: 'bg-stone-100',
  buttonHoverBg: 'hover:bg-stone-200',
  iconBg: 'bg-amber-100',
  ringTrack: 'rgba(0,0,0,0.06)',
  ringTextColor: 'text-stone-900',
  statusCompleted: 'bg-emerald-500',
  statusSkipped: 'bg-red-400',
  statusUpcoming: 'bg-stone-200',
  statusToday: 'bg-amber-400',
  statusRest: 'bg-stone-100',
  statusRingCompleted: 'ring-emerald-500/30',
  statusRingSkipped: 'ring-red-400/20',
  statusRingUpcoming: 'ring-stone-200',
  statusRingToday: 'ring-amber-400/40',
  todayCardBg: 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-white',
  todayCardBorder: 'border-blue-200/60',
  planDetailsBg: 'bg-white',
  planDetailsBorder: 'border-stone-200',
  schedulePillBg: 'bg-blue-50',
  schedulePillText: 'text-blue-600',
  adherenceGoodBg: 'bg-emerald-50',
  adherenceGoodText: 'text-emerald-600',
  adherenceOkBg: 'bg-amber-50',
  adherenceOkText: 'text-amber-600',
  weekCompletedBg: 'bg-emerald-500/60',
  weekCurrentBg: 'bg-amber-400',
  weekUpcomingBg: 'bg-stone-200',
  completedIcon: 'text-emerald-500',
  skippedIcon: 'text-red-400',
  todayIcon: 'text-amber-500',
  upcomingIcon: 'text-stone-300',
  restDash: 'text-stone-300',
  todayDayBg: 'bg-amber-50',
  todayDayRing: 'ring-1 ring-amber-300',
  completedDayBg: 'bg-emerald-50',
  sectionHeaderText: 'text-stone-400',
  streakCardBg: 'bg-gradient-to-br from-orange-50 via-amber-50/50 to-white',
  streakCardBorder: 'border-orange-200/60',
  streakFireColor: 'text-orange-500',
  streakFireGlow: 'drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]',
  streakMilestoneBg: 'bg-stone-100',
  streakMilestoneText: 'text-stone-400',
  streakMilestoneReachedBg: 'bg-orange-100',
  streakMilestoneReachedText: 'text-orange-600',
};

const ThemeCtx = createContext<PlanTheme>(darkTheme);
const useTheme = () => useContext(ThemeCtx);

// ─── Helpers ─────────────────────────────────────────────────────────

function isFixedLength(plan: ActivePlan): boolean {
  return !!plan.totalWeeks && plan.totalWeeks > 0;
}

// ─── Status helpers ──────────────────────────────────────────────────

function StatusIcon({ status, size = 16 }: { status: WorkoutStatus; size?: number }) {
  const t = useTheme();
  if (status === 'completed') return <CheckCircle2 size={size} className={t.completedIcon} />;
  if (status === 'skipped') return <XCircle size={size} className={t.skippedIcon} />;
  if (status === 'today') return <Flame size={size} className={t.todayIcon} />;
  if (status === 'rest') return <span className={cn('text-xs', t.restDash)}>—</span>;
  return <Circle size={size} className={t.upcomingIcon} />;
}

// ─── Progress Ring (only for fixed-length plans) ─────────────────────

function ProgressRing({ percent, size = 80, strokeWidth = 6 }: { percent: number; size?: number; strokeWidth?: number }) {
  const t = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={t.ringTrack} strokeWidth={strokeWidth} />
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
        <span className={cn('text-lg font-bold', t.ringTextColor)}>{percent}%</span>
      </div>
    </div>
  );
}

// ─── Streak Card ─────────────────────────────────────────────────────

const STREAK_MILESTONES = [3, 5, 7, 10, 14, 21, 30, 50, 75, 100];

function getStreakMessage(streak: number): string {
  if (streak >= 30) return 'Unstoppable! 💪';
  if (streak >= 21) return 'Three weeks strong!';
  if (streak >= 14) return 'Two weeks — incredible!';
  if (streak >= 10) return 'Double digits!';
  if (streak >= 7) return 'One full week!';
  if (streak >= 5) return 'On fire!';
  if (streak >= 3) return 'Building momentum!';
  if (streak >= 1) return 'Keep it going!';
  return 'Start your streak today!';
}

function getNextMilestone(streak: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (m > streak) return m;
  }
  return null;
}

function StreakCard({ plan }: { plan: ActivePlan }) {
  const t = useTheme();
  const { currentStreak, longestStreak, streakMilestones = [] } = plan;
  const nextMilestone = getNextMilestone(currentStreak);
  const progressToNext = nextMilestone ? Math.round((currentStreak / nextMilestone) * 100) : 100;

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border p-4 sm:p-5', t.streakCardBg, t.streakCardBorder)}>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Fire icon with glow */}
        <div className="relative shrink-0">
          <Flame
            size={currentStreak >= 7 ? 36 : 28}
            className={cn(
              t.streakFireColor,
              currentStreak >= 3 && t.streakFireGlow,
              currentStreak >= 7 && 'animate-pulse',
            )}
          />
          {currentStreak >= 10 && (
            <Flame
              size={16}
              className={cn('absolute -top-1 -right-1', t.streakFireColor, 'opacity-60')}
            />
          )}
        </div>

        {/* Streak info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={cn('text-2xl sm:text-3xl font-bold tabular-nums', t.textPrimary)}>
              {currentStreak}
            </span>
            <span className={cn('text-sm', t.textSecondary)}>
              workout streak
            </span>
          </div>
          <p className={cn('text-xs mt-0.5', t.textMuted)}>
            {getStreakMessage(currentStreak)}
          </p>
        </div>

        {/* Best streak badge */}
        {longestStreak > 0 && (
          <div className={cn('flex flex-col items-center shrink-0 px-2 sm:px-3 py-1.5 rounded-lg', t.cardBg)}>
            <Trophy size={14} className={cn(t.textMuted, 'mb-0.5')} />
            <span className={cn('text-xs font-bold tabular-nums', t.textPrimary)}>{longestStreak}</span>
            <span className={cn('text-[9px]', t.textFaint)}>best</span>
          </div>
        )}
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className={cn('text-[10px] sm:text-[11px]', t.textFaint)}>
              {nextMilestone - currentStreak} more to reach {nextMilestone} 🎯
            </span>
          </div>
          <div className={cn('h-1.5 rounded-full overflow-hidden', t.cardBg)}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestone badges */}
      {streakMilestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {STREAK_MILESTONES.filter(m => m <= Math.max(currentStreak + 5, 10)).map((milestone) => {
            const reached = streakMilestones.includes(milestone);
            return (
              <span
                key={milestone}
                className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full transition-all',
                  reached
                    ? cn(t.streakMilestoneReachedBg, t.streakMilestoneReachedText)
                    : cn(t.streakMilestoneBg, t.streakMilestoneText),
                )}
              >
                {reached ? '🔥' : ''} {milestone}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Flame; label: string; value: string | number; sub?: string }) {
  const t = useTheme();
  return (
    <div className={cn('rounded-xl p-2.5 sm:p-3 flex flex-col gap-1 border min-w-0', t.cardBg, t.cardBorder)}>
      <div className={cn('flex items-center gap-1 sm:gap-1.5', t.textSecondary)}>
        <Icon size={12} className="shrink-0" />
        <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className={cn('text-lg sm:text-xl font-bold leading-tight tabular-nums', t.textPrimary)}>{value}</div>
      {sub && <div className={cn('text-[10px] sm:text-[11px] truncate', t.textMuted)}>{sub}</div>}
    </div>
  );
}

// ─── Week Calendar Row ───────────────────────────────────────────────

function WeekCalendar({ week }: { week: (typeof ACTIVE_PLAN)['weeks'][0] }) {
  const t = useTheme();

  const statusColors: Record<WorkoutStatus, string> = {
    completed: t.statusCompleted,
    skipped: t.statusSkipped,
    upcoming: t.statusUpcoming,
    today: t.statusToday,
    rest: t.statusRest,
  };

  const statusRings: Record<WorkoutStatus, string> = {
    completed: t.statusRingCompleted,
    skipped: t.statusRingSkipped,
    upcoming: t.statusRingUpcoming,
    today: t.statusRingToday,
    rest: 'ring-transparent',
  };

  return (
    <div className="flex gap-1 sm:gap-1.5">
      {week.days.map((day, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg transition-all min-w-0',
            day.status === 'today' && cn(t.todayDayBg, t.todayDayRing),
            day.status === 'completed' && t.completedDayBg,
          )}
        >
          <span className={cn(
            'text-[9px] sm:text-[10px] font-medium',
            day.status === 'today' ? t.todayIcon : t.textMuted
          )}>
            {day.dayOfWeek}
          </span>
          <div className={cn(
            'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ring-2',
            statusColors[day.status],
            statusRings[day.status],
          )}>
            {day.status === 'rest' ? (
              <span className={cn('text-[8px] sm:text-[9px]', t.restDash)}>R</span>
            ) : (
              <StatusIcon status={day.status} size={12} />
            )}
          </div>
          <span className={cn(
            'text-[8px] sm:text-[9px] text-center leading-tight line-clamp-1 w-full',
            day.status === 'today' ? t.todayIcon : t.textFaint
          )}>
            {day.type === 'rest' ? '' : day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Today's Workout Card ────────────────────────────────────────────

function TodaysWorkout({ plan }: { plan: ActivePlan }) {
  const t = useTheme();
  const { nextWorkout } = plan;
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border', t.todayCardBg, t.todayCardBorder)}>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', t.iconBg)}>
              <Dumbbell size={16} className={t.todayIcon} />
            </div>
            <div className="min-w-0">
              <div className={cn('text-[10px] font-semibold uppercase tracking-wider', t.todayIcon)} style={{ opacity: 0.8 }}>Today&apos;s Workout</div>
              <div className={cn('text-xs truncate', t.textMuted)}>{nextWorkout.dayOfWeek} · ~{nextWorkout.estimatedDuration} min</div>
            </div>
          </div>
          <button className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0', t.buttonBg, t.buttonHoverBg, t.textPrimary)}>
            Start
          </button>
        </div>

        <h3 className={cn('text-base sm:text-lg font-bold mb-0.5', t.textPrimary)}>{nextWorkout.label}</h3>
        <p className={cn('text-xs mb-3 sm:mb-4', t.textSecondary)}>{nextWorkout.focus}</p>

        <div className="space-y-1 sm:space-y-1.5">
          {nextWorkout.exercises.map((ex, i) => (
            <div key={i} className={cn('flex items-center gap-2 text-xs sm:text-sm', t.textSecondary)}>
              <span className={cn('text-[10px] sm:text-xs w-4 text-right shrink-0', t.textFaint)}>{i + 1}</span>
              <span className="truncate">{ex}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Week Timeline (only for fixed-length plans) ─────────────────────

function WeekTimeline({ weeks, currentWeek, onSelectWeek }: { weeks: (typeof ACTIVE_PLAN)['weeks']; currentWeek: number; onSelectWeek: (w: number) => void }) {
  const t = useTheme();
  return (
    <div className="flex gap-0.5 items-center">
      {weeks.map((week) => (
        <button
          key={week.weekNumber}
          onClick={() => onSelectWeek(week.weekNumber)}
          className={cn(
            'flex-1 h-2 rounded-full transition-all',
            week.status === 'completed' && t.weekCompletedBg,
            week.status === 'current' && cn(t.weekCurrentBg, 'animate-pulse'),
            week.status === 'upcoming' && t.weekUpcomingBg,
            week.weekNumber === currentWeek && 'ring-1 ring-offset-1 ring-stone-400/30',
          )}
          title={`Week ${week.weekNumber}: ${week.label}`}
        />
      ))}
    </div>
  );
}

// ─── Workout History List ────────────────────────────────────────────

function WorkoutHistory({ weeks }: { weeks: (typeof ACTIVE_PLAN)['weeks'] }) {
  const t = useTheme();
  const completedDays = weeks
    .flatMap((w) => w.days.map((d) => ({ ...d, week: w.weekNumber, weekLabel: w.label })))
    .filter((d) => d.status === 'completed')
    .reverse()
    .slice(0, 8);

  return (
    <div className="space-y-1">
      {completedDays.map((day, i) => (
        <div key={i} className={cn('flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded-lg transition-colors group cursor-pointer', t.hoverBg)}>
          <CheckCircle2 size={14} className={cn(t.completedIcon, 'opacity-60 shrink-0')} />
          <div className="flex-1 min-w-0">
            <div className={cn('text-xs sm:text-sm truncate', t.textSecondary)}>{day.label}</div>
            <div className={cn('text-[10px] sm:text-[11px] truncate', t.textFaint)}>Week {day.week} · {day.dayOfWeek} · {day.date}</div>
          </div>
          {day.adherenceScore && (
            <span className={cn(
              'text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0',
              day.adherenceScore >= 90
                ? cn(t.adherenceGoodBg, t.adherenceGoodText)
                : cn(t.adherenceOkBg, t.adherenceOkText)
            )}>
              {day.adherenceScore}%
            </span>
          )}
          <ChevronRight size={14} className={cn(t.textFaint, 'group-hover:opacity-70 transition-colors shrink-0')} />
        </div>
      ))}
    </div>
  );
}

// ─── Fixed-Length Progress Section ────────────────────────────────────

function FixedProgressSection({ plan, selectedWeek, onSelectWeek }: { plan: ActivePlan; selectedWeek: number; onSelectWeek: (w: number) => void }) {
  const t = useTheme();
  const overallProgress = Math.round((plan.currentWeek / plan.totalWeeks!) * 100);
  const weeksRemaining = plan.totalWeeks! - plan.currentWeek;
  const displayWeek = plan.weeks[selectedWeek - 1];

  return (
    <div className={cn('rounded-2xl p-4 sm:p-5 border', t.cardBg, t.cardBorder)}>
      <div className="flex items-center gap-4 sm:gap-5">
        <ProgressRing percent={overallProgress} size={72} />
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <div>
            <div className={cn('text-sm font-semibold', t.textPrimary)}>Week {plan.currentWeek} of {plan.totalWeeks}</div>
            <div className={cn('text-xs truncate', t.textMuted)}>{displayWeek?.label} · {weeksRemaining} weeks remaining</div>
          </div>
          <WeekTimeline weeks={plan.weeks} currentWeek={selectedWeek} onSelectWeek={onSelectWeek} />
          <div className={cn('flex gap-3 text-[10px] sm:text-[11px] flex-wrap', t.textFaint)}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/60" /> Done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Current</span>
            <span className="flex items-center gap-1"><span className={cn('w-2 h-2 rounded-full', t.weekUpcomingBg)} /> Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Open-Ended Progress Section ─────────────────────────────────────

function OpenEndedProgressSection({ plan }: { plan: ActivePlan }) {
  const t = useTheme();

  return (
    <div className={cn('rounded-2xl p-4 sm:p-5 border', t.cardBg, t.cardBorder)}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={cn('w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0', t.iconBg)}>
          <TrendingUp size={28} className={t.todayIcon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-semibold', t.textPrimary)}>Week {plan.currentWeek}</div>
          <div className={cn('text-xs', t.textMuted)}>Started {plan.startDate}</div>
          <div className={cn('flex items-center gap-3 mt-2 text-xs flex-wrap', t.textSecondary)}>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className={cn(t.completedIcon, 'shrink-0')} />
              {plan.completedWorkouts} workouts
            </span>
            <span className="flex items-center gap-1">
              <Zap size={12} className="shrink-0" />
              {plan.adherencePercent}% adherence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

interface AntPlanPageProps {
  mode?: 'light' | 'dark';
}

export function AntPlanPage({ mode = 'dark' }: AntPlanPageProps) {
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const [planType, setPlanType] = useState<'fixed' | 'open'>('fixed');
  const plan = planType === 'fixed' ? ACTIVE_PLAN : OPEN_ENDED_PLAN;
  const fixed = isFixedLength(plan);
  const [selectedWeek, setSelectedWeek] = useState(plan.currentWeek);
  const displayWeek = plan.weeks[Math.min(selectedWeek - 1, plan.weeks.length - 1)];

  return (
    <ThemeCtx.Provider value={theme}>
      <div className={cn('min-h-screen', theme.bg)}>
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">

          {/* ── Demo Toggle (remove in production) ── */}
          <div className="flex gap-2">
            <button
              onClick={() => { setPlanType('fixed'); setSelectedWeek(ACTIVE_PLAN.currentWeek); }}
              className={cn(
                'text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors',
                planType === 'fixed'
                  ? cn(theme.schedulePillBg, theme.schedulePillText)
                  : cn(theme.textFaint),
              )}
            >
              12-Week Program
            </button>
            <button
              onClick={() => { setPlanType('open'); setSelectedWeek(OPEN_ENDED_PLAN.currentWeek); }}
              className={cn(
                'text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors',
                planType === 'open'
                  ? cn(theme.schedulePillBg, theme.schedulePillText)
                  : cn(theme.textFaint),
              )}
            >
              Open-Ended
            </button>
          </div>

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className={cn('text-lg sm:text-xl font-bold', theme.textPrimary)}>{plan.title}</h1>
              <p className={cn('text-xs sm:text-sm mt-0.5 truncate', theme.textMuted)}>{plan.subtitle}</p>
            </div>
            <button className={cn('p-2 rounded-lg transition-colors shrink-0', theme.hoverBg, theme.textMuted)}>
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* ── Progress (conditional on plan type) ── */}
          {fixed ? (
            <FixedProgressSection plan={plan} selectedWeek={selectedWeek} onSelectWeek={setSelectedWeek} />
          ) : (
            <OpenEndedProgressSection plan={plan} />
          )}

          {/* ── Streak Card ── */}
          <StreakCard plan={plan} />

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <StatCard icon={CheckCircle2} label="Done" value={plan.completedWorkouts} sub={plan.totalWorkouts ? `of ${plan.totalWorkouts}` : 'total'} />
            <StatCard icon={Target} label="Adherence" value={`${plan.adherencePercent}%`} sub={`${plan.skippedWorkouts} skipped`} />
            <StatCard icon={Flame} label="Streak" value={plan.currentStreak} sub={`Best: ${plan.longestStreak}`} />
          </div>

          {/* ── Today's Workout ── */}
          <TodaysWorkout plan={plan} />

          {/* ── Week Detail ── */}
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <button
                  onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  className={cn('p-1 rounded transition-colors shrink-0', theme.hoverBg, theme.textFaint)}
                  disabled={selectedWeek <= 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={cn('text-sm font-semibold truncate', theme.textPrimary)}>
                  Week {selectedWeek}
                  <span className={cn('font-normal ml-1 sm:ml-1.5', theme.textMuted)}>{displayWeek?.label}</span>
                </span>
                <button
                  onClick={() => setSelectedWeek(Math.min(fixed ? plan.totalWeeks! : plan.weeks.length, selectedWeek + 1))}
                  className={cn('p-1 rounded transition-colors shrink-0', theme.hoverBg, theme.textFaint)}
                  disabled={selectedWeek >= (fixed ? plan.totalWeeks! : plan.weeks.length)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              {selectedWeek !== plan.currentWeek && (
                <button onClick={() => setSelectedWeek(plan.currentWeek)} className={cn('text-[10px] sm:text-[11px] underline underline-offset-2 shrink-0', theme.textMuted, 'hover:opacity-70')}>
                  Back to current
                </button>
              )}
            </div>
            {displayWeek && <WeekCalendar week={displayWeek} />}
          </div>

          {/* ── Plan Info ── */}
          <div className={cn('rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 border', theme.planDetailsBg, theme.planDetailsBorder)}>
            <h3 className={cn('text-xs font-semibold uppercase tracking-wider', theme.sectionHeaderText)}>Plan Details</h3>
            <p className={cn('text-xs sm:text-sm leading-relaxed', theme.textSecondary)}>{plan.description}</p>
            <div className={cn('flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs', theme.textMuted)}>
              <span className="flex items-center gap-1"><Target size={12} className="shrink-0" /> <span className="truncate">{plan.goal}</span></span>
              <span className="flex items-center gap-1"><Calendar size={12} className="shrink-0" /> {plan.frequency}</span>
              {plan.expectedEndDate ? (
                <span className="flex items-center gap-1"><Clock size={12} className="shrink-0" /> {plan.startDate} → {plan.expectedEndDate}</span>
              ) : (
                <span className="flex items-center gap-1"><Clock size={12} className="shrink-0" /> Since {plan.startDate}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {plan.schedule.map((day) => (
                <span key={day} className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', theme.schedulePillBg, theme.schedulePillText)}>{day}</span>
              ))}
            </div>
          </div>

          {/* ── Recent Workouts ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider', theme.sectionHeaderText)}>Recent Workouts</h3>
              <button className={cn('text-[11px] transition-colors', theme.textFaint, 'hover:opacity-70')}>View all</button>
            </div>
            <WorkoutHistory weeks={plan.weeks} />
          </div>

        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
