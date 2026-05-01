import Image from 'next/image';

export function NextLevelBioSection() {
  return (
    <section id="coach" className="bg-nlb-dark text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10">
          <Image
            src="/coaches/next-level/rhynia-henry.jpg"
            alt="Coach Rhynia Henry"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.22em] text-white/60 font-semibold mb-1">
                RHYNIA HENRY
              </div>
              <div className="text-[11px] tracking-[0.18em] text-white font-bold uppercase">
                Head Coach · Next Level Basketball
              </div>
            </div>
            <div className="text-[10px] tracking-[0.22em] text-white/60 font-semibold">
              EST. 2020
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.28em] text-nlb-orange font-bold mb-4">
            MEET YOUR COACH
          </div>
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">Built for</span>
            <span className="block">players who</span>
            <span className="block">
              want <span className="text-nlb-orange">more.</span>
            </span>
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
            <p>
              Coach Rhynia Henry has spent more than a decade developing players from rec leagues
              to college rosters. His approach pairs technical fundamentals with the IQ to use them
              — so the work you do in practice actually shows up on game day.
            </p>
            <p>
              At camp, he runs every drill personally. Outside of camp, he writes the daily SMS
              workouts that keep your body and brain in rhythm year-round.
            </p>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-4 max-w-lg">
            <Stat value="10+" label="Years coaching" />
            <Stat value="200+" label="Players developed" />
            <Stat value="365" label="Days of texts" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display-condensed text-4xl md:text-5xl text-nlb-orange leading-none">
        {value}
      </div>
      <div className="text-[11px] text-white/50 mt-2">{label}</div>
    </div>
  );
}
