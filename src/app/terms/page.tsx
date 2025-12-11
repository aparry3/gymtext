import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | GymText',
  description: 'Terms and Conditions for using GymText fitness coaching service.',
};

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: December 10, 2025
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                1. Agreement to Terms
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                By accessing or using the GymText service (&quot;Service&quot;), you agree to be
                bound by these Terms and Conditions (&quot;Terms&quot;). If you disagree with any
                part of these terms, you do not have permission to access the Service.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                These Terms apply to all visitors, users, and others who access or use
                the Service. GymText LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) reserves
                the right to modify these Terms at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                2. Description of Service
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                GymText is an AI-powered fitness coaching service that delivers
                personalized workout plans and coaching via SMS text messaging. Our
                Service uses artificial intelligence to analyze your fitness profile and
                provide customized workout recommendations, progress tracking, and
                motivational support.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                The Service includes:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Personalized fitness plan generation</li>
                <li>Daily workout recommendations via SMS</li>
                <li>AI-powered coaching conversations</li>
                <li>Progress tracking and plan adjustments</li>
                <li>Access to workout history and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                3. Eligibility
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You must be at least 18 years old to use the Service. By using GymText,
                you represent and warrant that you are at least 18 years of age and have
                the legal capacity to enter into these Terms.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You must have a valid mobile phone number capable of receiving SMS
                messages in order to use the Service. You are responsible for any
                charges from your mobile carrier for receiving text messages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                4. Account Registration
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                To use the Service, you must create an account by providing accurate and
                complete information, including your mobile phone number. You will
                verify your phone number via SMS verification code.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You are responsible for:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your contact information remains accurate and up-to-date</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                5. SMS Messaging Consent
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                By signing up for GymText, you expressly consent to receive SMS text
                messages from us at the phone number you provided. These messages may
                include:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Daily workout instructions and reminders</li>
                <li>AI coaching responses to your messages</li>
                <li>Account notifications and updates</li>
                <li>Billing and subscription information</li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Message frequency varies based on your plan and interactions. Message
                and data rates may apply. You can opt out at any time by texting STOP
                to any message or by canceling your subscription.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                6. Subscription and Payment
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                GymText offers subscription-based access to the Service. By subscribing,
                you agree to pay the applicable subscription fees as described at the
                time of purchase.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Payment terms:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Subscriptions are billed in advance on a recurring basis</li>
                <li>Payment is processed securely through Stripe</li>
                <li>You authorize us to charge your payment method automatically</li>
                <li>Prices are subject to change with notice</li>
                <li>All fees are non-refundable except as required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                7. Cancellation Policy
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time. Upon cancellation:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Your subscription will remain active until the end of the current
                  billing period
                </li>
                <li>You will not be charged for subsequent billing periods</li>
                <li>
                  No refunds will be provided for partial months or unused service
                </li>
                <li>
                  You may continue to access the Service until your subscription
                  expires
                </li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                To cancel, you may use the account management features in the Service
                or contact us at support@gymtext.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                8. Health and Fitness Disclaimer
              </h2>
              <p className="mb-4 font-semibold text-foreground">
                IMPORTANT: GymText is not a substitute for professional medical advice,
                diagnosis, or treatment.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                The fitness information and workout recommendations provided through the
                Service are for general informational purposes only. Before starting any
                exercise program, you should:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Consult with a qualified healthcare provider</li>
                <li>
                  Inform your doctor of any medical conditions, injuries, or
                  limitations
                </li>
                <li>
                  Stop exercising immediately if you experience pain, dizziness, or
                  discomfort
                </li>
                <li>Understand that results vary based on individual factors</li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You acknowledge that you are voluntarily participating in physical
                activities and assume all risks associated with such participation.
                GymText LLC is not responsible for any injuries, health problems, or
                other consequences resulting from following the workout recommendations
                provided.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                9. User Responsibilities
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You agree to use the Service responsibly and in accordance with these
                Terms. You agree NOT to:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide false or misleading information</li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Share your account credentials with others</li>
                <li>
                  Use automated systems to access the Service without permission
                </li>
                <li>Harass, abuse, or harm others through the Service</li>
                <li>
                  Reverse engineer or attempt to extract source code from the Service
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                10. Intellectual Property
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are
                owned by GymText LLC and are protected by international copyright,
                trademark, and other intellectual property laws.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You may not copy, modify, distribute, sell, or lease any part of the
                Service without our prior written consent. The GymText name, logo, and
                all related marks are trademarks of GymText LLC.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                11. Limitation of Liability
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, GYMTEXT LLC SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Loss of profits, data, or goodwill</li>
                <li>Personal injury or property damage</li>
                <li>Service interruptions or errors</li>
                <li>
                  Any damages arising from your use of or inability to use the Service
                </li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Our total liability for any claims arising from these Terms or your use
                of the Service shall not exceed the amount you paid for the Service in
                the twelve (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                12. Disclaimer of Warranties
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
                OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>The Service will meet your specific requirements</li>
                <li>
                  Results from the Service will be accurate or reliable
                </li>
                <li>Any defects will be corrected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                13. Indemnification
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless GymText LLC and its
                officers, directors, employees, and agents from any claims, damages,
                losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you submit through the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                14. Governing Law and Dispute Resolution
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the
                laws of the United States of America, without regard to conflict of law
                principles.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or your use of the Service shall
                be resolved through binding arbitration in accordance with the rules of
                the American Arbitration Association. You agree to waive your right to
                a jury trial and to participate in class action lawsuits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                15. Termination
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service
                immediately, without prior notice, for any reason, including:
              </p>
              <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Breach of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>At our sole discretion for any reason</li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Service will cease immediately.
                Provisions of these Terms that should survive termination will remain
                in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                16. Changes to Terms
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify
                you of any material changes by posting the updated Terms on our website
                and updating the &quot;Last updated&quot; date. Your continued use of the Service
                after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                17. Severability
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid,
                that provision will be limited or eliminated to the minimum extent
                necessary, and the remaining provisions will remain in full force and
                effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                18. Contact Information
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
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
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
