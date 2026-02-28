'use client';

import { createContext, useContext, useState } from 'react';
import {
  User,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  Heart,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Home,
  Building,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  Scale,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PROFILE, type UserProfile, type Goal, type Constraint } from './profileMockData';

// ─── Theme ───────────────────────────────────────────────────────────

interface ProfileTheme {
  bg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  hoverBg: string;
  sectionHeaderText: string;
  // Goal colors
  goalPrimaryBg: string;
  goalPrimaryBorder: string;
  goalPrimaryAccent: string;
  goalSecondaryBg: string;
  goalSecondaryBorder: string;
  goalSecondaryAccent: string;
  // Schedule
  dayActiveBg: string;
  dayActiveText: string;
  dayActiveBorder: string;
  dayInactiveBg: string;
  dayInactiveText: string;
  dayInactiveBorder: string;
  // Constraints
  constraintActiveBg: string;
  constraintActiveBorder: string;
  constraintActiveIcon: string;
  constraintResolvedBg: string;
  constraintResolvedBorder: string;
  constraintResolvedIcon: string;
  // Preferences
  likeBg: string;
  likeText: string;
  dislikeBg: string;
  dislikeText: string;
  styleBg: string;
  styleText: string;
  // Metrics
  metricCardBg: string;
  metricCardBorder: string;
  trendUp: string;
  trendDown: string;
  trendStable: string;
  // Equipment
  equipmentBg: string;
  equipmentBorder: string;
  equipmentText: string;
  // Avatar
  avatarBg: string;
  avatarText: string;
  avatarBorder: string;
  // Badge
  badgeBg: string;
  badgeText: string;
  // Log
  logDotBg: string;
  logLineBg: string;
}

const darkTheme: ProfileTheme = {
  bg: 'bg-[hsl(222,47%,5%)]',
  textPrimary: 'text-white',
  textSecondary: 'text-white/50',
  textMuted: 'text-white/30',
  cardBg: 'bg-white/[0.03]',
  cardBorder: 'border-white/[0.06]',
  hoverBg: 'hover:bg-white/[0.05]',
  sectionHeaderText: 'text-white/30',
  goalPrimaryBg: 'bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent',
  goalPrimaryBorder: 'border-amber-500/20',
  goalPrimaryAccent: 'text-amber-400',
  goalSecondaryBg: 'bg-white/[0.03]',
  goalSecondaryBorder: 'border-white/[0.06]',
  goalSecondaryAccent: 'text-blue-400',
  dayActiveBg: 'bg-emerald-500/15',
  dayActiveText: 'text-emerald-400',
  dayActiveBorder: 'border-emerald-500/30',
  dayInactiveBg: 'bg-white/[0.02]',
  dayInactiveText: 'text-white/20',
  dayInactiveBorder: 'border-white/[0.04]',
  constraintActiveBg: 'bg-amber-500/10',
  constraintActiveBorder: 'border-amber-500/20',
  constraintActiveIcon: 'text-amber-400',
  constraintResolvedBg: 'bg-emerald-500/5',
  constraintResolvedBorder: 'border-emerald-500/15',
  constraintResolvedIcon: 'text-emerald-400',
  likeBg: 'bg-emerald-500/10',
  likeText: 'text-emerald-400',
  dislikeBg: 'bg-red-400/10',
  dislikeText: 'text-red-400',
  styleBg: 'bg-blue-500/10',
  styleText: 'text-blue-400',
  metricCardBg: 'bg-white/[0.03]',
  metricCardBorder: 'border-white/[0.06]',
  trendUp: 'text-emerald-400',
  trendDown: 'text-red-400',
  trendStable: 'text-white/40',
  equipmentBg: 'bg-white/[0.04]',
  equipmentBorder: 'border-white/[0.06]',
  equipmentText: 'text-white/60',
  avatarBg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
  avatarText: 'text-amber-400',
  avatarBorder: 'border-amber-500/30',
  badgeBg: 'bg-white/[0.06]',
  badgeText: 'text-white/60',
  logDotBg: 'bg-white/20',
  logLineBg: 'bg-white/[0.06]',
};

