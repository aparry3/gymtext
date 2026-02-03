'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

const BENEFITS = [
  'Personalized daily workouts',
  'AI coaching available 24/7',
  'Adapts to your equipment & schedule',
  'Progressive training plans',
  'Text back anytime with questions',
  'No app to download',
  'Cancel anytime',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Simple, Affordable Pricing
          </h2>
          <p className="text-lg text-gray-500">
            Less than the cost of a single personal training session.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Price Header */}
            <div className="bg-gradient-to-br from-[#1B81FF] to-[#1468CC] p-8 text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">
                Monthly Plan
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold">$</span>
                <span className="text-6xl font-extrabold tracking-tight">19</span>
                <span className="text-2xl font-bold">.99</span>
                <span className="text-lg opacity-80 ml-1">/mo</span>
              </div>
              <p className="mt-3 text-sm opacity-90">
                7-day free trial included
              </p>
            </div>

            {/* Benefits List */}
            <div className="p-8">
              <ul className="space-y-4">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/start"
                className="mt-8 block w-full bg-[#1B81FF] hover:bg-[#1468CC] text-white py-4 rounded-xl font-bold text-center text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-[#1B81FF]/20"
              >
                Start Free Trial
              </Link>

              <p className="mt-4 text-center text-sm text-gray-400">
                No credit card required to start
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
