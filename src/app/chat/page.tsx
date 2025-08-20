import ChatContainer from '@/components/pages/chat/ChatContainer';
import Link from 'next/link';

export default function ChatOnboardingPage() {
  return (
    <main className="min-h-screen w-full">
      {/* Hero + Chat */}
      <section>
        <ChatContainer />
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Trusted by busy people getting stronger, fitter, and healthier
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <figure className="rounded-2xl border bg-white p-5 shadow-sm">
            <blockquote className="text-sm text-gray-700">“In two weeks I had a plan that actually fit my schedule—and I stuck to it. The SMS check-ins keep me honest.”</blockquote>
            <figcaption className="mt-3 text-xs text-gray-500">Jordan • 34 • New parent</figcaption>
          </figure>
          <figure className="rounded-2xl border bg-white p-5 shadow-sm">
            <blockquote className="text-sm text-gray-700">“GymText met me where I am. Dumbbells at home, 30 minutes a day. I’m stronger and have more energy.”</blockquote>
            <figcaption className="mt-3 text-xs text-gray-500">Ari • 29 • Remote worker</figcaption>
          </figure>
          <figure className="rounded-2xl border bg-white p-5 shadow-sm">
            <blockquote className="text-sm text-gray-700">“I stopped bouncing between programs. The plan adapts as I go, and the daily text nudges help.”</blockquote>
            <figcaption className="mt-3 text-xs text-gray-500">Sam • 41 • Weekend climber</figcaption>
          </figure>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">How GymText works</h3>
            <p className="mt-3 text-gray-600">
              We start with a short conversation to learn about your goals, constraints, and preferences.
              Our AI builds a structured plan—then we coach you by text so it stays simple and sustainable.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              <li>• Quick onboarding chat to capture essentials</li>
              <li>• Personalized plan with real progression</li>
              <li>• SMS guidance, reminders, and adjustments</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-900">What we’ll ask</div>
            <ul className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
              <li className="rounded-lg border bg-gray-50 px-3 py-2">Your goals</li>
              <li className="rounded-lg border bg-gray-50 px-3 py-2">Schedule & frequency</li>
              <li className="rounded-lg border bg-gray-50 px-3 py-2">Equipment available</li>
              <li className="rounded-lg border bg-gray-50 px-3 py-2">Injuries & constraints</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Example Conversations */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h3 className="text-xl font-semibold text-gray-900">See the conversation</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 text-xs font-medium text-gray-500">Goals</div>
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-900 text-[10px] font-semibold text-white inline-flex items-center justify-center">You</div>
              <div className="rounded-2xl bg-gray-900 px-3 py-2 text-xs text-white">I want to get stronger for climbing.</div>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-[10px] font-semibold text-white inline-flex items-center justify-center">GT</div>
              <div className="rounded-2xl border bg-white px-3 py-2 text-xs text-gray-900 shadow-sm">Great. How many days per week can you train?</div>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 text-xs font-medium text-gray-500">Equipment</div>
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-900 text-[10px] font-semibold text-white inline-flex items-center justify-center">You</div>
              <div className="rounded-2xl bg-gray-900 px-3 py-2 text-xs text-white">I have adjustable dumbbells and a bench.</div>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-[10px] font-semibold text-white inline-flex items-center justify-center">GT</div>
              <div className="rounded-2xl border bg-white px-3 py-2 text-xs text-gray-900 shadow-sm">Perfect. I’ll tailor your program around that setup.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h3 className="text-xl font-semibold text-gray-900">Why it works</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-900">Structured programming</div>
            <p className="mt-2 text-sm text-gray-700">Real mesocycles and progression—no random workouts.</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-900">Fits your life</div>
            <p className="mt-2 text-sm text-gray-700">Plans adapt to your time, equipment, and experience.</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-900">Coaching via SMS</div>
            <p className="mt-2 text-sm text-gray-700">Simple reminders and adjustments keep you consistent.</p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900">Getting started</h3>
          <ol className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-3">
            <li className="rounded-lg border bg-gray-50 px-3 py-3">1. Say hello and share your goals</li>
            <li className="rounded-lg border bg-gray-50 px-3 py-3">2. We build your plan in minutes</li>
            <li className="rounded-lg border bg-gray-50 px-3 py-3">3. Switch to SMS and start training</li>
          </ol>
          <div className="mt-6 text-sm text-gray-500">
            Prefer to sign up directly? <Link className="underline" href="/">Go back</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