const lightTheme: ProfileTheme = {
  bg: 'bg-[#F7F5F2]',
  textPrimary: 'text-stone-900',
  textSecondary: 'text-stone-500',
  textMuted: 'text-stone-400',
  cardBg: 'bg-white',
  cardBorder: 'border-stone-200',
  hoverBg: 'hover:bg-stone-50',
  sectionHeaderText: 'text-stone-400',
  goalPrimaryBg: 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-white',
  goalPrimaryBorder: 'border-amber-200/60',
  goalPrimaryAccent: 'text-amber-600',
  goalSecondaryBg: 'bg-white',
  goalSecondaryBorder: 'border-stone-200',
  goalSecondaryAccent: 'text-blue-600',
  dayActiveBg: 'bg-emerald-50',
  dayActiveText: 'text-emerald-600',
  dayActiveBorder: 'border-emerald-200',
  dayInactiveBg: 'bg-stone-50',
  dayInactiveText: 'text-stone-300',
  dayInactiveBorder: 'border-stone-200',
  constraintActiveBg: 'bg-amber-50',
  constraintActiveBorder: 'border-amber-200',
  constraintActiveIcon: 'text-amber-500',
  constraintResolvedBg: 'bg-emerald-50',
  constraintResolvedBorder: 'border-emerald-200',
  constraintResolvedIcon: 'text-emerald-500',
  likeBg: 'bg-emerald-50',
  likeText: 'text-emerald-600',
  dislikeBg: 'bg-red-50',
  dislikeText: 'text-red-500',
  styleBg: 'bg-blue-50',
  styleText: 'text-blue-600',
  metricCardBg: 'bg-white',
  metricCardBorder: 'border-stone-200',
  trendUp: 'text-emerald-500',
  trendDown: 'text-red-500',
  trendStable: 'text-stone-400',
  equipmentBg: 'bg-stone-50',
  equipmentBorder: 'border-stone-200',
  equipmentText: 'text-stone-600',
  avatarBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
  avatarText: 'text-amber-700',
  avatarBorder: 'border-amber-200',
  badgeBg: 'bg-stone-100',
  badgeText: 'text-stone-600',
  logDotBg: 'bg-stone-300',
  logLineBg: 'bg-stone-200',
};

const ThemeContext = createContext<ProfileTheme>(darkTheme);
const useTheme = () => useContext(ThemeContext);

// ─── Section Header ──────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  const t = useTheme();
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className={t.sectionHeaderText} />
      <span className={cn('text-[11px] font-semibold uppercase tracking-[0.1em]', t.sectionHeaderText)}>
        {label}
      </span>
    </div>
  );
}

// ─── Hero / Identity Card ────────────────────────────────────────────

function IdentityCard({ profile }: { profile: UserProfile }) {
  const t = useTheme();
  const { identity } = profile;
  const initials = identity.name.split(' ').map(n => n[0]).join('');
  const memberMonths = Math.round(
    (new Date('2026-02-27').getTime() - new Date(identity.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <div className={cn('rounded-2xl border p-6', t.cardBg, t.cardBorder)}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center border-2 text-xl font-bold shrink-0',
          t.avatarBg, t.avatarText, t.avatarBorder
        )}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className={cn('text-xl font-bold', t.textPrimary)}>{identity.name}</h1>
          <p className={cn('text-sm mt-0.5', t.textSecondary)}>
            {identity.age} · {identity.gender}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', t.badgeBg, t.badgeText)}>
              <Activity size={12} />
              {identity.experience}
            </span>
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', t.badgeBg, t.badgeText)}>
              <Clock size={12} />
              {memberMonths} months
            </span>
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', t.badgeBg, t.badgeText)}>
              <Calendar size={12} />
              {profile.schedule.frequency}×/week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Goals Section ───────────────────────────────────────────────────

function GoalCard({ goal }: { goal: Goal }) {
  const t = useTheme();
  const isPrimary = goal.type === 'primary';

  return (
    <div className={cn(
      'rounded-xl border p-4',
      isPrimary ? t.goalPrimaryBg : t.goalSecondaryBg,
      isPrimary ? t.goalPrimaryBorder : t.goalSecondaryBorder,
    )}>
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-sm font-semibold',
          isPrimary ? t.goalPrimaryAccent : t.goalSecondaryAccent,
        )}>
          {goal.label}
        </span>
        {isPrimary && (
          <span className={cn('text-[10px] uppercase tracking-wider font-medium', t.textMuted)}>Primary</span>
        )}
      </div>
      <p className={cn('text-xs mt-1', t.textSecondary)}>{goal.description}</p>
    </div>
  );
}

function GoalsSection({ goals }: { goals: Goal[] }) {
  return (
    <div>
      <SectionHeader icon={Target} label="Goals" />
      <div className="space-y-2">
        {goals.map(g => <GoalCard key={g.id} goal={g} />)}
      </div>
    </div>
  );
}

// ─── Schedule Section ────────────────────────────────────────────────

