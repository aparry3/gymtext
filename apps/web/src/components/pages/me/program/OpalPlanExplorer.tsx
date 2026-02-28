'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Dumbbell, Gauge, HeartPulse, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type PlanCategory = 'All' | 'Strength' | 'Endurance' | 'Conditioning' | 'Hybrid';

interface MockPlan {
  id: string;
  name: string;
  category: Exclude<PlanCategory, 'All'>;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  frequency: string;
  equipment: string;
  vibe: string;
  summary: string;
  highlights: string[];
}

const PLAN_CATEGORIES: PlanCategory[] = ['All', 'Strength', 'Endurance', 'Conditioning', 'Hybrid'];

const MOCK_PLANS: MockPlan[] = [
  {
    id: 'starter-strength',
    name: 'Starter Strength Blueprint',
    category: 'Strength',
    level: 'Beginner',
    duration: '8 weeks',
    frequency: '3 days / week',
    equipment: 'Barbell + dumbbells',
    vibe: 'Learn form. Build confidence. Add consistent weight.',
    summary: 'Perfect first lifting cycle with simple progressions and clear rest guidance.',
    highlights: ['Full-body split', 'Technique checkpoints', 'Weekly progression targets'],
  },
  {
    id: 'marathon-basecamp',
    name: 'Marathon Basecamp',
    category: 'Endurance',
    level: 'Intermediate',
    duration: '16 weeks',
    frequency: '5 runs / week',
    equipment: 'Road shoes + watch',
    vibe: 'Sustainable mileage with recovery-first pacing.',
    summary: 'Structured build from aerobic base to race-ready long runs.',
    highlights: ['Long-run ladder', 'Tempo progression', 'Deload weeks built in'],
  },
  {
    id: 'hiit-ignite',
    name: 'HIIT Ignite',
    category: 'Conditioning',
    level: 'Intermediate',
    duration: '6 weeks',
    frequency: '4 sessions / week',
    equipment: 'Bodyweight + optional bike',
    vibe: 'Fast sessions, high output, measurable conditioning gains.',
    summary: 'Short explosive sessions designed for busy schedules and fat-loss support.',
    highlights: ['20-30 min sessions', 'Heart-rate zones', 'Low-equipment options'],
  },
  {
    id: 'hybrid-athlete',
    name: 'Hybrid Athlete Build',
    category: 'Hybrid',
    level: 'Advanced',
    duration: '12 weeks',
    frequency: '6 days / week',
    equipment: 'Gym + run access',
    vibe: 'Lift heavy while pushing aerobic performance.',
    summary: 'Combines lifting blocks with run conditioning and strict fatigue management.',
    highlights: ['Upper/lower strength', 'Threshold intervals', 'Recovery readiness score'],
  },
  {
    id: 'strong-core-reset',
    name: 'Core & Mobility Reset',
    category: 'Strength',
    level: 'Beginner',
    duration: '4 weeks',
    frequency: '4 sessions / week',
    equipment: 'Bands + mat',
    vibe: 'Move better, brace better, recover better.',
    summary: 'Great transition plan for getting back into training after time off.',
    highlights: ['Spine-friendly core work', 'Daily mobility flows', 'Posture + movement drills'],
  },
  {
    id: 'trail-10k',
    name: 'Trail 10K Builder',
    category: 'Endurance',
    level: 'Beginner',
    duration: '10 weeks',
    frequency: '4 runs / week',
    equipment: 'Trail shoes',
    vibe: 'Build engine and confidence for hilly terrain.',
    summary: 'A beginner-friendly route to your first trail race with terrain-specific prep.',
    highlights: ['Hill repeats', 'Downhill skill work', 'Optional cross-training day'],
  },
];

const levelStyles: Record<MockPlan['level'], string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
  Advanced: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function OpalPlanExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>('All');

  const plans = useMemo(
    () =>
      selectedCategory === 'All'
        ? MOCK_PLANS
        : MOCK_PLANS.filter((plan) => plan.category === selectedCategory),
    [selectedCategory]
  );

  const featuredPlan = plans[0] ?? MOCK_PLANS[0];

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 md:px-8">
        <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white ring-0">
          <CardContent className="p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Program Lab · Opal</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Choose your next training plan</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
              Browse plans by style, time commitment, and difficulty. This page is intentionally designed with mock
              plan data so we can shape the ideal planning UX first.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {PLAN_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors md:text-sm ${
                    selectedCategory === category
                      ? 'border-blue-400 bg-blue-500/25 text-blue-100'
                      : 'border-slate-600 bg-slate-800/70 text-slate-200 hover:bg-slate-700/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-blue-50/70 ring-0">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Featured in {selectedCategory}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{featuredPlan.name}</h2>
              <p className="mt-1 text-sm text-slate-700">{featuredPlan.vibe}</p>
            </div>
            <Button className="w-full md:w-auto">
              Preview featured plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="ring-1 ring-black/[0.04]">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{plan.category}</p>
                    <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                  </div>
                  <Badge className={`border ${levelStyles[plan.level]}`}>{plan.level}</Badge>
                </div>

                <p className="text-sm text-slate-600">{plan.summary}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 md:text-sm">
                  <StatChip icon={<CalendarDays className="h-3.5 w-3.5" />} label={plan.duration} />
                  <StatChip icon={<Timer className="h-3.5 w-3.5" />} label={plan.frequency} />
                  <StatChip icon={<Dumbbell className="h-3.5 w-3.5" />} label={plan.equipment} />
                  <StatChip icon={<Gauge className="h-3.5 w-3.5" />} label={plan.vibe} />
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan highlights</p>
                  <ul className="mt-2 space-y-1">
                    {plan.highlights.map((highlight) => (
                      <li key={highlight} className="text-sm text-slate-700">• {highlight}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Select Plan</Button>
                  <Button variant="outline" className="flex-1">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <HeartPulse className="h-5 w-5 text-rose-500" />
              <h4 className="text-lg font-semibold">How to choose the right plan</h4>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-3">
              <p><span className="font-semibold text-slate-900">Time:</span> Pick a schedule you can repeat for 4+ weeks.</p>
              <p><span className="font-semibold text-slate-900">Goal:</span> Prioritize one primary adaptation (strength, speed, endurance).</p>
              <p><span className="font-semibold text-slate-900">Recovery:</span> Match plan intensity to sleep, stress, and lifestyle.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2">
      <span className="text-slate-500">{icon}</span>
      <span className="line-clamp-1">{label}</span>
    </div>
  );
}
