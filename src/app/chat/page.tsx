import ChatContainer from '@/components/pages/chat/ChatContainer';
import Link from 'next/link';

export default function ChatOnboardingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Personalized fitness onboarding</h1>
        <p className="mt-3 text-gray-600">Tell us your goals. We’ll build your plan and move you to SMS coaching.</p>
      </section>

      <section className="mt-10">
        <ChatContainer />
      </section>

      <section className="mt-16 space-y-6 text-gray-700">
        <h2 className="text-2xl font-semibold">Why GymText?</h2>
        <ul className="list-disc pl-6">
          <li>AI-powered personalization with real coaching structure</li>
          <li>Simple SMS experience once you’re set up</li>
          <li>Flexible plans that fit your equipment and schedule</li>
        </ul>
        <div className="text-sm">
          Prefer to sign up directly? <Link className="underline" href="/">Go back</Link>
        </div>
      </section>
    </main>
  );
}
