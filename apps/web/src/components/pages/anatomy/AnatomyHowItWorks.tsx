'use client';

import React from 'react';
import TextBubble from './TextBubble';
import Button from './Button';

const AnatomyHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="pt-24 bg-anatomy-black">
      {/* Header */}
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-24 text-center">
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white mb-6">
          Personal Training <br /> <span className="text-zinc-500">In Your Pocket</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light">
          We removed the friction of apps and scheduling. Your coach lives in your text messages, ready when you are.
        </p>
      </div>

      {/* Split Section: Onboarding & SMS Demo */}
      <div className="container mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Steps Detail */}
          <div className="space-y-16">
            <div>
              <span className="text-4xl font-bold text-zinc-800 block mb-4">01</span>
              <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-4">The Profile</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We start by understanding your baseline. We ask about your goals (hypertrophy, endurance, mobility), your available equipment (full gym, dumbbells only, bodyweight), and your schedule.
              </p>
              <ul className="text-sm text-zinc-500 space-y-2 uppercase tracking-wide">
                <li>• Injury History</li>
                <li>• Preferred Training Days</li>
                <li>• Anatomy Class Integration</li>
              </ul>
            </div>

            <div>
              <span className="text-4xl font-bold text-zinc-800 block mb-4">02</span>
              <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-4">The Daily Text</h3>
              <p className="text-zinc-400 leading-relaxed">
                Every morning (or evening, your choice), you receive your workout. It&apos;s formatted clearly with sets, reps, and tempo. Click any exercise for a video demo.
              </p>
            </div>

            <div>
              <span className="text-4xl font-bold text-zinc-800 block mb-4">03</span>
              <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-4">Real-Time Coaching</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Need a substitution? Back hurts? Only have 20 minutes today? Just reply. Your coach adjusts the plan instantly.
              </p>
              <Button href="#plans" variant="primary">Start Your Profile</Button>
            </div>
          </div>

          {/* Right: SMS Visualization */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md mx-auto w-full shadow-2xl relative">
            {/* Phone Frame Mockup UI */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>

            <div className="flex flex-col h-[600px] overflow-y-auto scrollbar-hide pt-4">
              <div className="text-center text-xs text-zinc-600 mb-6 uppercase tracking-widest">Today 7:00 AM</div>

              <TextBubble
                sender="coach"
                message="Good morning James. Ready for leg day? We're focusing on squats and volume today."
                time="7:01 AM"
              />

              <div className="my-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Lower Body Focus</h4>
                <ul className="text-xs text-zinc-400 space-y-2 font-mono">
                  <li>A1. Back Squat: 4x6 @ 75%</li>
                  <li>B1. RDL: 3x10</li>
                  <li>C1. Walking Lunges: 3x12/leg</li>
                  <li>D1. Leg Press: 3x15 (failure)</li>
                </ul>
              </div>

              <TextBubble
                sender="user"
                message="Gym is packed. Squat racks are taken. Any subs?"
                time="7:15 AM"
              />

              <TextBubble
                sender="coach"
                message="No problem. Let's swap Back Squat for Heavy Goblet Squats (hold a DB at chest). Go 4x10 instead of 4x6 to make up for lighter weight. Keep rest short."
                time="7:16 AM"
              />

              <TextBubble
                sender="user"
                message="Perfect. On it."
                time="7:17 AM"
              />
            </div>

            {/* Input Area Mockup */}
            <div className="mt-4 pt-4 border-t border-zinc-900 flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-zinc-800"></div>
              <div className="flex-1 h-8 bg-zinc-900 rounded-full"></div>
              <div className="w-8 h-8 rounded-full bg-blue-600"></div>
            </div>
          </div>

        </div>
      </div>

      {/* Complements Anatomy */}
      <div className="bg-zinc-900 py-24">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h3 className="text-3xl font-bold uppercase tracking-widest text-white mb-12">The Anatomy Advantage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 border border-zinc-800 bg-zinc-950">
              <h4 className="text-white font-bold uppercase tracking-wider mb-4">Class Integration</h4>
              <p className="text-zinc-500 text-sm">We can see your class schedule. If you do Barry&apos;s or a HIIT class on Tuesday, we&apos;ll program active recovery or upper body stability, not heavy legs.</p>
            </div>
            <div className="p-8 border border-zinc-800 bg-zinc-950">
              <h4 className="text-white font-bold uppercase tracking-wider mb-4">Travel continuity</h4>
              <p className="text-zinc-500 text-sm">Anatomy members travel often. We ensure your progress doesn&apos;t stall when you leave Miami. Hotel gym or no gym, we have a plan.</p>
            </div>
            <div className="p-8 border border-zinc-800 bg-zinc-950">
              <h4 className="text-white font-bold uppercase tracking-wider mb-4">Recovery Focus</h4>
              <p className="text-zinc-500 text-sm">We prioritize longevity. If you report soreness or fatigue via text, we immediately downgrade intensity to prevent injury.</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS MINI */}
      <div className="py-32 bg-anatomy-black text-center">
        <div className="container mx-auto px-6 md:px-12">
          <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-white mb-16">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Tell Us Your Goals", desc: "Complete a quick profile about your schedule, equipment, and injuries." },
              { step: "02", title: "Get Your First Workout", desc: "Receive your tailored plan via text. No login required." },
              { step: "03", title: "Train & Adapt", desc: "Reply anytime to adjust the plan, ask questions, or get subs." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center text-xl font-bold text-white mb-8">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold uppercase tracking-widest text-white mb-4">{item.title}</h4>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnatomyHowItWorks;
