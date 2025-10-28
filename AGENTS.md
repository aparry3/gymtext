# Repository Guidelines

## Project Structure & Module Organization
- Next.js routes live in `src/app`; shared UI stays in `src/components` and `src/client`.
- Agents, messaging flows, and shared schemas sit in `src/server` and `src/shared`; read `docs/AGENT_ARCHITECTURE.md` before edits.
- Helpers and generated types live in `src/lib`, `src/types`, and `src/server/models/_types`; migrations and scripts are in `migrations/` and `scripts/`, with assets in `public/`.

## Build, Test, and Development Commands
- `pnpm install` bootstraps dependencies; stay on PNPM to keep lockfiles clean.
- `pnpm dev` (requires `.env.local`) runs Turbopack; use `pnpm predev` when schema changes need Kysely regeneration.
- `pnpm lint`, `pnpm build`, and `pnpm db:codegen` cover linting, builds, and type refreshes; run targeted suites via `pnpm test:*` per `docs/TESTING.md`.

## Coding Style & Naming Conventions
- TypeScript is standard; resolve `pnpm lint` issues raised by `eslint.config.mjs`.
- Keep Prettier defaults (2-space indent, single quotes) and favor readable Tailwind groupings.
- Use PascalCase for components (e.g., `HeroSection.tsx`), camelCase for hooks and utilities, and co-locate Zod/Kysely types with implementations.

## Testing Guidelines
- Follow `docs/TESTING.md`; place Vitest suites in `tests/unit` or `tests/integration` and create folders if missing.
- `pnpm test:unit` is the default loop; run `pnpm test:integration` or `pnpm test:docker` when touching Postgres or Inngest flows.
- Name files descriptively (`tests/unit/server/utils/timezone.test.ts`), use shared helpers like `withTestDatabase`, and track coverage via `pnpm test:coverage`.

## Commit & Pull Request Guidelines
- Write short, imperative commits, echoing history such as `fix selectable sizes`.
- PRs should link issues, summarise behavior changes, and flag migrations, env keys, or cron updates.
- Verify linting and relevant tests before review, attach screenshots or payloads, and call out risky areas upfront.

## Agent & Workflow Notes
- `src/server/agents` orchestrates workflows; reuse shared prompt builders described in `docs/AGENT_ARCHITECTURE.md`.
- Messaging cadence depends on Inngest (`pnpm inngest`) and `vercel.json` schedules; validate changes in staging first.
- After altering workflows, migrations, or shared schemas, rerun `pnpm db:codegen` so agents compile with up-to-date types.
