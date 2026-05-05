export const CAMP_SIGNUP_URL = 'https://www.msjnet.edu/athletics/camps';

export function ClatcheyCamp() {
  return (
    <section id="camp" className="bg-msj-cream text-msj-purple-deep py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-[10px] tracking-[0.28em] text-msj-purple font-bold mb-4">
          THE IN-PERSON CAMP
        </div>
        <h2 className="font-display-condensed text-5xl md:text-7xl uppercase leading-[0.95] tracking-tight">
          <span className="block">3 days at</span>
          <span className="block">
            Mt. St. Joe. <span className="text-msj-purple">Every summer.</span>
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-msj-purple-deep/75 leading-relaxed">
          Each summer, Coach Clatchey runs a 3-day basketball camp at Mt. St. Joseph High
          School in Baltimore. Open to middle and high school players. Real reps with the
          staff that produced 70+ Division I athletes. Camp registration is handled directly
          by Mt. St. Joe — separate from your daily SMS subscription.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-msj-purple-deep/10 rounded-2xl overflow-hidden border border-msj-purple-deep/10">
          <FactCell label="LOCATION" value="Mt. St. Joseph HS · Baltimore, MD" />
          <FactCell label="FORMAT" value="3 days · in-person" />
          <FactCell label="AGES" value="Middle / high school" highlight />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={CAMP_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-msj-purple-deep text-msj-purple-deep text-xs md:text-sm tracking-[0.18em] font-bold px-7 py-4 rounded-full hover:bg-msj-purple-deep hover:text-msj-cream transition-all"
          >
            SIGN UP FOR CAMP →
          </a>
          <a
            href="#pricing"
            className="text-sm text-msj-purple-deep/70 hover:text-msj-purple transition-colors underline underline-offset-4"
          >
            Can&apos;t make it? The daily texts are open year-round.
          </a>
        </div>
      </div>
    </section>
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
    <div className="bg-msj-cream p-5 md:p-6">
      <div className="text-[9px] tracking-[0.22em] text-msj-purple-deep/50 font-semibold mb-1.5">
        {label}
      </div>
      <div
        className={`text-sm md:text-base font-bold ${
          highlight ? 'text-msj-purple' : 'text-msj-purple-deep'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
