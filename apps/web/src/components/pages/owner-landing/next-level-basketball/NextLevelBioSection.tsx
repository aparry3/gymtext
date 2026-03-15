import Image from 'next/image';

export function NextLevelBioSection() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <div className="lg:w-1/3 relative w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-nlb-orange/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 aspect-[4/5]">
              <Image
                src="/coaches/next-level/rhynia-henry.jpg"
                alt="Coach Rhynia Henry"
                fill
                className="object-cover"
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
                Played for Tennessee legendary high school basketball coach, the late Joe C. Branch
                at <strong>Bolton High School</strong>. Was selected all district, and all region
                senior year. Played collegiate basketball at{' '}
                <strong>Rhodes College</strong> in Memphis.
              </p>
              <p>
                Rhodes College MVP as a senior (1991) along with MVP of the Maryville Classic (St
                Louis), Maryville Classic (TN), and Rhodes College Classic that same year.
              </p>
              <p>
                Began coaching in 2010 at the{' '}
                <strong>Memphis Jewish Community Center</strong>. Coached in two Maccabi games (one
                in Israel) in 2012 and 2013 earning a bronze in 2013.
              </p>
              <p>
                Excels at player development — pinpoint player attributes and developing the best
                plan for player improvement. <strong>Founder of Next Level Basketball Development</strong>{' '}
                in the Memphis, TN area.
              </p>
            </div>

            <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-nlb-orange">
                <p className="text-xs md:text-sm font-bold text-gray-800">Since 2010</p>
                <p className="text-[10px] md:text-xs text-gray-500">Coaching &amp; Training</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-nlb-orange">
                <p className="text-xs md:text-sm font-bold text-gray-800">Rhodes College MVP</p>
                <p className="text-[10px] md:text-xs text-gray-500">Senior Year (1991)</p>
              </div>
              <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 rounded-lg border-l-4 border-nlb-dark">
                <p className="text-xs md:text-sm font-bold text-gray-800">Maccabi Games</p>
                <p className="text-[10px] md:text-xs text-gray-500">Bronze Medalist (2013)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
