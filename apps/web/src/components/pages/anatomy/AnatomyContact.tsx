'use client';

import React from 'react';
import Button from './Button';

const AnatomyContact: React.FC = () => {
  return (
    <section id="contact" className="pt-24 min-h-screen bg-anatomy-black">
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">

          <div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-white mb-8">
              Contact
            </h2>
            <p className="text-zinc-400 text-lg mb-12 font-light">
              Have questions about the partnership or your plan? Reach out to our concierge team directly.
            </p>

            <div className="space-y-8">
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Email</h4>
                <p className="text-zinc-400">concierge@gymtext.co</p>
              </div>
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Anatomy Locations</h4>
                <p className="text-zinc-400">Miami Beach &bull; Midtown &bull; Coconut Grove &bull; Doral &bull; Nashville</p>
              </div>
            </div>
          </div>

          <form className="bg-zinc-900/50 p-8 md:p-12 border border-zinc-800">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Name</label>
                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-white transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                <input type="email" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-white transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Message</label>
                <textarea rows={5} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-white transition-colors resize-none"></textarea>
              </div>
              <Button type="submit" variant="primary" fullWidth>Send Message</Button>
            </div>
          </form>

        </div>
      </div>
    </section>
  );
};

export default AnatomyContact;
