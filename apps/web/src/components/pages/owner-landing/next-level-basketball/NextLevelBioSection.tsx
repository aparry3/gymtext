import Image from 'next/image';
import type { ProgramOwner } from '@gymtext/shared/server';

interface NextLevelBioSectionProps {
  owner: ProgramOwner;
}

export function NextLevelBioSection({ owner }: NextLevelBioSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <div className="lg:w-1/3 relative w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-nlb-orange/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 aspect-[4/5]">
              <Image
                src={
                  owner.avatarUrl ||
                  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&h=700&fit=crop'
                }
                alt={owner.displayName}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-8">
                <p className="text-white font-display text-lg md:text-2xl">
                  &quot;Fundamentals build champions. No shortcuts.&quot;
                </p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">&mdash; Coach Rhynia Henry</p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h2 className="text-nlb-orange font-bold tracking-wider uppercase mb-2 text-sm">
              The Skills Developer
            </h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
              Certified Trainer &amp; <br />
              Basketball Expert{' '}
              <span className="text-nlb-orange">Rhynia Henry</span>
            </h3>

            <div className="prose prose-base md:prose-lg text-gray-600 space-y-4 md:space-y-6">
              <p>
                Since 2011, Rhynia Henry has been transforming young athletes into skilled basketball
                players through her signature training methodology. A{' '}
                <strong>Bolton High School and Rhodes College basketball standout</strong>, she
                brings elite playing experience and deep coaching knowledge to every session.
              </p>
              <p>
                As an <strong>AFAA-certified personal trainer</strong> and CPR-certified coach,
                Rhynia founded Next Level Basketball Training and Development with a clear mission:
                deliver fundamental skills training that creates real, measurable improvement. Her
                programs run at both the{' '}
                <strong>Singleton Community Center and the Memphis Jewish Community Center</strong>,
                serving athletes across the Memphis area.
              </p>
              <p>
                Rhynia is also the creator of{' '}
                <strong>The FIRE Workout</strong> — a high-intensity training program that combines
                basketball-specific conditioning with strength and speed development. Her classes are
                in such high demand that sessions regularly fill to capacity.
              </p>
            </div>

            <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-nlb-orange">
                <p className="text-xs md:text-sm font-bold text-gray-800">Since 2011</p>
                <p className="text-[10px] md:text-xs text-gray-500">Coaching &amp; Training</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-nlb-orange">
                <p className="text-xs md:text-sm font-bold text-gray-800">AFAA Certified</p>
                <p className="text-[10px] md:text-xs text-gray-500">Personal Trainer</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-nlb-dark">
                <p className="text-xs md:text-sm font-bold text-gray-800">Rhodes College</p>
                <p className="text-[10px] md:text-xs text-gray-500">Basketball Standout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
