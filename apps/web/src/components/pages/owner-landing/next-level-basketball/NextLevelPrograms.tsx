const SIGNUP_BASIC_URL = 'https://coaching.gymtext.co/signup/basketball-fundamentals';
const SIGNUP_PREMIUM_URL = 'https://coaching.gymtext.co/signup/basketball-fundamentals-plus';

export function NextLevelCampDays() {
  return (
    <section id="schedule" className="bg-nlb-dark text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
          <span className="block">Two days.</span>
          <span className="block text-nlb-orange">Real reps.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-white/65 leading-relaxed">
          A focused, no-fluff camp designed to translate work into wins. Day 1 sharpens what every
          player needs — footwork, finishing, finishing under pressure. Day 2 puts it all in motion
          with reads, spacing, and team concepts.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <DayCard
            label="FRIDAY · MAY 29 · 6 – 8 PM"
            number="01"
            title="Skills"
            titleAccent="+ Scrimmage"
            bullets={[
              'Stance, footwork & first-step',
              'Ball-handling under pressure',
              'Finishing through contact',
              'Live 3-on-3 / 5-on-5 scrimmage',
            ]}
            stats={[
              { label: 'DURATION', value: '2 hours' },
              { label: 'INTENSITY', value: 'High' },
            ]}
          />
          <DayCard
            label="SATURDAY · MAY 30 · 11 AM – 1 PM"
            number="02"
            title="Game"
            titleAccent="Concepts"
            bullets={[
              'Reading defenses & coverages',
              'Pick-and-roll decision tree',
              'Spacing, timing & team flow',
              'Closing-minute situations',
            ]}
            stats={[
              { label: 'DURATION', value: '2 hours' },
              { label: 'FOCUS', value: 'IQ + Team' },
            ]}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
          <FactCell label="VENUE" value="St. Francis Middle School" />
          <FactCell label="LOCATION" value="Memphis, TN" />
          <FactCell label="AGES" value="10 & Up" highlight />
          <FactCell label="TOTAL SESSIONS" value="2 × 2 hrs · live coaching" />
        </div>
      </div>
    </section>
  );
}

function DayCard({
  label,
  number,
  title,
  titleAccent,
  bullets,
  stats,
}: {
  label: string;
  number: string;
  title: string;
  titleAccent: string;
  bullets: string[];
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 md:p-8">
      <div className="text-[10px] tracking-[0.22em] text-nlb-orange font-bold mb-5">{label}</div>
      <div className="font-display-condensed text-7xl leading-none text-white/90 mb-2">
        {number}
      </div>
      <div className="font-display-condensed text-3xl md:text-4xl uppercase leading-[1] mb-5">
        <span className="text-white">{title}</span>{' '}
        <span className="text-nlb-orange">{titleAccent}</span>
      </div>
      <ul className="space-y-2 text-sm text-white/75 mb-6">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span className="text-nlb-orange mt-[2px]">›</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] tracking-[0.2em] text-white/40 font-semibold mb-1">
              {s.label}
            </div>
            <div className="text-sm font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FactCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-nlb-dark p-4 md:p-5">
      <div className="text-[9px] tracking-[0.22em] text-white/40 font-semibold mb-1.5">
        {label}
      </div>
      <div
        className={`text-sm font-bold ${highlight ? 'text-nlb-orange' : 'text-white'}`}
      >
        {value}
      </div>
    </div>
  );
}

