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
    title: 'The Engine',
    role: 'Fitness',
    description:
      'Build the endurance and athleticism that powered an All-American career. Conditioning, agility, and functional strength.',
    features: ['Match-Day Conditioning', 'Speed & Agility Drills', 'Functional Strength'],
    icon: <Activity className="w-8 h-8 text-white" />,
    recommendedFor: 'All Positions',
  },
  {
    title: 'The Technician',
    role: 'Ball Mastery',
    description:
      'Develop the touch and control that made Mikey a four-year varsity starter. Technical drills for confident play under pressure.',
    features: ['First Touch Refinement', 'Dribbling Under Pressure', 'Passing Accuracy'],
    icon: <Crosshair className="w-8 h-8 text-white" />,
    recommendedFor: 'Midfield / Attack',
  },
  {
    title: 'The Defender',
    role: 'Defensive IQ',
    description:
      'Read the game like an All-Decade defender. Positioning, tackling technique, and leadership from the back.',
    features: ['Positioning & Angles', '1v1 Defending', 'Organizing the Backline'],
    icon: <Shield className="w-8 h-8 text-white" />,
    recommendedFor: 'Defenders / CDM',
  },
  {
    title: 'The Captain',
    role: 'Leadership',
    description:
      'Develop the mentality of a multi-year captain. Mental toughness, communication, and competitive mindset.',
    features: ['Game Preparation', 'Team Communication', 'Competitive Mindset'],
    icon: <ClipboardList className="w-8 h-8 text-white" />,
    recommendedFor: 'All Players',
  },
];

export function MikeyProgramTracks() {
  return (
    <section className="py-16 md:py-24 bg-white" id="programs">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[#002D72] font-bold tracking-wider uppercase mb-2 text-sm">
            Training Programs
          </h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Choose Your Path
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Mikey has designed specific training regimens drawing on his experience as an
            All-American, national champion, and professional player.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {PROGRAM_TRACKS.map((track, index) => (
            <div
              key={index}
              className="flex flex-col h-full bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-8 hover:shadow-xl hover:border-[#002D72]/30 transition-all duration-300 group"
            >
              <div className="mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-[#002D72] rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-8 md:[&>svg]:h-8">
                  {track.icon}
                </div>
                <div className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-[#002D72]/10 text-[#002D72] text-[10px] md:text-xs font-bold rounded-full mb-2">
                  {track.recommendedFor}
                </div>
                <h4 className="text-lg md:text-2xl font-display font-bold text-gray-900 leading-none mb-1">
                  {track.role}
                </h4>
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {track.title}
                </p>
              </div>

              <p className="text-gray-600 mb-4 md:mb-6 flex-grow text-xs md:text-base line-clamp-3 md:line-clamp-none">
                {track.description}
              </p>

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
                className="w-full py-2 md:py-3 px-3 md:px-4 rounded-lg border-2 border-gray-900 text-gray-900 font-bold hover:bg-[#002D72] hover:border-[#002D72] hover:text-white transition-colors text-center text-xs md:text-base"
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
