# WhatsApp Template Findings & Best Practices (2026)

**Author:** Shackleton (Research Agent)  
**Date:** February 18, 2026  
**Status:** Research Findings  
**Related:** `whatsapp-implementation-proposal.md`, `whatsapp-direct-api-migration.md`

---

## Executive Summary

This document provides updated findings on WhatsApp message templates for 2026, including new template categories, pricing structures, approval best practices, and compliance requirements. These findings should inform the template design and implementation strategy for GymText's WhatsApp integration.

**Key Findings:**
- **Three Template Categories:** Marketing, Utility, and Authentication (each with different pricing)
- **Template Pacing:** Meta now paces new campaigns to protect quality ratings
- **Strict Compliance:** 2026 brings enhanced compliance requirements and quality monitoring
- **Category-Specific Pricing:** Authentication templates are cheapest, Marketing are most expensive
- **Quality-Based Reach:** Your template reach depends on your quality rating

---

## Table of Contents

1. [Template Categories](#template-categories)
2. [Template Pricing (2026)](#template-pricing-2026)
3. [Template Approval Process](#template-approval-process)
4. [Template Best Practices](#template-best-practices)
5. [Template Components](#template-components)
6. [Quality Rating & Template Pacing](#quality-rating--template-pacing)
7. [Compliance Requirements (2026)](#compliance-requirements-2026)
8. [GymText Template Strategy](#gymtext-template-strategy)
9. [Template Examples](#template-examples)
10. [Monitoring & Optimization](#monitoring--optimization)

---

## Template Categories

WhatsApp officially categorizes message templates into **three types**, each with different purposes, pricing, and approval criteria:

### 1. **Utility Templates** (Recommended for GymText)

**Purpose:** Transactional, service-related messages

**Examples:**
- Order confirmations
- Appointment reminders
- Account updates
- Service notifications
- **Workout notifications** ✅
- Progress updates
- Subscription reminders

**Pricing:** Mid-tier (varies by country)

**Approval:** Moderate difficulty
- Must provide clear value to user
- Should be tied to a user action or subscription
- Cannot be promotional

**Best for GymText:**
- Daily workout notifications
- Weekly check-ins
- Progress reports
- Subscription renewals

### 2. **Marketing Templates**

**Purpose:** Promotional, sales, and marketing messages

**Examples:**
- Product promotions
- Sales announcements
- New feature launches
- Referral programs
- Newsletter content

**Pricing:** Highest tier
- Most expensive category
- Significantly higher than Utility

**Approval:** Strictest requirements
- Must comply with advertising policies
- Requires opt-in proof
- Subject to quality rating penalties
- Higher rejection rate

**Use Sparingly:** Only for genuine promotional campaigns

### 3. **Authentication Templates**

**Purpose:** One-time passwords (OTP) and verification codes

**Examples:**
- Login verification codes
- Two-factor authentication
- Account verification
- Password resets

**Pricing:** Cheapest category
- Lowest cost per message
- Designed to encourage security

**Approval:** Easiest (but very specific)
- Must be strictly for authentication
- Cannot include marketing content
- Must have clear OTP/code format

**Not Relevant for GymText:** Unless implementing 2FA

---

## Template Pricing (2026)

### Pricing Structure

WhatsApp pricing is based on **conversations**, not individual messages:

**Conversation Definition:**
- A 24-hour window starting when a business-initiated template is delivered
- All messages within that 24-hour window = 1 conversation
- User-initiated conversations are FREE

### Pricing by Category

| Category | US Price (per conversation) | International (varies) |
|----------|----------------------------|------------------------|
| **Authentication** | ~$0.002 - $0.005 | Lowest tier |
| **Utility** | ~$0.005 - $0.010 | Mid tier |
| **Marketing** | ~$0.010 - $0.030+ | Highest tier |

**Important Notes:**
1. Prices vary significantly by country
2. High-volume discounts may be available
3. User-initiated messages are ALWAYS free
4. Multiple messages within 24h = still 1 conversation cost

### Cost Comparison: Twilio vs Direct API

| Aspect | Twilio WhatsApp | Direct WhatsApp API |
|--------|----------------|---------------------|
| **Base Cost** | Twilio margin + Meta cost | Meta cost only |
| **Typical Markup** | ~50-100% markup | No markup |
| **US Utility Template** | ~$0.010 - $0.015 | ~$0.005 - $0.010 |
| **Monthly Fee** | May include platform fees | No platform fees |
| **Number Rental** | Included in service | May need separate phone number provider |

**For GymText:** Direct API could reduce messaging costs by 30-50%

---

## Template Approval Process

### Submission Flow

1. **Create Template in Meta Business Manager**
   - Log into Meta Business Manager
   - Navigate to WhatsApp Manager → Message Templates
   - Click "Create Template"

2. **Template Configuration**
   - **Name:** Lowercase, underscores only (e.g., `daily_workout_reminder`)
   - **Category:** Choose Utility/Marketing/Authentication
   - **Language:** Select all languages you'll support
   - **Header:** (Optional) Text, image, video, or document
   - **Body:** Message content with variable placeholders `{{1}}`, `{{2}}`, etc.
   - **Footer:** (Optional) Small text at bottom
   - **Buttons:** (Optional) Call-to-action or quick reply buttons

3. **Submit for Review**
   - Meta reviews within 5 minutes to 24 hours
   - Most templates approved within 1 hour

4. **Approval/Rejection**
   - ✅ **Approved:** Template is live, you receive template ID
   - ❌ **Rejected:** Review rejection reason, modify, resubmit

### Common Rejection Reasons

1. **Promotional Language in Utility Template**
   - ❌ "Limited time offer! Get 50% off your next workout plan!"
   - ✅ "Your daily workout is ready. Start when you're ready!"

2. **Missing Opt-Out Language** (for marketing)
   - ❌ No way to unsubscribe
   - ✅ "Reply STOP to unsubscribe"

3. **Vague or Unclear Variables**
   - ❌ "Your {{1}} is {{2}}" (too vague)
   - ✅ "Your workout for {{1}} is ready at {{2}}"

4. **Policy Violations**
   - Misleading content
   - Adult content
   - Illegal products/services
   - Spam-like messages

5. **Incorrect Category**
   - Marketing content in Utility category
   - Promotional messages in Authentication

### Approval Tips

✅ **Do:**
- Be specific and clear
- Provide value to the user
- Use natural, conversational language
- Include opt-out for marketing messages
- Test with sample variables

❌ **Don't:**
- Use all caps or excessive punctuation!!!
- Include promotional language in Utility
- Make vague or ambiguous statements
- Use placeholder text like "Insert name here"
- Violate WhatsApp policies

---

## Template Best Practices

### 1. **Keep It Concise**

**Why:** WhatsApp users expect short, scannable messages

**Guidelines:**
- Body: 100-200 characters ideal
- Maximum: 1024 characters (but avoid this)
- One clear message per template

**Example:**
```
❌ Too Long:
"Hello {{1}}! We hope you're having a wonderful day. We wanted to let you know that your personalized workout plan for {{2}} is now available in your account. You can access it anytime by logging into the app or replying to this message. We've included exercises that match your fitness level and goals. Remember to warm up before starting and cool down after. If you have any questions or need modifications, just reply and our team will help you. Have a great workout!"

✅ Just Right:
"Hey {{1}}! Your workout for {{2}} is ready. Reply START when you're set to begin! 💪"
```

### 2. **Use Variables Wisely**

**Variables:** `{{1}}`, `{{2}}`, `{{3}}`, etc.

**Guidelines:**
- Limit to 3-5 variables per template
- Make variables obvious in context
- Always provide fallback values
- Test with real data

**Good Variable Usage:**
```
Body: "Hi {{1}}! Your {{2}} workout is ready. Today's focus: {{3}}. Reply START to begin!"

Variables:
{{1}} = User first name (e.g., "Aaron")
{{2}} = Day of week (e.g., "Monday")
{{3}} = Workout focus (e.g., "Upper Body Strength")

Result:
"Hi Aaron! Your Monday workout is ready. Today's focus: Upper Body Strength. Reply START to begin!"
```

### 3. **Add Call-to-Action Buttons**

**Button Types:**
- **Call-to-action (CTA):** Opens URL or makes phone call
- **Quick reply:** Sends predefined response

**Benefits:**
- Higher engagement rates
- Clearer next steps
- Better user experience

**Example:**
```json
{
  "buttons": [
    {
      "type": "quick_reply",
      "text": "Start Workout"
    },
    {
      "type": "quick_reply",
      "text": "Skip Today"
    }
  ]
}
```

### 4. **Optimize by Category**

**Utility Templates:**
- Focus on clarity and value
- Avoid marketing language
- Include actionable next steps

**Marketing Templates:**
- Include opt-out language
- Be transparent about intent
- Target specific user segments

**Authentication Templates:**
- Keep it simple and secure
- Clear OTP/code format
- Include expiration time

### 5. **Test Before Launch**

**Testing Checklist:**
- [ ] Send test message to your device
- [ ] Verify all variables render correctly
- [ ] Check message formatting (line breaks, emojis)
- [ ] Test buttons (if included)
- [ ] Confirm message tone matches brand
- [ ] Review on different device types

---

## Template Components

### Header (Optional)

**Types:**
- **Text:** Short title (60 characters max)
- **Image:** JPEG or PNG
- **Video:** MP4 format
- **Document:** PDF (for invoices, receipts)

**GymText Use Cases:**
- Image: Exercise demonstration photo
- Video: Quick workout preview
- Document: Weekly workout plan PDF

**Example:**
```json
{
  "header": {
    "type": "image",
    "image": {
      "link": "https://gymtext.co/assets/workout-preview.jpg"
    }
  }
}
```

### Body (Required)

**Main message content**

**Guidelines:**
- 1024 character maximum
- Can include variables `{{1}}`, `{{2}}`, etc.
- Supports emojis ✅
- Supports line breaks (use `\n`)
- No markdown formatting

**Example:**
```
Your workout is ready, {{1}}! 💪

Today's focus: {{2}}
Duration: {{3}} minutes

Reply START to begin or SKIP to reschedule.
```

### Footer (Optional)

**Small text at bottom**

**Guidelines:**
- 60 characters maximum
- No variables allowed
- Good for disclaimers or branding

**Example:**
```
GymText - Your AI Fitness Coach
```

### Buttons (Optional)

**Types:**

1. **Quick Reply Buttons**
   - User taps → Sends predefined text
   - Maximum 3 buttons
   - 20 characters per button

2. **Call-to-Action Buttons**
   - **URL:** Opens link in browser
   - **Phone:** Initiates phone call
   - Maximum 2 CTA buttons

**Example:**
```json
{
  "buttons": [
    {
      "type": "quick_reply",
      "text": "Start Workout"
    },
    {
      "type": "quick_reply",
      "text": "Modify Plan"
    },
    {
      "type": "quick_reply",
      "text": "Skip Today"
    }
  ]
}
```

---

## Quality Rating & Template Pacing

### Quality Rating System

Meta assigns a **quality rating** to each phone number based on:
- User blocks
- User reports
- Delivery failures
- User engagement

**Ratings:**
- 🟢 **Green (High Quality):** No restrictions
- 🟡 **Yellow (Medium Quality):** May face limits
- 🔴 **Red (Low Quality):** Severe restrictions or suspension

**Impact on GymText:**
- High quality → Better deliverability, higher limits
- Low quality → Messages may not be delivered, account at risk

### Template Pacing (New in 2026)

**What is Template Pacing?**

When you launch a **new template**, Meta sends it to **small groups first** to monitor quality:

**Pacing Flow:**
1. **Initial:** First 100 messages monitored closely
2. **Evaluation:** Meta checks blocks, reports, delivery success
3. **Scale-Up:** If quality is good, volume increases gradually
4. **Full Scale:** Once proven, no restrictions

**Why This Matters:**
- New templates may not reach full audience immediately
- Need to monitor quality from day one
- Poor performance in initial batch = long-term restrictions

**Best Practices:**
1. Test new templates with engaged users first
2. Monitor quality metrics closely in first 24-48 hours
3. Don't send high-volume campaigns with untested templates
4. Iterate based on initial feedback

---

## Compliance Requirements (2026)

### Opt-In Requirements (Strict)

**WhatsApp requires explicit opt-in:**
- Must be separate from general marketing opt-in
- Must mention "WhatsApp" specifically
- Cannot be pre-checked
- Must be clear what user is opting into

**Good Opt-In Examples:**
```
☑️ "I want to receive my daily workout reminders via WhatsApp"

☑️ "Send me my GymText workout plans on WhatsApp (message and data rates may apply)"

☑️ "Yes, message me on WhatsApp about my fitness progress and workouts"
```

**Bad Opt-In Examples:**
```
❌ ☑️ "I agree to receive marketing communications"
   (Too vague, doesn't mention WhatsApp)

❌ ☑️ "I agree to the terms and conditions"
   (Opt-in must be separate, not buried)

❌ ☑️ [Pre-checked box]
   (Must be user-initiated)
```

### Data Privacy (GDPR, CCPA)

**Requirements:**
1. **Data Storage:** Document where WhatsApp message data is stored
2. **Data Retention:** Have clear retention policies
3. **User Rights:** Allow users to:
   - Export their message history
   - Delete their message history
   - Opt-out at any time
4. **Privacy Policy:** Update to include WhatsApp data handling

### Compliance Audit Checklist

For GymText implementation:

- [ ] **Opt-In Flow:** WhatsApp-specific opt-in on signup
- [ ] **Opt-Out:** STOP command functionality
- [ ] **Privacy Policy:** Updated to include WhatsApp
- [ ] **Data Export:** Include WhatsApp messages in data export
- [ ] **Data Deletion:** Delete WhatsApp messages on account deletion
- [ ] **Template Categories:** All templates correctly categorized
- [ ] **Quality Monitoring:** System to track quality rating
- [ ] **User Consent Records:** Store opt-in timestamp and method

---

## GymText Template Strategy

### Recommended Template Categories

| Template | Category | Priority | Rationale |
|----------|----------|----------|-----------|
| Daily Workout Reminder | **Utility** | High | Transactional, user-subscribed |
| Weekly Check-In | **Utility** | High | Service-related, value-add |
| Welcome Message | **Utility** | High | Onboarding, transactional |
| Subscription Renewal | **Utility** | Medium | Account management |
| Progress Milestone | **Utility** | Medium | User achievement, engagement |
| New Feature Announcement | **Marketing** | Low | Promotional (use sparingly) |
| Referral Incentive | **Marketing** | Low | Promotional (use sparingly) |

### Template Naming Convention

**Format:** `gymtext_[purpose]_[variant]`

**Examples:**
- `gymtext_daily_workout_v1`
- `gymtext_daily_workout_v2_motivational`
- `gymtext_weekly_checkin_v1`
- `gymtext_welcome_new_user_v1`

**Benefits:**
- Easy to identify in Meta dashboard
- Version control for A/B testing
- Organized template library

### Multi-Language Strategy

**Supported Languages for GymText:**
1. **English (US)** - Primary
2. **Spanish (Latin America)** - High WhatsApp adoption
3. **Portuguese (Brazil)** - Massive WhatsApp market

**Implementation:**
```typescript
const TEMPLATES = {
  dailyWorkout: {
    en_US: 'gymtext_daily_workout_en_v1',
    es_MX: 'gymtext_daily_workout_es_v1',
    pt_BR: 'gymtext_daily_workout_pt_v1',
  },
};

// Select template based on user language
const templateId = TEMPLATES.dailyWorkout[user.language] || TEMPLATES.dailyWorkout.en_US;
```

---

## Template Examples

### 1. Daily Workout Reminder (Utility)

**Template Name:** `gymtext_daily_workout_v1`

**Category:** Utility

**Body:**
```
Hey {{1}}! 💪 Your workout for {{2}} is ready.

Today's focus: {{3}}
Duration: ~{{4}} minutes

Reply START when you're ready to crush it!
```

**Variables:**
- `{{1}}` - User first name
- `{{2}}` - Day of week (e.g., "Monday")
- `{{3}}` - Workout focus (e.g., "Upper Body Strength")
- `{{4}}` - Duration (e.g., "30")

**Footer:**
```
GymText - Your AI Coach
```

**Buttons:**
```json
[
  { "type": "quick_reply", "text": "Start Now" },
  { "type": "quick_reply", "text": "Skip Today" }
]
```

### 2. Weekly Check-In (Utility)

**Template Name:** `gymtext_weekly_checkin_v1`

**Category:** Utility

**Body:**
```
Hey {{1}}! How's your week going? 🎯

You've completed {{2}} of {{3}} workouts this week.

Reply with any questions or let me know how you're feeling!
```

**Variables:**
- `{{1}}` - User first name
- `{{2}}` - Completed workouts (e.g., "3")
- `{{3}}` - Total workouts (e.g., "5")

**Buttons:**
```json
[
  { "type": "quick_reply", "text": "Feeling Great" },
  { "type": "quick_reply", "text": "Need Help" }
]
```

### 3. Welcome Message (Utility)

**Template Name:** `gymtext_welcome_v1`

**Category:** Utility

**Body:**
```
Welcome to GymText, {{1}}! 🎉

Your personalized AI fitness coach is ready. I'll send you daily workouts tailored to your goals.

Reply START to get your first workout!
```

**Variables:**
- `{{1}}` - User first name

**Buttons:**
```json
[
  { "type": "quick_reply", "text": "START" }
]
```

### 4. Subscription Renewal Reminder (Utility)

**Template Name:** `gymtext_subscription_renewal_v1`

**Category:** Utility

**Body:**
```
Hi {{1}}, your GymText subscription renews on {{2}}.

Your progress: {{3}} workouts completed! 💪

Reply CONTINUE to keep going or STOP to cancel.
```

**Variables:**
- `{{1}}` - User first name
- `{{2}}` - Renewal date (e.g., "March 1st")
- `{{3}}` - Total workouts (e.g., "24")

**Buttons:**
```json
[
  { "type": "quick_reply", "text": "CONTINUE" },
  { "type": "quick_reply", "text": "STOP" }
]
```

### 5. Progress Milestone (Utility)

**Template Name:** `gymtext_milestone_v1`

**Category:** Utility

**Body:**
```
🏆 Congratulations, {{1}}!

You've completed {{2}} workouts! You're crushing your fitness goals.

Keep up the momentum! Your next workout is ready.
```

**Variables:**
- `{{1}}` - User first name
- `{{2}}` - Milestone number (e.g., "10", "25", "50")

**Buttons:**
```json
[
  { "type": "quick_reply", "text": "View Workout" }
]
```

---

## Monitoring & Optimization

### Metrics to Track

**Template Performance:**
- **Delivery Rate:** % of messages successfully delivered
- **Read Rate:** % of messages read by users
- **Response Rate:** % of users who reply
- **Block Rate:** % of users who block
- **Report Rate:** % of users who report as spam

**Quality Metrics:**
- **Quality Rating:** Green/Yellow/Red status
- **Template Status:** Active/Paused/Rejected
- **Pacing Status:** Ramping/Full Scale/Throttled

**Cost Metrics:**
- **Cost per Conversation:** Actual cost vs. budget
- **Cost by Category:** Utility vs. Marketing spend
- **Cost by Country:** Identify expensive markets

### Optimization Strategies

**1. A/B Test Templates**

Test different versions:
- Message tone (formal vs. casual)
- Emoji usage (with vs. without)
- Message length (short vs. detailed)
- Button text (e.g., "Start" vs. "Let's Go")

**2. Optimize Send Times**

- Test different times of day
- Track response rates by time
- Personalize send times per user (if possible)

**3. Segment Users**

- **Engaged Users:** More frequent messages, rich content
- **At-Risk Users:** Less frequent, value-focused
- **New Users:** Onboarding templates, clear CTAs

**4. Monitor Quality Rating**

**If Yellow:**
- Pause new template launches
- Review recent message content
- Survey users for feedback
- Reduce message frequency

**If Red:**
- Immediate action required
- Pause all templates
- Contact Meta support
- Review all messaging practices

**5. Reduce Blocks/Reports**

- **Add value:** Every message should be useful
- **Frequency management:** Don't over-message
- **Clear opt-out:** Make STOP command obvious
- **Relevance:** Only send when relevant to user

---

## Conclusion

WhatsApp templates in 2026 are more sophisticated and compliance-focused than ever. Success requires:

1. **Category Selection:** Choose Utility for GymText's core use cases
2. **Quality Focus:** Prioritize user value over volume
3. **Compliance:** Strict opt-in and data privacy practices
4. **Monitoring:** Track quality ratings and adjust quickly
5. **Optimization:** Continuous A/B testing and refinement

**For GymText:**
- Start with **Utility templates** for daily workouts and check-ins
- Avoid **Marketing templates** unless for specific campaigns
- Monitor quality rating closely from day one
- Optimize for engagement, not just delivery
- Be prepared to iterate based on user feedback

---

**Next Steps:**
1. Review template examples with team
2. Create initial templates in Meta Business Manager
3. Submit for approval
4. Test with small user group
5. Monitor quality metrics
6. Scale based on performance

**Related Documentation:**
- `whatsapp-implementation-proposal.md` - Original Twilio implementation plan
- `whatsapp-direct-api-migration.md` - Migration guide to direct WhatsApp API

---

**End of Document**
