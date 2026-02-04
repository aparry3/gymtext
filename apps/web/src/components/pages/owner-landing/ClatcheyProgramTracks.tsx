import { Activity, Crosshair, Shield, ClipboardList, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';

interface ProgramTrack {
  title: string;
  role: string;
  description: string;
  features: string[];
  icon: ReactNode;
  recommendedFor: string;
}

const PROGRAM_TRACKS: ProgramTrack[] = [
  {
    title: 'The Floor General',
    role: 'Guards',
    description:
      'Master the perimeter. Develop elite handles, court vision, and shot-making ability off the dribble.',
    features: ['Ball Handling Mastery', 'Pick & Roll Reads', 'Perimeter Shooting'],
    icon: <Activity className="w-8 h-8 text-white" />,
    recommendedFor: 'PG / SG',
  },
  {
    title: 'The Complete Scorer',
    role: 'Forwards',
    description:
      'Become a three-level threat. Learn to score inside, mid-range, and from deep while locking down defense.',
    features: ['Creating Space', 'Transition Offense', 'Lockdown Defense'],
    icon: <Crosshair className="w-8 h-8 text-white" />,
    recommendedFor: 'SF / PF',
  },
  {
    title: 'The Paint Beast',
    role: 'Centers',
    description:
      'Dominate the interior. Refine your footwork, finishing touch, and rim protection skills.',
    features: ['Post Footwork', 'Rebounding Technique', 'Rim Protection'],
    icon: <Shield className="w-8 h-8 text-white" />,
    recommendedFor: 'C',
  },
  {
    title: 'The Master Class',
    role: 'Coaches',
    description:
      'Build a championship culture. Get inside access to practice plans, philosophy, and game management.',
    features: ['Practice Planning', 'Program Culture', 'In-Game Strategy'],
    icon: <ClipboardList className="w-8 h-8 text-white" />,
    recommendedFor: 'Head & Asst Coaches',
  },
];

export function ClatcheyProgramTracks() {
  return (
    <section className="py-16 md:py-24 bg-white" id="programs">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-msj-purple font-bold tracking-wider uppercase mb-2 text-sm">
            Curated Curriculums
          </h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">Choose Your Path</h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Coach Clatchey has designed specific training regimens for every position on the floor,
            plus a special masterclass for coaches looking to build their own dynasty.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {PROGRAM_TRACKS.map((track, index) => (
            <div
              key={index}
              className="flex flex-col h-full bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-8 hover:shadow-xl hover:border-msj-purple/30 transition-all duration-300 group"
            >
              <div className="mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-msj-purple rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-8 md:[&>svg]:h-8">
                  {track.icon}
                </div>
                <div className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-msj-purple/10 text-msj-purple text-[10px] md:text-xs font-bold rounded-full mb-2">
                  {track.recommendedFor}
                </div>
                <h4 className="text-lg md:text-2xl font-display font-bold text-gray-900 leading-none mb-1">{track.role}</h4>
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {track.title}
                </p>
              </div>

              <p className="text-gray-600 mb-4 md:mb-6 flex-grow text-xs md:text-base line-clamp-3 md:line-clamp-none">{track.description}</p>

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-8 hidden md:block">
                {track.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/start"
                className="w-full py-2 md:py-3 px-3 md:px-4 rounded-lg border-2 border-gray-900 text-gray-900 font-bold hover:bg-msj-purple hover:border-msj-purple hover:text-white transition-colors text-center text-xs md:text-base"
              >
                Select
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
