const STEPS = [
  {
    number: '01',
    title: 'SUBSCRIBE',
    body: '$25/mo. Cancel anytime. Two-minute signup.',
  },
  {
    number: '02',
    title: 'GET DAILY WORKOUTS',
    body:
      "Coach Clatchey's plan lands in your messages every morning — drills, reps, and a clear focus for the day.",
  },
  {
    number: '03',
    title: 'REPLY · ADAPT',
    body:
      "Tell us how it went, what hurt, what's next. The plan adapts to you.",
  },
];

export function ClatcheyHowItWorks() {
  return (
    <section className="bg-msj-cream text-msj-purple-deep py-20 md:py-28 border-t border-msj-purple-deep/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">How it</span>
            <span className="block text-msj-purple">works.</span>
          </h2>
          <p className="text-base md:text-lg text-msj-purple-deep/65 leading-relaxed max-w-2xl">
            One subscription, three habits. Show up every morning, tell us how it went, the
            plan keeps building.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className="rounded-2xl bg-msj-purple-deep/5 border border-msj-purple-deep/10 p-7"
            >
              <div className="font-display-condensed text-5xl text-msj-purple leading-none mb-5">
                {s.number}
              </div>
              <div className="text-sm tracking-[0.2em] text-msj-purple-deep font-bold mb-3">
                {s.title}
              </div>
              <p className="text-sm text-msj-purple-deep/65 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
