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
1. **Opt-in consent checkbox** with all required disclosures (frequency, STOP, data rates, etc.)
2. **Compliant welcome message format** (brand name, HELP/STOP, data rates disclaimer)
3. **`/opt-in` page** with full disclosure for Twilio to review
4. **Privacy policy** must include mobile data non-sharing statement

### 🎨 UX Improvement Opportunity (Optional)

**Current flow:**
1. User fills out `/start` form
2. Signup route creates user
3. Welcome SMS sent immediately
4. Redirect to Stripe checkout
5. User completes payment

**Suggested improvement:**
Move welcome message to AFTER payment completes (better UX, not required for compliance)

**Location:** `apps/web/src/app/api/users/signup/route.ts` (line ~227)

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

### UX Improvements (Optional) 🎨

### 6. Move Welcome Message Timing
**File:** `apps/web/src/app/api/users/signup/route.ts` → `apps/web/src/app/api/stripe/webhook/route.ts`
**Action:** Move welcome message trigger from signup route to Stripe webhook (after payment)
**Impact:** Better UX - users receive welcome message after payment confirmation
**Note:** This is NOT a compliance requirement; sending before payment is allowed if consent is collected

---

## Compliant Welcome Message

**Send AFTER checkout completion:**

```
Welcome to GymText! We're excited to go on this fitness journey with you. 
You'll receive daily workout messages to help you reach your goals. Reply 
HELP for support or STOP to cancel. Msg & data rates may apply.
```

**Includes all required elements:**
- ✅ Brand name (GymText)
- ✅ Program description
- ✅ Help instructions
- ✅ Opt-out instructions
- ✅ Data rates disclaimer

---

## Opt-in Checkbox Text

**Add to `/start` page after phone number input:**

```
By checking this box, I agree to receive recurring automated fitness and 
workout text messages from GymText at the mobile number provided. You will 
receive daily workout messages. Message frequency may vary. Message and data 
rates may apply. Reply HELP for help or STOP to cancel. View our Terms of 
Service at gymtext.com/terms and Privacy Policy at gymtext.com/privacy. 
Your mobile information will not be shared with third parties.
```

**Key requirements:**
- ❌ Checkbox CANNOT be pre-selected
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
1. Update welcome message format to include all required elements
2. Update privacy policy with mobile data non-sharing statement
3. Add compliant opt-in checkbox to /start page
4. Create /opt-in page

**Why:** Required for Twilio 10DLC campaign approval

### Phase 2: UX Improvements (Optional)
1. Move welcome message from signup route to Stripe webhook

**Why:** Better user experience (not compliance-related)

---

## Testing Checklist

Before going live:
- [ ] No messages sent during signup (before Stripe)
- [ ] Welcome message sends AFTER Stripe webhook
- [ ] Welcome message includes all required elements
- [ ] Consent checkbox appears on `/start`
- [ ] Consent checkbox is NOT pre-selected
- [ ] All consent disclosure text visible
- [ ] Links to Terms/Privacy work
- [ ] Privacy policy includes mobile data statement
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

