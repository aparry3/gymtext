# GYMTEXT - Personalized Fitness Coaching via Text

GYMTEXT is a modern web application that provides personalized fitness coaching and workout plans delivered directly to your phone via text messages.

## Project Structure

This is a monorepo managed with pnpm workspaces and Turborepo:

```
gymtext/
├── apps/
│   ├── web/              # Consumer-facing app (gymtext.com)
│   └── admin/            # Admin portal (admin.gymtext.com)
├── packages/
│   └── shared/           # @gymtext/shared - shared server logic
├── scripts/              # Build, test, and migration scripts
└── migrations/           # Database migrations
```

### Apps

- **web** - Consumer-facing Next.js application for end users. Handles onboarding, SMS conversations, fitness plans, and subscriptions.
- **admin** - Admin portal for managing users and viewing conversations.

### Packages

- **@gymtext/shared** - Shared package containing all server-side logic: services, agents (AI/LLM), repositories, database models, and external service connections.

## Features

- Personalized fitness coaching via AI
- Custom workout plans with progressive overload
- Text message delivery via Twilio
- Progress tracking
- Secure payment processing with Stripe
- Admin portal for user management

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Monorepo**: pnpm workspaces, Turborepo
- **Database**: PostgreSQL with Kysely ORM
- **AI/LLM**: LangChain with OpenAI and Google Gemini
- **SMS**: Twilio
- **Payments**: Stripe
- **Vector DB**: Pinecone

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Twilio account for SMS
- Stripe account for payments

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gymtext.git
cd gymtext
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following in `.env.local`:
- **Database**: `DATABASE_URL`, `SESSION_ENCRYPTION_KEY`
- **Twilio**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMBER`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- **AI**: `OPENAI_API_KEY`, `GOOGLE_API_KEY`
- **Admin**: `ADMIN_PHONE_NUMBERS` (comma-separated E.164 phone numbers)

4. Set up the database:
```bash
pnpm migrate:up
```

5. Run the development servers:
```bash
# Run both apps
pnpm dev

# Or run individually
pnpm dev:web    # Consumer app on localhost:3000
pnpm dev:admin  # Admin portal on localhost:3001
```

## Development Commands

```bash
# Development
pnpm dev              # Start both apps
pnpm dev:web          # Start consumer app (port 3000)
pnpm dev:admin        # Start admin portal (port 3001)

# Building
pnpm build            # Build all apps
pnpm build:web        # Build consumer app
pnpm build:admin      # Build admin portal

# Database
pnpm db:codegen       # Generate TypeScript types from schema
pnpm migrate:create   # Create new migration
pnpm migrate:up       # Apply pending migrations
pnpm migrate:down     # Rollback last migration

# Testing
pnpm test             # Run Vitest tests
pnpm test:ui          # Run tests with Vitest UI
pnpm lint             # Run ESLint
```

## Admin Portal

The admin portal (`apps/admin`) provides:

- **User Management**: View and manage users, fitness profiles, and subscriptions
- **Conversation Viewer**: View SMS conversation history

## Deployment

Both apps are deployed to Vercel:

- **web** → gymtext.com
- **admin** → admin.gymtext.com

Each app has its own `vercel.json` configuration in its directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
