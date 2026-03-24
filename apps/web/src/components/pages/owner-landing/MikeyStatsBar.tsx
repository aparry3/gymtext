import { Trophy, Star, Users, Medal, Award } from 'lucide-react';
import type { ReactNode } from 'react';

interface Stat {
  accolade: string;
  label: string;
  icon: ReactNode;
}

const STATS: Stat[] = [
  {
    accolade: 'All-American',
    label: 'Hopkins Soccer',
    icon: <Star className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    accolade: 'Scholar All-American',
    label: 'Hopkins Soccer',
    icon: <Users className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    accolade: 'Captain',
    label: 'Hopkins Soccer',
    icon: <Award className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    accolade: 'All-Decade Team',
    label: 'Hopkins Soccer',
    icon: <Medal className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    accolade: 'National Champion',
    label: 'US Open Cup * Christos FC',
    icon: <Trophy className="w-6 h-6 text-[#cfae70]" />,
  },
];

export function MikeyStatsBar() {
  return (
    <div className="bg-[#002D72] relative z-20 -mt-16 md:-mt-20 mx-4 md:mx-8 lg:mx-auto max-w-6xl rounded-2xl shadow-2xl border-t border-white/10 p-6 md:p-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {STATS.map((stat, index) => (
          <div key={index} className="text-center group">
            <div className="text-white text-sm md:text-base font-bold tracking-wide mb-1">
              {stat.accolade}
            </div>
            <div className="text-blue-200 text-[10px] md:text-xs font-medium tracking-wide uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
