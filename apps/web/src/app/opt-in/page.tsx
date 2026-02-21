import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SMS Messaging Program - GymText',
  description: 'Information about GymText SMS messaging program and opt-in process',
};

export default function OptInPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <h1 className="text-4xl font-bold text-foreground">
                GymText SMS Messaging Program
              </h1>
              <p className="mt-2 text-muted-foreground">
                Automated daily workout messages delivered to your phone
              </p>
            </div>

            {/* How to Opt In */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How to Opt In
              </h2>
              <p className="text-muted-foreground mb-4">
                To receive workout messages from GymText, you must:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Visit <a href="https://gymtext.com/start" className="text-primary hover:underline">gymtext.com/start</a></li>
                <li>Complete the signup questionnaire</li>
                <li>Provide your mobile phone number</li>
                <li>Check the box to consent to receiving text messages</li>
                <li>Complete payment through Stripe checkout</li>
              </ol>
              <p className="text-muted-foreground mt-4">
                After successful payment, you will receive a confirmation message and begin receiving daily workout messages.
              </p>
            </section>

            {/* Program Details */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Program Information
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="font-semibold text-foreground">Program Name:</dt>
                  <dd className="text-muted-foreground ml-4">GymText</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Message Type:</dt>
                  <dd className="text-muted-foreground ml-4">Recurring automated workout and fitness messages</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Message Frequency:</dt>
                  <dd className="text-muted-foreground ml-4">
                    Daily (approximately 30 messages per month). Frequency may vary based on your program.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Cost:</dt>
                  <dd className="text-muted-foreground ml-4">
                    Standard message and data rates may apply based on your mobile carrier plan. 
                    GymText does not charge for text messages beyond your subscription fee.
                  </dd>
                </div>
              </dl>
            </section>

            {/* Required Disclosures */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Important Information
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2 text-foreground">
                <p className="font-medium">By opting in to GymText&apos;s messaging program, you agree to the following:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You will receive recurring automated text messages from GymText</li>
                  <li>Message and data rates may apply</li>
                  <li>Your mobile information will not be shared with third parties or affiliates for marketing purposes</li>
                  <li>You can opt out at any time by texting STOP to any GymText message</li>
                  <li>You can get help by texting HELP to any GymText message</li>
                  <li>For full terms, visit <a href="/terms" className="text-primary hover:underline">gymtext.com/terms</a></li>
                  <li>For our privacy policy, visit <a href="/privacy" className="text-primary hover:underline">gymtext.com/privacy</a></li>
                </ul>
              </div>
            </section>

            {/* Support */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Support
              </h2>
              <p className="text-muted-foreground mb-3">For help with GymText:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Text HELP to any GymText message</li>
                <li>Email: <a href="mailto:support@gymtext.com" className="text-primary hover:underline">support@gymtext.com</a></li>
                <li>Visit our support resources at <a href="/" className="text-primary hover:underline">gymtext.com</a></li>
              </ul>
            </section>

            {/* Opt Out */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How to Opt Out
              </h2>
              <p className="text-muted-foreground mb-3">
                You can stop receiving messages at any time by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Texting STOP to any message from GymText</li>
                <li>Canceling your subscription through your account settings</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You will receive a confirmation message that you have been unsubscribed. 
                You will not receive further messages unless you opt in again.
              </p>
            </section>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-sm text-muted-foreground">
              <p>Last updated: February 19, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
