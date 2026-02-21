# Environment Variables

GymText uses environment variables for configuration. This reference documents all required and optional variables.

## Required Variables

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Session

| Variable | Description | Example |
|----------|-------------|---------|
| `SESSION_ENCRYPTION_KEY` | Key for encrypting sessions (32+ chars) | `your-secret-key-at-least-32-chars` |

### Twilio (SMS)

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `ACxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your_auth_token` |
| `TWILIO_NUMBER` | Twilio phone number (E.164) | `+1234567890` |

### Stripe (Payments)

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_xxxxx` |

### AI/LLM

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxxxx` |
| `GOOGLE_API_KEY` | Google API key (for Gemini) | `xxxxx` |

### Pinecone (Vector DB)

| Variable | Description | Example |
|----------|-------------|---------|
| `PINECONE_API_KEY` | Pinecone API key | `xxxxx-xxxxx` |
| `PINECONE_INDEX` | Pinecone index name | `gymtext` |

## Optional Variables

### Admin Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_PHONE_NUMBERS` | Comma-separated admin phone numbers (E.164) | `+1234567890,+0987654321` |

### Sandbox (Admin App Only)

| Variable | Description | Example |
|----------|-------------|---------|
| `SANDBOX_DATABASE_URL` | Sandbox database connection | `postgresql://...` |
| `SANDBOX_TWILIO_ACCOUNT_SID` | Sandbox Twilio SID | `ACxxxxx` |
| `SANDBOX_TWILIO_AUTH_TOKEN` | Sandbox Twilio token | `xxxxx` |
| `SANDBOX_TWILIO_NUMBER` | Sandbox Twilio number | `+1234567890` |
| `SANDBOX_STRIPE_SECRET_KEY` | Sandbox Stripe key | `sk_test_xxxxx` |
| `SANDBOX_STRIPE_WEBHOOK_SECRET` | Sandbox Stripe webhook | `whsec_xxxxx` |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `SMS_MAX_LENGTH` | Maximum SMS message length | `1600` |

## Configuration Files

### .env.local

Local development (committed to git for example, not secrets):

```bash
# Copy from .env and fill in values
cp .env.example .env.local
```

### .env.production

Production environment (never commit):

```bash
# Production values only
DATABASE_URL=postgresql://prod-db-url
# ... etc
```

## Turbo Configuration

Environment variables used in Turbo builds must be declared in `turbo.json`:

```json
{
  "globalEnv": [
    "DATABASE_URL",
    "SESSION_ENCRYPTION_KEY"
  ],
  "tasks": {
    "build": {
      "env": [
        "TWILIO_ACCOUNT_SID",
        "STRIPE_SECRET_KEY"
      ]
    }
  }
}
```

## Related Documentation

- [Getting Started](../development/getting-started.md) - Quick start
- [Local Setup](../development/local-setup.md) - Setup guide
- [Troubleshooting](./troubleshooting.md) - Common issues
