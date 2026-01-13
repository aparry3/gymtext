'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from './constants';
import Button from './Button';

const AnatomyFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="pt-24 min-h-screen bg-anatomy-black">
      <div className="container mx-auto px-6 md:px-12 py-12 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-white text-center mb-16">
          Frequently Asked
        </h2>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className={`border border-zinc-800 bg-zinc-950 transition-all duration-300 ${openIndex === index ? 'border-zinc-600' : ''}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 md:p-8 text-left focus:outline-none"
              >
                <span className="text-white font-bold uppercase tracking-wide pr-8">{faq.question}</span>
                {openIndex === index ? <Minus className="text-white flex-shrink-0" /> : <Plus className="text-zinc-500 flex-shrink-0" />}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 md:p-8 pt-0 text-zinc-400 leading-relaxed font-light">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-zinc-500 mb-6">Still have questions?</p>
          <Button href="#contact" variant="outline">Contact Support</Button>
        </div>
      </div>
    </section>
  );
};

export default AnatomyFaq;
