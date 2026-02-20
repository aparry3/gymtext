# Development Tools

GymText includes development tools for testing and debugging.

## Local SMS Testing Tool

The local SMS CLI allows you to test SMS functionality without using real Twilio numbers or affecting production data.

### Overview

The local SMS testing feature enables:
- Testing SMS webhooks locally
- Simulating incoming messages
- Testing chat flow without real SMS
- Debugging message processing

### Setup

1. Ensure `.env.local` has Twilio credentials:

```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_NUMBER=+1234567890
```

2. Ensure database is running and accessible

### Usage

```bash
# Run the SMS test script
pnpm sms:test
```

This will:
1. Start an interactive prompt
2. Allow you to simulate incoming messages
3. Process them through the chat system
4. Display the agent responses

### Interactive Commands

```
Welcome to GymText SMS Test
---------------------------
Type a message to simulate incoming SMS
Type 'quit' or 'exit' to exit
Type 'help' for commands

> What workout should I do today?
```

### Programmatic Usage

You can also import the test utilities:

```typescript
import { simulateIncomingMessage } from './scripts/sms-test';

const response = await simulateIncomingMessage(
  '+1234567890',
  'What workout should I do today?'
);

console.log(response);
```

## Other Development Tools

### Claude Code Integration

The project includes `CLAUDE.md` which provides context to Claude Code when working in the repository:

```bash
# Claude Code will automatically read CLAUDE.md
claude .
```

### Database GUI

For database exploration, consider using:
- **pgAdmin** - Full-featured PostgreSQL client
- **DBeaver** - Universal database tool
- **TablePlus** - Modern database client

### API Testing

For testing API endpoints:
- **Postman** - API client
- **Hoppscotch** - Open-source API client
- **curl** - Command line HTTP tool

## Environment Variables for Development

Required for local development:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/gymtext

# Session
SESSION_ENCRYPTION_KEY=your-32-character-minimum-key

# Twilio (for SMS testing)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...

# Stripe (for payments testing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=...

# AI
OPENAI_API_KEY=...
GOOGLE_API_KEY=...

# Pinecone (for embeddings)
PINECONE_API_KEY=...
PINECONE_INDEX=...
```

## Related Documentation

- [Getting Started](../development/getting-started.md) - Development setup
- [Testing](../development/testing.md) - Testing approaches
- [Environment Variables](../reference/environment-variables.md) - All env vars
