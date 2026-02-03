'use client';

import React from 'react';
import {
  Smartphone,
  Cpu,
  MessageCircle,
  Heart,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  dark?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className = '',
  dark = false,
}) => (
  <div
    className={`p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
      dark
        ? 'bg-gray-900 text-white'
        : 'bg-white border border-gray-100 shadow-sm text-gray-900'
    } ${className}`}
  >
    <div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
          dark ? 'bg-gray-800 text-white' : 'bg-blue-50 text-gymblue-600'
        }`}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
      <p
        className={`text-lg leading-relaxed ${
          dark ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {description}
      </p>
    </div>
  </div>
);

export const BrandsFeatures: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-sm font-bold text-gymblue-600 uppercase tracking-widest mb-3">
            Capabilities
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Everything you need to run a <br />
            <span className="text-gymblue-600">
              world-class digital fitness program.
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Bento Grid Layout */}

          <FeatureCard
            title="White-Labeled Experiences"
            description="Personalized workouts, recovery, and wellness content delivered via SMS in your brand's voice and tone."
            icon={<Smartphone className="h-6 w-6" />}
            className="lg:col-span-2 lg:row-span-1"
          />

          <FeatureCard
            title="AI-Driven Personalization"
            description="Programming adapts to goals, skill level, schedule, equipment, and interests across fitness, mobility, and recovery."
            icon={<Cpu className="h-6 w-6" />}
            dark={true}
          />

          <FeatureCard
            title="Two-Way Engagement"
            description="Customers can text back with questions, feedback, or needs, creating a conversational experience instead of one-way content."
            icon={<MessageCircle className="h-6 w-6" />}
          />

          <FeatureCard
            title="Retention & Loyalty"
            description="Keep customers engaged between visits, trips, training sessions, or deployments with consistent value."
            icon={<Heart className="h-6 w-6" />}
          />

          <FeatureCard
            title="Revenue & Brand Extension"
            description="Support upsells, programs, events, merch, memberships, or partner offerings through targeted, relevant messaging."
            icon={<TrendingUp className="h-6 w-6" />}
          />

          <FeatureCard
            title="Operational Simplicity"
            description="No new systems for your customers to learn. No apps. No logins. GymText integrates seamlessly into existing workflows."
            icon={<Settings className="h-6 w-6" />}
            className="lg:col-span-3 bg-gradient-to-r from-white to-blue-50"
          />
        </div>
      </div>
    </section>
  );
};
