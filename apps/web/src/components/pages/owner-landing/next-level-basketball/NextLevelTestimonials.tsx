const STEPS = [
  {
    number: '01',
    title: 'PICK YOUR PLAN',
    body:
      'Choose Basic ($25/mo) or Premium ($60/mo). Both include the May 29–30 camp and daily SMS coaching.',
  },
  {
    number: '02',
    title: 'GET DAILY WORKOUTS',
    body:
      "Coach Rhynia's plan lands in your messages every morning — drills, reps, and a clear focus for the day.",
  },
  {
    number: '03',
    title: 'SHOW UP TO CAMP',
    body:
      'Two days, two sessions, in-person with Coach Rhynia at St. Francis Middle School in Memphis.',
  },
];

export function NextLevelHowItWorks() {
  return (
    <section className="bg-nlb-dark text-white py-20 md:py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">How it</span>
            <span className="block text-nlb-orange">works.</span>
          </h2>
          <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-2xl">
            Camp registration is your GymText sign-up. Pick a plan, lock in your spot, and start
            getting daily workouts the day after you join.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-7"
            >
              <div className="font-display-condensed text-5xl text-nlb-orange leading-none mb-5">
                {s.number}
              </div>
              <div className="text-sm tracking-[0.2em] text-white font-bold mb-3">{s.title}</div>
              <p className="text-sm text-white/65 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
