export function ClatcheyBioSection() {
  return (
    <section
      id="bio"
      className="bg-msj-cream text-msj-purple-deep py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        <QuoteCard />

        <div>
          <div className="text-[10px] tracking-[0.28em] text-msj-purple font-bold mb-4">
            MEET COACH CLATCHEY
          </div>
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">Three decades.</span>
            <span className="block">One coach.</span>
            <span className="block">
              A <span className="text-msj-purple">dynasty.</span>
            </span>
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-msj-purple-deep/80 leading-relaxed max-w-xl">
            <p>
              For over three decades, Pat Clatchey hasn&apos;t just coached basketball at Mount
              Saint Joseph High School — he&apos;s built a dynasty. Since 1992, he has amassed
              850+ wins, placing him in elite company alongside legends like Bob Hurley.
            </p>
            <p>
              His court is a classroom: nearly 70 NCAA Division I athletes developed, 18
              professional careers overseas, and three players sent directly to the NBA —
              including top-10 draft pick Jalen Smith. Coached the McDonald&apos;s All-American
              Game. Named MIAA Coach of the Decade.
            </p>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-4 max-w-lg">
            <Stat value="30+" label="Years coaching" />
            <Stat value="850+" label="Career wins" />
            <Stat value="20+" label="Championships" />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteCard() {
  return (
    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-msj-purple-deep text-msj-cream p-8 md:p-12 flex flex-col justify-between">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(124,58,237,0.35), transparent 65%)',
        }}
      />

      <div className="relative flex items-start justify-between text-[10px] tracking-[0.28em] text-msj-cream/65 font-bold">
        <span>THE GAEL WAY</span>
        <span>EST. 1992</span>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="font-display-condensed text-msj-purple-tint text-[8rem] md:text-[10rem] leading-[0.7] select-none -mb-2"
        >
          &ldquo;
        </div>
        <p className="font-display-condensed text-4xl md:text-5xl lg:text-6xl text-msj-cream uppercase leading-[0.95] tracking-tight">
          Fundamentals first.
          <br />
          Victory follows.
        </p>
        <p className="text-[10px] tracking-[0.28em] text-msj-cream/70 font-semibold mt-6">
          — COACH PAT CLATCHEY
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display-condensed text-4xl md:text-5xl text-msj-purple leading-none">
        {value}
      </div>
      <div className="text-[11px] text-msj-purple-deep/60 mt-2">{label}</div>
    </div>
  );
}
