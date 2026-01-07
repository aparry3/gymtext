# Repository Guidelines

## Project Structure & Module Organization
The pnpm/Turborepo layout keeps layers separate: `apps/web` delivers the consumer Next.js 15 app while `apps/admin` hosts operational tooling. `packages/shared` exposes reusable services, agents, and adapters, `scripts/` houses CLIs, `migrations/` stores SQL files, and `tests/` supplies fixtures plus Vitest setup. Keep feature logic near the route or API that owns it and promote only hardened helpers into `@gymtext/shared`.

## Build, Test, and Development Commands
- `pnpm dev | dev:web | dev:admin` — run both apps or the targeted filter via Turborepo.
- `pnpm build | build:web | build:admin` — create optimized bundles for deployment.
- `pnpm lint` — enforce the root ESLint + Next.js rules; run with `--fix` when possible.
- `pnpm migrate:create | migrate:up | migrate:down` — manage PostgreSQL schema through `scripts/migrations`.
- `pnpm db:codegen` — regenerate Kysely types whenever tables change.

## Coding Style & Naming Conventions
Write TypeScript with two-space indentation and no semicolons (see `apps/web/src/lib/utils.ts`). Components/pages are PascalCase, hooks and utilities camelCase, and never-changing constants UPPER_SNAKE_CASE. Keep Tailwind class composition alongside JSX, favor pure helper functions, and run `pnpm lint --fix` before committing. Generated artifacts such as `*.tsbuildinfo` or Kysely output must not be edited manually.

## Testing Guidelines
Vitest powers unit and integration suites. Place specs under `tests/unit/**` or co-locate as `*.test.ts`, and reuse fixtures via `tests/setup/` and `tests/mocks/`. Ship only after `pnpm test:unit`, `pnpm test:integration`, and, for meaningful features, `pnpm test:coverage` (aim for ≥80% lines on new modules). When work touches Twilio, Stripe, or onboarding loops, also run the related CLI smoke test such as `pnpm test:messages:daily`.

## Commit & Pull Request Guidelines
History favors short imperative subjects (“fix build”, “finish refactor to factory pattern”); keep the first line under ~60 characters and squash noise before pushing. PRs must include a summary, linked issue (`Fixes #123`), UI or CLI evidence, and the exact commands run (at minimum `pnpm lint` and `pnpm test:all`). Highlight migrations or env changes explicitly and request review from the owner of every affected app.

## Security & Configuration Tips
Start from `.env.example`, keep secrets only in `.env.local`, and set both production and sandbox keys (`SANDBOX_DATABASE_URL`, `SANDBOX_TWILIO_*`, etc.). Run `pnpm backup:local` before destructive schema work, and prefix sensitive scripts with `source .env.local && …` (for example `source .env.local && pnpm test:user:create`). Default risky admin testing to sandbox and rotate OpenAI/Gemini/Pinecone credentials immediately after any suspected leak.
