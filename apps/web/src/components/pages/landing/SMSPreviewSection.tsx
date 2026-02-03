'use client';

import { CheckCircle2, Zap, ClipboardList } from 'lucide-react';

export function SMSPreviewSection() {
  return (
    <section id="demo" className="py-24 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex justify-center">
            {/* Phone Mockup with Video */}
            <div className="relative w-full max-w-sm mx-auto">
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
          </div>

          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Real Coaching. <br />
              <span className="text-[#1B81FF]">In Your Pocket.</span>
            </h2>
            <p className="text-lg mb-8 leading-relaxed text-gray-600">
              Most fitness apps are just databases of exercises. GymText is a
              direct line to your daily routine. It&apos;s human, interactive,
              and frictionless.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#1B81FF]/10 rounded-lg text-[#1B81FF] mt-1">
                  <CheckCircle2 size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg text-gray-900">
                    No App Required
                  </h4>
                  <p className="text-gray-500">
                    Don&apos;t waste time loading heavy apps. It&apos;s just a
                    text.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#1B81FF]/10 rounded-lg text-[#1B81FF] mt-1">
                  <Zap size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg text-gray-900">
                    Instant Accountability
                  </h4>
                  <p className="text-gray-500">
                    Knowing your coach is waiting for a reply changes
                    everything.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#1B81FF]/10 rounded-lg text-[#1B81FF] mt-1">
                  <ClipboardList size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg text-gray-900">
                    Intelligent Progression
                  </h4>
                  <p className="text-gray-500">
                    We track your weights and adjust over time. Progressive
                    overload made easy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
