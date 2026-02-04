import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';

interface Player {
  name: string;
  achievement: string;
  subtext: string;
  imageUrl: string;
  isNba?: boolean;
}

const PLAYERS: Player[] = [
  {
    name: 'Jalen Smith',
    achievement: 'Phoenix Suns (Top 10 Pick)',
    subtext: 'Class of 2018',
    imageUrl: 'https://i.ytimg.com/vi/yhxv8b4a9vM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC4wCoZFzq9hedDRav3l7A6w2jbgw',
    isNba: true,
  },
  {
    name: 'Jaylen Adams',
    achievement: 'NBA & International Pro',
    subtext: 'Class of 2014',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8woCNeAwFBnJ11P65OUAF1o6ZmSD6G_2MLA&s',
    isNba: true,
  },
  {
    name: 'Henry Sims',
    achievement: 'NBA Veteran',
    subtext: 'Class of 2008',
    imageUrl: 'https://s3media.247sports.com/Uploads/Assets/36/558/3558036.jpg',
    isNba: true,
  },
  {
    name: 'Phil Booth',
    achievement: '2x NCAA Champion (Villanova)',
    subtext: 'Pro Basketball Player',
    imageUrl: 'https://s.yimg.com/ny/api/res/1.2/3yZzkJx5metJVErWz9U8.w--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD03OTk7Y2Y9d2VicA--/https://media.zenfs.com/en/homerun/feed_manager_auto_publish_494/07108e7df5714ee6145455eeea1ad394',
    isNba: false,
  },
];

export function ClatcheyPlayerShowcase() {
  return (
    <section className="py-16 md:py-24 bg-gray-900 relative">
      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-msj-purple font-bold tracking-wider uppercase mb-2 text-sm">
            The Proof Is In The Pros
          </h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            From Mt. St. Joe to the League
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Coach Clatchey doesn&apos;t just teach plays; he builds careers. These athletes started with
            the fundamentals you&apos;ll learn in GymText.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {PLAYERS.map((player, index) => (
            <div
              key={index}
              className="group relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-msj-purple transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <Image
                  src={player.imageUrl}
                  alt={player.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                {player.isNba && (
                  <div className="inline-flex items-center gap-1 bg-msj-purple/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded mb-1 md:mb-2">
                    <BadgeCheck className="w-2.5 h-2.5 md:w-3 md:h-3" /> NBA
                  </div>
                )}
                <h4 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-1">{player.name}</h4>
                <p className="text-msj-purple font-medium text-xs md:text-sm line-clamp-1">{player.achievement}</p>
                <p className="text-gray-500 text-[10px] md:text-xs mt-0.5 md:mt-1">{player.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
