'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, Dumbbell, DollarSign } from 'lucide-react';

export function HeroSection() {
  const scrollToSignup = () => {
    const signupSection = document.getElementById('signup');
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        {/* Content */}
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground">
            Your <span className="text-primary-color">Personal Trainer</span> is Now{' '}
            <span className="text-primary">Always in Your <span className="text-primary-color">Pocket</span></span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Get <strong className="text-primary-color">personalized workouts</strong>, <strong className="text-primary-color">24/7 coaching</strong>,
            and <strong className="text-primary-color">real results</strong> - all through simple text messages.
            No app downloads, no gym required.
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">All via Text</div>
                <div className="text-xs text-muted-foreground">No apps, no hassle</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dumbbell className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Tailored to You</div>
                <div className="text-xs text-muted-foreground">Your goals, your pace</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">$9.99/month</div>
                <div className="text-xs text-muted-foreground">vs $200+ for trainers</div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={scrollToSignup}
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-6 h-auto"
            >
              Get Started - It Takes 2 Minutes
            </Button>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            <PhoneMockupVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple phone mockup component
function PhoneMockupVisual() {
  return (
    <div className="relative bg-white rounded-[3rem] shadow-2xl p-3 border-8 border-gray-800">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10"></div>

      {/* Screen */}
      <div className="bg-gray-50 rounded-[2.5rem] overflow-hidden h-[600px] relative">
        {/* Status bar */}
        <div className="bg-white px-6 py-3 flex justify-between items-center text-xs">
          <span className="font-semibold">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 mt-4">
          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Good morning! Ready for today&apos;s workout?
              </p>
            </div>
          </div>

          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Here&apos;s your personalized plan for today: Upper Body Strength
              </p>
            </div>
          </div>

          {/* Outgoing message */}
          <div className="flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-white">
                Let&apos;s do it!
              </p>
            </div>
          </div>

          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Great job yesterday! Let&apos;s build on that momentum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
