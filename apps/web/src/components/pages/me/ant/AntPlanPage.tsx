'use client';

import { useState, useMemo } from 'react';
import { Search, Clock, Calendar, Users, Star, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_PLANS,
  PLAN_CATEGORIES,
  type Plan,
  type PlanTag,
  type WeekSnapshot,
} from './planMockData';

// ─── Tag colors ──────────────────────────────────────────────────────
const TAG_BG: Record<PlanTag['color'], string> = {
  blue: 'bg-blue-500/15 text-blue-300',
  green: 'bg-emerald-500/15 text-emerald-300',
  orange: 'bg-orange-500/15 text-orange-300',
  purple: 'bg-purple-500/15 text-purple-300',
  red: 'bg-red-500/15 text-red-300',
  teal: 'bg-teal-500/15 text-teal-300',
};

const DAY_TYPE_COLOR: Record<WeekSnapshot['type'], string> = {
  strength: 'bg-blue-400',
  cardio: 'bg-emerald-400',
  mobility: 'bg-teal-400',
  hiit: 'bg-red-400',
  rest: 'bg-white/10',
};

// ─── Sub-components ──────────────────────────────────────────────────

function WeekBar({ days }: { days: WeekSnapshot[] }) {
  return (
    <div className="flex gap-1 items-end">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={cn(
              'w-full rounded-sm transition-all',
              DAY_TYPE_COLOR[d.type],
              d.type === 'rest' ? 'h-1.5' : 'h-5'
            )}
            title={d.label ? `${d.day}: ${d.label}` : d.day}
          />
          <span className="text-[10px] text-white/40 leading-none">{d.day[0]}</span>
        </div>
      ))}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs text-white/70 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function LevelBadge({ level }: { level: Plan['level'] }) {
  const colors: Record<Plan['level'], string> = {
    Beginner: 'bg-emerald-500/20 text-emerald-300',
    Intermediate: 'bg-amber-500/20 text-amber-300',
    Advanced: 'bg-red-500/20 text-red-300',
    'All Levels': 'bg-white/10 text-white/70',
  };
  return (
    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full', colors[level])}>
      {level}
    </span>
  );
}

// ─── Featured Card (hero-style for featured plans) ───────────────────

function FeaturedPlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${plan.coverGradient[0]}, ${plan.coverGradient[1]})`,
      }}
    >
      {/* Featured badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full px-2.5 py-1">
        <Sparkles className="h-3 w-3 text-amber-300" />
        <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Featured</span>
      </div>

      <div className="p-6 pt-12">
        {/* Emoji + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">{plan.coverEmoji}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white leading-tight">{plan.title}</h3>
            <p className="text-sm text-white/60 mt-0.5">{plan.subtitle}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors mt-1" />
        </div>

        {/* Description */}
        <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
          {plan.description}
        </p>

        {/* Week bar */}
        <div className="mb-4">
          <WeekBar days={plan.weekSnapshot} />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-white/50">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">{plan.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">{plan.frequency}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">{plan.enrolledCount.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={plan.rating} />
            <LevelBadge level={plan.level} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compact Plan Card ───────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl overflow-hidden cursor-pointer transition-all">
      {/* Gradient header strip */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${plan.coverGradient[0]}, ${plan.coverGradient[1]})`,
        }}
      />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-3 mb-2">
          <span className="text-2xl leading-none">{plan.coverEmoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{plan.title}</h4>
            <p className="text-xs text-white/40 truncate">{plan.subtitle}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {plan.tags.slice(0, 3).map((t) => (
            <span key={t.label} className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', TAG_BG[t.color])}>
              {t.label}
            </span>
          ))}
        </div>

        {/* Week bar */}
        <div className="mb-3">
          <WeekBar days={plan.weekSnapshot} />
        </div>

        {/* Highlights */}
        <ul className="space-y-1 mb-3">
          {plan.highlights.slice(0, 2).map((h, i) => (
            <li key={i} className="text-[11px] text-white/40 flex items-start gap-1.5">
              <span className="text-white/20 mt-px">›</span>
              {h}
            </li>
          ))}
        </ul>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/40">
            <span className="text-[11px]">{plan.duration}</span>
            <span className="text-white/15">·</span>
            <span className="text-[11px]">{plan.frequency}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={plan.rating} />
            <LevelBadge level={plan.level} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────

export function AntPlanPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = useMemo(() => {
    return MOCK_PLANS.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredPlans = filteredPlans.filter((p) => p.featured);
  const regularPlans = filteredPlans.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-white/40 mt-1">
            Browse programs designed for every goal and level
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {PLAN_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured section */}
        {featuredPlans.length > 0 && (
          <div className="space-y-3 mb-6">
            {featuredPlans.map((plan) => (
              <FeaturedPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {/* Regular plans grid */}
        {regularPlans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regularPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredPlans.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-white/40 text-sm">No plans match your search</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-2 text-xs text-white/50 underline underline-offset-2 hover:text-white/70"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
