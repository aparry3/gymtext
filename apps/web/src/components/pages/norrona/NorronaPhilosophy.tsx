import React from 'react';
import Image from 'next/image';

export const NorronaPhilosophy: React.FC = () => {
  return (
    <section className="bg-norr-gray py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Brand Alignment */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">Performance Driven.<br/>Nature Forward.</h2>
              <p className="text-lg text-gray-700 font-light leading-relaxed mb-8">
                Norrøna builds gear for the harshest environments on earth. Gymtext builds training that fits into real life.
              </p>
              <p className="text-lg text-gray-700 font-light leading-relaxed mb-8">
                This partnership is founded on a shared belief: Preparation is the key to enjoyment. Whether you&apos;re skinning up a ridge or trekking through a valley, your body is your most important piece of equipment.
              </p>
              <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                 <span className="font-bold text-xl tracking-tight">NORRØNA</span>
                 <span className="text-xl">×</span>
                 <Image
                   src="/Wordmark.png"
                   alt="GymText"
                   width={108}
                   height={24}
                   className="h-6 w-auto"
                 />
              </div>
            </div>
          </div>

          {/* Why Text Features */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 lg:p-16 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-12">Why text-based training?</h3>

              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Zero Friction</h4>
                    <p className="text-gray-600 leading-relaxed">No apps to download. No logins to remember. Your workout arrives like a message from a friend.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Built for Outdoors</h4>
                    <p className="text-gray-600 leading-relaxed">Whether you&apos;re at the trailhead with spotty service or in a lodge, SMS works. Access your training anywhere.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Real Human Coaching</h4>
                    <p className="text-gray-600 leading-relaxed">It&apos;s not a bot. Reply to your daily text and a real coach responds to adjust your plan or answer questions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
