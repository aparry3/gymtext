# Twilio 10DLC Compliance - Summary

**Date:** February 19, 2026
**Branch:** `twilio-compliance-welcome-message`
**Status:** Research Complete - Ready for Implementation

---

## What Was Done

✅ **Comprehensive research on Twilio 10DLC requirements**
- Reviewed official Twilio documentation
- Identified all mandatory opt-in disclosures
- Documented confirmation message requirements
- Researched opt-in page requirements for campaign submission

✅ **Analyzed current GymText implementation**
- Reviewed `/start` page flow
- Examined signup route (`/api/users/signup`)
- Analyzed Stripe webhook handling
- Identified compliance violations

✅ **Created complete PRD** (`TWILIO-COMPLIANCE-PRD.md`)
- Current state vs desired state
- All Twilio requirements with citations
- Compliant welcome message design
- Opt-in form language specifications
- `/opt-in` page content and screenshot requirements
- Step-by-step technical implementation plan
- Twilio campaign submission checklist

---

## Key Findings

### ✅ Twilio Compliance Requirements

**What's required for campaign approval:**
1. **Two separate opt-in checkboxes:**
   - Checkbox 1: Terms of Service and Privacy Policy consent
   - Checkbox 2: SMS consent with all required disclosures (frequency, STOP, data rates, etc.)
2. **Immediate confirmation messages** sent right after signup (with SMS consent):
   - Message 1: Welcome/confirmation (brand name, data rates, STOP instructions)
   - Message 2: Checkout reminder
3. **`/opt-in` page** with full disclosure for Twilio to review
4. **Privacy policy** must include mobile data non-sharing statement

### ✅ Correct Message Flow

**IMMEDIATELY after signup (with SMS consent checked):**
1. Welcome confirmation message: "Welcome to GymText! We're excited to go on this fitness journey with you. Message and data rates may apply. Reply STOP to cancel."
2. Checkout reminder: "Finish checking out and we will get your fitness program over to you."

**AFTER Stripe checkout completes:**
3. Actual GymText programming/workout messages begin

---

## What Needs to Change

### Twilio Compliance Requirements ✅

### 1. Update Welcome Message Format (REQUIRED)
**File:** `apps/web/src/app/api/users/signup/route.ts` OR `apps/web/src/app/api/stripe/webhook/route.ts`
**Action:** Update welcome message to include all required elements
**Impact:** Message includes brand name, HELP/STOP instructions, data rates disclaimer

### 2. Add Compliant Opt-in Checkbox (REQUIRED)
**File:** `apps/web/src/lib/questionnaire/baseQuestions.ts`
**File:** `apps/web/src/lib/questionnaire/baseQuestions.ts`
**Action:** 
- Add SMS consent checkbox question
- Include all required disclosures (frequency, STOP, data rates, privacy link, etc.)
- Checkbox must NOT be pre-selected
**Impact:** Clear, compliant opt-in mechanism

### 3. Create Consent Question Component (REQUIRED)
**File:** `apps/web/src/components/questionnaire/questions/ConsentQuestion.tsx` (NEW)
**Action:** Build new component for consent checkboxes
**Impact:** Reusable component for compliant consent collection

### 4. Update Privacy Policy (REQUIRED)
**File:** Check if `apps/web/src/app/privacy/page.tsx` exists
**Action:** Add mobile data non-sharing statement
**Required text:** "Your mobile information will not be shared with third parties or affiliates for marketing purposes"
**Impact:** Twilio campaign approval depends on this

### 5. Create `/opt-in` Page (REQUIRED FOR CAMPAIGN)
**File:** `apps/web/src/app/opt-in/page.tsx` (NEW)
**Action:** Create public page showing full opt-in disclosure
**Purpose:** Twilio needs this URL when submitting campaign
**Impact:** Required for campaign approval

---

### Additional Implementation Details

**Two-checkbox structure:**
- Checkbox 1: Terms of Service and Privacy Policy consent
- Checkbox 2: SMS consent (with full Twilio disclosures)
- Both must be separate and NOT pre-selected

**Message flow:**
- IMMEDIATELY after signup (with consents checked): Welcome confirmation + checkout reminder
- AFTER Stripe checkout: Actual GymText programming/workout messages

---

## Compliant Confirmation Messages

**Send IMMEDIATELY after signup (with SMS consent checked):**

**Message 1: Welcome/Confirmation**
```
Welcome to GymText! We're excited to go on this fitness journey with you. 
Message and data rates may apply. Reply STOP to cancel.
```

**Message 2: Checkout Reminder**
```
Finish checking out and we will get your fitness program over to you.
```

**Message 1 includes all required Twilio elements:**
- ✅ Brand name (GymText)
- ✅ Confirmation of enrollment
- ✅ Data rates disclaimer
- ✅ Opt-out instructions (STOP)

**Then AFTER checkout completion:**
- Actual GymText programming/workout messages begin

---

## Opt-in Checkbox Text (TWO SEPARATE CHECKBOXES)

**Add to `/start` page after phone number input:**

**Checkbox 1: Terms and Privacy**
```
I agree to the Terms of Service and Privacy Policy.
[Links to gymtext.com/terms and gymtext.com/privacy]
```

