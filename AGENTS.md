# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js routes and API (`src/app/api/...`).
- `src/server`: Back-end logic
  - `services/`: business logic and orchestration
  - `agents/`: LLM chains and prompts (e.g., `chat/`, `dailyMessage/`, `dailyWorkout/`, `fitnessPlan/`, `summary/`, `welcomeMessage/`, `microcyclePattern/`; export via `index.ts`)
  - `repositories/`: database access
  - `connections/`, `models/`, `utils/`
- `src/components`: UI components; screen-level views in `pages/` subfolders.
- `src/shared`: Reusable config and utilities.
- `migrations`: Kysely migrations.
- `tests`: Vitest (`unit/`, `integration/`, plus `fixtures/`, `mocks/`).
- `scripts`: Dev/test helpers (`migrations/`, `test/`, `docker/`).

## Architecture Overview
- Routes: request routing + validation; call services. Location: `src/app/api/**`.
- Services: business rules, compose agents/repos/externals. Location: `src/server/services/**`.
- Agents: all LLM logic (prompt templates, chains, model config). Location: `src/server/agents/**`.
- Repositories: DB reads/writes only. Location: `src/server/repositories/**`.
See `_claude_docs/chat/AGENT_ARCHITECTURE.md` for diagrams and patterns.

## Build, Test, and Development Commands
- `pnpm dev`: Run Next.js in dev mode (loads `.env.local`).
- `pnpm build` / `pnpm start`: Production build and start.
- `pnpm lint`: Lint with Next/TypeScript rules.
- Database:
  - `pnpm db:codegen`: Generate Kysely types to `src/server/models/_types`.
  - `pnpm migrate:up` or `pnpm db:migrate`: Apply migrations; `:down` to rollback.
- Tests (Vitest):
  - `pnpm test:unit` / `pnpm test:integration` / `pnpm test:all`.
  - `pnpm test:coverage` (HTML reports under `test-results/`).
  - Dockerized: `pnpm test:docker[:unit|:integration|:watch|:coverage]`.

## Coding Style & Naming Conventions
- TypeScript (strict), Next.js 15, React 19.
- Linting: `eslint` (`next/core-web-vitals`, `next/typescript`).
- Indentation: 2 spaces.
- Names: kebab-case files, PascalCase components, camelCase identifiers.
- Paths: prefer `@/` alias (see `tsconfig.json`).

## Testing Guidelines
- Framework: Vitest with globals enabled.
- Location: `tests/unit/**/*.test.ts`, `tests/integration/**/*.test.ts`.
- Setup files: see `vitest.config*.mts` and `tests/setup/*`.
- Env: copy `.env.test.example` → `.env.test` (or use Docker). Do not commit secrets.

## Agent-Specific Instructions
- Add under `src/server/agents/<agentName>/{chain.ts,prompts.ts}` and export in `src/server/agents/index.ts`.
- Keep prompts in `prompts.ts`; chain/orchestration in `chain.ts`.
- Example call: `const res = await contextualChatChain.invoke({ userId, message });` (see `agents/chat/chain.ts`).
- Tests: use mocks in `tests/mocks/*`; reference `tests/integration/server/services/chatService.integration.test.ts`. Run `pnpm test:integration`.
- Config: API keys in `.env.local` / `.env.test`; tests should avoid real network calls.

## Commit & Pull Request Guidelines
- Commits: concise, present-tense, scoped messages (e.g., `admin: add users page`).
- Branches: `feature/<scope>`, `fix/<scope>`, `chore/<scope>`.
- PRs: include purpose, summary of changes, manual test notes, related issues (`Closes #123`), and screenshots for UI.
- Checks: ensure `pnpm lint` and `pnpm test:all` pass; run `pnpm db:codegen` and migrations if schema changed.

## Security & Configuration Tips
- Env files: use `.env.local` for dev, `.env.test` for tests; never commit secrets.
- Services: Postgres, Redis, Stripe, Twilio, Pinecone—mock in tests (`tests/mocks/*`).
- Data: use provided test scripts (e.g., `pnpm test:user:create`) to seed and inspect test users.
