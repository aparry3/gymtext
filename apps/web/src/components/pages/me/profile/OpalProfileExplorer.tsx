'use client';

import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  Dumbbell,
  HeartPulse,
  Shield,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FitnessProfile = {
  userName: string;
  profileVersion: string;
  profileCompleteness: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingAge: string;
  primaryGoals: { label: string; priority: 'Primary' | 'Secondary' }[];
  weeklyTarget: {
    sessions: number;
    minutes: number;
    streakDays: number;
  };
  schedule: {
    preferredDays: string[];
    sessionWindow: string;
    maxSessionLength: string;
    blockedWindows: string[];
  };
  equipmentAccess: string[];
  preferences: string[];
  constraints: {
    active: { label: string; detail: string; since: string }[];
    resolved: { label: string; resolvedOn: string }[];
  };
  progressSignals: {
    consistency4Weeks: number;
    strengthTrend: string;
    cardioTrend: string;
    recoveryTrend: string;
  };
};

const profile: FitnessProfile = {
  userName: 'Alex',
  profileVersion: 'Updated 2 days ago',
  profileCompleteness: 88,
  experienceLevel: 'intermediate',
  trainingAge: '2 years consistent lifting',
  primaryGoals: [
    { label: 'Build lean muscle while dropping ~10 lb body fat', priority: 'Primary' },
    { label: 'Improve compound strength (bench + deadlift)', priority: 'Primary' },
    { label: 'Run a sub-25 minute 5K in spring', priority: 'Secondary' },
  ],
  weeklyTarget: {
    sessions: 4,
    minutes: 220,
    streakDays: 11,
  },
  schedule: {
    preferredDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    sessionWindow: 'Weekdays 6:00-7:00 AM · Weekends 8:00-9:00 AM',
    maxSessionLength: '45-60 min',
    blockedWindows: ['Sunday (family)', 'Late evening sessions'],
  },
  equipmentAccess: [
    'Home setup: barbell + rack + bench',
    'Dumbbells: 5-50 lb pairs',
    'Bands + pull-up bar',
    'Weekend commercial gym access',
  ],
  preferences: [
    'Compound lifts first, accessories second',
    'Enjoys supersets and short rest density blocks',
    'Dislikes long steady-state cardio',
    'Prefers concise, data-driven coaching cues',
    'Wants optional variety for accessories',
  ],
  constraints: {
    active: [
      {
        label: 'Knee discomfort with heavy barbell squats',
        detail: 'Use goblet/front squat pattern while monitoring pain response',
        since: 'Since Feb 16',
      },
      {
        label: 'Time cap on weekday sessions',
        detail: 'Must fit in pre-work window with minimal transition time',
        since: 'Ongoing',
      },
    ],
    resolved: [
      { label: 'Right shoulder strain', resolvedOn: 'Resolved · 2024' },
    ],
  },
  progressSignals: {
    consistency4Weeks: 86,
    strengthTrend: 'Bench +10 lb and deadlift +15 lb over last 8 weeks',
    cardioTrend: 'Easy pace improving; recovery HR trend positive',
    recoveryTrend: 'Sleep consistency up; soreness moderate and manageable',
  },
};

const weekGrid = [
  { day: 'Mon', status: 'train', label: 'Upper Strength' },
  { day: 'Tue', status: 'light', label: 'Mobility / Walk' },
  { day: 'Wed', status: 'train', label: 'Lower Strength' },
  { day: 'Thu', status: 'light', label: 'Run Intervals' },
  { day: 'Fri', status: 'train', label: 'Upper Hypertrophy' },
  { day: 'Sat', status: 'train', label: 'Lower + Conditioning' },
  { day: 'Sun', status: 'blocked', label: 'Family / Recovery' },
] as const;

