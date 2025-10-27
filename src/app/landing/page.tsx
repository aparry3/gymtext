import { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';
import Image from 'next/image';
import { HeroSection } from '@/components/pages/landing/HeroSection';
import { BenefitsSection } from '@/components/pages/landing/BenefitsSection';
import { TestimonialsSection } from '@/components/pages/landing/TestimonialsSection';
import { ComparisonTable } from '@/components/pages/landing/ComparisonTable';
import { FAQSection } from '@/components/pages/landing/FAQSection';
import { MultiStepSignupForm } from '@/components/pages/landing/MultiStepSignupForm';

const bn = Bebas_Neue({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GymText - 24/7 Personal Training via Text Message',
  description:
    'Get personalized workouts, 24/7 coaching, and real results - all through simple text messages. No app downloads, no gym required. Just $29/month.',
  keywords:
    'fitness coaching, personal training, text message coaching, workout plans, fitness goals, online personal trainer, affordable training',
  openGraph: {
    title: 'GymText - 24/7 Personal Training via Text Message',
    description:
      'Your personal trainer, always in your pocket. Get personalized workouts and 24/7 coaching via text for just $29/month.',
    type: 'website',
    url: 'https://gymtext.com/landing',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Sticky Header */}
      <header className="bg-white py-4 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/IconInverse.png"
                alt="GymText Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <h2
                className={`text-3xl font-bold italic text-[#2d3748] ${bn.className}`}
              >
                GYMTEXT
              </h2>
            </div>

            {/* CTA in header on desktop */}
            <div className="hidden md:block">
              <a
                href="#signup"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <HeroSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* FAQ Section */}
        <FAQSection />

        {/* Signup Form Section */}
        <section id="signup" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  Start Your Transformation Today
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Answer a few questions so we can build your perfect program.
                  Takes less than 2 minutes.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-border">
                <MultiStepSignupForm />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Image
                  src="/IconInverse.png"
                  alt="GymText Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <h3
                  className={`text-2xl font-bold italic text-[#2d3748] ${bn.className}`}
                >
                  GYMTEXT
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your personal trainer, always in your pocket.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span>© 2025 GymText</span>
                <span>•</span>
                <span>No contracts</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
