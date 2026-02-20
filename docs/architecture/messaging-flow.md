# Messaging Flow

GymText delivers workout plans and coaching conversations via SMS (Twilio). This document explains the messaging architecture.

## Overview

```
User Phone          Twilio              GymText API            Agent System
    │                  │                      │                      │
    │  "What workout   │                      │                      │
    │   should I do?"  │                      │                      │
    │─────────────────▶│  Webhook Request     │                      │
    │                  │─────────────────────▶│                      │
    │                  │                      │  Store message      │
    │                  │                      │─────────────────────▶│
    │                  │                      │                      │
    │                  │                      │      Invoke agent    │
    │                  │                      │◀─────────────────────│
    │                  │                      │                      │
    │                  │   Queue response     │                      │
    │                  │◀─────────────────────│                      │
    │                  │                      │                      │
    │  "Here's your    │                      │                      │
    │   workout..."    │                      │                      │
    │◀─────────────────│                      │                      │
```

## Incoming Message Flow

### 1. Twilio Webhook

When a user texts the GymText number, Twilio sends a webhook to `/api/webhooks/twilio`:

```typescript
// apps/web/src/app/api/webhooks/twilio/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  
  const from = formData.get('From') as string;   // User phone
  const body = formData.get('Body') as string;    // Message text
  const messageSid = formData.get('MessageSid') as string;
  
  // Process the message
  await processIncomingMessage(from, body, messageSid);
  
  return new Response('', { status: 200 });
}
```

### 2. Message Storage

Messages are stored in the database:

```typescript
const message = await repos.message.create({
  conversationId: conversation.id,
  direction: 'inbound',
  content: body,
  externalSid: messageSid,
  userId: user.id,
});
```

### 3. Chat Service Processing

The ChatService orchestrates the response:

```typescript
const result = await chatService.processMessage(userId, message);
```

This involves:
1. Fetching conversation history
2. Resolving user context
3. Invoking the chat agent
4. Handling any tool calls (profile updates, workout fetches)

## Outbound Message Flow

### 1. Response Generation

The agent generates a response:

```typescript
const response = await agentRunner.invoke('chat:generate', {
  input: message,
  params: { user: userWithProfile },
});
```

### 2. Message Queuing

Responses are queued for delivery:

```typescript
await repos.messageQueue.enqueue({
  userId: user.id,
  content: response.text,
  priority: 'normal',
});
```

### 3. Twilio API Send

The queued message is sent via Twilio:

```typescript
await twilioClient.messages.create({
  body: message.content,
  from: process.env.TWILIO_NUMBER,
  to: user.phone,
});
```

## Chat Agent

The main chat agent (`chat:generate`) handles conversational interactions:

### Capabilities

- **Fitness questions**: Answer workout and training questions
- **Profile updates**: Extract and update user fitness info
- **Workout retrieval**: Fetch today's workout or generate new one
- **Program modifications**: Handle workout changes

### Tools Available

| Tool | Description |
|------|-------------|
| `update_profile` | Extract and persist profile changes from messages |
| `get_workout` | Fetch or generate today's workout |
| `make_modification` | Handle workout/program changes |

### Context Provided

| Context | Description |
|---------|-------------|
| `user` | Basic user info |
| `userProfile` | Fitness profile data |
| `fitnessPlan` | Current fitness plan |
| `currentWorkout` | Today's workout |
| `dateContext` | Current date, day of week |

## SMS Formatting

Workout messages are formatted for SMS:

- **Maximum length**: 1600 characters (configurable)
- **Format**: Plain text with workout details
- **Structured**: Clear sections for each exercise

## Scheduled Messages

GymText also sends scheduled messages (daily workouts, reminders):

```typescript
// Cron job or Inngest function
const workouts = await workoutService.getDailyWorkouts();
for (const workout of workouts) {
  await messageService.sendDailyWorkout(workout.userId, workout);
}
```

## Error Handling

- **Twilio errors**: Retry with exponential backoff
- **Agent errors**: Return fallback message
- **Rate limiting**: Respect Twilio rate limits

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture
- [API Structure](./api-structure.md) - API routes
- [Agent System](../agents/index.md) - AI agents
- [Database Schema](./database.md) - Database design
