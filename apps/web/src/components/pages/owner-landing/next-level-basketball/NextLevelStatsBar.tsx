const MARQUEE_ITEMS = [
  '2-DAY ELITE CAMP',
  'MEMPHIS, TN',
  'AGES 10 & UP',
  'MAY 29 – 30, 2026',
  'COACH RHYNIA HENRY',
  'DAILY SMS WORKOUTS',
];

export function NextLevelStatsBar() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section
      aria-label="Camp highlights"
      className="bg-nlb-dark border-y border-nlb-orange/40 overflow-hidden"
    >
      <div className="nlb-marquee-track flex items-center gap-12 py-4 whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            <span className="text-[11px] md:text-xs tracking-[0.28em] text-white font-bold uppercase">
              {item}
            </span>
            <span aria-hidden className="text-nlb-orange text-lg leading-none">
              ◆
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
