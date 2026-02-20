# @gymtext/local-sms-cli

CLI tool for monitoring local SMS messages in real-time during development.

## Installation

```bash
# From the gymtext monorepo
pnpm install
cd packages/local-sms-cli
pnpm build
```

## Usage

```bash
# Run from the monorepo root
pnpm local:sms

# Or run directly
node packages/local-sms-cli/dist/index.js

# With custom URL
node packages/local-sms-cli/dist/index.js --url http://localhost:3000

# Filter by phone number
node packages/local-sms-cli/dist/index.js --phone +1234567890
```

## Options

- `-u, --url <url>` - Base URL of the Next.js dev server (default: http://localhost:3000)
- `-p, --phone <number>` - Filter messages to show only those for a specific phone number

## Example Output

```
╔════════════════════════════════════════╗
║   GymText Local SMS Monitor v1.0       ║
╚════════════════════════════════════════╝

  ✓ Connected to message stream
  Filtering messages for: +1234567890
  Press Ctrl+C to stop

──────────────────────────────────────────────────

 NEW MESSAGE 

  Time:     Feb 20 09:15:32
  To:       +1234567890
  From:     local-system
  ID:       local-1708422932000-1

  Content:
  Welcome to GymText! Your verification code is 123456

──────────────────────────────────────────────────
```

## How It Works

1. Connects to `/api/messages/stream` SSE endpoint
2. Subscribes to message events from `LocalMessagingClient`
3. Displays messages in real-time with formatted output

## Requirements

- MESSAGING_PROVIDER=local in your `.env.local`
- Next.js dev server running (`pnpm dev`)