export function NextLevelPricing() {
  return (
    <section id="pricing" className="bg-nlb-dark text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
          <span className="block">Two ways</span>
          <span className="block">
            to <span className="text-nlb-orange">play.</span>
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-white/65 leading-relaxed">
          Both tiers include the full two-day camp and daily SMS coaching. Premium adds monthly 1:1
          Zoom film sessions with Coach Rhynia for players who want the next level of attention.
        </p>

        <div className="mt-8 rounded-xl border border-nlb-orange/40 bg-nlb-orange/10 px-5 py-3 flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-nlb-orange text-white text-xs font-bold flex items-center justify-center">
            !
          </span>
          <p className="text-[11px] md:text-xs tracking-[0.16em] text-white/85 font-semibold uppercase">
            Camp registration requires a GymText subscription · Choose Basic or Premium below
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-5">
          <PricingCard
            tier="BASIC"
            tagline="Camp + Daily Coaching"
            price="$25"
            period="/ MONTH"
            features={[
              { title: '2-Day Camp Access', body: 'Both sessions with Coach Rhynia, May 29 & 30' },
              { title: 'Daily SMS Workouts', body: 'A coach-written workout texted to you every day' },
              { title: 'Cancel anytime', body: "Stay as long as it's helping you grow" },
            ]}
            cta="START BASIC"
            href={SIGNUP_BASIC_URL}
            footnote="SPOTS ARE LIMITED · FIRST COME, FIRST SERVED"
          />
          <PricingCard
            tier="PREMIUM"
            tagline="Camp + Coaching + 1:1 Zoom"
            price="$60"
            period="/ MONTH"
            features={[
              { title: 'Everything in Basic', body: 'Full 2-day camp + daily SMS workouts' },
              {
                title: 'Monthly 1:1 Zoom with Coach Rhynia',
                body: 'Film review, IQ work, and a custom focus for the month',
              },
              {
                title: 'Personalized programming',
                body: "Daily texts adjust to what you're working on",
              },
            ]}
            cta="START PREMIUM"
            href={SIGNUP_PREMIUM_URL}
            footnote="BEST FOR SERIOUS PLAYERS · LIMITED 1:1 SLOTS"
            highlight
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  tier,
  tagline,
  price,
  period,
  features,
  cta,
  href,
  footnote,
  highlight = false,
}: {
  tier: string;
  tagline: string;
  price: string;
  period: string;
  features: { title: string; body: string }[];
  cta: string;
  href: string;
  footnote: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-7 md:p-8 border ${
        highlight
          ? 'bg-nlb-orange/10 border-nlb-orange/40'
          : 'bg-white/[0.03] border-white/10'
      }`}
    >
      {highlight && (
        <span className="absolute top-5 right-5 bg-nlb-orange text-white text-[10px] tracking-[0.18em] font-bold px-3 py-1 rounded-full">
          MOST VALUE
        </span>
      )}
      <div className="text-[11px] tracking-[0.28em] text-white/60 font-bold mb-1">{tier}</div>
      <div className="text-xs text-white/50 mb-6">{tagline}</div>
      <div className="flex items-baseline gap-2 mb-7">
        <span
          className={`font-display-condensed text-7xl md:text-8xl leading-none ${
            highlight ? 'text-nlb-orange' : 'text-white'
          }`}
        >
          {price}
        </span>
        <span className="text-[11px] tracking-[0.2em] text-white/50 font-semibold">{period}</span>
      </div>

      <ul className="space-y-4 mb-7">
        {features.map((f) => (
          <li key={f.title} className="flex items-start gap-3">
            <span
              className={`shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-xs font-bold ${
                highlight ? 'bg-nlb-orange text-white' : 'bg-white/10 text-nlb-orange'
              }`}
            >
              ✓
            </span>
            <div>
              <div className="text-sm font-bold text-white">{f.title}</div>
              <div className="text-xs text-white/55 mt-0.5">{f.body}</div>
            </div>
          </li>
        ))}
      </ul>

      <a
        href={href}
        className={`block text-center text-xs tracking-[0.22em] font-bold py-4 rounded-full transition-all ${
          highlight
            ? 'bg-nlb-orange text-white hover:brightness-110'
            : 'bg-white text-nlb-dark hover:bg-white/90'
        }`}
      >
        {cta}
      </a>

      <div className="mt-4 text-[10px] tracking-[0.2em] text-white/40 font-semibold text-center">
        {footnote}
      </div>
    </div>
  );
}
