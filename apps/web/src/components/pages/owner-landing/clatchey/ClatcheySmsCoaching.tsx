import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

export function ClatcheySmsCoaching() {
  return (
    <section
      id="sms"
      className="bg-msj-night text-msj-cream py-20 md:py-28 border-t border-msj-cream/5"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="text-[10px] tracking-[0.28em] text-msj-purple-tint font-bold mb-4">
            DAILY SMS COACHING
          </div>
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">A coach in</span>
            <span className="block">
              your <span className="text-msj-purple-tint">pocket.</span>
            </span>
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-msj-cream/70 leading-relaxed max-w-lg">
            <p>
              Every morning, Coach Clatchey&apos;s program sends the day&apos;s workout right
              to your phone — short enough to actually do, specific enough to actually move
              you forward.
            </p>
            <p>Reply with how it went. Skip a day if life happens. The plan keeps adapting.</p>
          </div>
          <a
            href={CLATCHEY_SIGNUP_URL}
            className="inline-block mt-8 bg-msj-purple text-msj-cream text-xs md:text-sm tracking-[0.22em] font-bold px-7 py-4 rounded-full hover:brightness-110 transition-all"
          >
            START $25 / MO
          </a>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-[280px] md:w-[320px] aspect-[9/19] rounded-[2.5rem] bg-black border-[10px] border-msj-cream/10 shadow-2xl shadow-black/60 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
      <div className="h-full overflow-hidden bg-[#0d0a18] px-3 pt-10 pb-6 space-y-3">
        <Bubble side="meta">Mon · 6:38 AM</Bubble>
        <Bubble side="left">
          Today is footwork. 50 form shots from the elbow + 3 sets of jab-step into pull-up.
          Stay in your stance. Send a clip.
        </Bubble>
        <Bubble side="right">Done. Felt slow on the second set.</Bubble>
        <Bubble side="meta">Tue · 6:40 AM</Bubble>
        <Bubble side="left">
          Slow is real. Today: 20 min ball-handling — 2-ball pound, in-and-out, killer cross.
          3 sets x 30s. Then write 3 things you saw on yesterday&apos;s clip.
        </Bubble>
        <Bubble side="right">Sent.</Bubble>
        <Bubble side="meta">Wed · 6:42 AM</Bubble>
        <Bubble side="left">
          Good read on the help-side. Today is conditioning + reads — 5 suicides, then film.
          We&apos;re building. Keep showing up.
        </Bubble>
      </div>
    </div>
  );
}

function Bubble({
  side,
  children,
}: {
  side: 'left' | 'right' | 'meta';
  children: React.ReactNode;
}) {
  if (side === 'meta') {
    return (
      <div className="text-center text-[9px] tracking-[0.18em] text-msj-cream/35 font-semibold py-1">
        {children}
      </div>
    );
  }
  const base = 'max-w-[80%] text-[11px] leading-snug rounded-2xl px-3 py-2';
  return side === 'left' ? (
    <div className={`${base} bg-msj-cream/10 text-msj-cream/85 mr-auto rounded-bl-md`}>
      {children}
    </div>
  ) : (
    <div className={`${base} bg-msj-purple text-msj-cream ml-auto rounded-br-md`}>
      {children}
    </div>
  );
}
