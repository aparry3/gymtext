'use client';

import {
  Activity,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PlanType = 'fixed' | 'open';

type PlanData = {
  type: PlanType;
  name: string;
  coach: string;
  goal: string;
  currentWeek: number;
  currentDay: number;
  durationWeeks?: number;
  schedule: string[];
  completionRate: number;
  adherenceRate: number;
  workoutsCompleted: number;
  totalWorkouts?: number;
  streak: {
    consecutiveCompleted: number;
    longest: number;
    weeklyGoal: number;
    thisWeekCompleted: number;
  };
  nextWorkout: {
    name: string;
    day: string;
    focus: string;
    estimatedTime: string;
  };
};

const fixedLengthPlan: PlanData = {
  type: 'fixed',
  name: 'Hybrid Strength & Conditioning',
  coach: 'Coach Aaron',
  goal: 'Build strength while improving conditioning and work capacity',
  durationWeeks: 12,
  currentWeek: 3,
  currentDay: 2,
  schedule: ['Mon · Lower Strength', 'Tue · Zone 2 Conditioning', 'Thu · Upper Strength', 'Sat · Intervals + Core'],
  completionRate: 81,
  adherenceRate: 87,
  workoutsCompleted: 10,
  totalWorkouts: 48,
  streak: {
    consecutiveCompleted: 4,
    longest: 9,
    weeklyGoal: 4,
    thisWeekCompleted: 2,
  },
  nextWorkout: {
    name: 'Upper Strength B',
    day: 'Today · 6:00 PM',
    focus: 'Bench volume + horizontal pull + shoulder accessories',
    estimatedTime: '65 min',
  },
};

const openEndedPlan: PlanData = {
  type: 'open',
  name: 'Ongoing Strength Training',
  coach: 'Coach Aaron',
  goal: 'Stay consistent, add load over time, and keep training around life schedule',
  currentWeek: 18,
  currentDay: 3,
  schedule: ['Mon · Lower Strength', 'Wed · Upper Push/Pull', 'Fri · Full Body + Carries', 'Sun · Optional Conditioning'],
  completionRate: 84,
  adherenceRate: 90,
  workoutsCompleted: 44,
  streak: {
    consecutiveCompleted: 6,
    longest: 11,
    weeklyGoal: 3,
    thisWeekCompleted: 2,
  },
  nextWorkout: {
    name: 'Full Body + Carries',
    day: 'Tomorrow · 7:30 AM',
    focus: 'Hinge + squat pairing, upper accessory superset, loaded carry finisher',
    estimatedTime: '55 min',
  },
};

const useOpenEndedPreview = true;
const activePlan = useOpenEndedPreview ? openEndedPlan : fixedLengthPlan;

const recentWorkouts = [
  { date: 'Wed, Feb 25', name: 'Zone 2 Ride', status: 'Completed', detail: '42 min · Avg HR 138' },
  { date: 'Mon, Feb 23', name: 'Lower Strength A', status: 'Completed', detail: '5/5 lifts logged · +5 lb squat' },
  { date: 'Sat, Feb 21', name: 'Intervals + Core', status: 'Completed', detail: '8 rounds · RPE 8.5' },
  { date: 'Thu, Feb 19', name: 'Upper Strength A', status: 'Completed', detail: 'All sets completed' },
  { date: 'Tue, Feb 17', name: 'Zone 2 Run', status: 'Missed', detail: 'Rescheduled due to travel' },
];

const weekCalendar = [
  { day: 'Mon', label: 'Lower A', done: true },
  { day: 'Tue', label: 'Zone 2', done: true },
  { day: 'Wed', label: 'Recovery', done: true },
  { day: 'Thu', label: 'Upper B', done: false, today: true },
  { day: 'Fri', label: 'Mobility', done: false },
  { day: 'Sat', label: 'Intervals', done: false },
  { day: 'Sun', label: 'Rest', done: false },
];

export function OpalPlanExplorer() {
  const hasDefinedLength = typeof activePlan.durationWeeks === 'number';
  const progress = hasDefinedLength
    ? Math.round((activePlan.currentWeek / (activePlan.durationWeeks || 1)) * 100)
    : null;

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-4 md:px-8 md:py-6">
        <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white ring-0">
          <CardContent className="p-4 sm:p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">My Plan · Active Program</p>
                <h1 className="mt-2 break-words text-xl font-bold sm:text-2xl md:text-3xl">{activePlan.name}</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">{activePlan.goal}</p>
              </div>
              {hasDefinedLength ? (
                <Badge className="whitespace-nowrap border-blue-300 bg-blue-500/20 text-blue-100">
                  Week {activePlan.currentWeek} of {activePlan.durationWeeks}
                </Badge>
              ) : (
                <Badge className="whitespace-nowrap border-blue-300 bg-blue-500/20 text-blue-100">
                  Ongoing Program · Week {activePlan.currentWeek}
                </Badge>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
              {hasDefinedLength && progress !== null ? (
                <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Plan Progress" value={`${progress}%`} />
              ) : (
                <Kpi icon={<Flame className="h-4 w-4" />} label="Current Streak" value={`${activePlan.streak.consecutiveCompleted} days`} />
              )}
              <Kpi
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Completed"
                value={activePlan.totalWorkouts ? `${activePlan.workoutsCompleted}/${activePlan.totalWorkouts}` : `${activePlan.workoutsCompleted} total`}
              />
              <Kpi icon={<Flame className="h-4 w-4" />} label="Adherence" value={`${activePlan.adherenceRate}%`} />
              <Kpi icon={<Activity className="h-4 w-4" />} label="Completion" value={`${activePlan.completionRate}%`} />
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current / Next Workout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Up next</p>
                    <h3 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">{activePlan.nextWorkout.name}</h3>
                  </div>
                  <Badge className="max-w-full border-blue-200 bg-white text-blue-700">
                    Day {activePlan.currentDay} · Week {activePlan.currentWeek}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-700">{activePlan.nextWorkout.focus}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 md:text-sm">
                  <InfoChip icon={<CalendarDays className="h-3.5 w-3.5" />} text={activePlan.nextWorkout.day} />
                  <InfoChip icon={<Clock3 className="h-3.5 w-3.5" />} text={activePlan.nextWorkout.estimatedTime} />
                  <InfoChip icon={<Dumbbell className="h-3.5 w-3.5" />} text="Auto-adjusted from last session" />
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button className="w-full sm:flex-1">Start Workout</Button>
                  <Button variant="outline" className="w-full sm:flex-1">View Full Session</Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly cadence</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {activePlan.schedule.map((item) => (
                    <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Plan Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <OverviewRow icon={<Target className="h-4 w-4" />} label="Primary Goal" value="Strength + conditioning" />
              <OverviewRow icon={<Calendar className="h-4 w-4" />} label="Program Length" value={hasDefinedLength ? `${activePlan.durationWeeks} weeks` : 'Open-ended'} />
              <OverviewRow icon={<Dumbbell className="h-4 w-4" />} label="Training Split" value="4 sessions / week" />
              <OverviewRow icon={<Activity className="h-4 w-4" />} label="Coach" value={activePlan.coach} />

              {hasDefinedLength && progress !== null ? (
                <div className="pt-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Phase Progress</p>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Foundation block · Week {activePlan.currentWeek} / {activePlan.durationWeeks}</p>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Flexible progression</p>
                  <p className="mt-1 text-xs text-amber-800">This plan adapts continuously based on training logs and recovery—no fixed end date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentWorkouts.map((workout) => (
                  <div key={`${workout.date}-${workout.name}`} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-900">{workout.name}</p>
                      <p className="text-xs text-slate-500">{workout.date}</p>
                      <p className="mt-1 break-words text-sm text-slate-600">{workout.detail}</p>
                    </div>
                    <Badge className={`w-fit ${workout.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {workout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">This Week Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {weekCalendar.map((entry) => (
                    <div
                      key={entry.day}
                      className={`rounded-lg border p-2.5 ${
                        entry.today
                          ? 'border-blue-300 bg-blue-50'
                          : entry.done
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{entry.day}</p>
                        <p className="text-right text-xs text-slate-500">{entry.label}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {entry.today ? 'Today' : entry.done ? 'Completed' : 'Upcoming'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  Momentum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <GamificationRow
                  icon={<Flame className="h-4 w-4 text-orange-500" />}
                  label="Consecutive completed workouts"
                  value={`${activePlan.streak.consecutiveCompleted} in a row`}
                />
                <GamificationRow
                  icon={<Target className="h-4 w-4 text-blue-600" />}
                  label="This week goal"
                  value={`${activePlan.streak.thisWeekCompleted}/${activePlan.streak.weeklyGoal} sessions`}
                />
                <GamificationRow
                  icon={<Sparkles className="h-4 w-4 text-violet-500" />}
                  label="Best streak"
                  value={`${activePlan.streak.longest} workouts`}
                />
                <p className="text-xs text-slate-500">Keep the streak alive: complete your next session within 24 hours to earn a consistency badge.</p>
              </CardContent>
            </Card>
          </div>
        </section>
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

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 py-1.5">
      <span className="shrink-0 text-slate-500">{icon}</span>
      <span className="truncate">{text}</span>
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <p className="truncate text-sm text-slate-600">{label}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
