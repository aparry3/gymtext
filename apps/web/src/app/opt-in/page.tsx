import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SMS Opt-In Documentation - GymText',
  description: 'GymText SMS opt-in process documentation for Twilio 10DLC compliance',
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
                GymText SMS Opt-In Process
              </h1>
              <p className="mt-2 text-muted-foreground">
                Documentation for Twilio 10DLC Campaign Submission
              </p>
            </div>

            {/* Program Overview */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Program Overview
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
                    Daily workout messages (approximately 30 messages per month). Message frequency may vary.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Opt-In Method:</dt>
                  <dd className="text-muted-foreground ml-4">
                    Double opt-in via website checkbox with explicit SMS consent
                  </dd>
                </div>
              </dl>
            </section>

            {/* Step-by-Step Opt-In Flow */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Complete Opt-In Flow (Step-by-Step)
              </h2>
              
              {/* Step 1: Visit Start Page */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Step 1: User visits /start page
                </h3>
                <p className="text-muted-foreground mb-4">
                  Users begin the signup process at <a href="https://gymtext.com/start" className="text-primary hover:underline">gymtext.com/start</a>
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">Screenshot: Landing on /start page showing questionnaire introduction</p>
                </div>
              </div>

              {/* Step 2: Questionnaire */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Step 2: User completes questionnaire
                </h3>
                <p className="text-muted-foreground mb-4">
                  Users answer questions about their fitness goals, experience level, and preferences.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">Screenshot: Example questionnaire screen (e.g., "What are your fitness goals?")</p>
                </div>
              </div>

              {/* Step 3: Phone Number */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Step 3: User provides phone number
                </h3>
                <p className="text-muted-foreground mb-4">
                  Users enter their mobile phone number in the questionnaire.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">Screenshot: Phone number input field</p>
                </div>
              </div>

              {/* Step 4: SMS Consent - THE CRITICAL STEP */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Step 4: User provides explicit SMS consent ⭐
                </h3>
                <p className="text-muted-foreground mb-4">
                  Users must check <strong>both consent checkboxes</strong> to continue. The first checkbox contains the complete SMS consent disclosure.
                </p>
                
                {/* SMS Consent Text - Verbatim */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-4">
                  <h4 className="font-semibold text-foreground mb-3">SMS Consent Text (Verbatim):</h4>
                  <div className="bg-white rounded p-4 border border-blue-200">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" disabled />
                      <span className="text-sm text-foreground leading-relaxed">
                        By checking this box, I agree to receive recurring automated fitness and workout text messages from GymText
                        at the mobile number provided. You will receive daily workout messages. Message frequency may vary. Message
                        and data rates may apply. Reply HELP for help or STOP to cancel. Your mobile information will not be shared
                        with third parties.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Terms & Privacy Consent */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-4">
                  <h4 className="font-semibold text-foreground mb-3">Terms & Privacy Consent:</h4>
                  <div className="bg-white rounded p-4 border border-gray-200">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" disabled />
                      <span className="text-sm text-foreground leading-relaxed">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">Screenshot: Phone number screen with both consent checkboxes visible and checked</p>
                </div>
              </div>

              {/* Step 5: Payment */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Step 5: User completes payment via Stripe
                </h3>
                <p className="text-muted-foreground mb-4">
                  After providing consent, users are redirected to Stripe checkout to complete payment.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">Screenshot: Stripe checkout page</p>
                </div>
              </div>

              {/* Step 6: Confirmation */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Step 6: User receives confirmation messages
                </h3>
                <p className="text-muted-foreground mb-4">
                  After successful payment, users receive SMS confirmation and begin receiving daily workout messages.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">Screenshot: Welcome/confirmation text message on phone</p>
                </div>
              </div>
            </section>

            {/* STOP/HELP Keywords */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                User Controls & Keywords
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="font-semibold text-foreground">STOP:</dt>
                    <dd className="text-muted-foreground ml-4">
                      Users can text STOP to any GymText message to immediately opt out and stop receiving messages.
                      They will receive a confirmation message that they have been unsubscribed.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">HELP:</dt>
                    <dd className="text-muted-foreground ml-4">
                      Users can text HELP to any GymText message to receive support information and contact details.
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Required Disclosures */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Required Disclosures
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li><strong>Message Frequency:</strong> Daily workout messages (approximately 30 messages per month). Message frequency may vary.</li>
                  <li><strong>Message & Data Rates:</strong> Message and data rates may apply based on your mobile carrier plan.</li>
                  <li><strong>Privacy:</strong> Your mobile information will not be shared with third parties or affiliates for marketing purposes.</li>
                  <li><strong>Opt-Out:</strong> Reply STOP to any message to cancel.</li>
                  <li><strong>Help:</strong> Reply HELP for support.</li>
                  <li><strong>Terms of Service:</strong> <Link href="/terms" className="text-primary hover:underline">gymtext.com/terms</Link></li>
                  <li><strong>Privacy Policy:</strong> <Link href="/privacy" className="text-primary hover:underline">gymtext.com/privacy</Link></li>
                </ul>
              </div>
            </section>

            {/* Support Information */}
            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Support
              </h2>
              <p className="text-muted-foreground mb-3">For help with GymText:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Text HELP to any GymText message</li>
                <li>Email: <a href="mailto:support@gymtext.com" className="text-primary hover:underline">support@gymtext.com</a></li>
                <li>Visit: <a href="https://gymtext.com" className="text-primary hover:underline">gymtext.com</a></li>
              </ul>
            </section>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-sm text-muted-foreground">
              <p>Last updated: March 6, 2026</p>
              <p className="mt-2">
                This page documents the GymText SMS opt-in process for Twilio 10DLC campaign registration compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
