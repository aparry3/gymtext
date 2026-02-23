# Development Guide

> Single source of truth for how we build GymText.

## Development Rules

### Branch Strategy

- **Base branch:** `new-agent-system` (not `main` or `staging`)
- Feature branches: `feature/<name>` off `new-agent-system`
- **Max 1 migration per feature branch** — keeps rebases clean and rollbacks simple

### Architecture Principles

- **Service layering:** Orchestration → Domain Services → Repositories
  - Services never instantiate LLMs directly — delegate to `AgentRunner`
  - Repositories handle all DB operations via Kysely
- **Prompts are single source of truth** — live in `/prompts/*.md`
  - Markdown dossiers for agent inputs (not JSON)
  - Seed from prompts: `pnpm seed:prompts`
- **Never commit production data** — PII protection is non-negotiable
  - Use `pnpm db:anonymize` to create safe dev copies
- **Environment variables** must be in `turbo.json` for Turbo to pass them through
  - `pnpm build` is the real test, not just `tsc`

### Code Quality

- Tests pass, build succeeds, no lint errors before PR
- New migrations must be reversible (include `down`)
- Document new env vars in `.env.example`

---

## Common Commands

### Development

```bash
pnpm dev              # Start all apps (web :3000, admin :3001)
pnpm dev:web          # Consumer app only
pnpm dev:admin        # Admin portal only
```

### Building & Testing

```bash
pnpm build            # Build all (REQUIRED — tsc alone is not sufficient)
pnpm test             # Run Vitest
pnpm test:ui          # Vitest with UI
pnpm lint             # ESLint
```

### Database

```bash
pnpm migrate:up       # Apply pending migrations
pnpm migrate:down     # Rollback last migration
pnpm migrate:create <name>  # Create new migration (interactive)
pnpm db:codegen       # Regenerate TypeScript types from schema

pnpm test:migration   # Full migration test (reset DB → main migrations → feature migrations → seed → codegen)
pnpm db:anonymize     # Anonymize prod data for dev use
pnpm db:anonymize:dry # Dry run — see what would change
```

### Seeding

```bash
pnpm seed             # Run ALL seeders (agents, exercises, templates, prompts)
pnpm seed:agents      # Agent definitions only
pnpm seed:exercises   # Exercise database only
pnpm seed:templates   # Context templates only
pnpm seed:prompts     # Prompt configurations only
```

### Test Users & Personas

```bash
pnpm signup --list              # List available test personas
pnpm signup --persona sarah-chen  # Create single test user (requires dev server running)
pnpm signup --all               # Create all 15 test users
pnpm test:cleanup-users         # Delete all test users
pnpm test:cleanup-users --dry-run  # Preview what would be deleted
pnpm local:sms                  # Monitor local SMS messages in real-time
```

Test personas use phone numbers `+13392220001` through `+13392220015`. See `docs/development/TEST_PERSONAS.md` for full persona details.

The signup script hits real API endpoints (`POST /api/users/signup`, mock Stripe webhook) to test the full production flow including onboarding via Inngest.

### SMS Testing

```bash
pnpm sms:test         # Test SMS functionality
pnpm local:sms        # Monitor local SMS via SSE (no Twilio required)
```

---

## Workflows

### New Feature

```bash
git checkout new-agent-system
git pull origin new-agent-system
git checkout -b feature/my-feature

# Develop, test, commit
pnpm test && pnpm build
git push -u origin feature/my-feature
# Create PR → new-agent-system
```

### Database Change

1. `pnpm migrate:create <descriptive-name>`
2. Edit the migration file in `migrations/`
3. `pnpm migrate:up`
4. `pnpm db:codegen`
5. **One migration per branch** — if you need another, squash or split the feature

### Testing Migrations

```bash
pnpm test:migration
```

This script automates: DB reset → apply main branch migrations → apply feature branch migrations → seed → codegen. Use it to verify your migration works cleanly from scratch.

### Agent Changes

- Edit prompt in `/prompts/*.md` (source of truth)
- Seed to DB: `pnpm seed:prompts` or `pnpm agent:upsert --agent <id> --file prompts/<file>.md`
- Register new tools in Tool Registry, new context in Context Registry
- Add agent ID constant in `packages/shared/src/server/agents/constants.ts`

---

## Project Structure

```
gymtext/
├── apps/web/          # Consumer app (gymtext.com)
├── apps/admin/        # Admin portal (admin.gymtext.com)
├── packages/shared/   # @gymtext/shared — all server logic
│   └── src/server/
│       ├── agents/    # DB-driven AI agent system
│       ├── repositories/  # Data access layer
│       ├── services/  # Business logic
│       └── connections/   # External service factories
├── prompts/           # Agent prompts (*.md) — source of truth
├── migrations/        # Database migrations
├── scripts/           # Build, test, seed scripts
│   ├── seed/          # Seeding system
│   └── test-data/personas/  # Test user JSON files
└── docs/development/  # Additional dev docs
```

## Related Docs

- `CLAUDE.md` — Full architecture reference and AI agent patterns
- `docs/development/getting-started.md` — First-time setup
- `docs/development/local-setup.md` — Local environment details
- `docs/development/testing.md` — Testing approaches
- `docs/development/TEST_PERSONAS.md` — Test user persona details
