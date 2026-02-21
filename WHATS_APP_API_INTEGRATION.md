# WhatsApp Business Cloud API Integration Guide

**Research compiled for GymText integration**  
**Date:** February 18, 2026  
**Purpose:** Intel gathering for potential migration from Twilio's WhatsApp integration to direct WhatsApp Cloud API

---

## Table of Contents

1. [Overview](#overview)
2. [Official Documentation](#official-documentation)
3. [Authentication & Setup](#authentication--setup)
4. [API Endpoints](#api-endpoints)
5. [Sending Template Messages](#sending-template-messages)
6. [Template Examples for GymText](#template-examples-for-gymtext)
7. [Key Differences from Twilio](#key-differences-from-twilio)
8. [Requirements & Gotchas](#requirements--gotchas)
9. [Code Examples](#code-examples)
10. [Webhooks](#webhooks)

---

## Overview

The **WhatsApp Cloud API** is Meta's officially hosted WhatsApp Business Platform solution. It allows businesses to send and receive WhatsApp messages directly through Meta's infrastructure without requiring third-party providers like Twilio.

**Key features:**
- Direct integration with Meta (no BSP middleman like Twilio)
- Free tier available (1,000 free conversations per month)
- Lower per-message costs compared to Twilio
- Template-based messaging for business-initiated conversations
- 24-hour messaging window for free-form replies after user contact

**API Base URL:**
```
https://graph.facebook.com/{VERSION}/{PHONE_NUMBER_ID}/messages
```

---

## Official Documentation

**Primary resources:**
- **Developer Hub:** https://business.whatsapp.com/developers/developer-hub
- **Cloud API Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api/
- **Messages API Reference:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages/
- **Get Started Guide:** https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/
- **Webhooks Setup:** https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/

**Example code repositories:**
- **Official Examples:** https://github.com/fbsamples/whatsapp-api-examples
- **Node.js SDK (ARCHIVED):** https://github.com/WhatsApp/WhatsApp-Nodejs-SDK  
  *(Note: Meta stopped development of the official SDK. Direct HTTP API calls are recommended.)*

**Third-party resources:**
- **Postman Collection:** https://www.postman.com/meta/whatsapp-business-platform/overview
- **Community Node.js Library:** https://github.com/tawn33y/whatsapp-cloud-api

---

## Authentication & Setup

### 1. Create a Meta for Developers App

1. Go to https://developers.facebook.com/
2. Create a **Business Type App**
3. Add the **WhatsApp** product to your app
4. Navigate to **WhatsApp > API Setup** in the left menu

### 2. Get Your Credentials

You'll need these values:

| Credential | Where to Find It | Example |
|------------|------------------|---------|
| **Phone Number ID** | WhatsApp > API Setup | `102934567890123` |
| **WhatsApp Business Account ID** | WhatsApp > Getting Started | `108765432109876` |
| **Access Token** | WhatsApp > API Setup > Generate | `EAAx...` |

### 3. Generate a Permanent Access Token

⚠️ **Important:** The default token expires in 24 hours. For production, you need a **System User Access Token**.

**Steps to create a permanent token:**
1. Go to **Meta Business Suite** (business.facebook.com)
2. Navigate to **Business Settings > Users > System Users**
3. Create a new System User
4. Assign it to your app with `whatsapp_business_messaging` and `whatsapp_business_management` permissions
5. Generate an access token (set it to **never expire**)

**Reference:** https://stackoverflow.com/a/74253066

### 4. Environment Variables

```bash
# Required
WHATSAPP_PHONE_NUMBER_ID=102934567890123
WHATSAPP_BUSINESS_ACCOUNT_ID=108765432109876
WHATSAPP_ACCESS_TOKEN=EAAx...yourpermanenttoken...
CLOUD_API_VERSION=v23.0

# Optional
WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_string
WEBHOOK_ENDPOINT=/whatsapp/webhook
```

---

## API Endpoints

### Send Messages

**Endpoint:**
```
POST https://graph.facebook.com/{VERSION}/{PHONE_NUMBER_ID}/messages
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

### Get Phone Numbers

**Endpoint:**
```
GET https://graph.facebook.com/{VERSION}/{WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers
Authorization: Bearer {ACCESS_TOKEN}
```

### Register Phone Number

**Endpoint:**
```
POST https://graph.facebook.com/{VERSION}/{PHONE_NUMBER_ID}/register
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

Body:
{
  "messaging_product": "whatsapp",
  "pin": "123456"
}
```

---

## Sending Template Messages

WhatsApp requires **pre-approved message templates** for business-initiated conversations. These templates must be created and approved by Meta before use.

### Template Categories

Templates must be categorized as one of:

| Category | Use Case | Example |
|----------|----------|---------|
| **UTILITY** | Transactional updates, alerts, confirmations | Order updates, appointment reminders, workout delivery |
| **MARKETING** | Promotional content (requires explicit opt-in) | New feature announcements, special offers |
| **AUTHENTICATION** | One-time passcodes (OTP) | Login codes, verification |

**For GymText:** Most workout messages would fall under **UTILITY** (scheduled workout delivery).

### Template Approval Process

- **Automatic approval:** Most templates are approved within **minutes** via ML-assisted review
- **Manual review:** Some templates require human review and can take up to **48 hours**
- **Rejection reasons:** Violating WhatsApp policies, unclear messaging, marketing without opt-in

### Template Structure

Templates support:
- **Header:** Optional (text, media, or document)
- **Body:** Required (main message content with variables `{{1}}`, `{{2}}`, etc.)
- **Footer:** Optional (small text at bottom)
- **Buttons:** Optional (call-to-action, quick replies)

**Example template body:**
```
Good morning! Here's your workout for today:

{{1}}

Reply DONE when complete.
```

**Variable placeholders:** `{{1}}`, `{{2}}`, `{{3}}`, etc. (1-indexed, not 0-indexed)

---

## Template Examples for GymText

Based on GymText's workout message format (see `workout_messages.md`), here are template examples:

### Template 1: Daily Workout (Utility)

**Template Name:** `daily_workout_v1`  
**Category:** UTILITY  
**Language:** English (en_US)

**Header:** None  
**Body:**
```
{{1}}

{{2}}

Notes: {{3}}
```

**Footer:** `Reply DONE when finished`  
**Buttons:** Quick Reply: "DONE"

**Usage Example:**
```json
{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "template",
  "template": {
    "name": "daily_workout_v1",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Upper Body Strength"
          },
          {
            "type": "text",
            "text": "Warm-Up:\n- Band pull-apart: 2x15\n- Arm circles: 30s each direction\n\nWorkout:\n- BB bench press: 5x5\n- Weighted pull-up: 4x6\n- Overhead press: 4x6\n- DB row: 3x8 each side\n- Dips: 3x8"
          },
          {
            "type": "text",
            "text": "Rest 2-3min between main lifts. Aim for RPE 8."
          }
        ]
      }
    ]
  }
}
```

### Template 2: Compact Workout (Utility)

**Template Name:** `workout_compact_v1`  
**Category:** UTILITY  
**Language:** English (en_US)

**Body:**
```
{{1}}

{{2}}
```

**Footer:** `Let me know when you're done!`

**Usage for short workouts (rest day, active recovery):**
```json
{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "template",
  "template": {
    "name": "workout_compact_v1",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Rest Day"
          },
          {
            "type": "text",
            "text": "No workout today. Recovery is part of the program.\n\nIf you feel like moving:\n- Walk: 20-30min\n- Stretching: 10-15min"
          }
        ]
      }
    ]
  }
}
```

### Template 3: Workout with Sections (Utility)

**Template Name:** `workout_structured_v1`  
**Category:** UTILITY  
**Language:** English (en_US)

**Body:**
```
{{1}}

{{2}}

{{3}}

{{4}}
```

**Usage for complex workouts (warm-up + workout + core + cooldown):**
```json
{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "template",
  "template": {
    "name": "workout_structured_v1",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Lower Body + Conditioning"
          },
          {
            "type": "text",
            "text": "Warm-Up:\n- Jump rope: 2min\n- Bodyweight squat: 2x10"
          },
          {
            "type": "text",
            "text": "Strength:\n- BB front squat: 4x6\n- BB hip thrust: 4x8"
          },
          {
            "type": "text",
            "text": "Conditioning:\n- KB swing: 5x15\n- Assault bike: 3x 60s on/90s off\n\nNotes: Rest 2min between strength sets. Push hard on conditioning."
          }
        ]
      }
    ]
  }
}
```

### Template 4: Reminder (Utility)

**Template Name:** `workout_reminder_v1`  
**Category:** UTILITY  
**Language:** English (en_US)

**Body:**
```
Hey {{1}}! Ready for today's workout?

Type YES when you're ready.
```

**Usage:**
```json
{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "template",
  "template": {
    "name": "workout_reminder_v1",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Sarah"
          }
        ]
      }
    ]
  }
}
```

---

## Key Differences from Twilio

| Feature | WhatsApp Cloud API (Direct) | Twilio WhatsApp API |
|---------|----------------------------|---------------------|
| **Provider** | Meta (direct) | Twilio (BSP/intermediary) |
| **Cost** | 1,000 free conversations/month, then $0.005-0.05/conversation depending on country | $0.005/message (flat rate) |
| **Setup Complexity** | Moderate (Meta for Developers + Business Manager) | Easy (Twilio Console) |
| **Template Management** | Meta Business Manager | Twilio Console |
| **Template Approval** | Meta (1min - 48hrs) | Meta via Twilio (same timing) |
| **Phone Number** | Bring your own or use Meta test number | Use Twilio's `whatsapp:+14155238886` or request your own |
| **Authentication** | Bearer token (Access Token) | Twilio Account SID + Auth Token |
| **API Endpoint** | `graph.facebook.com/{VERSION}/{PHONE_NUMBER_ID}/messages` | `api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json` |
| **Template Variables** | `{{1}}`, `{{2}}`, `{{3}}` (1-indexed) | `{{1}}`, `{{2}}`, `{{3}}` (1-indexed, same) |
| **Webhooks** | HTTPS required, custom verify token | HTTPS required, Twilio signature validation |
| **Rate Limits** | Tier-based (starts at 1,000/day, scales with quality rating) | Twilio's internal limits |
| **Number Portability** | Can migrate existing WhatsApp Business number | Can migrate existing number |
| **Official SDK** | ARCHIVED (use direct HTTP API) | Twilio SDK (`twilio-node`) |

### Why Consider Moving from Twilio?

**Pros:**
- **Cost savings:** Free tier + lower per-message costs at scale
- **No middleman:** Direct relationship with Meta
- **Better visibility:** Access to Meta Business Manager analytics
- **Future-proofing:** Native access to new WhatsApp features

**Cons:**
- **More setup:** Requires Meta for Developers account + Business Manager
- **Token management:** Need to handle permanent access tokens
- **No official SDK:** Direct HTTP API calls (more boilerplate)
- **Twilio integration benefits:** Twilio consolidates SMS + WhatsApp in one API

---

## Requirements & Gotchas

### 1. Business Verification

- **Meta Business Verification** is required for production use beyond test limits
- Process can take **3-5 business days** (sometimes longer)
- Requires business documents (registration, tax ID, etc.)

### 2. Phone Number Requirements

- Phone number must **not** be registered with WhatsApp Messenger (personal app)
- If migrating from Twilio, you need to **deregister** from Twilio first
- Can only be registered with **one WhatsApp Business Account** at a time

### 3. Template Limitations

- **Maximum 1024 characters** in template body
- **Maximum 3 buttons** per template
- **Variable limit:** Up to 10 variables per component
- Once a template is approved, **you cannot edit it** — you must create a new version

### 4. Messaging Windows

- **Template messages:** Can be sent anytime to users who opted in
- **Free-form messages:** Can only be sent within **24 hours** of the last user message
- After 24 hours, you **must** use a template

### 5. Rate Limits

WhatsApp uses a **tiered rate limit system** based on quality rating:

| Tier | Messaging Limit (per day) |
|------|---------------------------|
| Tier 1 | 1,000 unique customers |
| Tier 2 | 10,000 unique customers |
| Tier 3 | 100,000 unique customers |
| Tier 4 | Unlimited |

**Quality rating factors:**
- User blocks/reports
- Template approval rejections
- User engagement (reply rate)

### 6. Opt-In Requirements

- **Users must opt in** before you can send them messages
- Opt-in can be via:
  - SMS
  - Website form
  - In-person (verbal/written)
  - NOT via WhatsApp (can't cold-message people)

### 7. Webhook Requirements

- **HTTPS required** (no HTTP in production)
- **Valid SSL certificate** required
- **Webhook verification token** must match your config
- **Response time:** Webhooks must respond within **20 seconds** or Meta will retry

### 8. Phone Number Format

- Use **E.164 format** (e.g., `15551234567` for US numbers)
- **No** `+`, `-`, `()`, or spaces
- **Include country code** (no leading zeros)

### 9. Template Rejections

Common reasons templates are rejected:
- **Grammar/spelling errors**
- **Unclear messaging** (vague or ambiguous)
- **Marketing content** without explicit category
- **Policy violations** (hate speech, adult content, etc.)
- **Variable-only templates** (body can't be just `{{1}}`)

### 10. Testing Limitations

- **Test phone number** provided by Meta allows **5 recipient numbers** max
- For broader testing, you need a **production phone number**

---

## Code Examples

### Basic Template Message (Node.js with Axios)

```javascript
const axios = require('axios');

async function sendWorkoutTemplate(recipientPhone, workoutTitle, workoutBody, notes) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const VERSION = 'v23.0';

  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: recipientPhone, // E.164 format: '15551234567'
    type: 'template',
    template: {
      name: 'daily_workout_v1',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: workoutTitle },
            { type: 'text', text: workoutBody },
            { type: 'text', text: notes }
          ]
        }
      ]
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
sendWorkoutTemplate(
  '15551234567',
  'Upper Body Strength',
  'Warm-Up:\n- Band pull-apart: 2x15\n\nWorkout:\n- BB bench press: 5x5\n- Weighted pull-up: 4x6',
  'Rest 2-3min between main lifts.'
);
```

### Free-Form Text Message (within 24-hour window)

```javascript
async function sendTextMessage(recipientPhone, messageText) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const VERSION = 'v23.0';

  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: messageText
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error sending text message:', error.response?.data || error.message);
    throw error;
  }
}
```

### Error Handling

WhatsApp Cloud API errors follow this structure:

```json
{
  "error": {
    "message": "Invalid OAuth access token - Cannot parse access token",
    "type": "OAuthException",
    "code": 190,
    "fbtrace_id": "AbCd1234XyZ"
  }
}
```

**Common error codes:**
- `190` - Invalid access token
- `100` - Invalid parameter
- `131047` - Message undeliverable (user blocked, invalid number, etc.)
- `131056` - Phone number not registered

---

## Webhooks

### Webhook Verification (GET)

When you configure webhooks in Meta App Dashboard, Meta sends a GET request to verify your endpoint:

```javascript
app.get('/whatsapp/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
```

### Webhook Payload (POST)

Incoming messages are sent as POST requests:

```javascript
app.post('/whatsapp/webhook', (req, res) => {
  const body = req.body;

  // Acknowledge receipt immediately
  res.sendStatus(200);

  // Process webhook asynchronously
  if (body.object === 'whatsapp_business_account') {
    body.entry.forEach(entry => {
      const changes = entry.changes;
      changes.forEach(change => {
        if (change.field === 'messages') {
          const value = change.value;
          
          if (value.messages) {
            value.messages.forEach(message => {
              console.log('Received message:', {
                from: message.from,
                type: message.type,
                text: message.type === 'text' ? message.text.body : null,
                timestamp: message.timestamp
              });

              // Process message here (e.g., handle "DONE" replies)
            });
          }

          if (value.statuses) {
            value.statuses.forEach(status => {
              console.log('Message status:', {
                id: status.id,
                status: status.status, // 'sent', 'delivered', 'read', 'failed'
                timestamp: status.timestamp
              });
            });
          }
        }
      });
    });
  }
});
```

### Webhook Events

Subscribe to these events in Meta App Dashboard:
- `messages` - Incoming messages from users
- `message_status` - Delivery status updates (sent, delivered, read, failed)

**Example incoming message payload:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "108765432109876",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "102934567890123"
            },
            "contacts": [
              {
                "profile": { "name": "John Doe" },
                "wa_id": "15559876543"
              }
            ],
            "messages": [
              {
                "from": "15559876543",
                "id": "wamid.ABC123...",
                "timestamp": "1645564567",
                "type": "text",
                "text": { "body": "DONE" }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

---

## Next Steps for Implementation

**For Benji (with Opus 4-6):**

1. **Environment Setup**
   - Create Meta for Developers app
   - Set up Business Manager account
   - Generate permanent access token
   - Configure environment variables

2. **Template Creation**
   - Design templates for GymText workout messages
   - Submit templates for approval
   - Wait for approval (1min - 48hrs)

3. **Code Migration**
   - Create `WhatsAppCloudAPIClient` class (parallel to existing `WhatsAppMessagingClient`)
   - Implement template message sending
   - Implement free-form message handling (for 24-hour window replies)
   - Add error handling and retry logic

4. **Webhook Implementation**
   - Set up webhook endpoint for inbound messages
   - Implement webhook verification
   - Handle message status updates
   - Process user replies (e.g., "DONE")

5. **Testing**
   - Test with Meta's test phone number (5 recipients max)
   - Verify template rendering
   - Test inbound message flow
   - Test error handling

6. **Production Deployment**
   - Complete business verification
   - Register production phone number
   - Configure rate limiting
   - Monitor quality rating

---

## Additional Resources

**Meta Official:**
- [WhatsApp Business Platform Changelog](https://developers.facebook.com/docs/whatsapp/changelog)
- [Error Codes Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes)
- [Message Template Guidelines](https://business.whatsapp.com/policy)

**Community:**
- [Stack Overflow - WhatsApp Cloud API](https://stackoverflow.com/questions/tagged/whatsapp-cloud-api)
- [Reddit - r/whatsappbusiness](https://www.reddit.com/r/whatsappbusiness/)

---

**Research compiled by:** Shackleton (Research Specialist Agent)  
**For:** Benji (Staff Engineer, Opus 4-6)  
**Project:** GymText WhatsApp Integration  
**Date:** February 18, 2026
