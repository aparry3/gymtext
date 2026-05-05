import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

const FEATURES = [
  {
    title: 'Daily SMS workouts',
    body: 'A coach-written workout in your messages every morning.',
  },
  {
    title: 'Reply anytime',
    body: 'Tell us how it went, what to skip, what to push — the plan adapts.',
  },
  {
    title: 'Cancel anytime',
    body: "No contract. Stay as long as it's helping you grow.",
  },
  {
    title: 'In-person camp (optional)',
    body: 'Mt. St. Joe summer camp registers separately on the school site.',
  },
];

export function ClatcheyPricing() {
  return (
    <section id="pricing" className="bg-msj-cream text-msj-purple-deep py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <div className="text-[10px] tracking-[0.28em] text-msj-purple font-bold mb-4">
          THE PRICE
        </div>
        <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
          <span className="block">One price.</span>
          <span className="block text-msj-purple">All in.</span>
        </h2>

        <div className="mt-12 rounded-2xl bg-msj-purple-deep/5 border border-msj-purple-deep/10 p-7 md:p-10 text-left">
          <div className="text-[11px] tracking-[0.28em] text-msj-purple-deep/60 font-bold mb-1">
            DAILY SMS COACHING
          </div>
          <div className="flex items-baseline gap-2 mb-7">
            <span className="font-display-condensed text-7xl md:text-8xl leading-none text-msj-purple-deep">
              $25
            </span>
            <span className="text-[11px] tracking-[0.2em] text-msj-purple-deep/60 font-semibold">
              / MONTH
            </span>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-xs font-bold bg-msj-purple text-msj-cream">
                  ✓
                </span>
                <div className="min-w-0">
                  <div className="text-sm md:text-base font-bold text-msj-purple-deep">
                    {f.title}
                  </div>
                  <div className="text-xs md:text-sm text-msj-purple-deep/65 mt-0.5">
                    {f.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={CLATCHEY_SIGNUP_URL}
            className="block text-center text-xs md:text-sm tracking-[0.22em] font-bold py-4 rounded-full bg-msj-purple-deep text-msj-cream hover:brightness-125 transition-all"
          >
            START NOW
          </a>

          <div className="mt-4 text-[10px] tracking-[0.2em] text-msj-purple-deep/50 font-semibold text-center">
            BILLED MONTHLY · CANCEL ANY TIME
          </div>
        </div>
      </div>
    </section>
  );
}
