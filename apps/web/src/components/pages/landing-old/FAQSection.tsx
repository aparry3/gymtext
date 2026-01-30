'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Do I need a gym membership?',
    answer:
      'Nope! We customize your workouts based on what equipment you have access to - from a full gym to just your bodyweight.',
  },
  {
    question: 'How quickly will you respond to my questions?',
    answer:
      'Most questions are answered within minutes during business hours, and within a few hours outside of that. You always get your daily workout first thing in the morning.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. No contracts, no commitment. Cancel with one simple text message: STOP.',
  },
  {
    question: 'What if I miss a day?',
    answer:
      'Life happens! Your program adapts. Just let us know and we\'ll adjust your plan accordingly.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Frequently Asked Questions
          </h2>

          <p className="text-center text-muted-foreground text-lg mb-12">
            Got questions? We&apos;ve got answers.
          </p>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left"
                  aria-expanded={openIndex === index}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                          openIndex === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Answer */}
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        openIndex === index
                          ? 'max-h-40 mt-4 opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
