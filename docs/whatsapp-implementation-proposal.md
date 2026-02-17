# WhatsApp Implementation Proposal for GymText

**Author:** Shackleton (Research Agent)  
**Date:** February 17, 2026  
**Branch:** `new-agent-system`  
**Status:** Proposal - Ready for Implementation

---

## Executive Summary

This document outlines a comprehensive plan to add WhatsApp messaging support to GymText alongside the existing SMS infrastructure. The implementation leverages Twilio's WhatsApp Business API, which shares the same messaging API as SMS, enabling a clean integration with minimal architectural changes.

**Key Benefits:**
- Reach international users (WhatsApp is dominant in LATAM, EMEA, APAC)
- Richer media support (images, videos, documents)
- Higher engagement rates (WhatsApp has ~98% open rates vs ~20% for SMS)
- Interactive features (buttons, quick replies)
- Lower cost for international messaging

**Implementation Complexity:** Medium  
**Estimated Timeline:** 2-3 weeks  
**Breaking Changes:** None (additive only)

---

## Table of Contents

1. [Current Architecture Summary](#current-architecture-summary)
2. [WhatsApp vs SMS: Key Differences](#whatsapp-vs-sms-key-differences)
3. [WhatsApp Integration Plan](#whatsapp-integration-plan)
4. [Code Changes Needed](#code-changes-needed)
5. [Configuration Required](#configuration-required)
6. [Database Schema Changes](#database-schema-changes)
7. [Testing Strategy](#testing-strategy)
8. [Migration Path](#migration-path)
9. [Potential Issues & Edge Cases](#potential-issues--edge-cases)
10. [Post-Launch Considerations](#post-launch-considerations)

---

## Current Architecture Summary

### Overview

GymText's messaging architecture follows a **message-first queue pattern**:

1. **Message Storage** → Store message in `messages` table
2. **Queue Entry** → Create queue entry in `message_queues` table
3. **Async Processing** → Inngest triggers message sending
4. **Delivery** → Twilio sends via SMS
5. **Status Updates** → Webhooks update message status

### Key Components

#### 1. **TwilioMessagingClient** (`packages/shared/src/server/connections/messaging/twilioClient.ts`)
- Implements `IMessagingClient` interface
- Wraps Twilio SDK for SMS/MMS delivery
- Maps Twilio status to standardized message status
- Provider: `'twilio'`

#### 2. **MessageService** (`packages/shared/src/server/services/domain/messaging/messageService.ts`)
- Domain service for message storage and retrieval
- Stores inbound/outbound messages
- Does NOT handle sending (that's MessagingOrchestrator's job)
- Integrates with Inngest for async processing

#### 3. **MessagingOrchestrator** (`packages/shared/src/server/services/orchestration/messagingOrchestrator.ts`)
- High-level orchestration service
- Coordinates MessageService, QueueService, and Twilio
- Methods:
  - `queueMessage()` - Queue single message
  - `queueMessages()` - Queue multiple messages
  - `sendImmediate()` - Send without queuing (for chat responses)
  - `processNext()` - Process next in queue
  - `sendQueuedMessage()` - Send specific queued message

#### 4. **QueueService** (`packages/shared/src/server/repositories/messageQueueRepository.ts`)
- Manages message queue entries
- Handles sequencing, retries, status tracking
- Supports multiple queue names per user

#### 5. **Inngest Functions**
- `processNextQueuedMessageFunction` - Process next in queue
- `sendQueuedMessageFunction` - Send specific message
- Event-driven, async processing

#### 6. **Webhooks**
- **Inbound:** `/api/twilio/sms` - Receives incoming SMS
- **Status:** `/api/twilio/status` - Delivery status updates
- Handles STOP/START commands for subscription management

### Database Schema

**Messages Table:**
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES users(id),
  direction varchar(10) NOT NULL, -- 'inbound' | 'outbound'
  content text NOT NULL,
  phone_from varchar(20),
  phone_to varchar(20),
  provider varchar(20) NOT NULL DEFAULT 'twilio',
  provider_message_id varchar(100),
  delivery_status varchar(20) NOT NULL DEFAULT 'pending',
  delivery_error text,
  delivery_attempts integer NOT NULL DEFAULT 0,
  last_delivery_attempt_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Message Queues Table:**
```sql
CREATE TABLE message_queues (
  id uuid PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES users(id),
  queue_name varchar(50) NOT NULL,
  sequence_number integer NOT NULL,
  message_id uuid REFERENCES messages(id),
  status varchar(20) NOT NULL DEFAULT 'pending',
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  error_message text,
  created_at timestamptz NOT NULL,
  sent_at timestamptz,
  delivered_at timestamptz
);
```

### Message Flow

**Outbound Message Flow:**
```
User triggers message
  → MessageService.storeOutboundMessage()
  → QueueService.enqueue()
  → Inngest.send('message-queue/process-next')
  → MessagingOrchestrator.processNext()
  → MessagingOrchestrator.sendQueuedMessage()
  → TwilioMessagingClient.sendMessage()
  → Twilio API
  → Status webhook updates delivery_status
```

**Inbound Message Flow:**
```
User sends SMS
  → Twilio webhook → /api/twilio/sms
  → MessageService.ingestMessage()
  → MessageService.storeInboundMessage()
  → Inngest.send('message/received')
  → Chat agent processes
  → MessagingOrchestrator.sendImmediate()
```

---

## WhatsApp vs SMS: Key Differences

### 1. **Message Templates (Business-Initiated Messages)**

**SMS:** No templates required. Send any message anytime.

**WhatsApp:** Business-initiated messages MUST use pre-approved templates.
- Templates must be submitted to WhatsApp for approval
- Approval takes 5 minutes to 24 hours
- Templates can include variables for personalization
- Used for: Workout notifications, reminders, updates

**Example Template:**
```
Approved Template: "workout_reminder"
Body: "Hey {{1}}! Your workout for today is ready. Reply 'ready' when you're set to start!"
Variables: ["userName"]
```

### 2. **24-Hour Session Window**

**Critical Rule:** Once a user sends you a WhatsApp message, you have a **24-hour session window** to send free-form messages (no template required).

**Implications:**
- User asks a question → 24-hour window opens
- During this window: Send unlimited free-form messages
- After 24 hours: Must use approved templates

**For GymText:**
- Conversational messages (user asking about workouts) → Free-form (within session)
- Daily workout notifications (business-initiated) → Template required
- User replies to notification → Opens 24-hour window for follow-ups

### 3. **Phone Number Format**

**SMS:** E.164 format (e.g., `+15005550006`)

**WhatsApp:** Prefixed E.164 format (e.g., `whatsapp:+15005550006`)

### 4. **Opt-In Requirements**

**SMS:** Opt-in required by TCPA (US law)

**WhatsApp:** Explicit opt-in REQUIRED by WhatsApp policy
- Must be gathered via web, app, or SMS
- Must be clear and specific to WhatsApp
- Violating opt-in rules can result in account suspension

### 5. **Status Callbacks**

**SMS:** Same webhook format

**WhatsApp:** Same webhook format + additional statuses:
- `read` - User read the message
- `delivered` - Message delivered to user's device

### 6. **Media Support**

**SMS/MMS:**
- Images: JPG, PNG, GIF
- Size limit: Carrier-dependent (~600KB typically)

**WhatsApp:**
- Images: JPG, JPEG, PNG
- Audio files
- PDF documents
- Videos
- Size limit: 16MB per message

### 7. **Interactive Features**

**SMS:** Text only (or simple TwiML buttons)

**WhatsApp:** Rich interactive features:
- Quick reply buttons
- List messages
- Location messages
- Contact cards

### 8. **Pricing**

**SMS:**
- US: ~$0.0075 per outbound SMS
- International: Varies widely ($0.02-$0.50+)

**WhatsApp:**
- User-initiated (within 24h window): Free
- Business-initiated (templates): 
  - US: ~$0.005 per conversation
  - International: Often cheaper than SMS

**For GymText:** WhatsApp can significantly reduce international messaging costs.

---

## WhatsApp Integration Plan

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 Twilio WhatsApp Account Setup
- [ ] Create/link Meta Business Manager account
- [ ] Enable WhatsApp on Twilio account (Console)
- [ ] Register WhatsApp Business Profile
- [ ] Configure business display name, description, logo
- [ ] Verify business (if required for production limits)

#### 1.2 WhatsApp Number Registration
- [ ] Request WhatsApp enablement for Twilio phone number
  - Or provision new WhatsApp-enabled number
- [ ] Configure WhatsApp sender profile
- [ ] Set webhook URLs for inbound messages and status callbacks

#### 1.3 Template Creation & Approval
Create and submit templates for:
- [ ] **Daily workout notification**
  - Name: `daily_workout_ready`
  - Body: `Hi {{1}}! Your workout for {{2}} is ready. Reply when you're ready to start! 💪`
  - Variables: `userName`, `date`
  
- [ ] **Weekly check-in**
  - Name: `weekly_checkin`
  - Body: `Hey {{1}}! How's your week going? Reply with any questions or feedback.`
  - Variables: `userName`
  
- [ ] **Subscription welcome**
  - Name: `welcome_message`
  - Body: `Welcome to GymText, {{1}}! 🎉 Your personalized training starts now. Reply START when you're ready for your first workout.`
  - Variables: `userName`

- [ ] **Subscription reminder**
  - Name: `subscription_reminder`
  - Body: `Hi {{1}}, your GymText subscription will renew on {{2}}. Reply STOP to cancel or CONTINUE to keep crushing your goals!`
  - Variables: `userName`, `renewalDate`

**Template Approval Tips:**
- Keep templates clear and concise
- Avoid promotional language (WhatsApp is strict)
- Include opt-out language where appropriate
- Test variables thoroughly

#### 1.4 Environment Configuration
- [ ] Add WhatsApp-specific environment variables
- [ ] Configure sandbox for testing
- [ ] Set up production credentials

---

### Phase 2: Code Implementation (Week 1-2)

#### 2.1 Create WhatsApp Messaging Client

**New File:** `packages/shared/src/server/connections/messaging/whatsappClient.ts`

```typescript
import { twilioClient as twilioSdk } from '../twilio/twilio';
import type { IMessagingClient, MessageResult, MessagingProvider } from './types';
import type { UserWithProfile } from '@/server/models/user';
import { getTwilioSecrets } from '@/server/config';

/**
 * WhatsApp Messaging Client
 * 
 * Implements IMessagingClient for WhatsApp delivery via Twilio.
 * Handles phone number prefixing and template-based messaging.
 */
export class WhatsAppMessagingClient implements IMessagingClient {
  public readonly provider: MessagingProvider = 'whatsapp';

  async sendMessage(
    user: UserWithProfile, 
    message?: string, 
    mediaUrls?: string[],
    templateSid?: string,
    templateVariables?: Record<string, string>
  ): Promise<MessageResult> {
    try {
      const whatsappNumber = this.formatWhatsAppNumber(user.phoneNumber);
      const fromNumber = this.formatWhatsAppNumber(getTwilioSecrets().phoneNumber);

      let twilioResponse;

      if (templateSid) {
        // Send template message
        twilioResponse = await twilioSdk.sendTemplateMessage(
          whatsappNumber,
          fromNumber,
          templateSid,
          templateVariables
        );
      } else {
        // Send freeform message (within 24h session window)
        twilioResponse = await twilioSdk.sendWhatsAppMessage(
          whatsappNumber,
          fromNumber,
          message,
          mediaUrls
        );
      }

      return {
        messageId: twilioResponse.sid,
        status: this.mapTwilioStatus(twilioResponse.status),
        provider: this.provider,
        to: twilioResponse.to,
        from: twilioResponse.from,
        timestamp: twilioResponse.dateCreated,
        metadata: {
          twilioSid: twilioResponse.sid,
          twilioStatus: twilioResponse.status,
          errorCode: twilioResponse.errorCode,
          errorMessage: twilioResponse.errorMessage,
          mediaUrls,
          templateSid,
        },
      };
    } catch (error) {
      console.error('WhatsAppMessagingClient: Failed to send message', error);
      throw error;
    }
  }

  /**
   * Format phone number for WhatsApp (add whatsapp: prefix)
   */
  private formatWhatsAppNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('whatsapp:')) {
      return phoneNumber;
    }
    return `whatsapp:${phoneNumber}`;
  }

  /**
   * Maps Twilio status to standardized message status
   */
  private mapTwilioStatus(twilioStatus: string): MessageResult['status'] {
    switch (twilioStatus) {
      case 'sent':
      case 'delivered':
      case 'read':
        return 'delivered';
      case 'queued':
      case 'accepted':
      case 'sending':
        return 'queued';
      case 'failed':
      case 'undelivered':
        return 'failed';
      default:
        return 'sent';
    }
  }
}

// Export singleton instance
export const whatsappMessagingClient = new WhatsAppMessagingClient();
```

#### 2.2 Update Twilio Client to Support WhatsApp

**File:** `packages/shared/src/server/connections/twilio/factory.ts`

Add methods to `ITwilioClient` interface:

```typescript
export interface ITwilioClient {
  sendSMS(to: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance>;
  sendMMS(to: string, message: string | undefined, mediaUrls: string[]): Promise<MessageInstance>;
  
  // NEW: WhatsApp methods
  sendWhatsAppMessage(to: string, from: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance>;
  sendTemplateMessage(to: string, from: string, contentSid: string, contentVariables?: Record<string, string>): Promise<MessageInstance>;
  
  getMessageStatus(messageSid: string): Promise<MessageInstance>;
  getFromNumber(): string;
}
```

Implement in `createTwilioClient()`:

```typescript
async sendWhatsAppMessage(
  to: string, 
  from: string,
  message?: string, 
  mediaUrls?: string[]
): Promise<MessageInstance> {
  try {
    console.log('Sending WhatsApp message from:', from, 'to:', to);
    
    const response = await client.messages.create({
      ...(message && { body: message }),
      from: from, // whatsapp:+14155238886
      to: to,     // whatsapp:+15005550006
      statusCallback: statusCallbackUrl,
      ...(mediaUrls && mediaUrls.length > 0 && { mediaUrl: mediaUrls }),
    });
    
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
},

async sendTemplateMessage(
  to: string,
  from: string,
  contentSid: string,
  contentVariables?: Record<string, string>
): Promise<MessageInstance> {
  try {
    console.log('Sending WhatsApp template message:', contentSid, 'from:', from, 'to:', to);
    
    const response = await client.messages.create({
      from: from,
      to: to,
      contentSid: contentSid,
      ...(contentVariables && { contentVariables: JSON.stringify(contentVariables) }),
      statusCallback: statusCallbackUrl,
    });
    
    return response;
  } catch (error) {
    console.error('Error sending template message:', error);
    throw error;
  }
},
```

#### 2.3 Update Messaging Types

**File:** `packages/shared/src/server/connections/messaging/types.ts`

Update `MessagingProvider` type:

```typescript
export type MessagingProvider = 'twilio' | 'whatsapp' | 'local' | 'websocket';
```

Update `IMessagingClient` interface to support templates:

```typescript
export interface IMessagingClient {
  readonly provider: MessagingProvider;

  sendMessage(
    user: UserWithProfile, 
    message?: string, 
    mediaUrls?: string[],
    templateSid?: string,
    templateVariables?: Record<string, string>
  ): Promise<MessageResult>;
}
```

#### 2.4 Create Messaging Client Factory

**File:** `packages/shared/src/server/connections/messaging/factory.ts`

```typescript
import { twilioMessagingClient } from './twilioClient';
import { whatsappMessagingClient } from './whatsappClient';
import { localMessagingClient } from './localClient';
import type { IMessagingClient, MessagingProvider } from './types';

/**
 * Get messaging client by provider
 */
export function getMessagingClient(provider: MessagingProvider): IMessagingClient {
  switch (provider) {
    case 'twilio':
      return twilioMessagingClient;
    case 'whatsapp':
      return whatsappMessagingClient;
    case 'local':
      return localMessagingClient;
    default:
      throw new Error(`Unknown messaging provider: ${provider}`);
  }
}
```

#### 2.5 Update User Model to Support Messaging Preferences

**File:** `packages/shared/src/server/models/user.ts`

Add fields to user profile:

```typescript
export interface UserProfile {
  // ... existing fields
  
  // Messaging preferences
  preferredMessagingProvider?: 'twilio' | 'whatsapp';
  whatsappOptIn?: boolean;
  whatsappOptInDate?: Date;
  whatsappNumber?: string; // If different from phone number
}
```

#### 2.6 Update MessagingOrchestrator to Support Provider Selection

**File:** `packages/shared/src/server/services/orchestration/messagingOrchestrator.ts`

Update methods to accept optional provider:

```typescript
async queueMessage(
  user: UserWithProfile,
  content: QueuedMessageContent,
  queueName: string,
  provider?: MessagingProvider, // NEW
  templateSid?: string,         // NEW
  templateVariables?: Record<string, string> // NEW
): Promise<{ messageId: string; queueEntryId: string }> {
  // Determine provider
  const messageProvider = provider || user.profile?.preferredMessagingProvider || 'twilio';
  
  // Store the message with provider
  const message = await messageService.storeOutboundMessage({
    clientId: user.id,
    to: user.phoneNumber,
    content: content.content || '[Template Message]',
    provider: messageProvider,
    metadata: {
      ...(content.mediaUrls && { mediaUrls: content.mediaUrls }),
      ...(templateSid && { templateSid }),
      ...(templateVariables && { templateVariables }),
    },
    deliveryStatus: 'queued',
  });

  // ... rest of queueing logic
}
```

Update `sendImmediate`:

```typescript
async sendImmediate(
  user: UserWithProfile, 
  content: string, 
  mediaUrls?: string[],
  provider?: MessagingProvider
): Promise<SendResult> {
  const messageProvider = provider || user.profile?.preferredMessagingProvider || 'twilio';
  const client = getMessagingClient(messageProvider);

  const message = await messageService.storeOutboundMessage({
    clientId: user.id,
    to: user.phoneNumber,
    content,
    provider: messageProvider,
    metadata: mediaUrls ? { mediaUrls } : undefined,
    deliveryStatus: 'sent',
  });

  if (!message) {
    return { success: false, error: 'Failed to store message' };
  }

  try {
    const result = await client.sendMessage(user, content, mediaUrls);
    
    // Update with provider message ID
    if (result.messageId) {
      await messageService.updateProviderMessageId(message.id, result.messageId);
    }

    return {
      success: true,
      messageId: message.id,
      providerMessageId: result.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await messageService.updateDeliveryStatus(message.id, 'failed', errorMessage);
    
    return {
      success: false,
      messageId: message.id,
      error: errorMessage,
    };
  }
}
```

#### 2.7 Create WhatsApp Webhook Handler

**New File:** `apps/web/src/app/api/whatsapp/webhook/route.ts`

```typescript
import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getTwilioSecrets } from '@/server/config';

const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'UNSTOP', 'RESUME'];

function isStopCommand(message: string): boolean {
  return STOP_KEYWORDS.includes(message.trim().toUpperCase());
}

function isStartCommand(message: string): boolean {
  return START_KEYWORDS.includes(message.trim().toUpperCase());
}

export async function POST(req: NextRequest) {
  try {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    // WhatsApp numbers are prefixed: whatsapp:+15005550006
    const incomingMessage = body.Body as string || '';
    const from = body.From as string || ''; // whatsapp:+15005550006
    const to = body.To as string || '';

    // Strip whatsapp: prefix to lookup user
    const phoneNumber = from.replace('whatsapp:', '');

    const services = getServices();
    const user = await services.user.getUserByPhone(phoneNumber);

    if (!user) {
      twiml.message('Sign up now! https://www.gymtext.co/');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile.');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Handle STOP/START commands (same as SMS)
    if (isStopCommand(incomingMessage)) {
      const result = await services.subscription.cancelSubscription(user.id);
      
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
      });

      let confirmationMessage: string;
      if (result.success && result.periodEndDate) {
        const formattedDate = result.periodEndDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
        confirmationMessage = `You've been unsubscribed from GymText. You'll have access until ${formattedDate}. Reply START anytime to reactivate.`;
      } else {
        confirmationMessage = `Sorry, there was an issue. Please contact support.`;
      }

      await services.messagingOrchestrator.sendImmediate(
        userWithProfile, 
        confirmationMessage,
        undefined,
        'whatsapp'
      );

      twiml.message('');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (isStartCommand(incomingMessage)) {
      const result = await services.subscription.reactivateSubscription(user.id);
      
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
      });

      let confirmationMessage = 'Welcome back to GymText!';
      if (result.requiresNewSubscription && result.checkoutUrl) {
        confirmationMessage = `Your subscription has ended. Resubscribe here: ${result.checkoutUrl}`;
      }

      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        confirmationMessage,
        undefined,
        'whatsapp'
      );

      twiml.message('');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Ingest message for chat agent processing
    const result = await services.message.ingestMessage({
      user: userWithProfile,
      content: incomingMessage,
      from,
      to,
      twilioData: body
    });

    twiml.message(result.ackMessage);

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Sorry, something went wrong. Please try again later.');

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
```

**New File:** `apps/web/src/app/api/whatsapp/status/route.ts`

(Similar to existing `/api/twilio/status` but for WhatsApp delivery updates)

```typescript
import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    const messageSid = body.MessageSid as string;
    const status = body.MessageStatus as string;
    const errorCode = body.ErrorCode as string | undefined;
    const errorMessage = body.ErrorMessage as string | undefined;

    console.log('[WhatsApp Status Webhook]', {
      messageSid,
      status,
      errorCode,
      errorMessage,
    });

    const services = getServices();

    // Handle delivery confirmation or failure
    if (status === 'delivered' || status === 'read') {
      await services.messagingOrchestrator.handleDeliveryConfirmation(messageSid);
    } else if (status === 'failed' || status === 'undelivered') {
      await services.messagingOrchestrator.handleDeliveryFailure(
        messageSid,
        errorMessage || errorCode
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing WhatsApp status webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process status webhook' },
      { status: 500 }
    );
  }
}
```

#### 2.8 Update Cron Jobs to Support WhatsApp

**File:** `apps/web/src/app/api/cron/daily-messages/route.ts`

Add logic to send via WhatsApp if user prefers:

```typescript
// Determine messaging provider for this user
const provider = user.profile?.preferredMessagingProvider || 'twilio';

if (provider === 'whatsapp') {
  // Send via WhatsApp template
  await services.messagingOrchestrator.queueMessage(
    user,
    { content: workoutMessage },
    `daily-${user.id}`,
    'whatsapp',
    'daily_workout_ready', // Template SID
    { 
      '1': user.name || 'there', 
      '2': new Date().toLocaleDateString() 
    }
  );
} else {
  // Send via SMS (existing logic)
  await services.messagingOrchestrator.queueMessage(
    user,
    { content: workoutMessage },
    `daily-${user.id}`,
    'twilio'
  );
}
```

---

### Phase 3: Testing (Week 2)

See [Testing Strategy](#testing-strategy) section below.

---

### Phase 4: Deployment & Migration (Week 3)

See [Migration Path](#migration-path) section below.

---

## Code Changes Needed

### New Files to Create

1. **`packages/shared/src/server/connections/messaging/whatsappClient.ts`**
   - WhatsApp messaging client implementation
   - Implements `IMessagingClient` interface
   - Handles number formatting, template sending

2. **`packages/shared/src/server/connections/messaging/factory.ts`**
   - Messaging client factory
   - Returns appropriate client based on provider

3. **`apps/web/src/app/api/whatsapp/webhook/route.ts`**
   - WhatsApp inbound message webhook handler
   - Handles STOP/START commands
   - Routes to chat agent

4. **`apps/web/src/app/api/whatsapp/status/route.ts`**
   - WhatsApp delivery status webhook
   - Updates message delivery status

5. **`packages/shared/src/server/utils/whatsappTemplates.ts`**
   - Template management utilities
   - Template SID constants
   - Template variable builders

### Files to Modify

1. **`packages/shared/src/server/connections/twilio/factory.ts`**
   - Add `sendWhatsAppMessage()` method
   - Add `sendTemplateMessage()` method

2. **`packages/shared/src/server/connections/messaging/types.ts`**
   - Update `MessagingProvider` type to include `'whatsapp'`
   - Update `IMessagingClient` interface for templates

3. **`packages/shared/src/server/connections/messaging/index.ts`**
   - Export new factory function
   - Update default client logic

4. **`packages/shared/src/server/models/user.ts`**
   - Add `preferredMessagingProvider` field
   - Add `whatsappOptIn` field
   - Add `whatsappOptInDate` field

5. **`packages/shared/src/server/services/orchestration/messagingOrchestrator.ts`**
   - Update `queueMessage()` to accept provider, templateSid, templateVariables
   - Update `sendImmediate()` to accept provider
   - Update `sendQueuedMessage()` to use provider from metadata

6. **`packages/shared/src/server/services/domain/messaging/messageService.ts`**
   - Ensure `provider` field is stored correctly
   - Handle WhatsApp-specific metadata

7. **`apps/web/src/app/api/cron/daily-messages/route.ts`**
   - Check user messaging preference
   - Send via WhatsApp template if preferred

8. **`apps/web/src/app/api/cron/weekly-messages/route.ts`**
   - Check user messaging preference
   - Send via WhatsApp template if preferred

9. **`apps/admin/src/app/users/[id]/page.tsx`** (Admin UI)
   - Add messaging preference selector
   - Show WhatsApp opt-in status

10. **`apps/web/src/app/settings/page.tsx`** (User Settings)
    - Add messaging preference toggle
    - Show opt-in/opt-out for WhatsApp

### Database Migration

**File:** `migrations/20260218000000_add_whatsapp_support.ts`

```typescript
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add WhatsApp-related fields to user_profiles
  await db.schema
    .alterTable('user_profiles')
    .addColumn('preferred_messaging_provider', 'varchar(20)')
    .addColumn('whatsapp_opt_in', 'boolean', (col) => col.defaultTo(false))
    .addColumn('whatsapp_opt_in_date', 'timestamptz')
    .addColumn('whatsapp_number', 'varchar(20)')
    .execute();

  // Add index for provider field in messages
  await sql`
    CREATE INDEX IF NOT EXISTS messages_provider_idx 
    ON messages(provider)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('user_profiles')
    .dropColumn('preferred_messaging_provider')
    .dropColumn('whatsapp_opt_in')
    .dropColumn('whatsapp_opt_in_date')
    .dropColumn('whatsapp_number')
    .execute();

  await sql`DROP INDEX IF EXISTS messages_provider_idx`.execute(db);
}
```

---

## Configuration Required

### Environment Variables

**File:** `.env.local`

```bash
# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER="+14155238886"  # Your WhatsApp-enabled Twilio number

# WhatsApp Templates (Content SIDs from Twilio)
WHATSAPP_TEMPLATE_DAILY_WORKOUT="HXb5b62575e6e4ff6129ad7c8efe1f983e"
WHATSAPP_TEMPLATE_WEEKLY_CHECKIN="HXc7d83686f7f5gg7230be8d9fgf2g094f"
WHATSAPP_TEMPLATE_WELCOME="HXd8e94797g8g6hh8341cf9e0ghg3h105g"
WHATSAPP_TEMPLATE_SUBSCRIPTION_REMINDER="HXe9f05808h9h7ii9452dg0f1hih4i216h"
```

**File:** `packages/shared/src/server/config/index.ts`

Add configuration helpers:

```typescript
export function getWhatsAppConfig() {
  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    phoneNumber: requireEnv('WHATSAPP_PHONE_NUMBER'),
    templates: {
      dailyWorkout: requireEnv('WHATSAPP_TEMPLATE_DAILY_WORKOUT'),
      weeklyCheckin: requireEnv('WHATSAPP_TEMPLATE_WEEKLY_CHECKIN'),
      welcome: requireEnv('WHATSAPP_TEMPLATE_WELCOME'),
      subscriptionReminder: requireEnv('WHATSAPP_TEMPLATE_SUBSCRIPTION_REMINDER'),
    },
  };
}
```

### Twilio Console Configuration

1. **Enable WhatsApp on Account**
   - Navigate to: Messaging → Try it out → WhatsApp
   - Follow self-signup process
   - Link Meta Business Manager account

2. **Configure WhatsApp Sender**
   - Navigate to: Messaging → Senders → WhatsApp Senders
   - Click on your WhatsApp-enabled number
   - Set webhook URLs:
     - **Inbound Messages:** `https://yourdomain.com/api/whatsapp/webhook`
     - **Status Callback:** `https://yourdomain.com/api/whatsapp/status`

3. **Create Message Templates**
   - Navigate to: Messaging → Content Template Builder
   - Create templates for each use case
   - Submit for approval (5 min - 24 hours)
   - Copy Content SIDs to environment variables

### Meta Business Manager

1. **Create/Link Account**
   - Go to business.facebook.com
   - Create business account or link existing
   - Verify business (if scaling beyond 2 phone numbers)

2. **Configure Business Profile**
   - Business name
   - Business category
   - Business description
   - Profile photo/logo
   - Business hours
   - Website

---

## Database Schema Changes

### Migration: Add WhatsApp Support

**File:** `migrations/20260218000000_add_whatsapp_support.ts`

```sql
-- Add messaging preference fields to user_profiles
ALTER TABLE user_profiles 
  ADD COLUMN preferred_messaging_provider VARCHAR(20) DEFAULT 'twilio',
  ADD COLUMN whatsapp_opt_in BOOLEAN DEFAULT FALSE,
  ADD COLUMN whatsapp_opt_in_date TIMESTAMPTZ,
  ADD COLUMN whatsapp_number VARCHAR(20);

-- Add index for provider in messages table
CREATE INDEX IF NOT EXISTS messages_provider_idx ON messages(provider);

-- Add index for WhatsApp opt-in users
CREATE INDEX IF NOT EXISTS user_profiles_whatsapp_opt_in_idx 
  ON user_profiles(whatsapp_opt_in) 
  WHERE whatsapp_opt_in = TRUE;
```

### Schema Changes Summary

**`user_profiles` table:**
- `preferred_messaging_provider` - Default messaging channel ('twilio' | 'whatsapp')
- `whatsapp_opt_in` - Has user opted in to WhatsApp messaging?
- `whatsapp_opt_in_date` - When did user opt in?
- `whatsapp_number` - Alternative WhatsApp number (if different from main phone)

**`messages` table:**
- No schema changes needed! Already has `provider` field
- Will use 'whatsapp' as provider value

---

## Testing Strategy

### Phase 1: Sandbox Testing

#### 1.1 Setup Twilio Sandbox for WhatsApp
- [ ] Activate sandbox in Twilio Console
- [ ] Connect personal WhatsApp account to sandbox
- [ ] Configure sandbox webhook URLs

#### 1.2 Unit Tests

**File:** `packages/shared/src/server/connections/messaging/whatsappClient.test.ts`

```typescript
import { WhatsAppMessagingClient } from './whatsappClient';
import { twilioClient } from '../twilio/twilio';

describe('WhatsAppMessagingClient', () => {
  const client = new WhatsAppMessagingClient();

  it('should format phone numbers with whatsapp: prefix', () => {
    // Test number formatting
  });

  it('should send freeform message', async () => {
    // Mock Twilio client
    // Test sendMessage without template
  });

  it('should send template message', async () => {
    // Mock Twilio client
    // Test sendMessage with template
  });

  it('should map Twilio statuses correctly', () => {
    // Test status mapping
  });
});
```

#### 1.3 Integration Tests

**Test Scenarios:**

1. **Send Outbound Template Message**
   - [ ] Queue template message
   - [ ] Verify message sent via WhatsApp
   - [ ] Verify delivery status webhook received
   - [ ] Verify message status updated in database

2. **Receive Inbound Message**
   - [ ] Send WhatsApp message to sandbox number
   - [ ] Verify webhook received
   - [ ] Verify message stored in database
   - [ ] Verify chat agent processes message
   - [ ] Verify response sent via WhatsApp

3. **24-Hour Session Window**
   - [ ] Send template message (business-initiated)
   - [ ] User replies (opens 24h window)
   - [ ] Send freeform follow-up message
   - [ ] Verify freeform message sent successfully

4. **STOP/START Commands**
   - [ ] Send "STOP" via WhatsApp
   - [ ] Verify subscription canceled
   - [ ] Verify confirmation message sent
   - [ ] Send "START" via WhatsApp
   - [ ] Verify subscription reactivated

5. **Media Messages**
   - [ ] Send MMS with image via WhatsApp
   - [ ] Verify image received
   - [ ] Send WhatsApp with image back
   - [ ] Verify image sent successfully

### Phase 2: Staging Testing

#### 2.1 Production WhatsApp Number Setup
- [ ] Request WhatsApp enablement for production number
- [ ] Configure production webhooks
- [ ] Submit production templates for approval
- [ ] Verify templates approved

#### 2.2 End-to-End Testing

**Test with Real Users (Internal Team):**

1. **Onboarding Flow**
   - [ ] User signs up
   - [ ] User opts in to WhatsApp
   - [ ] Welcome template message sent
   - [ ] User receives welcome message

2. **Daily Workout Flow**
   - [ ] Cron triggers daily workout
   - [ ] Template message sent via WhatsApp
   - [ ] User receives workout
   - [ ] User asks question
   - [ ] Chat agent responds via WhatsApp

3. **Provider Switching**
   - [ ] User changes preference from SMS to WhatsApp
   - [ ] Next workout sent via WhatsApp
   - [ ] User changes back to SMS
   - [ ] Next workout sent via SMS

4. **Error Handling**
   - [ ] Simulate delivery failure
   - [ ] Verify retry logic
   - [ ] Verify fallback to SMS (optional)

### Phase 3: Load Testing

- [ ] Test high-volume message sending (100+ messages)
- [ ] Monitor Twilio API rate limits
- [ ] Monitor queue processing performance
- [ ] Monitor webhook latency

### Phase 4: User Acceptance Testing

- [ ] Beta test with 10-20 real users
- [ ] Collect feedback on WhatsApp experience
- [ ] Monitor engagement metrics
- [ ] Compare SMS vs WhatsApp open/response rates

---

## Migration Path

### Strategy: Additive, Opt-In Rollout

**Goal:** Add WhatsApp alongside SMS with zero disruption to existing users.

### Phase 1: Infrastructure Deployment (Week 1)

1. **Deploy Code Changes**
   - [ ] Merge WhatsApp implementation to `main`
   - [ ] Deploy to staging environment
   - [ ] Run integration tests
   - [ ] Deploy to production
   - [ ] Verify no impact on existing SMS functionality

2. **Run Database Migration**
   - [ ] Backup production database
   - [ ] Run migration to add user preference fields
   - [ ] Verify migration success
   - [ ] Default all existing users to `preferredMessagingProvider: 'twilio'`

3. **Configure Production WhatsApp Number**
   - [ ] Enable WhatsApp on production Twilio number
   - [ ] Set production webhook URLs
   - [ ] Verify webhook connectivity

4. **Deploy Templates**
   - [ ] Create production templates in Twilio
   - [ ] Submit for WhatsApp approval
   - [ ] Wait for approval (5 min - 24 hours)
   - [ ] Add approved template SIDs to environment variables
   - [ ] Redeploy with template configuration

### Phase 2: Internal Beta (Week 2)

1. **Enable WhatsApp for Team**
   - [ ] Update team member profiles: `preferredMessagingProvider: 'whatsapp'`
   - [ ] Send test workout via WhatsApp
   - [ ] Verify delivery and engagement

2. **Monitor & Iterate**
   - [ ] Monitor logs for WhatsApp-related errors
   - [ ] Track message delivery rates
   - [ ] Collect team feedback
   - [ ] Fix any bugs discovered

### Phase 3: External Beta (Week 3)

1. **Add Opt-In UI**
   - [ ] Add WhatsApp opt-in toggle to user settings page
   - [ ] Add opt-in during onboarding flow (optional)
   - [ ] Show clear explanation of WhatsApp benefits

2. **Invite Beta Testers**
   - [ ] Email 50-100 engaged users
   - [ ] Offer WhatsApp as beta feature
   - [ ] Provide clear instructions for opt-in
   - [ ] Set up feedback channel

3. **Monitor Beta Performance**
   - [ ] Track opt-in rate
   - [ ] Compare engagement: WhatsApp vs SMS
   - [ ] Monitor delivery success rate
   - [ ] Collect user feedback

### Phase 4: General Availability (Week 4+)

1. **Announce WhatsApp Support**
   - [ ] Email all users about WhatsApp availability
   - [ ] Highlight benefits (international, media, engagement)
   - [ ] Provide easy opt-in link

2. **Gradual Rollout**
   - **Week 1:** 10% of users see opt-in prompt
   - **Week 2:** 25% of users see opt-in prompt
   - **Week 3:** 50% of users see opt-in prompt
   - **Week 4:** 100% of users see opt-in prompt

3. **Monitor at Scale**
   - [ ] Track adoption rate (% users on WhatsApp)
   - [ ] Monitor WhatsApp costs vs SMS costs
   - [ ] Track engagement metrics by provider
   - [ ] Monitor error rates and delivery failures

### Rollback Plan

**If issues arise:**

1. **Disable WhatsApp Globally**
   - Set `WHATSAPP_ENABLED=false` in environment
   - All messages fall back to SMS
   - No data loss or user disruption

2. **Migrate Users Back to SMS**
   - Update all users: `preferredMessagingProvider: 'twilio'`
   - Continue service via SMS

3. **Debug & Relaunch**
   - Fix issues in staging
   - Retest thoroughly
   - Gradual re-rollout

---

## Potential Issues & Edge Cases

### 1. **Template Rejection**

**Issue:** WhatsApp rejects message templates during approval.

**Causes:**
- Promotional language
- Missing opt-out language
- Unclear variable usage
- Policy violations

**Mitigation:**
- Follow WhatsApp template best practices
- Keep language clear, concise, transactional
- Test templates in sandbox first
- Have backup template variations ready

**Fallback:**
- Use SMS for business-initiated messages if templates rejected
- Rely on user-initiated sessions for freeform WhatsApp messages

### 2. **24-Hour Session Window Expiration**

**Issue:** User doesn't respond within 24 hours, can't send freeform message.

**Scenario:**
- Send daily workout template
- User doesn't respond
- 24 hours pass
- User asks question → Can respond freely
- 24 hours pass again → Need template

**Mitigation:**
- Always use templates for business-initiated messages
- Track session window expiration in database (optional enhancement)
- Send follow-up templates if needed

**Implementation:**
```typescript
// Optional: Track session windows
interface WhatsAppSession {
  userId: string;
  lastInboundMessage: Date;
  sessionExpiresAt: Date; // lastInboundMessage + 24 hours
}

function isSessionActive(session: WhatsAppSession): boolean {
  return new Date() < session.sessionExpiresAt;
}
```

### 3. **Phone Number Format Mismatch**

**Issue:** User's phone number not in E.164 format, WhatsApp delivery fails.

**Examples:**
- `(555) 123-4567` instead of `+15551234567`
- Missing country code

**Mitigation:**
- Validate phone numbers on signup (already done)
- Normalize phone numbers before sending
- Add phone number formatting utility

```typescript
function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assume US)
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  
  return '+' + cleaned;
}
```

### 4. **WhatsApp Account Suspension**

**Issue:** WhatsApp suspends account for policy violations.

**Causes:**
- Sending to users without opt-in
- Spam/bulk messaging
- User complaints/blocks
- Policy violations

**Mitigation:**
- Strict opt-in enforcement
- Track opt-in status in database
- Monitor quality rating in Meta Business Manager
- Respond quickly to user complaints

**Monitoring:**
```typescript
// Track quality metrics
interface QualityMetrics {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  blocks: number;
  complaints: number;
  qualityRating: 'green' | 'yellow' | 'red';
}
```

**Response:**
- If quality rating drops to yellow: Review messaging practices
- If quality rating drops to red: Immediate pause, investigate

### 5. **User Has No WhatsApp**

**Issue:** User opts in to WhatsApp but doesn't have WhatsApp installed.

**Result:** Messages fail to deliver.

**Mitigation:**
- Detect delivery failures
- After 2-3 failures, auto-switch user back to SMS
- Notify user of switch

```typescript
async function handleWhatsAppDeliveryFailure(userId: string, errorCode: string) {
  // Twilio error code 63016: User not on WhatsApp
  if (errorCode === '63016') {
    console.log(`User ${userId} not on WhatsApp, switching to SMS`);
    
    await db
      .updateTable('user_profiles')
      .set({ preferredMessagingProvider: 'twilio' })
      .where('userId', '=', userId)
      .execute();
    
    // Notify user
    await sendSMS(userId, 'We noticed you don\'t have WhatsApp. We\'ve switched you back to SMS. Reply WHATSAPP if you\'d like to try again.');
  }
}
```

### 6. **International Phone Numbers**

**Issue:** WhatsApp number formatting varies by country.

**Examples:**
- UK: `+44 7911 123456`
- Brazil: `+55 11 98765-4321`
- India: `+91 98765 43210`

**Mitigation:**
- Use `libphonenumber` library for robust formatting
- Validate country codes
- Test with international numbers

```typescript
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

function formatWhatsAppNumber(phoneNumber: string): string | null {
  try {
    if (!isValidPhoneNumber(phoneNumber)) {
      return null;
    }
    
    const parsed = parsePhoneNumber(phoneNumber);
    return `whatsapp:${parsed.number}`;
  } catch (error) {
    console.error('Invalid phone number:', phoneNumber);
    return null;
  }
}
```

### 7. **Rate Limits**

**Issue:** Twilio/WhatsApp rate limits restrict message sending.

**Limits:**
- WhatsApp: 1000 messages per second (enterprise)
- Twilio: Account-specific limits

**Mitigation:**
- Implement rate limiting in queue processor
- Batch message sending
- Monitor API rate limit headers

```typescript
// Rate limiter for WhatsApp messages
import Bottleneck from 'bottleneck';

const whatsappLimiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100, // 100ms between messages = 10 msg/sec
});

async function sendWhatsAppWithRateLimit(user, message) {
  return whatsappLimiter.schedule(() => 
    whatsappClient.sendMessage(user, message)
  );
}
```

### 8. **Template Variable Mismatches**

**Issue:** Template expects variable `{{1}}` but code sends `userName`.

**Result:** Template fails to render, message rejected.

**Mitigation:**
- Create type-safe template builders
- Validate variables before sending
- Unit test template rendering

```typescript
// Type-safe template builders
const TEMPLATES = {
  dailyWorkout: {
    sid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
    variables: ['userName', 'date'] as const,
    build: (userName: string, date: string) => ({
      '1': userName,
      '2': date,
    }),
  },
  weeklyCheckin: {
    sid: 'HXc7d83686f7f5gg7230be8d9fgf2g094f',
    variables: ['userName'] as const,
    build: (userName: string) => ({
      '1': userName,
    }),
  },
};

// Usage
const vars = TEMPLATES.dailyWorkout.build(user.name, todayDate);
await sendTemplateMessage(user, TEMPLATES.dailyWorkout.sid, vars);
```

### 9. **Webhook Delivery Failures**

**Issue:** Twilio can't reach webhook URL (downtime, DNS issues).

**Result:** Inbound messages not processed, status updates missed.

**Mitigation:**
- Monitor webhook health
- Set up webhook retry logic (Twilio retries automatically)
- Implement fallback webhook URL
- Log all webhook failures

```typescript
// Webhook health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

### 10. **Cost Overruns**

**Issue:** WhatsApp messaging costs exceed budget.

**Causes:**
- High volume of business-initiated conversations
- Unexpected international usage
- Template-heavy messaging pattern

**Mitigation:**
- Monitor WhatsApp costs daily
- Set up billing alerts in Twilio
- Optimize template usage
- Leverage 24-hour session windows for free messaging
- Consider hybrid approach (templates for some, SMS for others)

**Cost Monitoring:**
```typescript
// Daily cost tracking
interface DailyCosts {
  date: Date;
  smsCount: number;
  smsCost: number;
  whatsappSessionCount: number;
  whatsappBusinessInitiated: number;
  whatsappCost: number;
  totalCost: number;
}

// Alert if daily cost exceeds threshold
if (dailyCost.totalCost > DAILY_COST_THRESHOLD) {
  await notifyAdmin(`Daily messaging cost exceeded: $${dailyCost.totalCost}`);
}
```

---

## Post-Launch Considerations

### 1. **Analytics & Metrics**

**Track:**
- WhatsApp adoption rate (% users opted in)
- Delivery success rate (WhatsApp vs SMS)
- Engagement rate (open rate, response rate)
- Cost per message (WhatsApp vs SMS)
- User satisfaction (surveys, feedback)

**Dashboards:**
- Messaging provider breakdown (SMS vs WhatsApp)
- Daily/weekly message volume by provider
- Delivery success rates
- Cost analysis

### 2. **Optimization Opportunities**

**Template Optimization:**
- A/B test template messaging
- Optimize variable usage
- Test different template styles

**Session Window Optimization:**
- Encourage user engagement to open 24h windows
- Send follow-up messages within windows to maximize free messaging
- Track session window utilization rate

**Cost Optimization:**
- For high-engagement users: Prefer WhatsApp (lower cost per conversation)
- For low-engagement users: Prefer SMS (avoid template costs)
- Implement smart provider selection based on user behavior

### 3. **Feature Enhancements**

**Rich Messaging:**
- Quick reply buttons for workout responses
- List messages for exercise selection
- Interactive workout tracking via buttons

**Example:**
```typescript
// Send workout with quick reply buttons
await whatsappClient.sendMessage(user, 'Ready for your workout?', undefined, {
  type: 'button',
  buttons: [
    { id: 'start', title: 'Start Workout' },
    { id: 'skip', title: 'Skip Today' },
    { id: 'reschedule', title: 'Reschedule' },
  ],
});
```

**Location-Based Features:**
- Send gym location
- Share workout location

**Media-Rich Workouts:**
- Send exercise demo videos via WhatsApp
- Send workout PDFs
- Send progress photos

### 4. **Multi-Provider Strategy**

**Hybrid Approach:**
- Critical notifications: SMS (higher reliability)
- Engagement/content: WhatsApp (richer, cheaper)
- User preference: Allow per-message-type preferences

**Example:**
```typescript
interface MessagingPreferences {
  dailyWorkouts: 'sms' | 'whatsapp';
  weeklyCheckins: 'sms' | 'whatsapp';
  chatResponses: 'sms' | 'whatsapp';
  systemNotifications: 'sms' | 'whatsapp';
}
```

### 5. **International Expansion**

**WhatsApp is dominant in:**
- Latin America (Brazil, Mexico, Argentina)
- Europe (Spain, Italy, Germany)
- Asia-Pacific (India, Indonesia)
- Middle East & Africa

**Strategy:**
- Target international markets with WhatsApp-first approach
- Offer WhatsApp as default for international users
- Translate templates for localization

### 6. **Compliance & Privacy**

**GDPR Considerations:**
- User data stored in WhatsApp messages
- Right to data deletion
- Data export requirements

**Implementation:**
- Add WhatsApp message deletion to user deletion flow
- Include WhatsApp messages in data export
- Document WhatsApp data handling in privacy policy

### 7. **Fallback & Redundancy**

**Multi-Channel Redundancy:**
- If WhatsApp delivery fails → Fall back to SMS
- If SMS delivery fails → Notify via email
- Critical messages: Send via multiple channels

**Implementation:**
```typescript
async function sendCriticalMessage(user: User, message: string) {
  // Try WhatsApp first
  const whatsappResult = await sendWhatsApp(user, message);
  
  if (!whatsappResult.success) {
    // Fall back to SMS
    const smsResult = await sendSMS(user, message);
    
    if (!smsResult.success) {
      // Last resort: Email
      await sendEmail(user, message);
    }
  }
}
```

---

## Conclusion

This WhatsApp implementation proposal provides a comprehensive, production-ready plan for adding WhatsApp messaging to GymText. The architecture leverages the existing messaging infrastructure with minimal changes, ensuring a clean, maintainable integration.

**Key Strengths:**
- ✅ **Additive, not disruptive** - No breaking changes to existing SMS functionality
- ✅ **Type-safe** - Leverages existing TypeScript interfaces
- ✅ **Scalable** - Uses existing queue system and Inngest
- ✅ **Testable** - Clear testing strategy with sandbox and staging
- ✅ **Flexible** - Easy to extend with rich messaging features
- ✅ **Cost-effective** - Can reduce international messaging costs
- ✅ **User-centric** - Gives users choice of messaging provider

**Next Steps:**
1. Review this proposal with the team
2. Get approval for WhatsApp Business setup
3. Begin Phase 1: Infrastructure Setup
4. Iterate based on testing and feedback

**Questions or concerns?** Review the [Potential Issues](#potential-issues--edge-cases) section for edge case handling, or reach out to the team for clarification.

---

**End of Proposal**
