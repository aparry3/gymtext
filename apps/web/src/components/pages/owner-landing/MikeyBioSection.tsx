import Image from 'next/image';
import type { ProgramOwner } from '@gymtext/shared/server';

interface MikeyBioSectionProps {
  owner: ProgramOwner;
}

export function MikeyBioSection({ owner }: MikeyBioSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <div className="lg:w-1/3 relative w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#002D72]/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 aspect-[4/5]">
              <Image
                src="/coaches/coach-swiercz/Hopkins-Cp.JPG"
                alt={owner.displayName}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-8">
                <p className="text-white font-display text-lg md:text-2xl">
                  &quot;From a small town to a national stage.&quot;
                </p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">&mdash; Mikey Swiercz</p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h2 className="text-[#002D72] font-bold tracking-wider uppercase mb-2 text-sm">
              The Complete Player
            </h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
              All-American &amp; National Champion <br />
              <span className="text-[#002D72]">Mikey Swiercz</span>
            </h3>

            <div className="prose prose-base md:prose-lg text-gray-600 space-y-4 md:space-y-6">
              <p>
                In his nearly two decades playing the game, Mikey Swiercz excelled at every level. A{' '}
                <strong>four-year varsity starter</strong>, three-year captain, and Subway All-Area
                Allstar in high school, he continued his journey at the prestigious{' '}
                <strong>Johns Hopkins University</strong>. There, he repeated as a two-year captain,
                garnered <strong>All-American</strong> and <strong>Scholar All-American</strong>{' '}
                accolades, and was named to their <strong>All-Decade team</strong>.
              </p>
              <p>
                He also played three seasons in the U.S. Soccer pyramid for USL2 teams, including
                the cult classic <strong>Christos FC</strong>, where he won the historic{' '}
                <strong>U.S. National Amateur Open Cup</strong>.
              </p>
              <p>
                Hailing from a baseball-centric small town to eventually becoming a soccer national
                champion, Mikey&apos;s story speaks for itself. Now, for the first time, the drills
                and philosophies that built his decorated career are available to you.
              </p>
            </div>

            <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-[#002D72]">
                <p className="text-xs md:text-sm font-bold text-gray-800">Johns Hopkins</p>
                <p className="text-[10px] md:text-xs text-gray-500">All-American &amp; Captain</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-[#002D72]">
                <p className="text-xs md:text-sm font-bold text-gray-800">All-Decade Team</p>
                <p className="text-[10px] md:text-xs text-gray-500">Hopkins Soccer</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-[#cfae70]">
                <p className="text-xs md:text-sm font-bold text-gray-800">National Champion</p>
                <p className="text-[10px] md:text-xs text-gray-500">U.S. Open Cup &bull; Christos FC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
