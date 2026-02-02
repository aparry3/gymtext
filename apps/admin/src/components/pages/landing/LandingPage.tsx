'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { HeroSection } from '@/components/pages/landing/HeroSection';
import { BenefitsSection } from '@/components/pages/landing/BenefitsSection';
import { TestimonialsSection } from '@/components/pages/landing/TestimonialsSection';
import { ComparisonTable } from '@/components/pages/landing/ComparisonTable';
import { FAQSection } from '@/components/pages/landing/FAQSection';
import { MultiStepSignupForm } from '@/components/pages/landing/MultiStepSignupForm';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 py-4 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Image
                  src="/Wordmark.png"
                  alt="GymText"
                  width={135}
                  height={30}
                  className="h-[30px] w-auto"
                />

                <nav className="hidden md:block">
                  <ul className="flex items-center gap-8">
                    <li>
                      <a
                        href="#home"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#details"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Details
                      </a>
                    </li>
                    <li>
                      <a
                        href="#testimonials"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Testimonials
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#faqs"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        FAQs
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="#signup"
                  className="hidden md:block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Sign up
                </a>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <nav className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#home"
                      onClick={handleNavClick}
                      className="block text-sm font-semibold text-foreground transition-colors hover:text-primary py-2"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#details"
                      onClick={handleNavClick}
                      className="block text-sm font-semibold text-foreground transition-colors hover:text-primary py-2"
                    >
                      Details
                    </a>
                  </li>
                  <li>
                    <a
                      href="#testimonials"
                      onClick={handleNavClick}
                      className="block text-sm font-semibold text-foreground transition-colors hover:text-primary py-2"
                    >
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a
                      href="#features"
                      onClick={handleNavClick}
                      className="block text-sm font-semibold text-foreground transition-colors hover:text-primary py-2"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faqs"
                      onClick={handleNavClick}
                      className="block text-sm font-semibold text-foreground transition-colors hover:text-primary py-2"
                    >
                      FAQs
                    </a>
                  </li>
                  <li>
                    <a
                      href="#signup"
                      onClick={handleNavClick}
                      className="block text-sm font-semibold text-primary transition-colors hover:text-primary/80 py-2"
                    >
                      Sign up
                    </a>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </header>

        <section id="home">
          <HeroSection />
        </section>
        <section id="details">
          <BenefitsSection />
        </section>
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        <section id="features">
          <ComparisonTable />
        </section>
        <section id="faqs">
          <FAQSection />
        </section>
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
            <div className="rounded-3xl border border-border/60 bg-white shadow-2xl">
              <MultiStepSignupForm />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center">
              <Image
                src="/Wordmark.png"
                alt="GymText"
                width={108}
                height={24}
                className="h-6 w-auto"
              />
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
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <a
                href="/terms"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Terms & Conditions
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="/privacy"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
