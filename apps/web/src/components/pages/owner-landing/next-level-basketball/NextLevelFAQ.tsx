const FAQS_LEFT = [
  {
    q: 'Do I have to sign up for GymText to attend the camp?',
    a: "Yes. The camp is included with both GymText plans (Basic or Premium). You can't register for the camp on its own — your subscription is your registration.",
  },
  {
    q: "What's the difference between Basic and Premium?",
    a: "Both plans include the full 2-day camp and daily SMS workouts. Premium adds a monthly 1:1 Zoom session with Coach Rhynia for film review and personalized programming.",
  },
  {
    q: 'Where is the camp held?',
    a: 'St. Francis Middle School in Memphis, TN. Address details and parking instructions go out by SMS the week of camp.',
  },
  {
    q: 'What ages can attend?',
    a: 'Ages 10 and up. Drills scale based on the players in attendance, but the program is built with middle school through high school athletes in mind.',
  },
];

const FAQS_RIGHT = [
  {
    q: 'Can I cancel after the camp?',
    a: "Yes. There's no commitment beyond the month you sign up. Cancel any time from your account.",
  },
  {
    q: 'What should I bring?',
    a: 'Indoor basketball shoes, athletic clothes, a basketball, and water. We provide everything else.',
  },
  {
    q: 'How do the daily texts work?',
    a: 'Coach Rhynia sends a workout to your phone each morning. Reply with how it went, ask questions, or request adjustments — the plan adapts.',
  },
  {
    q: 'Is there a refund if I miss the camp?',
    a: "Camp registration is part of your monthly subscription. If you can't make it, you keep getting daily workouts — no separate refund for the in-person sessions.",
  },
];

export function NextLevelFAQ() {
  return (
    <section id="faq" className="bg-nlb-dark text-white py-20 md:py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">Questions</span>
            <span className="block text-nlb-orange">answered.</span>
          </h2>
          <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-2xl">
            Everything you need to know before reserving your spot. Still curious? Reply to any
            text from Coach Rhynia after you sign up.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
          <div>
            {FAQS_LEFT.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
          <div>
            {FAQS_RIGHT.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex items-start justify-between gap-6 cursor-pointer text-sm md:text-base font-semibold text-white list-none">
        <span>{q}</span>
        <span className="shrink-0 text-nlb-orange text-xl leading-none mt-0.5 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-white/65 leading-relaxed pr-8">{a}</p>
    </details>
  );
}
