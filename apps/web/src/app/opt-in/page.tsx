import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'SMS Opt-In & Messaging Policy | GymText',
  description:
    'Learn how GymText SMS messaging works, how to opt in and opt out, message frequency, and your rights as a subscriber.',
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

          <h1 className="mb-4 text-4xl font-bold text-foreground">
            SMS Opt-In & Messaging Policy
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: March 7, 2026
          </p>

          <div className="prose prose-gray max-w-none">
            {/* Program Description */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                1. Program Description
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                GymText is an AI-powered fitness coaching service that delivers
                personalized workout plans and coaching directly to your phone
                via SMS text messages. When you sign up, you will receive:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Daily personalized workout instructions</li>
                <li>AI coaching responses when you text back with questions</li>
                <li>Plan updates and progress-based adjustments</li>
                <li>Account and subscription notifications</li>
              </ul>
            </section>

            {/* How You Opt In */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                2. How You Opt In
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You opt in to receive SMS messages from GymText by completing
                our online sign-up process at{' '}
                <a
                  href="https://gymtext.co"
                  className="text-primary hover:underline"
                >
                  gymtext.co
                </a>
                . During sign-up, you provide your mobile phone number and
                explicitly consent to receive messages by checking the consent
                checkbox before submitting.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                The consent checkbox states:
              </p>
              <blockquote className="mb-4 border-l-4 border-primary/30 bg-gray-50 p-4 text-muted-foreground italic">
                &quot;By checking this box, I agree to receive recurring
                automated fitness and workout text messages from GymText at the
                mobile number provided. You will receive daily workout messages.
                Message frequency may vary. Message and data rates may apply.
                Reply HELP for help or STOP to cancel. Your mobile information
                will not be shared with third parties.&quot;
              </blockquote>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You must also agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                before completing sign-up. Both checkboxes are required &mdash;
                you cannot sign up without providing explicit consent.
              </p>

              {/* Screenshots of the opt-in flow */}
              <div className="my-8 space-y-6">
                <p className="text-sm font-medium text-foreground">
                  Screenshots of the opt-in process:
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <figure className="overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src="/compliance/signup-desktop.png"
                      alt="GymText sign-up page on desktop showing phone number field, SMS consent checkbox, and Terms/Privacy checkbox"
                      width={800}
                      height={500}
                      className="w-full"
                    />
                    <figcaption className="bg-gray-50 px-4 py-2 text-center text-xs text-muted-foreground">
                      Desktop: Sign-up page with consent checkboxes
                    </figcaption>
                  </figure>

                  <figure className="overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src="/compliance/signup-mobile.png"
                      alt="GymText sign-up page on mobile showing phone number field, SMS consent checkbox, and Terms/Privacy checkbox"
                      width={400}
                      height={800}
                      className="mx-auto w-full max-w-xs"
                    />
                    <figcaption className="bg-gray-50 px-4 py-2 text-center text-xs text-muted-foreground">
                      Mobile: Sign-up page with consent checkboxes
                    </figcaption>
                  </figure>
                </div>

                <figure className="overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src="/compliance/consent-closeup.png"
                    alt="Close-up of the SMS consent checkbox language on the GymText sign-up form"
                    width={1000}
                    height={400}
                    className="w-full"
                  />
                  <figcaption className="bg-gray-50 px-4 py-2 text-center text-xs text-muted-foreground">
                    Close-up: SMS consent language
                  </figcaption>
                </figure>
              </div>
            </section>

            {/* Confirmation Message */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                3. Opt-In Confirmation
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                After you sign up, you will receive an initial welcome message
                confirming your enrollment in the GymText program. This message
                includes instructions on how to opt out and a reminder that
                message and data rates may apply.
              </p>

              <div className="my-6 flex justify-center">
                <figure className="overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src="/compliance/welcome-message.png"
                    alt="GymText welcome SMS confirming opt-in with opt-out instructions"
                    width={350}
                    height={700}
                    className="mx-auto w-full max-w-xs"
                  />
                  <figcaption className="bg-gray-50 px-4 py-2 text-center text-xs text-muted-foreground">
                    Welcome message confirming enrollment
                  </figcaption>
                </figure>
              </div>
            </section>

            {/* Sample Messages */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                4. Sample Messages
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Below is an example of the daily workout messages you will
                receive. Each message includes your personalized workout
                instructions for the day, tailored to your fitness goals and
                training plan.
              </p>

              <div className="my-6 flex justify-center">
                <figure className="overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src="/compliance/workout-example.png"
                    alt="Example daily workout SMS from GymText with detailed exercise instructions"
                    width={350}
                    height={700}
                    className="mx-auto w-full max-w-xs"
                  />
                  <figcaption className="bg-gray-50 px-4 py-2 text-center text-xs text-muted-foreground">
                    Example daily workout message
                  </figcaption>
                </figure>
              </div>
            </section>

            {/* Message Frequency */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                5. Message Frequency
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You will receive approximately 1&ndash;3 messages per day,
                including your daily workout and any coaching responses when you
                text back. Message frequency may vary based on your interactions
                with the service and your training schedule.
              </p>
            </section>

            {/* Message and Data Rates */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                6. Message and Data Rates
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Message and data rates may apply. GymText does not charge for
                SMS messages, but your mobile carrier may charge standard
                messaging fees. Check with your carrier for details about your
                text messaging plan.
              </p>
            </section>

            {/* How to Opt Out */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                7. How to Opt Out
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You can opt out of GymText SMS messages at any time by texting{' '}
                <strong>STOP</strong> to any message you receive from us. You
                will receive a final confirmation message acknowledging your
                opt-out request, and no further messages will be sent.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You may also opt out by:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Canceling your subscription through your account settings
                </li>
                <li>
                  Contacting us at{' '}
                  <a
                    href="mailto:support@gymtext.co"
                    className="text-primary hover:underline"
                  >
                    support@gymtext.co
                  </a>
                </li>
              </ul>
            </section>

            {/* How to Get Help */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                8. How to Get Help
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you need assistance, you can text <strong>HELP</strong> to
                any message from GymText to receive support information. You can
                also reach us at:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:support@gymtext.co"
                    className="text-primary hover:underline"
                  >
                    support@gymtext.co
                  </a>
                </li>
              </ul>
            </section>

            {/* Privacy & Data Sharing */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                9. Privacy & Data Sharing
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Your mobile phone number and personal information will not be
                shared with third parties for marketing or promotional purposes.
                We only use your information to deliver the GymText service as
                described. For full details on how we handle your data, please
                see our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                No mobile information will be shared with third parties or
                affiliates for marketing or promotional purposes.
              </p>
            </section>

            {/* Consent Not Required for Purchase */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                10. Consent Is Not a Condition of Purchase
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Consent to receive SMS messages is not a condition of purchasing
                any goods or services. However, because GymText delivers its
                core service via SMS, opting out of messages will affect your
                ability to receive workout instructions.
              </p>
            </section>

            {/* Supported Carriers */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                11. Supported Carriers
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                GymText is compatible with most major US mobile carriers,
                including AT&T, T-Mobile, Verizon, Sprint, and others. Carriers
                are not liable for delayed or undelivered messages.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                12. Contact Information
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you have any questions about this SMS policy, please contact
                us:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>GymText LLC</strong>
                <br />
                Email:{' '}
                <a
                  href="mailto:support@gymtext.co"
                  className="text-primary hover:underline"
                >
                  support@gymtext.co
                </a>
              </p>
            </section>

            {/* Links */}
            <section className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Related Policies
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
