import Image from 'next/image';

export const CLATCHEY_SIGNUP_URL = 'https://coaching.gymtext.co/signup/clatchey';
export const CLATCHEY_PORTRAIT_URL =
  'https://catholicreview.org/wp-content/uploads/2018/12/Clatchey_DK47404-web-1.jpg';

export function ClatcheyHero() {
  return (
    <section className="relative bg-msj-night text-msj-cream overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.28), transparent 70%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-[11px] tracking-[0.22em] text-msj-cream/70 font-semibold mb-8">
          <span>GYMTEXT × MT. ST. JOE BASKETBALL</span>
          <span className="text-msj-purple">•</span>
          <span>DAILY SMS COACHING</span>
          <span className="text-msj-purple">•</span>
          <span>$25 / MO</span>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
          <div>
            <h1 className="font-display-condensed text-[3.75rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[7rem] leading-[0.92] tracking-tight uppercase">
              <span className="block">30 years of</span>
              <span className="block">winning.</span>
              <span className="block text-msj-purple-tint">Now on your phone.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base md:text-lg text-msj-cream/70 leading-relaxed">
              Hall-of-Fame coach Pat Clatchey has spent three decades building a dynasty at
              Mt. St. Joseph — 850+ wins, 3 NBA players, 70+ NCAA Division I athletes. Now his
              daily playbook texts you the next workout.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={CLATCHEY_SIGNUP_URL}
                className="bg-msj-purple text-msj-cream text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:brightness-110 transition-all"
              >
                START $25 / MO
              </a>
              <a
                href="#camp"
                className="border border-msj-cream/25 text-msj-cream/90 text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:bg-msj-cream hover:text-msj-night transition-all"
              >
                SEE THE CAMP
              </a>
            </div>
            <div className="mt-5 text-[10px] md:text-[11px] tracking-[0.22em] text-msj-cream/50 font-semibold">
              NO CAMP SIGNUP REQUIRED · CANCEL ANYTIME
            </div>
          </div>

          <PortraitCard />
        </div>
      </div>
    </section>
  );
}

function PortraitCard() {
  return (
    <div className="relative w-full max-w-md ml-auto aspect-[4/5] rounded-2xl overflow-hidden bg-msj-cream/10 border border-msj-cream/10">
      <Image
        src={CLATCHEY_PORTRAIT_URL}
        alt="Coach Pat Clatchey"
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
        unoptimized
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-msj-night/85 via-msj-night/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] text-msj-cream/60 font-semibold mb-1">
            COACH PAT CLATCHEY
          </div>
          <div className="text-[11px] tracking-[0.18em] text-msj-cream font-bold uppercase">
            Head Coach · Mt. St. Joseph Gaels
          </div>
        </div>
        <div className="text-[10px] tracking-[0.22em] text-msj-cream/60 font-semibold">
          SINCE 1992
        </div>
      </div>
    </div>
  );
}
