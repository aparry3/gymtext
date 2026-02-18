# WhatsApp Cloud API Setup Guide

**Direct Meta integration for WhatsApp messaging**  
**Alternative to Twilio's WhatsApp API**

---

## Overview

This guide walks you through setting up direct WhatsApp Cloud API integration for GymText. This implementation provides:

- **Lower costs:** 1,000 free conversations/month, then $0.005-0.05/conversation
- **No middleman:** Direct Meta integration (no Twilio fees)
- **Drop-in replacement:** Implements the same `IMessagingClient` interface

---

## Prerequisites

1. **Meta for Developers Account:** https://developers.facebook.com/
2. **Meta Business Manager Account:** https://business.facebook.com/
3. **Phone number:** Not registered with personal WhatsApp
4. **Business verification** (for production use beyond test limits)

---

## Part 1: Meta for Developers Setup

### Step 1: Create a Developer App

1. Go to https://developers.facebook.com/
2. Click **My Apps** → **Create App**
3. Choose **Business** as app type
4. Fill in app details:
   - **App Name:** GymText WhatsApp
   - **App Contact Email:** your-email@domain.com
   - **Business Portfolio:** Select your Meta Business account
5. Click **Create App**

### Step 2: Add WhatsApp Product

1. In your app dashboard, click **Add Products**
2. Find **WhatsApp** and click **Set Up**
3. You'll be taken to the WhatsApp setup page

### Step 3: Get Your Credentials

On the **WhatsApp > API Setup** page, you'll see:

**Phone Number ID:**
```
Example: 102934567890123
```

**WhatsApp Business Account ID:**
```
Example: 108765432109876
```

**Temporary Access Token:**
```
Example: EAAx...
```

⚠️ **Important:** The temporary token expires in 24 hours. We'll create a permanent token in Part 2.

---

## Part 2: Create a Permanent Access Token

### Step 1: Create a System User

1. Go to **Meta Business Suite:** https://business.facebook.com/
2. Navigate to **Business Settings** (gear icon)
3. Go to **Users** → **System Users**
4. Click **Add** → Create new system user:
   - **Name:** GymText API User
   - **Role:** Admin
5. Click **Create System User**

### Step 2: Assign App to System User

1. Click on your newly created system user
2. Click **Assign Assets**
3. Select **Apps** tab
4. Find your **GymText WhatsApp** app
5. Toggle **Full Control** ON
6. Click **Save Changes**

### Step 3: Generate Access Token

