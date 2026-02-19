# Twilio 10DLC Compliance PRD

**Project:** GymText Twilio 10DLC Compliance
**Branch:** `twilio-compliance-welcome-message`
**Date:** February 19, 2026
**Author:** Shackleton (Research Agent)

---

## Executive Summary

This PRD outlines changes to meet Twilio's A2P 10DLC compliance requirements and improve the user signup experience.

### Twilio 10DLC Compliance Requirements (Required for Campaign Approval)

1. **Incomplete opt-in disclosure** - `/start` page lacks required Twilio opt-in language
2. **Missing opt-in page** - No dedicated `/opt-in` page for Twilio campaign submission

### UX Improvements (Not Compliance-Related)

1. **Message timing** - Move welcome SMS to AFTER Stripe checkout completion (better UX, not a compliance requirement)

**Goal:** Meet all Twilio compliance requirements for campaign approval and improve signup flow UX.

---

## Table of Contents

1. [Current State vs Desired State](#current-state-vs-desired-state)
2. [Twilio 10DLC Requirements](#twilio-10dlc-requirements)
3. [Compliant Welcome Message](#compliant-welcome-message)
4. [Opt-in Form Language](#opt-in-form-language)
5. [Opt-in Page Requirements](#opt-in-page-requirements)
6. [Technical Implementation](#technical-implementation)
7. [Twilio Campaign Submission Checklist](#twilio-campaign-submission-checklist)
8. [References](#references)

---

## Current State vs Desired State

### Current State

**Flow:**
1. User visits `/start` page
2. User fills out questionnaire including phone number
3. User submits form → `POST /api/users/signup`
4. Signup route:
   - Creates user
   - Creates Stripe customer
   - **❌ Sends welcome SMS immediately** (line 227 in `signup/route.ts`)
   - Creates Stripe checkout session
   - Redirects to Stripe checkout
5. User completes payment
6. Stripe webhook fires (`checkout.session.completed`)
7. Webhook attempts to send onboarding messages

**Issues:**

**Twilio Compliance Issues:**
- Phone input has minimal helpText: "We'll text you your workouts"
- No separate SMS consent checkbox (need TWO checkboxes: Terms/Privacy AND SMS consent)
- SMS consent hardcoded to `true` in Questionnaire component
- No opt-in language with required disclosures (frequency, STOP to cancel, data rates, etc.)
- No dedicated opt-in page for Twilio campaign linking
- Welcome confirmation messages not sent immediately after consent (should send before checkout)

### Desired State

**Flow (with compliance requirements):**
1. User visits `/start` page
2. User fills out questionnaire with **two separate checkboxes:** ✅ *Required for Twilio compliance*
   - **Checkbox 1:** Terms of Service and Privacy Policy consent
   - **Checkbox 2:** SMS consent with full Twilio-required disclosures (frequency, STOP, data rates, privacy link, etc.)
   - Both checkboxes must NOT be pre-selected
3. User submits form (both consents checked) → `POST /api/users/signup`
4. Signup route:
   - Creates user
   - Creates Stripe customer
   - **IMMEDIATELY sends two confirmation messages:** ✅ *Required for Twilio compliance*
     1. **Welcome/confirmation message:** "Welcome to GymText! We're excited to go on this fitness journey with you. Message and data rates may apply. Reply STOP to cancel."
     2. **Checkout reminder:** "Finish checking out and we will get your fitness program over to you."
   - Creates Stripe checkout session
   - Redirects to Stripe checkout
5. User completes payment
6. Stripe webhook fires (`checkout.session.completed`)
7. Webhook:
   - Creates subscription
   - **Begins actual GymText programming/workout messages**

**Additional (Twilio Compliance):**
- Dedicated `/opt-in` page with full disclosure for Twilio campaign submission ✅
- All required disclaimers visible at point of consent ✅
- Privacy policy includes mobile data non-sharing statement ✅

**Legend:**
- ✅ = Required for Twilio 10DLC compliance
- 🎨 = UX improvement (not compliance-related)

---

## Twilio 10DLC Requirements

### Mandatory Opt-in Requirements

According to Twilio documentation, **all opt-in mechanisms must include:**

1. **Program/Brand Name**
   - "GymText" must be clearly identified

2. **Message Frequency Disclosure** (for recurring message programs)
   - Examples: "#msgs/mo", "msg frequency varies", "recurring messages"
   - For GymText: "You will receive daily workout messages"

3. **Terms and Conditions**
   - Link to terms OR complete terms displayed
   - Example: `gymtext.com/terms`

4. **Privacy Policy with Mobile Data Non-Sharing Statement**
   - Must include explicit language that mobile information will NOT be shared with third parties
   - Required language: "No mobile data will be shared with third parties/affiliates for marketing/promotional purposes at any time"
   - Example: `gymtext.com/privacy`

5. **"Message and data rates may apply" Disclosure**
   - EXACT wording required
   - Must be visible at point of consent

6. **Opt-out Instructions**
   - Example: "Reply STOP to cancel"
   - Must be clear and conspicuous

### Web/Online Opt-in Specific Requirements

For web-based opt-in (GymText's case):

- **Checkbox must NOT be pre-selected** - User must actively check the box
- **Standalone consent required** - Cannot be buried in general terms
- **All disclosures must be visible** - On the same page where user enters phone number
- **Privacy policy is MANDATORY** - Not optional for web opt-in

### Confirmation Message Requirements

Twilio requires an **opt-in confirmation message** sent immediately after user opts in (for recurring message programs).

**Required elements:**
1. Brand name
2. Confirmation of enrollment
3. How to get help
4. How to opt out

---

## Compliant Confirmation Messages

**Trigger:** Send IMMEDIATELY after signup form submission (when user checks SMS consent checkbox)

Twilio requires immediate confirmation messages for recurring message programs. Send TWO messages:

### Message 1: Welcome/Confirmation (Twilio-Required)

```
Welcome to GymText! We're excited to go on this fitness journey with you. Message and data rates may apply. Reply STOP to cancel.
```

**Breakdown:**

| Element | Content |
|---------|---------|
| Brand name | "GymText" |
| Welcome/engagement | "We're excited to go on this fitness journey with you" |
| Data rates disclaimer | "Message and data rates may apply" |
| Opt-out instructions | "Reply STOP to cancel" |

**Length:** 126 characters (fits in single SMS)

**Required elements included:**
- ✅ Brand name (GymText)
- ✅ Confirmation of enrollment (implicit in welcome)
- ✅ Data rates disclaimer
- ✅ Opt-out instructions (STOP)

### Message 2: Checkout Reminder

```
Finish checking out and we will get your fitness program over to you.
```

**Breakdown:**

| Element | Content |
|---------|---------|
| Action prompt | "Finish checking out" |
| Value proposition | "we will get your fitness program over to you" |

**Length:** 69 characters (fits in single SMS)

**Purpose:**
- Guides user to complete payment
- Sets expectation for what happens after checkout
- Friendly and encouraging tone

**Notes:**
- Both messages send immediately after signup (before checkout)
- Message 1 satisfies Twilio's confirmation message requirement
- Message 2 prompts user to complete payment
- Actual programming/workout messages begin AFTER checkout completes

---

## Opt-in Form Language

**Location:** `/start` page - Phone number input step

**Current Implementation:**
```tsx
{
  id: 'phone',
  questionText: "What's your phone number?",
  type: 'phone',
  required: true,
  helpText: "We'll text you your workouts",  // ❌ Insufficient
  placeholder: '(555) 555-5555',
  source: 'base',
}
```

**Required Implementation:**

### Phone Input Question

Keep existing question but update helpText:

```tsx
{
  id: 'phone',
  questionText: "What's your phone number?",
  type: 'phone',
  required: true,
  helpText: "Enter your mobile number to receive workout messages",
  placeholder: '(555) 555-5555',
  source: 'base',
}
```

### Consent Checkboxes (TWO SEPARATE CHECKBOXES REQUIRED)

Add immediately after phone input question:

**Checkbox 1: Terms and Privacy Consent**
```tsx
{
  id: 'termsConsent',
  questionText: 'Terms and Conditions',
  type: 'consent',
  required: true,
  source: 'base',
  consentText: `I agree to the Terms of Service and Privacy Policy.`,
  checkboxLabel: 'I agree to the Terms of Service and Privacy Policy',
  links: [
    { text: 'Terms of Service', url: 'https://gymtext.com/terms' },
    { text: 'Privacy Policy', url: 'https://gymtext.com/privacy' }
  ],
  preSelected: false
}
```

**Checkbox 2: SMS Consent (with full Twilio disclosures)**
```tsx
{
  id: 'smsConsent',
  questionText: 'SMS Messaging Consent',
  type: 'consent',
  required: true,
  source: 'base',
  consentText: `By checking this box, I agree to receive recurring automated fitness and workout text messages from GymText at the mobile number provided. You will receive daily workout messages. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to cancel. View our Terms of Service at gymtext.com/terms and Privacy Policy at gymtext.com/privacy. Your mobile information will not be shared with third parties.`,
  checkboxLabel: 'I consent to receive text messages from GymText',
  preSelected: false  // MUST NOT be pre-selected
}
```

**Important:** These must be TWO SEPARATE checkboxes, not combined. Twilio requires standalone SMS consent.

**Implementation Notes:**

1. **Create new `ConsentQuestion` component**
   - Renders checkbox (UNCHECKED by default)
   - Displays full consent text
   - Links to Terms and Privacy (opens in new tab)
   - Stores boolean + timestamp in answers

2. **Update Questionnaire submission**
   - Current code hardcodes `smsConsent: true` (line 86 in Questionnaire.tsx)
   - Change to: `smsConsent: answers.smsConsent as boolean`
   - Already captures `smsConsentedAt` timestamp

3. **Validation**
   - User MUST check checkbox to proceed
   - Show error if unchecked: "You must consent to receive text messages to use GymText"

---

## Opt-in Page Requirements

### Overview

Twilio requires a publicly accessible opt-in page URL when submitting a 10DLC campaign. This page demonstrates how users consent to receive messages.

**Purpose:**
- Campaign reviewers verify your opt-in process
- Must show ALL required disclosures
- Used when submitting screenshots to Twilio

**URL:** `gymtext.com/opt-in`

### Page Content Requirements

#### Page Header
```
GymText SMS Messaging Program
```

#### Opt-in Disclosure Section

**Heading:** How to Opt In

**Content:**
```
To receive workout messages from GymText, you must:

1. Visit gymtext.com/start
2. Complete the signup questionnaire
3. Provide your mobile phone number
4. Check the box to consent to receiving text messages
5. Complete payment through Stripe checkout

After successful payment, you will receive a confirmation message and begin receiving daily workout messages.
```

#### Program Details Section

**Heading:** Program Information

**Content:**
```
- Program Name: GymText
- Message Type: Recurring automated workout and fitness messages
- Message Frequency: Daily (approximately 30 messages per month). Frequency may vary based on your program.
- Cost: Standard message and data rates may apply based on your mobile carrier plan. GymText does not charge for text messages beyond your subscription fee.
```

#### Required Disclosures Section

**Heading:** Important Information

**Content:**
```
By opting in to GymText's messaging program, you agree to the following:

- You will receive recurring automated text messages from GymText
- Message and data rates may apply
- Your mobile information will not be shared with third parties or affiliates for marketing purposes
- You can opt out at any time by texting STOP to any GymText message
- You can get help by texting HELP to any GymText message
- For full terms, visit gymtext.com/terms
- For our privacy policy, visit gymtext.com/privacy
```

#### Customer Support Section

**Heading:** Support

**Content:**
```
For help with GymText:
- Text HELP to any GymText message
- Email: support@gymtext.com
- Visit: gymtext.com/help
```

#### Opt-out Section

**Heading:** How to Opt Out

**Content:**
```
You can stop receiving messages at any time by:
- Texting STOP to any message from GymText
- Canceling your subscription at gymtext.com/account

You will receive a confirmation message that you have been unsubscribed. You will not receive further messages unless you opt in again.
```

### Screenshot Requirements for Twilio

When submitting your campaign to Twilio, you need to provide:

#### Screenshot 1: Opt-in Form
**What to capture:**
- `/start` page at the phone number step
- Phone number input field
- SMS consent checkbox (UNCHECKED)
- Full consent text visible
- "Continue" button

**Filename:** `gymtext-opt-in-form.png`

**Requirements:**
- Full page visible
- All text readable
- Show that checkbox is not pre-selected
- Consent text clearly visible

#### Screenshot 2: Welcome Message
**What to capture:**
- Welcome/confirmation message on actual phone
- Must show message received AFTER payment
- Message includes all required elements

**Filename:** `gymtext-welcome-message.png`

**Requirements:**
- Shows GymText sender
- Complete message text visible
- Timestamp visible (proving it's post-payment)

#### Screenshot 3: Opt-in Page
**What to capture:**
- `gymtext.com/opt-in` full page
- All disclosures visible

**Filename:** `gymtext-opt-in-page.png`

**Requirements:**
- Full page screenshot OR scrolling screenshot showing all content
- All required disclosures visible
- Links to Terms and Privacy visible

### Hosting Instructions

**Option 1: Static Page (Recommended)**
- Create `apps/web/src/app/opt-in/page.tsx`
- Server-rendered page (no client state needed)
- Publically accessible (no auth required)

**Option 2: Link to Screenshot**
If opt-in is behind login (not applicable for GymText):
- Host screenshot on same domain: `gymtext.com/public/opt-in-screenshot.png`
- Provide URL to Twilio
- Screenshot must show login-gated opt-in experience

**Best Practice:** Use Option 1 - full static page is clearer for reviewers

---

## Technical Implementation

### Phase 1: Send Immediate Confirmation Messages (Twilio Compliance ✅)

**Priority:** REQUIRED for Twilio 10DLC approval

**File:** `apps/web/src/app/api/users/signup/route.ts`

**Current code (lines ~220-230):**
```typescript
// Send welcome SMS
console.log('[Signup] Sending welcome SMS');
const userWithProfile = await services.user.getUser(userId);
if (userWithProfile) {
  const welcomeMessage = await services.messagingAgent.generateWelcomeMessage(userWithProfile);
  await services.messagingOrchestrator.sendImmediate(userWithProfile, welcomeMessage);
}
```

**Update to send TWO immediate messages:**
```typescript
// Send Twilio-compliant confirmation messages immediately after signup
console.log('[Signup] Sending confirmation messages');
const userWithProfile = await services.user.getUser(userId);
if (userWithProfile && userWithProfile.smsConsent) {
  // Message 1: Welcome/confirmation message (Twilio-required)
  const welcomeMessage = createCompliantWelcomeMessage();
  await services.messagingOrchestrator.sendImmediate(userWithProfile, welcomeMessage);
  
  // Message 2: Checkout reminder
  const checkoutReminder = createCheckoutReminderMessage();
  await services.messagingOrchestrator.sendImmediate(userWithProfile, checkoutReminder);
  
  console.log('[Signup] Sent welcome + checkout reminder messages');
}
```

**Helper functions to add:**
```typescript
function createCompliantWelcomeMessage(): string {
  return "Welcome to GymText! We're excited to go on this fitness journey with you. Message and data rates may apply. Reply STOP to cancel.";
}

function createCheckoutReminderMessage(): string {
  return "Finish checking out and we will get your fitness program over to you.";
}
```

**Explanation:**
- Twilio requires immediate confirmation message after opt-in for recurring programs
- Two messages: (1) compliant welcome with disclaimers, (2) checkout reminder
- These are sent BEFORE payment, but AFTER explicit SMS consent is collected
- Programming messages wait until after payment

### Phase 2: Send Programming Messages After Payment

**Priority:** REQUIRED

**File:** `apps/web/src/app/api/stripe/webhook/route.ts`

**Current code (lines ~60-75):**
```typescript
// Create subscription record
await repos.subscription.create({
  clientId: userId,
  stripeSubscriptionId: subscription.id,
  status: subscription.status,
  planType: 'monthly',
  currentPeriodStart: new Date(subscription.current_period_start * 1000),
  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
});

console.log(`[Stripe Webhook] Subscription created for user ${userId}`);
```

**Add after subscription creation:**
```typescript
// Create subscription record
await repos.subscription.create({
  clientId: userId,
  stripeSubscriptionId: subscription.id,
  status: subscription.status,
  planType: 'monthly',
  currentPeriodStart: new Date(subscription.current_period_start * 1000),
  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
});

console.log(`[Stripe Webhook] Subscription created for user ${userId}`);

// ✅ NOW send actual GymText programming/workout messages
console.log(`[Stripe Webhook] Starting programming messages for user ${userId}`);
try {
  const userWithProfile = await services.user.getUser(userId);
  if (userWithProfile) {
    // User already received welcome + checkout reminder during signup
    // Now send the actual workout programming messages
    await services.messagingOrchestrator.sendOnboardingMessages(userWithProfile);
    console.log(`[Stripe Webhook] Programming messages started for user ${userId}`);
  }
} catch (error) {
  console.error(`[Stripe Webhook] Failed to send programming messages to user ${userId}:`, error);
  // Don't fail webhook if message sending fails
}
```

**Notes:**
- Welcome/confirmation messages were already sent during signup (Phase 1)
- This webhook triggers the actual GymText programming/workout messages
- User has now completed payment, so full service begins
- Failures logged but don't block webhook

### Phase 3: Update Opt-in Form

**File:** `apps/web/src/lib/questionnaire/baseQuestions.ts`

**Changes:**

1. **Update phone question helpText**

Current:
```typescript
{
  id: 'phone',
  questionText: "What's your phone number?",
  type: 'phone',
  required: true,
  helpText: "We'll text you your workouts",
  placeholder: '(555) 555-5555',
  source: 'base',
}
```

New:
```typescript
{
  id: 'phone',
  questionText: "What's your phone number?",
  type: 'phone',
  required: true,
  helpText: "Enter your mobile number to receive workout messages",
  placeholder: '(555) 555-5555',
  source: 'base',
}
```

2. **Add SMS consent question (insert after phone question)**

```typescript
{
  id: 'smsConsent',
  questionText: 'SMS Messaging Consent',
  type: 'consent',
  required: true,
  source: 'base',
  metadata: {
    consentText: `By checking this box, I agree to receive recurring automated fitness and workout text messages from GymText at the mobile number provided. You will receive daily workout messages. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to cancel. View our <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>. Your mobile information will not be shared with third parties.`,
    checkboxLabel: 'I consent to receive text messages from GymText',
    preSelected: false,
  },
}
```

**File:** `apps/web/src/lib/questionnaire/types.ts`

Add new question type:
```typescript
export type QuestionType = 'select' | 'multiselect' | 'text' | 'phone' | 'boolean' | 'consent';
```

**File:** `apps/web/src/components/questionnaire/questions/ConsentQuestion.tsx` (NEW)

Create new component:
```tsx
'use client';

import { useState } from 'react';
import { QuestionCard } from '../QuestionCard';
import { ContinueButton } from '../ContinueButton';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';

interface ConsentQuestionProps {
  question: QuestionnaireQuestion;
  value?: boolean;
  onChange: (value: boolean) => void;
  onNext: () => void;
}

export function ConsentQuestion({ question, value, onChange, onNext }: ConsentQuestionProps) {
  const [error, setError] = useState<string | null>(null);
  const isChecked = value === true;

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked);
    setError(null);
  };

  const handleContinue = () => {
    if (!isChecked) {
      setError('You must consent to receive text messages to use GymText');
      return;
    }
    onNext();
  };

  return (
    <QuestionCard title={question.questionText}>
      <div className="space-y-6">
        {/* Consent text with links */}
        <div
          className="text-sm text-[hsl(var(--questionnaire-muted-foreground))] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.metadata?.consentText || '' }}
        />

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-2 border-[hsl(var(--questionnaire-muted))] 
                     checked:bg-[hsl(var(--questionnaire-accent))] 
                     checked:border-[hsl(var(--questionnaire-accent))]
                     focus:ring-2 focus:ring-[hsl(var(--questionnaire-accent))] focus:ring-offset-2"
          />
          <span className="text-[hsl(var(--questionnaire-foreground))] font-medium">
            {question.metadata?.checkboxLabel || 'I consent'}
          </span>
        </label>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Continue button */}
        <ContinueButton
          onClick={handleContinue}
          disabled={!isChecked}
        />
      </div>
    </QuestionCard>
  );
}
```

**File:** `apps/web/src/components/questionnaire/Questionnaire.tsx`

Update to render consent question:
```tsx
// Add to imports
import { ConsentQuestion } from './questions/ConsentQuestion';

// In renderQuestion() function, add case:
case 'consent':
  return (
    <ConsentQuestion
      question={currentQuestion}
      value={currentValue as boolean | undefined}
      onChange={(v) => setAnswer(v)}
      onNext={handleNext}
    />
  );

// In handleSubmit(), update SMS consent (currently hardcoded):
// OLD:
smsConsent: true,
smsConsentedAt: new Date().toISOString(),

// NEW:
smsConsent: answers.smsConsent as boolean,
smsConsentedAt: answers.smsConsent ? new Date().toISOString() : undefined,
```

### Phase 4: Create Opt-in Page

**File:** `apps/web/src/app/opt-in/page.tsx` (NEW)

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SMS Messaging Program - GymText',
  description: 'Information about GymText SMS messaging program and opt-in process',
};

export default function OptInPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            GymText SMS Messaging Program
          </h1>
          <p className="mt-2 text-gray-600">
            Automated daily workout messages delivered to your phone
          </p>
        </div>

        {/* How to Opt In */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How to Opt In
          </h2>
          <p className="text-gray-700 mb-4">
            To receive workout messages from GymText, you must:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>Visit <a href="https://gymtext.com/start" className="text-blue-600 hover:underline">gymtext.com/start</a></li>
            <li>Complete the signup questionnaire</li>
            <li>Provide your mobile phone number</li>
            <li>Check the box to consent to receiving text messages</li>
            <li>Complete payment through Stripe checkout</li>
          </ol>
          <p className="text-gray-700 mt-4">
            After successful payment, you will receive a confirmation message and begin receiving daily workout messages.
          </p>
        </section>

        {/* Program Details */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Program Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="font-semibold text-gray-900">Program Name:</dt>
              <dd className="text-gray-700 ml-4">GymText</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Message Type:</dt>
              <dd className="text-gray-700 ml-4">Recurring automated workout and fitness messages</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Message Frequency:</dt>
              <dd className="text-gray-700 ml-4">
                Daily (approximately 30 messages per month). Frequency may vary based on your program.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Cost:</dt>
              <dd className="text-gray-700 ml-4">
                Standard message and data rates may apply based on your mobile carrier plan. 
                GymText does not charge for text messages beyond your subscription fee.
              </dd>
            </div>
          </dl>
        </section>

        {/* Required Disclosures */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Important Information
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2 text-gray-800">
            <p>By opting in to GymText's messaging program, you agree to the following:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You will receive recurring automated text messages from GymText</li>
              <li>Message and data rates may apply</li>
              <li>Your mobile information will not be shared with third parties or affiliates for marketing purposes</li>
              <li>You can opt out at any time by texting STOP to any GymText message</li>
              <li>You can get help by texting HELP to any GymText message</li>
              <li>For full terms, visit <a href="/terms" className="text-blue-600 hover:underline">gymtext.com/terms</a></li>
              <li>For our privacy policy, visit <a href="/privacy" className="text-blue-600 hover:underline">gymtext.com/privacy</a></li>
            </ul>
          </div>
        </section>

        {/* Support */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Support
          </h2>
          <p className="text-gray-700 mb-3">For help with GymText:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Text HELP to any GymText message</li>
            <li>Email: <a href="mailto:support@gymtext.com" className="text-blue-600 hover:underline">support@gymtext.com</a></li>
            <li>Visit: <a href="/help" className="text-blue-600 hover:underline">gymtext.com/help</a></li>
          </ul>
        </section>

        {/* Opt Out */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How to Opt Out
          </h2>
          <p className="text-gray-700 mb-3">
            You can stop receiving messages at any time by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Texting STOP to any message from GymText</li>
            <li>Canceling your subscription at <a href="/account" className="text-blue-600 hover:underline">gymtext.com/account</a></li>
          </ul>
          <p className="text-gray-700 mt-4">
            You will receive a confirmation message that you have been unsubscribed. 
            You will not receive further messages unless you opt in again.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-sm text-gray-500">
          <p>Last updated: February 19, 2026</p>
        </div>
      </div>
    </div>
  );
}
```

### Phase 5: Update Privacy Policy

**File:** Check if `apps/web/src/app/privacy/page.tsx` exists

**Required addition to Privacy Policy:**

Add section under "How We Use Your Information" or create new section "Mobile Information":

```markdown
### Mobile Information and SMS Messaging

When you provide your mobile phone number and opt in to receive text messages:

- We collect and store your mobile phone number to deliver workout messages
- **Your mobile information will not be shared with third parties or affiliates for marketing purposes**
- We use Twilio as our messaging service provider to deliver SMS messages
- You can opt out of messages at any time by texting STOP
- Standard message and data rates from your carrier may apply

We maintain your mobile information solely for the purpose of delivering your GymText workout program.
```

**This statement is REQUIRED for Twilio 10DLC compliance.**

---

## Twilio Campaign Submission Checklist

When submitting your A2P 10DLC campaign to Twilio, ensure you have:

### Brand Registration
- [ ] Business name matches legal registration (EIN/tax documents)
- [ ] Website URL is correct and functional: `gymtext.com`
- [ ] Privacy policy is public and accessible
- [ ] Privacy policy includes mobile data non-sharing statement
- [ ] Terms of Service are public and accessible

### Campaign Registration

**Campaign Description:**
```
GymText sends daily personalized workout messages to subscribed users. 
Messages include exercise instructions, training plans, progress tracking, 
and motivation. Users opt in during signup by checking a consent checkbox 
and receive messages only after completing payment via Stripe checkout.
```

**Message Flow / Call to Action:**
```
Users opt in to GymText messages during signup at gymtext.com/start. 
After completing a fitness questionnaire, users provide their mobile phone 
number and check an opt-in checkbox with full disclosure of messaging terms. 
The checkbox is not pre-selected. Users must complete payment through 
Stripe checkout before receiving any messages. Upon successful payment, 
users receive a welcome message confirming enrollment. Full opt-in details 
at gymtext.com/opt-in. Terms at gymtext.com/terms. Privacy policy at 
gymtext.com/privacy including mobile data non-sharing statement.
```

**Sample Messages (provide 2-5):**

1. Welcome message:
```
Welcome to GymText! We're excited to go on this fitness journey with you. 
You'll receive daily workout messages to help you reach your goals. Reply 
HELP for support or STOP to cancel. Msg & data rates may apply.
```

2. Workout message:
```
GymText - Today's Workout: Bench Press 4x8 @ 185lbs, Incline DB Press 3x12, 
Cable Flyes 3x15. Rest 90s between sets. You've got this! Reply DONE when 
complete or SKIP if needed. STOP to cancel.
```

3. Progress message:
```
GymText - Great work this week! You completed 4/5 workouts and hit all your 
targets. Keep crushing it! Reply HELP for support or STOP to cancel.
```

**Use Case:**
- Select: `MIXED` (includes workout delivery, progress tracking, customer care)
- OR: `ACCOUNT_NOTIFICATION` (if primarily transactional)

**Opt-in Type:**
- `WEB_FORM` (online opt-in via gymtext.com/start)

**Opt-in Image/URL:**
- URL: `https://gymtext.com/opt-in`
- Screenshot: Upload screenshot showing opt-in checkbox at `/start` page

**Has Embedded Links:** Yes
- Example URLs in messages: `gymtext.com/help`, `gymtext.com/account`

**Has Embedded Phone:** No

**Auto-responder Keywords:**

Opt-out:
- Keywords: `STOP, CANCEL, UNSUBSCRIBE, QUIT, END`
- Response: `You have been unsubscribed from GymText. You will not receive further messages. Text START to re-subscribe or visit gymtext.com/account`

Help:
- Keywords: `HELP, INFO, SUPPORT`
- Response: `GymText - Personalized workout messages. Email support@gymtext.com or visit gymtext.com/help. STOP to cancel. Msg & data rates may apply.`

Opt-in (if supporting keyword opt-in later):
- Keywords: `START, SUBSCRIBE`
- Response: Welcome message (same as above)

### Documentation to Prepare

1. **Screenshots:**
   - [ ] `/start` page showing phone input
   - [ ] `/start` page showing SMS consent checkbox (UNCHECKED)
   - [ ] Welcome message on actual device
   - [ ] `/opt-in` page (full page or scrolling screenshot)

2. **URLs to provide:**
   - [ ] Opt-in page: `https://gymtext.com/opt-in`
   - [ ] Terms of Service: `https://gymtext.com/terms`
   - [ ] Privacy Policy: `https://gymtext.com/privacy`
   - [ ] Help/Support: `https://gymtext.com/help`

3. **Supporting documents (if needed):**
   - [ ] Business registration (EIN letter if required)
   - [ ] Business website verification

### Common Rejection Reasons to Avoid

❌ **Checkbox pre-selected** - Must be unchecked by default
❌ **Missing "msg & data rates may apply"** - Required exact wording
❌ **No privacy policy link** - Must be visible at opt-in
❌ **Privacy policy doesn't mention mobile data** - Add non-sharing statement
❌ **Messages sent before opt-in** - Only send AFTER checkout complete
❌ **Vague opt-in description** - Be specific about when/how users consent
❌ **Sample messages don't match description** - Align samples with campaign type
❌ **Inaccessible opt-in page** - Must be public, no login required

---

## References

### Twilio Official Documentation

1. **A2P 10DLC Overview**
   - https://www.twilio.com/docs/messaging/compliance/a2p-10dlc

2. **Improving A2P 10DLC Registration Approval** (PRIMARY SOURCE)
   - https://www.twilio.com/en-us/blog/insights/best-practices/improving-your-chances-of-a2p10dlc-registration-approval
   - Covers: Opt-in types, required disclosures, message flow examples

3. **Gather Required Business Information**
   - https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/collect-business-info
   - Campaign details, message samples, opt-in requirements

4. **Campaign Approval Requirements**
   - https://support.twilio.com/hc/en-us/articles/11847054539547-A2P-10DLC-Campaign-Approval-Requirements
   - Confirmation message requirements, opt-in keywords

5. **Opt-in and Opt-out Best Practices**
   - https://www.twilio.com/en-us/blog/insights/compliance/opt-in-opt-out-text-messages
   - Welcome message examples, opt-out confirmation

### Key Compliance Points

- **Opt-in confirmation required** for all recurring message programs
- **Confirmation must be immediate** after user opts in
- **Web opt-in requires privacy policy** (not optional)
- **Checkbox cannot be pre-selected** (Twilio will reject)
- **"Message and data rates may apply"** is exact required wording
- **Privacy policy must state mobile data won't be shared** with third parties
- **Campaign reviewers need public access** to opt-in process (gymtext.com/opt-in)

### CTIA Guidelines Referenced by Twilio

- Consent must be "clear, conspicuous, and compliant"
- Opt-out must be free and easy (STOP keyword)
- Must include frequency disclosure for recurring programs
- Cannot send messages before obtaining explicit consent

---

## Implementation Timeline

**Recommended order:**

1. **Phase 1** (Critical): Remove welcome message from signup route
2. **Phase 2** (Critical): Add compliant welcome message to webhook
3. **Phase 5** (Prerequisite): Update privacy policy with mobile data statement
4. **Phase 3** (Required): Update opt-in form with consent checkbox
5. **Phase 4** (Required): Create `/opt-in` page

**Testing checklist before going live:**
- [ ] No messages sent during signup (before payment)
- [ ] Welcome message sent AFTER Stripe checkout completion
- [ ] Welcome message includes all required elements
- [ ] Consent checkbox appears on `/start` page
- [ ] Consent checkbox is NOT pre-selected
- [ ] All consent text is visible
- [ ] Links to Terms and Privacy work
- [ ] `/opt-in` page is publicly accessible
- [ ] Privacy policy includes mobile data non-sharing statement
- [ ] Test STOP keyword (opt-out)
- [ ] Test HELP keyword

---

## Benji Handoff Notes

**For implementation, Benji should:**

1. **Start with critical fixes (Phases 1-2)**
   - These fix the compliance violation immediately
   - Can deploy without waiting for opt-in page

2. **Create ConsentQuestion component**
   - New question type for forms
   - Reusable for future consent scenarios
   - Should handle HTML in consent text (for links)

3. **Consider using existing components**
   - Check if `BooleanQuestion` can be extended
   - Or create new `ConsentQuestion` component

4. **Update TypeScript types**
   - Add 'consent' to QuestionType union
   - Update question metadata interface

5. **Privacy policy location**
   - Verify if `/privacy` page exists
   - Add required mobile data statement
   - Consider version dating

6. **Test webhook flow end-to-end**
   - Use Stripe test mode
   - Verify message sends after checkout
   - Check for race conditions

7. **Consider message queue**
   - Welcome message should be reliable
   - If Inngest is used, may want to queue it
   - Don't block webhook on message sending

**Questions for Aaron:**

- Is there an existing `/privacy` page to update?
- Is there an existing `/terms` page to link?
- What's the support email? (PRD assumes `support@gymtext.com`)
- Should help page be created or does it exist?
- Any specific branding for `/opt-in` page?

---

**End of PRD**

---

## Appendix: Twilio Campaign Reviewer Perspective

When a Twilio campaign reviewer evaluates GymText's submission, they will:

1. **Visit `gymtext.com/opt-in`** - Verify all disclosures are present
2. **Check screenshots** - Confirm checkbox is not pre-selected
3. **Review message samples** - Ensure they match campaign description
4. **Verify privacy policy** - Look for mobile data non-sharing statement
5. **Validate message flow** - Understand when/how consent is obtained

**What they're looking for:**
- ✅ Clear consent mechanism
- ✅ All required disclosures visible
- ✅ Privacy policy accessible and compliant
- ✅ Message samples align with use case
- ✅ Opt-out mechanism clear
- ✅ Brand name consistent across all materials

**Red flags that cause rejection:**
- ❌ Pre-selected checkboxes
- ❌ Hidden or incomplete disclosures
- ❌ Missing privacy policy mobile statement
- ❌ Inaccessible opt-in page
- ❌ Vague or inconsistent descriptions
- ❌ Messages don't match stated purpose

**This PRD addresses all common rejection reasons.**

