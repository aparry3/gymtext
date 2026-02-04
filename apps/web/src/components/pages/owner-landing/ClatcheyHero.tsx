import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function ClatcheyHero() {
  return (
    <div className="relative min-h-[100vh] md:min-h-[90vh] flex items-center justify-center bg-black overflow-hidden pb-24 md:pb-28">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80"
          alt="Basketball Court"
          fill
          className="object-cover opacity-40 grayscale"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-msj-purple/90 via-black/60 to-black/80"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center pt-16 lg:pt-0">
        <div className="hidden lg:inline-block mb-4 px-4 py-1 border border-white/20 rounded-full bg-white/10 backdrop-blur-md">
          <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">
            GymText Presents
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-display font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
          TRAIN WITH A <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            FUTURE HALL OF FAMER
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 md:mb-10 font-light px-2">
          Legendary Coach Pat Clatchey has forged 850+ wins and 3 NBA careers.
          <br className="hidden md:block" /> Now, he&apos;s putting his championship blueprint in your
          pocket.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/start"
            className="group bg-white text-msj-purple px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
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
