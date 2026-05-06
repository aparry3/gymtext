import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';

interface Player {
  name: string;
  achievement: string;
  classYear: string;
  imageUrl: string;
  isNba?: boolean;
}

const PLAYERS: Player[] = [
  {
    name: 'Jalen Smith',
    achievement: 'Phoenix Suns · Top-10 Pick',
    classYear: 'Class of 2018',
    imageUrl:
      'https://i.ytimg.com/vi/yhxv8b4a9vM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC4wCoZFzq9hedDRav3l7A6w2jbgw',
    isNba: true,
  },
  {
    name: 'Jaylen Adams',
    achievement: 'NBA & International Pro',
    classYear: 'Class of 2014',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8woCNeAwFBnJ11P65OUAF1o6ZmSD6G_2MLA&s',
    isNba: true,
  },
  {
    name: 'Henry Sims',
    achievement: 'NBA Veteran',
    classYear: 'Class of 2008',
    imageUrl: 'https://s3media.247sports.com/Uploads/Assets/36/558/3558036.jpg',
    isNba: true,
  },
  {
    name: 'Phil Booth',
    achievement: '2× NCAA Champion · Villanova',
    classYear: 'Pro Basketball',
    imageUrl:
      'https://s.yimg.com/ny/api/res/1.2/3yZzkJx5metJVErWz9U8.w--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD03OTk7Y2Y9d2VicA--/https://media.zenfs.com/en/homerun/feed_manager_auto_publish_494/07108e7df5714ee6145455eeea1ad394',
    isNba: false,
  },
];

export function ClatcheyPlayerShowcase() {
  return (
    <section
      id="proof"
      className="bg-msj-purple-deep text-msj-cream py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">From The Mount</span>
            <span className="block">
              to the <span className="text-msj-purple-tint">League.</span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-msj-cream/65 leading-relaxed max-w-2xl">
            Coach Clatchey doesn&apos;t just teach plays — he builds careers. These are the
            alumni whose careers started at Mt. St. Joe.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {PLAYERS.map((player) => (
            <div
              key={player.name}
              className="group relative rounded-2xl overflow-hidden bg-msj-night border border-msj-cream/10 hover:border-msj-purple-tint/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <Image
                  src={player.imageUrl}
                  alt={player.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-msj-night via-msj-night/80 to-transparent"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                {player.isNba && (
                  <div className="inline-flex items-center gap-1 bg-msj-purple/90 backdrop-blur-sm text-msj-cream text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded mb-1 md:mb-2">
                    <BadgeCheck className="w-3 h-3" /> NBA
                  </div>
                )}
                <h4 className="text-base md:text-xl font-bold text-msj-cream mb-0.5 md:mb-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {player.name}
                </h4>
                <p className="text-msj-purple-tint font-medium text-xs md:text-sm line-clamp-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {player.achievement}
                </p>
                <p className="text-msj-cream/75 text-[10px] md:text-xs mt-0.5 md:mt-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {player.classYear}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
