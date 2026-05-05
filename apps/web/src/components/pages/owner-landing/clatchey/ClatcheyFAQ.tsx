const FAQS_LEFT = [
  {
    q: "What if I'm not at Clatchey's level?",
    a: "Plans scale to where you are. Tell us your level when you sign up; the workouts adjust. We coach beginners and college recruits the same way: meet you where you are, push you forward.",
  },
  {
    q: 'How long are the daily workouts?',
    a: 'Most are 30–45 minutes. Designed to actually be done, not skipped.',
  },
  {
    q: 'Do I need a gym?',
    a: "A hoop helps. Most days are doable with a basketball, a wall, and some space. We'll specify when court time is required.",
  },
  {
    q: 'Is the camp included?',
    a: 'No. The camp is run by Mt. St. Joseph and registered separately on the school site. The daily SMS subscription is the standalone product here.',
  },
];

const FAQS_RIGHT = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contract. Cancel from your account, no questions.',
  },
  {
    q: 'What ages?',
    a: 'Built for middle school through college. Younger players welcome with parental signup.',
  },
  {
    q: 'Will I actually hear from Coach?',
    a: "Coach Clatchey writes the program. Day-to-day responses come from his coaching staff and the GymText system, modeled on his approach.",
  },
  {
    q: 'Does the plan adapt to my season?',
    a: 'Yes. Tell us when your season starts; off-season, in-season, and post-season programming all run differently.',
  },
];

export function ClatcheyFAQ() {
  return (
    <section
      id="faq"
      className="bg-msj-cream text-msj-purple-deep py-20 md:py-28 border-t border-msj-purple-deep/10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-end mb-12">
          <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
            <span className="block">Questions,</span>
            <span className="block text-msj-purple">answered.</span>
          </h2>
          <p className="text-base md:text-lg text-msj-purple-deep/65 leading-relaxed max-w-2xl">
            Everything you need to know before signing up. Still curious? Reply to any text
            after you start.
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
      className="group border-b border-msj-purple-deep/10 py-5 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex items-start justify-between gap-6 cursor-pointer text-sm md:text-base font-semibold text-msj-purple-deep list-none">
        <span>{q}</span>
        <span className="shrink-0 text-msj-purple text-xl leading-none mt-0.5 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-msj-purple-deep/65 leading-relaxed pr-8">{a}</p>
    </details>
  );
}
