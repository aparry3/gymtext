import { Trophy, Star, Users, Medal } from 'lucide-react';
import type { ReactNode } from 'react';

interface Stat {
  value: string;
  label: string;
  icon: ReactNode;
}

const STATS: Stat[] = [
  {
    value: '850+',
    label: 'Career Wins',
    icon: <Trophy className="w-6 h-6 text-yellow-400" />,
  },
  {
    value: '3',
    label: 'NBA Players Developed',
    icon: <Star className="w-6 h-6 text-yellow-400" />,
  },
  {
    value: '70+',
    label: 'NCAA Div I Athletes',
    icon: <Users className="w-6 h-6 text-yellow-400" />,
  },
  {
    value: '30',
    label: 'Championships',
    icon: <Medal className="w-6 h-6 text-yellow-400" />,
  },
];

export function ClatcheyStatsBar() {
  return (
    <div className="bg-msj-purple relative z-20 -mt-16 md:-mt-20 mx-4 md:mx-8 lg:mx-auto max-w-6xl rounded-2xl shadow-2xl border-t border-white/10 p-6 md:p-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {STATS.map((stat, index) => (
          <div key={index} className="text-center group">
            <div className="flex justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
              <div className="p-2 md:p-3 bg-white/10 rounded-full">{stat.icon}</div>
            </div>
            <div className="text-3xl md:text-5xl font-display font-bold text-white mb-1 md:mb-2">{stat.value}</div>
            <div className="text-purple-200 text-xs md:text-base font-medium tracking-wide uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
