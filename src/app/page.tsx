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
    url: 'https://gymtext.com',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 py-4 backdrop-blur-sm">
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

              <div className="hidden md:block">
                <a
                  href="#signup"
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </header>

        <HeroSection />
        <BenefitsSection />
        <TestimonialsSection />
        <ComparisonTable />
        <FAQSection />
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                Start Your Transformation Today
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Answer a few questions so we can build your perfect program. Takes less than 2 minutes.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section
        id="signup"
        className="bg-white pb-16 md:pb-24 scroll-mt-24 md:scroll-mt-32"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-border bg-white shadow-2xl">
              <MultiStepSignupForm />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
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
            <p className="mb-4 text-muted-foreground">
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
  );
}
