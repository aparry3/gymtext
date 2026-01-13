'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import Button from './Button';
import { PRICING_PLANS } from './constants';

const AnatomyPlans: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <section id="plans" className="pt-24 min-h-screen bg-anatomy-black">
      <div className="container mx-auto px-6 md:px-12 py-12">
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white text-center mb-16">
          Choose Your Path
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

          {/* PRICING COLUMN */}
          <div className="space-y-8">
            {PRICING_PLANS.map((plan, idx) => (
              <div key={idx} className={`p-8 border transition-all duration-300 ${plan.isPopular ? 'bg-zinc-900 border-white/20' : 'bg-transparent border-zinc-800 opacity-80 hover:opacity-100'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {plan.isPopular && <span className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-2 inline-block">Popular</span>}
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-white">{plan.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white block">{plan.price}</span>
                    <span className="text-zinc-500 text-xs uppercase tracking-wide">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check size={18} className="text-white mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={18} className="text-zinc-700 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-center text-zinc-500 text-sm">No long-term contracts. Cancel anytime via text.</p>
          </div>

          {/* FORM COLUMN */}
          <div className="bg-white text-black p-8 md:p-12">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold uppercase tracking-widest mb-2">Get Started</h3>
                  <p className="text-zinc-600 text-sm">Tell us a bit about yourself to begin your onboarding.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                    <input required type="text" className="w-full bg-zinc-100 border-b-2 border-zinc-200 p-3 focus:outline-none focus:border-black transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Phone Number</label>
                    <input required type="tel" className="w-full bg-zinc-100 border-b-2 border-zinc-200 p-3 focus:outline-none focus:border-black transition-colors" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Primary Goal</label>
                    <select className="w-full bg-zinc-100 border-b-2 border-zinc-200 p-3 focus:outline-none focus:border-black transition-colors">
                      <option>Build Muscle</option>
                      <option>Lose Fat / Lean Out</option>
                      <option>Improve Athletic Performance</option>
                      <option>General Health & Longevity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Access</label>
                    <select className="w-full bg-zinc-100 border-b-2 border-zinc-200 p-3 focus:outline-none focus:border-black transition-colors">
                      <option>Full Gym Access</option>
                      <option>Home Gym / Limited Equipment</option>
                      <option>Bodyweight Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <input required type="checkbox" className="mt-1" />
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    I consent to receive recurring automated marketing text messages and daily workouts at the phone number provided. Consent is not a condition to purchase. Msg & data rates may apply.
                  </p>
                </div>

                <Button type="submit" variant="secondary" fullWidth className="mt-6" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Start Training'}
                </Button>
              </form>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-6 min-h-[400px]">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center">
                  <Check size={40} />
                </div>
                <h3 className="text-3xl font-bold uppercase tracking-widest">You&apos;re In.</h3>
                <p className="text-zinc-600 max-w-sm">
                  Check your phone. You should receive a text from your new coach within the next 2 minutes to complete your profile setup.
                </p>
                <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  Reset
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AnatomyPlans;
