import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface NextLevelHeroProps {
  startUrl?: string;
}

export function NextLevelHero({ startUrl = '/start' }: NextLevelHeroProps) {
  return (
    <div className="relative min-h-[100vh] md:min-h-[90vh] flex items-center justify-center bg-black overflow-hidden pb-24 md:pb-28">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1920&q=80"
          alt="Basketball Training"
          fill
          className="object-cover opacity-40"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#ea580c]/80 via-black/70 to-black/80"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center pt-16 lg:pt-0">
        <div className="hidden lg:inline-block mb-4 px-4 py-1 border border-white/20 rounded-full bg-white/10 backdrop-blur-md">
          <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">
            GymText Presents
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-display font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
          TAKE YOUR GAME <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] to-yellow-300">
            TO THE NEXT LEVEL
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 md:mb-10 font-light px-2">
          Coach Rhynia Henry has been developing elite basketball skills since 2011.
          <br className="hidden md:block" /> Now his championship-caliber training is in your pocket.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={startUrl}
            className="group bg-nlb-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-500 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center gap-2"
          >
            Get The Workouts
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-gray-400 text-sm mt-2 sm:mt-0">
            Texted directly to your phone via GymText
          </span>
        </div>
      </div>
    </div>
  );
}
