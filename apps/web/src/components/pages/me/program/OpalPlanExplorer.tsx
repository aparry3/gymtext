'use client';

import {
  Activity,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activePlan = {
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
  nextWorkout: {
    name: 'Upper Strength B',
    day: 'Today · 6:00 PM',
    focus: 'Bench volume + horizontal pull + shoulder accessories',
    estimatedTime: '65 min',
  },
};

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
  const progress = Math.round((activePlan.currentWeek / activePlan.durationWeeks) * 100);

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 md:px-8">
        <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white ring-0">
          <CardContent className="p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">My Plan · Active Program</p>
                <h1 className="mt-2 text-2xl font-bold md:text-3xl">{activePlan.name}</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">{activePlan.goal}</p>
              </div>
              <Badge className="border-blue-300 bg-blue-500/20 text-blue-100">Week {activePlan.currentWeek} of {activePlan.durationWeeks}</Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Plan Progress" value={`${progress}%`} />
              <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={`${activePlan.workoutsCompleted}/${activePlan.totalWorkouts}`} />
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
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Up next</p>
                    <h3 className="text-xl font-semibold text-slate-900">{activePlan.nextWorkout.name}</h3>
                  </div>
                  <Badge className="border-blue-200 bg-white text-blue-700">Day {activePlan.currentDay} · Week {activePlan.currentWeek}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-700">{activePlan.nextWorkout.focus}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 md:text-sm">
                  <InfoChip icon={<CalendarDays className="h-3.5 w-3.5" />} text={activePlan.nextWorkout.day} />
                  <InfoChip icon={<Clock3 className="h-3.5 w-3.5" />} text={activePlan.nextWorkout.estimatedTime} />
                  <InfoChip icon={<Dumbbell className="h-3.5 w-3.5" />} text="Auto-adjusted from last session" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1">Start Workout</Button>
                  <Button variant="outline" className="flex-1">View Full Session</Button>
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
              <OverviewRow icon={<Calendar className="h-4 w-4" />} label="Program Length" value="12 weeks" />
              <OverviewRow icon={<Dumbbell className="h-4 w-4" />} label="Training Split" value="4 sessions / week" />
              <OverviewRow icon={<Activity className="h-4 w-4" />} label="Coach" value={activePlan.coach} />

              <div className="pt-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Phase Progress</p>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Foundation block · Week {activePlan.currentWeek} / {activePlan.durationWeeks}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Workout History (This Plan)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentWorkouts.map((workout) => (
                  <div key={`${workout.date}-${workout.name}`} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{workout.name}</p>
                      <p className="text-xs text-slate-500">{workout.date}</p>
                      <p className="mt-1 text-sm text-slate-600">{workout.detail}</p>
                    </div>
                    <Badge className={workout.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                      {workout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">This Week Calendar</CardTitle>
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{entry.day}</p>
                      <p className="text-xs text-slate-500">{entry.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {entry.today ? 'Today' : entry.done ? 'Completed' : 'Upcoming'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-3">
      <div className="flex items-center gap-1.5 text-slate-300">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 py-1.5">
      <span className="text-slate-500">{icon}</span>
      <span>{text}</span>
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
