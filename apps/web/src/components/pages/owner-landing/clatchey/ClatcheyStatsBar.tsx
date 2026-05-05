const MARQUEE_ITEMS = [
  '850+ WINS',
  '3 NBA PLAYERS',
  '70+ NCAA D-I',
  '20+ CHAMPIONSHIPS',
  'MT. ST. JOE · BALTIMORE',
  'DAILY SMS COACHING',
];

export function ClatcheyStatsBar() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section
      aria-label="Coach Clatchey stats"
      className="bg-msj-night border-y border-msj-purple/40 overflow-hidden"
    >
      <div className="msj-marquee-track flex items-center gap-12 py-4 whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            <span className="text-[11px] md:text-xs tracking-[0.28em] text-msj-cream font-bold uppercase">
              {item}
            </span>
            <span aria-hidden className="text-msj-purple text-lg leading-none">
              ◆
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
