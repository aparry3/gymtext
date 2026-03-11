import { Trophy, Star, Users, Medal } from 'lucide-react';
import type { ReactNode } from 'react';

interface Stat {
  value: string;
  label: string;
  icon: ReactNode;
}

const STATS: Stat[] = [
  {
    value: '🏆',
    label: 'National Champion',
    icon: <Trophy className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    value: '⭐',
    label: 'All-American',
    icon: <Star className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    value: '🎓',
    label: 'Scholar All-American',
    icon: <Users className="w-6 h-6 text-[#cfae70]" />,
  },
  {
    value: '🔟',
    label: 'All-Decade Team',
    icon: <Medal className="w-6 h-6 text-[#cfae70]" />,
  },
];

export function MikeyStatsBar() {
  return (
    <div className="bg-[#002D72] relative z-20 -mt-16 md:-mt-20 mx-4 md:mx-8 lg:mx-auto max-w-6xl rounded-2xl shadow-2xl border-t border-white/10 p-6 md:p-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {STATS.map((stat, index) => (
          <div key={index} className="text-center group">
            <div className="flex justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="p-2 md:p-3 bg-white/10 rounded-full text-2xl md:text-3xl">{stat.value}</div>
            </div>
            <div className="text-blue-200 text-xs md:text-base font-medium tracking-wide uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
