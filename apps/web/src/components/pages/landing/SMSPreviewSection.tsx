'use client';

import { CheckCircle2, Zap, ClipboardList } from 'lucide-react';

export function SMSPreviewSection() {
  return (
    <section id="demo" className="py-24 bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 order-2 lg:order-1 flex justify-center">
            {/* Phone Mockup */}
            <div className="relative w-[320px] sm:w-[350px] bg-slate-950 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
              <div className="h-[650px] bg-slate-950 flex flex-col p-4 pt-12 relative">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1B81FF] flex items-center justify-center font-bold text-white">
                    GT
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Coach Mike
                    </div>
                    <div className="text-xs text-slate-400">
                      GymText - Today 6:00 AM
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex flex-col gap-4 overflow-hidden">
                  {/* Message 1 */}
                  <div
                    className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-200 shadow-sm self-start max-w-[90%] animate-slide-up"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <p className="mb-2 font-semibold text-[#5BA3FF]">
                      Morning Alex! Upper Body Power today.
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li>Warm up: 5 min row</li>
                      <li>1A. Bench Press 4x8</li>
                      <li>1B. Pull-ups 4xMax</li>
                      <li>2. Overhead Press 3x10</li>
                      <li>3. Face Pulls 3x15</li>
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">
                      Reply &quot;DONE&quot; when finished!
                    </p>
                  </div>

                  {/* Message 2 (User) */}
                  <div
                    className="bg-[#1B81FF] rounded-2xl rounded-tr-sm p-3 text-sm text-white shadow-sm self-end max-w-[80%] animate-slide-up"
                    style={{ animationDelay: '1.5s' }}
                  >
                    On it! Feeling strong today.
                  </div>

                  {/* Message 3 */}
                  <div
                    className="bg-slate-800 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-200 shadow-sm self-start max-w-[90%] animate-slide-up"
                    style={{ animationDelay: '3s' }}
                  >
                    Love to hear it. Focus on explosive tempo for the press.
                    Let&apos;s get it!
                  </div>
                </div>

                {/* Input area mockup */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-slate-950 border-t border-slate-800">
                  <div className="h-10 bg-slate-900 rounded-full flex items-center px-4 text-xs text-slate-500">
                    Text Message
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Real Coaching. <br />
              <span className="text-[#1B81FF]">In Your Pocket.</span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
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
                  <h4 className="text-white font-bold text-lg">
                    No App Required
                  </h4>
                  <p className="text-slate-400">
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
                  <h4 className="text-white font-bold text-lg">
                    Instant Accountability
                  </h4>
                  <p className="text-slate-400">
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
                  <h4 className="text-white font-bold text-lg">
                    Intelligent Progression
                  </h4>
                  <p className="text-slate-400">
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
