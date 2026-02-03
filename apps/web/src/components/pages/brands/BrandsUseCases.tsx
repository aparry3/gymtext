'use client';

import React from 'react';
import { Dumbbell, Hotel, ShoppingBag, Shield, Check } from 'lucide-react';

interface UseCaseItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const UseCaseItem: React.FC<UseCaseItemProps> = ({ title, description, icon }) => (
  <div className="flex gap-6 items-start p-6 rounded-2xl hover:bg-gray-50 transition-colors">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gymblue-600">
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

export const BrandsUseCases: React.FC = () => {
  return (
    <section id="use-cases" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-gymblue-700 text-xs font-bold uppercase tracking-wide mb-4">
              Use Cases
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Built for any organization moving people.
            </h2>
            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
              GymText works whether you&apos;re supporting gym members between sessions,
              helping military units stay ready, extending a hotel wellness experience,
              or reinforcing a brand-led training program.
            </p>
            <div className="space-y-4">
              {['No App Fatigue', '98% Open Rates', 'Instant Onboarding'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-gray-900">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <UseCaseItem
              title="Gyms & Trainers"
              description="Daily programming, class reminders, training plans, accountability, and member retention."
              icon={<Dumbbell className="h-6 w-6" />}
            />
            <UseCaseItem
              title="Hotels & Wellness Retreats"
              description="Curated movement experiences for guests such as yoga, mobility, recovery, or destination-specific fitness journeys."
              icon={<Hotel className="h-6 w-6" />}
            />
            <UseCaseItem
              title="Athletic & Fitness Brands"
              description="Sport-specific training, recovery programs, campaign extensions, and community engagement tied to product launches."
              icon={<ShoppingBag className="h-6 w-6" />}
            />
            <UseCaseItem
              title="Military & Tactical"
              description="Readiness training, mobility, injury prevention, and performance routines tailored to operational demands."
              icon={<Shield className="h-6 w-6" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
