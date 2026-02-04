import Image from 'next/image';
import type { ProgramOwner } from '@gymtext/shared/server';

interface ClatcheyBioSectionProps {
  owner: ProgramOwner;
}

export function ClatcheyBioSection({ owner }: ClatcheyBioSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <div className="lg:w-1/3 relative w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-msj-purple/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 aspect-[4/5]">
              <Image
                src={
                  owner.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop'
                }
                alt={owner.displayName}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-8">
                <p className="text-white font-display text-lg md:text-2xl">
                  &quot;Fundamentals first. Victory follows.&quot;
                </p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">&mdash; Coach Pat Clatchey</p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h2 className="text-msj-purple font-bold tracking-wider uppercase mb-2 text-sm">
              The Architect of Champions
            </h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
              Future Basketball Hall of Famer <br />
              <span className="text-msj-purple">Pat Clatchey</span>
            </h3>

            <div className="prose prose-base md:prose-lg text-gray-600 space-y-4 md:space-y-6">
              <p>
                For over three decades, Pat Clatchey hasn&apos;t just coached basketball at Mount
                Saint Joseph High School; he has built a dynasty. Since 1992, he has amassed a
                staggering <strong>850+ wins</strong>, placing him in the elite company of legends
                like Bob Hurley.
              </p>
              <p>
                His court is a classroom where raw talent transforms into elite performance. Coach
                Clatchey has meticulously developed <strong>nearly 70 NCAA Division I athletes</strong>{' '}
                and sent 18 players to professional careers overseas. His unparalleled eye for
                development has launched three players directly into the <strong>NBA</strong>,
                including top-10 draft pick Jalen Smith.
              </p>
              <p>
                From coaching the prestigious <strong>McDonald&apos;s All-American Game</strong> to being
                named Coach of the Decade, Clatchey&apos;s resume speaks for itself. Now, for the first
                time, the drills and philosophies that built this legacy are available to you.
              </p>
            </div>

            <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-msj-purple">
                <p className="text-xs md:text-sm font-bold text-gray-800">30 Years</p>
                <p className="text-[10px] md:text-xs text-gray-500">Head Coach at Mt St. Joe</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-msj-purple">
                <p className="text-xs md:text-sm font-bold text-gray-800">Coach of Decade</p>
                <p className="text-[10px] md:text-xs text-gray-500">MIAA Sports Net</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-msj-gold flex items-center gap-2 md:gap-3">
                <Image
                  src="https://www.dcnewsnow.com/wp-content/uploads/sites/14/2025/01/mcdonalds-all-american-games.png?w=1280"
                  alt="McDonald's All-American Games"
                  width={32}
                  height={32}
                  className="object-contain md:w-10 md:h-10"
                  unoptimized
                />
                <div>
                  <p className="text-xs md:text-sm font-bold text-gray-800">All-American Coach</p>
                  <p className="text-[10px] md:text-xs text-gray-500">McDonald&apos;s Games</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
