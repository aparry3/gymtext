import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

export function ClatcheyCTA() {
  return (
    <section className="bg-msj-purple-deep text-msj-cream py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <h2 className="font-display-condensed text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.95] tracking-tight">
          <span className="block">Train like a Mount man.</span>
          <span className="block">
            Starting <span className="text-msj-purple-tint">tomorrow.</span>
          </span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-msj-cream/85 leading-relaxed">
          Join the daily workout program. Two-minute signup. Cancel anytime.
        </p>
        <a
          href={CLATCHEY_SIGNUP_URL}
          className="inline-block mt-9 bg-msj-cream text-msj-purple-deep text-xs md:text-sm tracking-[0.22em] font-bold px-9 py-5 rounded-full hover:brightness-95 transition-all"
        >
          START $25 / MO
        </a>
        <div className="mt-6 text-[10px] md:text-[11px] tracking-[0.22em] text-msj-cream/75 font-semibold">
          DAILY SMS COACHING · NO CAMP REQUIRED
        </div>
      </div>
    </section>
  );
}
