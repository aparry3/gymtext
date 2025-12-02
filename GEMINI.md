# GymText Project Context

## Project Overview

**GymText** is a modern web application delivering personalized fitness coaching and workout plans directly to users' phones via SMS. It leverages AI agents to generate custom plans and engages users through a conversational interface.

### Key Technologies
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Backend:** Next.js API Routes, Inngest (background jobs/workflows), OpenAI (AI agents).
- **Database:** PostgreSQL, accessed via Kysely ORM.
- **Services:** Stripe (payments), Twilio (SMS), Pinecone (vector DB).
- **Testing:** Vitest.

### Architecture Highlights
- **Agents (`src/server/agents`):** Core AI logic for generating workouts and managing conversations.
- **Services (`src/server/services`):** Business logic layer (e.g., `ChatService`, `OnboardingChatService`).
- **Repositories (`src/server/repositories`):** Data access layer using Kysely.
- **Models (`src/server/models`):** Domain models and generated database types.
- **Background Jobs (`src/server/inngest`):** Handles asynchronous tasks like sending scheduled messages.

### Recent Major Changes (Onboarding Refactor)
The onboarding flow has been recently refactored from a stateful, session-based system to a **stateless, pass-through architecture**.
- **Removed:** Temp session cookies (`gt_temp_session`), `onboardingSession` utils, and dual-mode agent tools.
- **New Pattern:** The frontend maintains state (`Partial<User>`, `Partial<FitnessProfile>`) and passes it to the backend with each request. The backend returns updated partial objects via SSE (Server-Sent Events).
- **Final Save:** Database persistence only happens at the end of the flow when `saveWhenReady` is true.

## Building and Running

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL
- Stripe Account
- Environment variables (see `.env.local.example`)

### Key Commands

| Category | Command | Description |
| :--- | :--- | :--- |
| **Development** | `pnpm install` | Install dependencies. |
| | `pnpm dev` | Start dev server (requires `.env.local`). |
| | `pnpm start` | Start production server. |
| | `pnpm build` | Build for production. |
| | `pnpm inngest` | Start Inngest dev server. |
| **Database** | `pnpm db:migrate` | Run database migrations. |
| | `pnpm migrate:create` | Create new migration (interactive). |
| | `pnpm migrate:up` | Apply pending migrations. |
| | `pnpm migrate:down` | Rollback last migration. |
| | `pnpm db:codegen` | Generate Kysely types. **Run after migrations.** |
| **Testing** | `pnpm test` | Run all tests (Vitest). |
| | `pnpm test:unit` | Run unit tests. |
| | `pnpm test:integration` | Run integration tests. |
| | `pnpm test:ui` | Run tests with Vitest UI. |
| | `pnpm sms:test` | Test SMS functionality (requires Twilio config). |
| **Quality** | `pnpm lint` | Run ESLint. |

## Development Conventions

### Database & Migrations
- **Schema:** Defined in `migrations/` using Kysely.
- **Workflow:**
    1. Create a migration: `pnpm migrate:create`
    2. Apply migration: `pnpm migrate:up`
    3. Regenerate types: `pnpm db:codegen`
- **Access:** Use Repositories (`src/server/repositories`) for DB interactions.

### Testing (`docs/TESTING.md`)
- **Unit Tests:** `tests/unit` - Fast, mocked dependencies.
- **Integration Tests:** `tests/integration` - Uses a real (test) database.
- **Scripts:** Use specialized scripts in `scripts/test/` for specific flows.
- **Rule:** Ensure all tests pass when implementing new features.

### Code Style & Quality
- **Formatting:** Prettier (default settings).
- **Linting:** ESLint (`pnpm lint`).
- **Naming:** PascalCase for components, camelCase for functions/variables.
- **Type Safety:** Strict TypeScript. Zod for runtime validation.
- **Build:** Implementations must pass `pnpm build` and `pnpm lint`.

### Architecture Guidelines
- **Clean Architecture:** Services uses Agents; Agents use Tools. Services do NOT instantiate LLMs directly.
- **Environment Variables:** Manage via `.env.local`.
- **Directory Structure:**
  - `src/app`: Routes (API & Pages)
  - `src/server/agents`: AI Logic
  - `src/server/services`: Business Logic
  - `src/server/repositories`: DB Access