**Checkbox 2: SMS Consent (with full Twilio disclosures)**
```
By checking this box, I agree to receive recurring automated fitness and 
workout text messages from GymText at the mobile number provided. You will 
receive daily workout messages. Message frequency may vary. Message and data 
rates may apply. Reply HELP for help or STOP to cancel. View our Terms of 
Service at gymtext.com/terms and Privacy Policy at gymtext.com/privacy. 
Your mobile information will not be shared with third parties.
```

**Key requirements:**
- ❌ Both checkboxes CANNOT be pre-selected
- ✅ Must be TWO SEPARATE checkboxes (not combined)
- ✅ Must include "msg and data rates may apply"
- ✅ Must link to Terms and Privacy
- ✅ Must include opt-out instructions
- ✅ Must state frequency disclosure

---

## What You Need for Twilio Campaign Submission

### Screenshots Required

1. **Opt-in form** (`/start` page)
   - Show phone input
   - Show consent checkbox UNCHECKED
   - Show full consent text

2. **Welcome message**
   - Screenshot on actual phone
   - Shows message received AFTER payment
   - All required elements visible

3. **Opt-in page**
   - Full page at `gymtext.com/opt-in`
   - All disclosures visible

### Information to Provide Twilio

**Campaign Description:**
```
GymText sends daily personalized workout messages to subscribed users. Users 
opt in during signup by checking a consent checkbox and receive messages only 
after completing payment via Stripe checkout.
```

**Message Flow:**
```
Users opt in at gymtext.com/start. After providing mobile number, users check 
an opt-in checkbox with full disclosure. Checkbox is not pre-selected. Users 
must complete payment before receiving messages. Full details at 
gymtext.com/opt-in.
```

**URLs:**
- Opt-in page: `https://gymtext.com/opt-in`
- Terms: `https://gymtext.com/terms`
- Privacy: `https://gymtext.com/privacy` (must include mobile data statement)

---

## Implementation Priority

### Phase 1: Twilio Compliance (Required for Campaign Approval)
1. **Add two separate checkboxes to /start page:**
   - Terms/Privacy consent checkbox
   - SMS consent checkbox (with all Twilio disclosures)
2. **Update message flow in signup route:**
   - Send TWO immediate messages after signup (welcome + checkout reminder)
   - Keep programming messages in Stripe webhook (after payment)
3. **Update privacy policy** with mobile data non-sharing statement
4. **Create /opt-in page** with full disclosure

**Why:** Required for Twilio 10DLC campaign approval

---

## Testing Checklist

Before going live:
- [ ] TWO separate checkboxes appear on `/start` (Terms/Privacy + SMS)
- [ ] Both checkboxes are NOT pre-selected
- [ ] All consent disclosure text visible
- [ ] Links to Terms/Privacy work
- [ ] IMMEDIATE messages send after signup (with consents checked):
  - [ ] Message 1: Welcome confirmation with required elements
  - [ ] Message 2: Checkout reminder
- [ ] Programming messages send AFTER Stripe webhook (not before)
- [ ] Privacy policy includes mobile data non-sharing statement
- [ ] `/opt-in` page is public (no login required)
- [ ] Test STOP keyword
- [ ] Test HELP keyword

---

## Next Steps

### For Benji (Implementation)

See `TWILIO-COMPLIANCE-PRD.md` for:
- Complete code examples
- File-by-file implementation guide
- Technical architecture decisions
- TypeScript type updates needed

### For Aaron (Campaign Submission)

After implementation is deployed:

1. **Take screenshots:**
   - `/start` page (phone + consent)
   - Welcome message on phone
   - `/opt-in` page

2. **Submit Twilio campaign:**
   - Use campaign description from PRD
   - Provide message flow explanation
   - Upload screenshots
   - Link to `gymtext.com/opt-in`

3. **Common rejection reasons to avoid:**
   - ❌ Pre-selected checkbox
   - ❌ Missing "msg & data rates" disclaimer
   - ❌ No privacy policy link
   - ❌ Privacy policy missing mobile statement
   - ❌ Messages before opt-in
   - ❌ Inaccessible opt-in page

---

## Questions for Aaron

Before implementation:

1. **Does `/privacy` page exist?** Need to add mobile data statement
2. **Does `/terms` page exist?** Need to link in consent text
3. **What's the support email?** (PRD assumes `support@gymtext.com`)
4. **Should we create `/help` page?** Or link to existing support
5. **Any branding requirements for `/opt-in` page?**

---

## Resources

**Full PRD:** `TWILIO-COMPLIANCE-PRD.md` (36KB, comprehensive)

**Key Twilio Docs:**
- [A2P 10DLC Best Practices](https://www.twilio.com/en-us/blog/insights/best-practices/improving-your-chances-of-a2p10dlc-registration-approval)
- [Campaign Requirements](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/collect-business-info)
- [Opt-in/Opt-out Guide](https://www.twilio.com/en-us/blog/insights/compliance/opt-in-opt-out-text-messages)

---

**Status:** Ready to hand off to Benji for implementation

