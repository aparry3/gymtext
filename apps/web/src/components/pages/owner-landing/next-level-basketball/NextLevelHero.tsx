export function NextLevelHero() {
  return (
    <section className="relative bg-nlb-dark text-white overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(234,88,12,0.25), transparent 70%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-[11px] tracking-[0.22em] text-white/70 font-semibold mb-8">
          <span>2-DAY ELITE CAMP</span>
          <span className="text-nlb-orange">•</span>
          <span>MEMPHIS, TN</span>
          <span className="text-nlb-orange">•</span>
          <span>AGES 10 &amp; UP</span>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
          <div>
            <h1 className="font-display-condensed text-[3.75rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[7rem] leading-[0.92] tracking-tight uppercase">
              <span className="block">Take your</span>
              <span className="block">game to the</span>
              <span className="block text-nlb-orange">Next level.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base md:text-lg text-white/70 leading-relaxed">
              Two days in the gym with Coach Rhynia Henry, plus daily SMS workouts that keep
              showing up after he goes home. Memphis, May 29–30.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#pricing"
                className="bg-nlb-orange text-white text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:brightness-110 transition-all"
              >
                RESERVE YOUR SPOT
              </a>
              <a
                href="#schedule"
                className="border border-white/25 text-white/90 text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:bg-white hover:text-nlb-dark transition-all"
              >
                SEE THE SCHEDULE
              </a>
            </div>
          </div>

          <ItineraryCard />
        </div>
      </div>
    </section>
  );
}

function ItineraryCard() {
  return (
    <div className="w-full max-w-md ml-auto rounded-2xl bg-white/[0.04] border border-white/10 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] tracking-[0.22em] text-white/50 font-semibold">
          CAMP ITINERARY
        </span>
        <span className="text-[10px] tracking-[0.18em] font-bold text-white bg-nlb-orange px-2.5 py-1 rounded-full">
          2026
        </span>
      </div>
      <DayRow
        day="29"
        weekday="Fri"
        month="May"
        sessionLabel="DAY 1 / 6 – 8 PM"
        title="Skills + Scrimmage"
        subtitle="Footwork, finishing, live reps"
      />
      <div className="border-t border-white/10 my-4" />
      <DayRow
        day="30"
        weekday="Sat"
        month="May"
        sessionLabel="DAY 2 / 11 AM – 1 PM"
        title="Game Concepts"
        subtitle="IQ, reads, and team play"
      />
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <span>St. Francis Middle School</span>
        <span>Memphis, TN</span>
      </div>
    </div>
  );
}

function DayRow({
  day,
  weekday,
  month,
  sessionLabel,
  title,
  subtitle,
}: {
  day: string;
  weekday: string;
  month: string;
  sessionLabel: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center w-12 shrink-0">
        <span className="text-[9px] tracking-[0.2em] text-white/40 font-semibold uppercase">
          {weekday}
        </span>
        <span className="font-display-condensed text-4xl leading-none text-white">{day}</span>
        <span className="text-[9px] tracking-[0.2em] text-white/40 font-semibold uppercase mt-0.5">
          {month}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] tracking-[0.22em] text-nlb-orange font-bold uppercase mb-1">
          {sessionLabel}
        </div>
        <div className="text-base font-bold text-white leading-tight">{title}</div>
        <div className="text-xs text-white/50 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}