function ScheduleSection({ profile }: { profile: UserProfile }) {
  const t = useTheme();
  const { schedule } = profile;

  return (
    <div>
      <SectionHeader icon={Calendar} label="Schedule" />
      <div className={cn('rounded-xl border p-4', t.cardBg, t.cardBorder)}>
        {/* Day pills */}
        <div className="flex gap-1.5 justify-between mb-4">
          {schedule.days.map(d => (
            <div
              key={d.day}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 flex-1 min-w-0',
                d.available
                  ? cn(t.dayActiveBg, t.dayActiveBorder)
                  : cn(t.dayInactiveBg, t.dayInactiveBorder),
              )}
            >
              <span className={cn(
                'text-xs font-semibold',
                d.available ? t.dayActiveText : t.dayInactiveText,
              )}>
                {d.short}
              </span>
              {d.available && d.timeWindow && (
                <span className={cn('text-[9px]', t.dayActiveText, 'opacity-70')}>
                  {d.timeWindow}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={13} className={t.textMuted} />
            <span className={cn('text-xs', t.textSecondary)}>{schedule.sessionDuration}</span>
          </div>
          <span className={cn('text-xs font-medium', t.textSecondary)}>
            {schedule.frequency} days/week
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Equipment & Environment ─────────────────────────────────────────

function EnvironmentSection({ profile }: { profile: UserProfile }) {
  const t = useTheme();

  const locationIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'commercial': return Building;
      default: return MapPin;
    }
  };

  return (
    <div>
      <SectionHeader icon={Dumbbell} label="Training Environment" />
      <div className="space-y-3">
        {profile.environments.map(env => {
          const Icon = locationIcon(env.type);
          return (
            <div key={env.name} className={cn('rounded-xl border p-4', t.cardBg, t.cardBorder)}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={t.textSecondary} />
                <span className={cn('text-sm font-semibold', t.textPrimary)}>{env.name}</span>
                <span className={cn('text-[10px] uppercase tracking-wider', t.textMuted)}>
                  {env.type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {env.equipment.map(eq => (
                  <span
                    key={eq.name}
                    className={cn('px-2.5 py-1 rounded-md text-[11px] border', t.equipmentBg, t.equipmentBorder, t.equipmentText)}
                  >
                    {eq.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Constraints ─────────────────────────────────────────────────────

function ConstraintCard({ constraint }: { constraint: Constraint }) {
  const t = useTheme();
  const isActive = constraint.status === 'active';

  return (
    <div className={cn(
      'rounded-xl border p-3 flex items-start gap-3',
      isActive ? t.constraintActiveBg : t.constraintResolvedBg,
      isActive ? t.constraintActiveBorder : t.constraintResolvedBorder,
    )}>
      {isActive ? (
        <AlertTriangle size={15} className={cn(t.constraintActiveIcon, 'mt-0.5 shrink-0')} />
      ) : (
        <CheckCircle2 size={15} className={cn(t.constraintResolvedIcon, 'mt-0.5 shrink-0')} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold uppercase tracking-wider',
            isActive ? t.constraintActiveIcon : t.constraintResolvedIcon
          )}>
            {constraint.status}
          </span>
          {constraint.since && (
            <span className={cn('text-[10px]', t.textMuted)}>since {constraint.since}</span>
          )}
        </div>
        <p className={cn('text-sm mt-1', t.textPrimary)}>{constraint.description}</p>
        {constraint.management && (
          <p className={cn('text-xs mt-1', t.textSecondary)}>{constraint.management}</p>
        )}
      </div>
    </div>
  );
}

function ConstraintsSection({ constraints }: { constraints: Constraint[] }) {
  return (
    <div>
      <SectionHeader icon={Shield} label="Constraints & Injuries" />
      <div className="space-y-2">
        {constraints.map(c => <ConstraintCard key={c.id} constraint={c} />)}
      </div>
    </div>
  );
}

// ─── Preferences ─────────────────────────────────────────────────────

function PreferencesSection({ profile }: { profile: UserProfile }) {
  const t = useTheme();

  const catConfig = {
    likes: { icon: Heart, bg: t.likeBg, text: t.likeText, label: 'Likes' },
    dislikes: { icon: ThumbsDown, bg: t.dislikeBg, text: t.dislikeText, label: 'Dislikes' },
    style: { icon: MessageSquare, bg: t.styleBg, text: t.styleText, label: 'Communication' },
  };

  return (
    <div>
      <SectionHeader icon={Heart} label="Preferences" />
      <div className="space-y-3">
        {profile.preferences.map(pref => {
          const cfg = catConfig[pref.category];
          const Icon = cfg.icon;
          return (
            <div key={pref.category}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} className={cfg.text} />
                <span className={cn('text-[11px] font-semibold uppercase tracking-wider', cfg.text)}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pref.items.map(item => (
                  <span key={item} className={cn('px-2.5 py-1 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Metrics ─────────────────────────────────────────────────────────

function MetricsSection({ profile }: { profile: UserProfile }) {
  const t = useTheme();

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === 'up') return <TrendingUp size={13} className={t.trendUp} />;
    if (trend === 'down') return <TrendingDown size={13} className={t.trendDown} />;
    return <Minus size={13} className={t.trendStable} />;
  };

  return (
    <div>
      <SectionHeader icon={TrendingUp} label="Metrics" />

      {/* Strength */}
      <div className={cn('rounded-xl border p-4 mb-3', t.cardBg, t.cardBorder)}>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={13} className={t.textSecondary} />
          <span className={cn('text-xs font-semibold uppercase tracking-wider', t.textSecondary)}>Strength</span>
        </div>
        <div className="space-y-3">
          {profile.strengthMetrics.map(m => (
            <div key={m.exercise} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium', t.textPrimary)}>{m.exercise}</span>
                  <TrendIcon trend={m.trend} />
                </div>
                {m.previousValue && (
                  <span className={cn('text-[10px]', t.textMuted)}>prev: {m.previousValue}</span>
                )}
              </div>
              <div className="text-right">
                <span className={cn('text-sm font-bold', t.textPrimary)}>{m.value}</span>
                <div className={cn('text-[10px]', t.textMuted)}>{m.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body Composition */}
      <div className={cn('rounded-xl border p-4', t.cardBg, t.cardBorder)}>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={13} className={t.textSecondary} />
          <span className={cn('text-xs font-semibold uppercase tracking-wider', t.textSecondary)}>Body</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {profile.bodyMetrics.map(m => (
            <div key={m.label}>
              <span className={cn('text-[11px]', t.textMuted)}>{m.label}</span>
              <div className={cn('text-lg font-bold mt-0.5', t.textPrimary)}>{m.value}</div>
              {m.startValue && (
                <span className={cn('text-[10px]', t.textSecondary)}>
                  from {m.startValue}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Log ────────────────────────────────────────────────────

function LogSection({ profile }: { profile: UserProfile }) {
  const t = useTheme();
  const [expanded, setExpanded] = useState(false);
  const entries = expanded ? profile.recentLog : profile.recentLog.slice(0, 2);

  return (
    <div>
      <SectionHeader icon={FileText} label="Activity Log" />
      <div className="relative">
        {/* Timeline line */}
        <div className={cn('absolute left-[7px] top-3 bottom-3 w-px', t.logLineBg)} />

        <div className="space-y-4">
          {entries.map((entry, i) => (
            <div key={entry.date} className="relative pl-6">
              {/* Dot */}
              <div className={cn('absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2', t.logDotBg, t.cardBorder)} />

              <div>
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-xs font-mono', t.textMuted)}>{entry.date}</span>
                  <span className={cn('text-sm font-semibold', t.textPrimary)}>{entry.title}</span>
                </div>
                <ul className="mt-1.5 space-y-0.5">
                  {entry.notes.map((note, j) => (
                    <li key={j} className={cn('text-xs', t.textSecondary)}>• {note}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {profile.recentLog.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn('flex items-center gap-1 mt-3 text-xs font-medium', t.textSecondary, t.hoverBg, 'rounded-md px-2 py-1')}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Show less' : `Show all (${profile.recentLog.length})`}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export function AntProfilePage({ mode }: { mode: 'light' | 'dark' }) {
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const profile = MOCK_PROFILE;

  return (
    <ThemeContext.Provider value={theme}>
      <div className={cn('min-h-screen', theme.bg)}>
        <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">

          {/* Identity */}
          <IdentityCard profile={profile} />

          {/* Goals */}
          <GoalsSection goals={profile.goals} />

          {/* Schedule */}
          <ScheduleSection profile={profile} />

          {/* Metrics */}
          <MetricsSection profile={profile} />

          {/* Constraints */}
          <ConstraintsSection constraints={profile.constraints} />

          {/* Environment */}
          <EnvironmentSection profile={profile} />

          {/* Preferences */}
          <PreferencesSection profile={profile} />

          {/* Log */}
          <LogSection profile={profile} />

        </div>
      </div>
    </ThemeContext.Provider>
  );
}
