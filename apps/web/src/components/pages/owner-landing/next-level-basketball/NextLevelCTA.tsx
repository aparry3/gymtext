export function NextLevelSmsCoaching() {
  return (
    <section className="bg-nlb-dark text-white py-20 md:py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="text-[10px] tracking-[0.28em] text-nlb-orange font-bold mb-4">
            DAILY SMS COACHING
          </div>
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">A coach in</span>
            <span className="block">
              your <span className="text-nlb-orange">pocket.</span>
            </span>
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-white/70 leading-relaxed max-w-lg">
            <p>
              Every morning, Coach Rhynia sends the day&apos;s workout right to your phone — short
              enough to actually do, specific enough to actually move you forward.
            </p>
            <p>
              Reply with how it went. Skip a day if life happens. The plan keeps adapting.
            </p>
          </div>
          <a
            href="#pricing"
            className="inline-block mt-8 bg-nlb-orange text-white text-xs md:text-sm tracking-[0.22em] font-bold px-7 py-4 rounded-full hover:brightness-110 transition-all"
          >
            GET STARTED
          </a>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-[280px] md:w-[320px] aspect-[9/19] rounded-[2.5rem] bg-black border-[10px] border-white/10 shadow-2xl shadow-black/60 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
      <div className="h-full overflow-hidden bg-[#0d0d0e] px-3 pt-10 pb-6 space-y-3">
        <Bubble side="meta">Mon · 6:42 AM</Bubble>
        <Bubble side="left">
          ☀️ Morning. Today: 30 min ball-handling — 2-ball pound, in-and-out, killer crossover. 3
          sets x 30s each. Send a clip when you&apos;re done.
        </Bubble>
        <Bubble side="right">Done. The killer cross felt good today.</Bubble>
        <Bubble side="meta">Tue · 6:38 AM</Bubble>
        <Bubble side="left">
          🔥 Build on yesterday. Mikan layup ladder + 50 form shots. Then 10 min footwork from the
          elbow. Stay in your feet.
        </Bubble>
        <Bubble side="right">Knees felt slow. Pushing through.</Bubble>
        <Bubble side="meta">Wed · 6:40 AM</Bubble>
        <Bubble side="left">
          Heard. Today is recovery + IQ. 20 min light shooting + watch the clip I sent — write 3
          reads you saw. We&apos;ll talk Friday.
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
      <div className="text-center text-[9px] tracking-[0.18em] text-white/35 font-semibold py-1">
        {children}
      </div>
    );
  }
  const base = 'max-w-[80%] text-[11px] leading-snug rounded-2xl px-3 py-2';
  return side === 'left' ? (
    <div className={`${base} bg-white/10 text-white/85 mr-auto rounded-bl-md`}>{children}</div>
  ) : (
    <div className={`${base} bg-nlb-orange text-white ml-auto rounded-br-md`}>{children}</div>
  );
}

export function NextLevelCTA() {
  return (
    <section className="bg-nlb-orange text-white py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <h2 className="font-display-condensed text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.95] tracking-tight text-nlb-dark">
          <span className="block">May 29 – 30.</span>
          <span className="block">Be there.</span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-white/85 leading-relaxed">
          Spots are limited. Lock in your camp seat and start training with Coach Rhynia today.
        </p>
        <a
          href="#pricing"
          className="inline-block mt-9 bg-nlb-dark text-white text-xs md:text-sm tracking-[0.22em] font-bold px-9 py-5 rounded-full hover:brightness-125 transition-all"
        >
          RESERVE YOUR SPOT
        </a>
        <div className="mt-6 text-[10px] md:text-[11px] tracking-[0.22em] text-white/75 font-semibold">
          REGISTRATION CLOSES MAY 25, 2026 · MEMPHIS, TN
        </div>
      </div>
    </section>
  );
}