export function OpalProfileExplorer() {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-4 md:px-8 md:py-6">
        <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white ring-0">
          <CardContent className="p-4 sm:p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">My Profile · Fitness Identity</p>
                <h1 className="mt-2 break-words text-xl font-bold sm:text-2xl md:text-3xl">{profile.userName}&apos;s Training Profile</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
                  A live snapshot of goals, constraints, and coaching preferences so every workout stays aligned to real life.
                </p>
              </div>
              <Badge className="whitespace-nowrap border-blue-300 bg-blue-500/20 text-blue-100">
                {profile.profileVersion}
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
              <Kpi icon={<Target className="h-4 w-4" />} label="Goals Set" value={`${profile.primaryGoals.length}`} />
              <Kpi icon={<Dumbbell className="h-4 w-4" />} label="Experience" value={profile.experienceLevel} />
              <Kpi icon={<Clock3 className="h-4 w-4" />} label="Weekly Target" value={`${profile.weeklyTarget.sessions} sessions`} />
              <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Profile Complete" value={`${profile.profileCompleteness}%`} />
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Goal Stack & Training Direction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                {profile.primaryGoals.map((goal) => (
                  <div key={goal.label} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">{goal.label}</p>
                      <Badge className={goal.priority === 'Primary' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}>{goal.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <SignalCard icon={<Timer className="h-4 w-4 text-blue-600" />} label="Weekly Minutes" value={`${profile.weeklyTarget.minutes} min`} />
                <SignalCard icon={<FlameIcon />} label="Current Streak" value={`${profile.weeklyTarget.streakDays} days`} />
                <SignalCard icon={<Shield className="h-4 w-4 text-emerald-600" />} label="Training Age" value={profile.trainingAge} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Profile Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <OverviewRow icon={<CheckCircle2 className="h-4 w-4" />} label="Completeness" value={`${profile.profileCompleteness}%`} />
              <OverviewRow icon={<Activity className="h-4 w-4" />} label="Consistency (4 weeks)" value={`${profile.progressSignals.consistency4Weeks}%`} />
              <OverviewRow icon={<TrendingUp className="h-4 w-4" />} label="Strength Trend" value="Positive" />
              <OverviewRow icon={<HeartPulse className="h-4 w-4" />} label="Recovery Status" value="Stable" />

              <div className="pt-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Profile confidence</p>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${profile.profileCompleteness}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Based on recent check-ins, workout logs, and constraints updates.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Preferences & Equipment Reality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coaching preferences</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferences.map((preference) => (
                    <span key={preference} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 sm:text-sm">
                      {preference}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equipment access</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {profile.equipmentAccess.map((item) => (
                    <InfoChip key={item} icon={<Dumbbell className="h-3.5 w-3.5" />} text={item} />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Time windows</p>
                <p className="mt-1 text-sm text-slate-700">{profile.schedule.sessionWindow}</p>
                <p className="mt-1 text-sm text-slate-700">Session duration target: {profile.schedule.maxSessionLength}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weekly Availability Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {weekGrid.map((entry) => (
                    <div
                      key={entry.day}
                      className={`rounded-lg border p-2.5 ${
                        entry.status === 'train'
                          ? 'border-emerald-200 bg-emerald-50'
                          : entry.status === 'blocked'
                            ? 'border-rose-200 bg-rose-50'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{entry.day}</p>
                        <p className="text-right text-xs text-slate-500">{entry.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Constraints Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.constraints.active.map((constraint) => (
                  <div key={constraint.label} className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                    <p className="text-sm font-semibold text-amber-900">{constraint.label}</p>
                    <p className="mt-1 text-xs text-amber-800">{constraint.detail}</p>
                    <p className="mt-1 text-xs text-amber-700">{constraint.since}</p>
                  </div>
                ))}
                {profile.constraints.resolved.map((constraint) => (
                  <div key={constraint.label} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                    <p className="text-sm text-emerald-900">{constraint.label}</p>
                    <p className="text-xs text-emerald-700">{constraint.resolvedOn}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-4 w-4 text-amber-600" />
              Progress Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            <GamificationRow icon={<Zap className="h-4 w-4 text-blue-600" />} label="Strength" value={profile.progressSignals.strengthTrend} />
            <GamificationRow icon={<Calendar className="h-4 w-4 text-violet-600" />} label="Cardio" value={profile.progressSignals.cardioTrend} />
            <GamificationRow icon={<Sparkles className="h-4 w-4 text-emerald-600" />} label="Recovery" value={profile.progressSignals.recoveryTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-2.5 sm:p-3">
      <div className="flex items-center gap-1.5 text-slate-300">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-1 break-words text-base font-semibold text-white sm:text-lg">{value}</p>
    </div>
  );
}

function SignalCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <p className="text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
      <span className="shrink-0 text-slate-500">{icon}</span>
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  );
}

function OverviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-500">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function GamificationRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <p className="text-sm font-semibold text-slate-800">{label}</p>
      </div>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function FlameIcon() {
  return <span className="text-sm">🔥</span>;
}
