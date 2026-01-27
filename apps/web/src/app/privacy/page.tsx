import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | GymText',
  description: 'Privacy Policy for GymText fitness coaching service.',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: January 27, 2026
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                1. Introduction
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                GymText LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy
                and is committed to protecting your personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your
                information when you use our AI-powered fitness coaching service
                (&quot;Service&quot;).
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                By using GymText, you consent to the data practices described in this
                Privacy Policy. If you do not agree with our policies, please do not
                use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                2. Information We Collect
              </h2>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                2.1 Information You Provide
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                When you create an account and use our Service, we collect information
                you directly provide, including:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Contact Information:</strong> Mobile phone number, name
                </li>
                <li>
                  <strong>Fitness Profile Data:</strong> Age, gender, height, weight,
                  fitness goals, exercise experience level, available equipment,
                  workout preferences, and time availability
                </li>
                <li>
                  <strong>Health Information:</strong> Information about injuries,
                  physical limitations, or medical conditions you choose to share
                </li>
                <li>
                  <strong>Communication Data:</strong> Messages you send to our AI
                  coaching system, including questions, feedback, and workout updates
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing details processed
                  through our payment provider (we do not store full credit card
                  numbers)
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                2.2 Information Collected Automatically
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                When you access the Service, we automatically collect certain
                information:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Device Information:</strong> Device type, operating system,
                  browser type, and unique device identifiers
                </li>
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used, time
                  spent on the Service, and interaction patterns
                </li>
                <li>
                  <strong>Log Data:</strong> IP address, access times, and referring
                  URLs
                </li>
                <li>
                  <strong>Location Data:</strong> General location based on IP address
                  (we do not collect precise GPS location)
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                2.3 Workout and Progress Data
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We collect and store data related to your fitness journey:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Generated workout plans and exercise programs</li>
                <li>Workout completion status and history</li>
                <li>Exercise performance metrics you report</li>
                <li>Progress notes and adjustments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                3. How We Use Your Information
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Provide the Service:</strong> Generate personalized workout
                  plans, deliver AI coaching responses, and track your fitness progress
                </li>
                <li>
                  <strong>Communicate with You:</strong> Send workout reminders, daily
                  messages, account notifications, and respond to your inquiries via
                  SMS
                </li>
                <li>
                  <strong>Process Payments:</strong> Handle subscription billing and
                  payment transactions securely
                </li>
                <li>
                  <strong>Improve the Service:</strong> Analyze usage patterns to
                  enhance our AI coaching algorithms and user experience
                </li>
                <li>
                  <strong>Personalize Your Experience:</strong> Tailor workout
                  recommendations based on your profile, preferences, and progress
                </li>
                <li>
                  <strong>Ensure Security:</strong> Detect and prevent fraud,
                  unauthorized access, and other harmful activities
                </li>
                <li>
                  <strong>Comply with Legal Obligations:</strong> Fulfill our legal
                  and regulatory requirements
                </li>
                <li>
                  <strong>Internal Review:</strong> Our team may review your
                  conversations and profile information to improve our AI coaching
                  quality, identify issues, and enhance the overall user experience.
                  This data is only reviewed internally for product improvement
                  purposes.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                4. Third-Party Service Providers
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We share your information with trusted third-party service providers
                who assist us in operating the Service:
              </p>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                4.1 Twilio (SMS Communications)
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use Twilio to send and receive SMS messages. When you communicate
                with GymText via text message, Twilio processes your phone number and
                message content.{' '}
                <a
                  href="https://www.twilio.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Twilio&apos;s Privacy Policy
                </a>
              </p>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                4.2 Stripe (Payment Processing)
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use Stripe to process subscription payments. Stripe collects and
                processes your payment information securely. We do not store your full
                credit card details.{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Stripe&apos;s Privacy Policy
                </a>
              </p>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                4.3 AI Services (OpenAI and Google)
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use artificial intelligence services from OpenAI and Google to power
                our coaching conversations and workout plan generation. Your messages
                and fitness data are processed by these AI systems to generate
                personalized responses.{' '}
                <a
                  href="https://openai.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI&apos;s Privacy Policy
                </a>
                {' | '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google&apos;s Privacy Policy
                </a>
              </p>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                4.4 Pinecone (Data Indexing)
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use Pinecone for efficient data indexing and retrieval to enhance
                the AI&apos;s ability to provide relevant coaching responses.{' '}
                <a
                  href="https://www.pinecone.io/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Pinecone&apos;s Privacy Policy
                </a>
              </p>

              <h3 className="mb-3 text-xl font-medium text-foreground">
                4.5 Hosting and Infrastructure
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Our Service is hosted on secure cloud infrastructure. Your data is
                stored on servers located in the United States.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                5. Data Retention
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We retain your personal information for as long as your account is
                active or as needed to provide the Service. Specifically:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Account Data:</strong> Retained while your account is active
                  and for up to 30 days after deletion request
                </li>
                <li>
                  <strong>Conversation History:</strong> Retained for the duration of
                  your subscription to provide context for AI coaching
                </li>
                <li>
                  <strong>Workout History:</strong> Retained to track your progress and
                  improve recommendations
                </li>
                <li>
                  <strong>Payment Records:</strong> Retained as required for tax and
                  accounting purposes (typically 7 years)
                </li>
                <li>
                  <strong>Usage Analytics:</strong> Retained in aggregated,
                  anonymized form for service improvement
                </li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                After account deletion, we may retain certain information as required
                by law or for legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                6. Your Rights and Choices
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal information
                  we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account and
                  personal data (subject to legal retention requirements)
                </li>
                <li>
                  <strong>Portability:</strong> Request a copy of your data in a
                  portable format
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing communications
                  (note: you cannot opt out of Service-related messages while
                  subscribed)
                </li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                To exercise these rights, contact us at{' '}
                <a
                  href="mailto:support@gymtext.com"
                  className="text-primary hover:underline"
                >
                  support@gymtext.com
                </a>
                . We will respond to your request within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                7. California Privacy Rights (CCPA)
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you are a California resident, you have additional rights under the
                California Consumer Privacy Act (CCPA):
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Right to Know:</strong> Request disclosure of the categories
                  and specific pieces of personal information we have collected
                </li>
                <li>
                  <strong>Right to Delete:</strong> Request deletion of your personal
                  information, subject to certain exceptions
                </li>
                <li>
                  <strong>Right to Opt-Out:</strong> We do not sell personal
                  information, so this right does not apply
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> We will not
                  discriminate against you for exercising your privacy rights
                </li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                To exercise your CCPA rights, contact us at{' '}
                <a
                  href="mailto:support@gymtext.com"
                  className="text-primary hover:underline"
                >
                  support@gymtext.com
                </a>{' '}
                or call us at the number provided on our website.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                <strong>Categories of Information Collected:</strong> Identifiers
                (phone number, name), fitness and health information, commercial
                information (purchase history), internet activity, and inferences drawn
                from this data.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                <strong>We Do Not Sell or Share Personal Information:</strong> GymText
                does not sell or share your personal information, including your
                conversations and profile data, with third parties. Your data is used
                solely to provide and improve our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                8. Data Security
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to
                protect your personal information, including:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and monitoring</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                However, no method of transmission over the Internet or electronic
                storage is 100% secure. While we strive to protect your information, we
                cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                9. Children&apos;s Privacy
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                GymText is not intended for use by anyone under 18 years of age. We do
                not knowingly collect personal information from children under 18. If
                we learn that we have collected information from a child under 18, we
                will take steps to delete that information promptly.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you believe we have inadvertently collected information from a minor,
                please contact us immediately at{' '}
                <a
                  href="mailto:support@gymtext.com"
                  className="text-primary hover:underline"
                >
                  support@gymtext.com
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                10. International Data Transfers
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other
                than your country of residence, including the United States. These
                countries may have different data protection laws. By using the Service,
                you consent to the transfer of your information to the United States
                and other jurisdictions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                11. Cookies and Tracking Technologies
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies on our website to:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Authenticate your account and maintain your session</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve our Service and user experience</li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. Disabling
                cookies may affect the functionality of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                12. Changes to This Privacy Policy
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you
                of any material changes by posting the updated policy on our website
                and updating the &quot;Last updated&quot; date. We encourage you to review this
                Privacy Policy periodically.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Your continued use of the Service after changes to this Privacy Policy
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                13. Contact Us
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy
                Policy or our data practices, please contact us:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>GymText LLC</strong>
                <br />
                Email:{' '}
                <a
                  href="mailto:support@gymtext.com"
                  className="text-primary hover:underline"
                >
                  support@gymtext.com
                </a>
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We will respond to privacy-related inquiries within 30 days.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
