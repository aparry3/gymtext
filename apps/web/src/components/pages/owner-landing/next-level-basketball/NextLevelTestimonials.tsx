import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Coach Henry pushes you to be better every single day. The fundamentals I learned completely changed my game.',
    name: 'MJCC Athlete',
    role: 'Next Level Basketball Program',
  },
  {
    quote: 'The FIRE Workout is no joke. My speed and conditioning improved dramatically in just a few weeks.',
    name: 'Training Client',
    role: 'FIRE Workout Participant',
  },
  {
    quote: 'My son has grown so much as a player under Coach Rhynia. Her attention to fundamentals is exactly what young athletes need.',
    name: 'Basketball Parent',
    role: 'Singleton CC Program',
  },
];

export function NextLevelTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-gray-900 relative">
      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-nlb-orange font-bold tracking-wider uppercase mb-2 text-sm">
            What Athletes Say
          </h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Real Results, Real Growth
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Athletes across Memphis trust Coach Henry to take their skills to the next level.
            Here&apos;s what they have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 md:p-8 hover:border-nlb-orange/50 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-nlb-orange fill-nlb-orange" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>
              <div>
                <p className="text-white font-bold text-sm">{testimonial.name}</p>
                <p className="text-gray-500 text-xs">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
