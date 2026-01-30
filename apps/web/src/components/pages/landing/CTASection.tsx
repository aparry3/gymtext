'use client';

import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-600 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-800 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Train Smarter.{' '}
          <span className="text-[#1B81FF]">No App Required.</span>
        </h2>
        <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
          Join the athletes who have simplified their fitness with GymText.
        </p>
        <Link
          href="/start"
          className="inline-block bg-[#1B81FF] hover:bg-[#1468CC] text-white px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-xl shadow-[#1B81FF]/30"
        >
          Get Started Today
        </Link>
        <p className="mt-6 text-sm text-slate-500">
          No credit card required for 7-day trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