1. Still in the system user page, click **Generate New Token**
2. Select your **GymText WhatsApp** app
3. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
4. Set token expiration: **Never** (for production)
5. Click **Generate Token**
6. **Copy the token immediately** (you won't see it again!)
7. Store it securely (environment variable)

---

## Part 3: Register Your Phone Number

### Option A: Use Meta's Test Number (for Development)

Meta provides a test phone number for free:
- Allows messaging to **5 test recipients** only
- Good for initial development and testing

1. On **WhatsApp > API Setup** page, use the test number shown
2. Add test recipient phone numbers in the interface

### Option B: Register Your Own Number (for Production)

1. **Get a phone number:**
   - Must NOT be registered with WhatsApp Messenger (personal app)
   - Can be a new number or existing business number
   - Twilio, Vonage, or other providers work

2. **Verify you own the number:**
   - On **WhatsApp > API Setup**, click **Add Phone Number**
   - Enter your phone number
   - Choose verification method (SMS or voice call)
   - Enter the verification code

3. **Register the number:**
   ```bash
   POST https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/register
   Authorization: Bearer {ACCESS_TOKEN}
   Content-Type: application/json

   {
     "messaging_product": "whatsapp",
     "pin": "123456"
   }
   ```
   (Use a 6-digit PIN you choose)

---

## Part 4: Create Message Templates

Templates must be created and approved by Meta before use.

### Step 1: Access Template Manager

1. Go to **Meta Business Manager:** https://business.facebook.com/
2. Navigate to **WhatsApp Manager**
3. Click **Message Templates** in left sidebar
4. Click **Create Template**

### Step 2: Create Daily Workout Template

**Template Name:** `gymtext_daily_workout_v1`

**Category:** UTILITY

**Language:** English (US)

**Header:** None

**Body:**
```
{{1}}

{{2}}

Notes: {{3}}
```

**Footer:** `Reply DONE when finished`

**Buttons:** Quick Reply: "DONE"

### Step 3: Create Additional Templates

Repeat for each template defined in `whatsappTemplates.ts`:

- `gymtext_workout_compact_v1` (for rest days)
- `gymtext_workout_structured_v1` (for complex workouts)
- `gymtext_workout_reminder_v1` (for reminders)
- `gymtext_welcome_v1` (for new users)
- `gymtext_weekly_checkin_v1` (for check-ins)
- `gymtext_subscription_renewal_v1` (for renewals)
- `gymtext_milestone_v1` (for achievements)

See `packages/shared/src/server/utils/whatsappTemplates.ts` for template specifications.

### Step 4: Wait for Approval

- **Automatic approval:** Most templates approved within **1-10 minutes**
- **Manual review:** Some templates take up to **48 hours**
- **Rejection:** If rejected, review reason and resubmit with modifications

---

## Part 5: Set Up Webhooks

### Step 1: Configure Webhook URL

1. In your **Meta for Developers** app dashboard
2. Go to **WhatsApp > Configuration**
3. Click **Edit** next to **Webhook**
4. Enter your webhook URL:
   ```
   https://yourdomain.com/api/whatsapp-cloud/webhook
   ```
5. Enter your **Verify Token** (you choose this, must match env var):
   ```
   your_custom_verify_token_12345
   ```
6. Click **Verify and Save**

### Step 2: Subscribe to Webhook Events

1. Still in **WhatsApp > Configuration**
2. Under **Webhook fields**, subscribe to:
   - ✅ `messages` (incoming messages)
   - ✅ `message_status` (delivery status updates)
3. Click **Save**

---

## Part 6: Environment Variables

Add these to your `.env.local` file:

```bash
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=102934567890123          # From API Setup page
WHATSAPP_BUSINESS_ACCOUNT_ID=108765432109876     # From API Setup page
WHATSAPP_ACCESS_TOKEN=EAAx...yourpermanenttoken... # From system user
WHATSAPP_API_VERSION=v23.0                        # Or latest version

# Webhook Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_12345

# Optional: Template Name Overrides (if using custom template names)
WHATSAPP_TEMPLATE_DAILY_WORKOUT=gymtext_daily_workout_v1
WHATSAPP_TEMPLATE_WEEKLY_CHECKIN=gymtext_weekly_checkin_v1
WHATSAPP_TEMPLATE_WELCOME=gymtext_welcome_v1
WHATSAPP_TEMPLATE_SUBSCRIPTION_RENEWAL=gymtext_subscription_renewal_v1
```

---

## Part 7: Enable WhatsApp Cloud in Code

### Option 1: Set as Default Provider

Update your messaging configuration to use WhatsApp Cloud by default:

```bash
# .env.local
MESSAGING_PROVIDER=whatsapp-cloud
```

### Option 2: Per-User Provider Selection

Update user preferences in database:

```sql
UPDATE users
SET preferred_messaging_provider = 'whatsapp-cloud'
WHERE id = 'user-id-here';
```

### Option 3: Programmatic Usage

```typescript
import { getMessagingClientByProvider } from '@/server/connections/messaging';

const whatsappClient = getMessagingClientByProvider('whatsapp-cloud');

await whatsappClient.sendMessage(
  user,
  undefined, // No message (using template)
  undefined, // No media
  'gymtext_daily_workout_v1', // Template name
  {
    '1': 'Upper Body Strength',
    '2': 'Workout exercises here...',
    '3': 'Rest 2-3min between sets'
  }
);
```

---

## Part 8: Testing

### Test with Meta's Test Number

1. Add your personal WhatsApp number as a test recipient (in Meta dashboard)
2. Send a test message:
   ```bash
   curl -X POST https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages \
     -H "Authorization: Bearer {ACCESS_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{
       "messaging_product": "whatsapp",
       "to": "15551234567",
       "type": "template",
       "template": {
         "name": "gymtext_daily_workout_v1",
         "language": { "code": "en_US" },
         "components": [
           {
             "type": "body",
             "parameters": [
               { "type": "text", "text": "Test Workout" },
               { "type": "text", "text": "Exercise 1\nExercise 2" },
               { "type": "text", "text": "Test notes" }
             ]
           }
         ]
       }
     }'
   ```

3. Verify you receive the message on your WhatsApp

### Test Webhooks Locally (ngrok)

1. Install ngrok: https://ngrok.com/
2. Start your local server:
   ```bash
   pnpm dev
   ```
3. Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
4. Update webhook URL in Meta dashboard with ngrok URL:
   ```
   https://abc123.ngrok.io/api/whatsapp-cloud/webhook
   ```
5. Send a message from your WhatsApp to your business number
6. Check your local server logs to see the webhook event

---

## Part 9: Database Migration

Run the migration to add WhatsApp support fields:

```bash
cd ~/Projects/gymtext
pnpm db:migrate
```

This adds:
- `preferred_messaging_provider` column to users
- `whatsapp_opt_in` column
- `whatsapp_opt_in_date` column
- `whatsapp_number` column (if different from main phone)

---

## Part 10: Production Deployment

### Before Going Live:

1. ✅ **Complete business verification** (Meta Business Manager)
2. ✅ **All templates approved**
3. ✅ **Webhooks configured and tested**
4. ✅ **Environment variables set in production**
5. ✅ **Database migration run**
6. ✅ **Test with real users** (small group first)

### Go Live:

1. Update production environment variables
2. Deploy code to production
3. Test with a few users first
4. Monitor logs for errors
5. Gradually roll out to more users

---

## Troubleshooting

### Issue: "Invalid OAuth access token"

**Cause:** Access token expired or invalid

**Solution:**
1. Generate new permanent access token (Part 2)
2. Update `WHATSAPP_ACCESS_TOKEN` environment variable
3. Restart server

### Issue: "Message undeliverable (131047)"

**Causes:**
- User blocked your business number
- User's phone number is invalid
- User not on WhatsApp

**Solution:**
1. Verify user's phone number format (E.164)
2. Check if user has WhatsApp installed
3. Consider fallback to SMS if WhatsApp fails

### Issue: "Template not found"

**Cause:** Template name doesn't match or not approved

**Solution:**
1. Check template name matches exactly (case-sensitive)
2. Verify template is approved in Meta Business Manager
3. Check template language code (must be `en_US`)

### Issue: Webhook not receiving events

**Causes:**
- Webhook URL not accessible
- SSL certificate invalid
- Verify token mismatch
- Not subscribed to events

**Solution:**
1. Test webhook URL in browser (should return 403)
2. Check SSL certificate is valid
3. Verify `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches Meta config
4. Check webhook subscriptions in Meta dashboard

---

## Cost Estimation

### WhatsApp Cloud API Pricing (as of 2026)

**Free tier:** 1,000 conversations/month (business-initiated)

**Paid tier (after free tier):**
- **US:** ~$0.005-0.010 per conversation
- **International:** Varies by country ($0.002-0.05)

**Conversation definition:**
- 24-hour window from first message
- All messages within window = 1 conversation cost
- User-initiated messages = FREE

### Example: GymText with 100 users

Assume:
- Daily workout message (business-initiated)
- User responds 50% of the time (opens 24h free window)
- Additional messages within window = free

**Monthly cost calculation:**
- Days per month: 30
- Business-initiated conversations: 100 users × 30 days × 50% (other 50% within free window) = 1,500 conversations
- Cost: 500 free + (1,000 × $0.007) = $7/month

**Compare to Twilio WhatsApp:**
- Same usage with Twilio: ~$15-20/month

**Savings: ~50-60%**

---

## Next Steps

1. ✅ Complete Meta setup (Parts 1-3)
2. ✅ Create templates (Part 4)
3. ✅ Configure webhooks (Part 5)
4. ✅ Set environment variables (Part 6)
5. ✅ Run database migration (Part 9)
6. ✅ Test with test number (Part 8)
7. ✅ Deploy to production (Part 10)

---

## Support & Resources

**Meta Documentation:**
- Cloud API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/
- Template Guidelines: https://business.whatsapp.com/policy
- Error Codes: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes

**GymText Implementation:**
- Client: `packages/shared/src/server/connections/messaging/whatsappCloudClient.ts`
- Templates: `packages/shared/src/server/utils/whatsappTemplates.ts`
- Webhook: `apps/web/src/app/api/whatsapp-cloud/webhook/route.ts`

---

**Setup complete! You're now using WhatsApp Cloud API directly.** 🎉
