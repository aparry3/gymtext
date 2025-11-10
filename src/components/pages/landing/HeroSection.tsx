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

function PhoneMockupVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Container uses intrinsic image ratio to lock proportions */}
      <div className="relative w-full">
        {/* Bezel defines aspect ratio */}
        <img
          src="/iPhone bezel.png"
          alt="iPhone frame"
          className="block w-full h-auto pointer-events-none z-10 relative"
        />

        {/* Video overlay — positioned with measured offsets */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-[3.7%] left-[6.9%] w-[86.2%] h-[93%] object-cover rounded-[2.3rem] z-0"
        >
          <source src="/GymTextDemo.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}