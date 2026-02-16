# Scripts

Utility and maintenance scripts for GymText.

## Directory Structure

```
scripts/
├── agents/             # Agent definition and config scripts
│   ├── agent-definition.ts
│   └── update-agent-temperatures.ts
├── agent-updates/      # Agent prompt update packages
├── archive/            # Deprecated scripts
├── db/                 # Database utilities (dump, restore, anonymize)
├── exercises/          # Exercise data management
│   ├── assign-movements.ts
│   └── audit-exercise-aliases.ts
├── migrations/         # Migration runners and helpers
│   ├── create.ts
│   ├── run.ts
│   ├── regenerate-training-data.ts
│   └── rename-signup-data-fields.ts
├── seeds/              # Data seeding scripts
│   ├── seed-context-templates.ts
│   ├── seed-exercise-db.ts
│   ├── seed-exercise-embeddings.ts
│   ├── seed-exercises.ts
│   └── update-context-templates.ts
├── utils/              # Shared utilities (db, config, common)
└── generate-favicons.js
```

## Usage

All scripts require environment variables from `.env.local`:

```bash
# Load env and run a script
set -a && source .env.local && set +a
npx tsx scripts/<path-to-script>.ts
```

## Key Scripts

| Script | Purpose |
|--------|---------|
| `migrations/run.ts` | Run pending database migrations |
| `migrations/create.ts` | Scaffold a new migration file |
| `seeds/seed-exercises.ts` | Seed exercise database |
| `seeds/seed-exercise-embeddings.ts` | Generate exercise embeddings |
| `agents/agent-definition.ts` | View/manage agent definitions |
| `db/anonymize-prod-to-dev.ts` | Anonymize prod data for dev |
| `db/dump-data.ts` / `db/restore-data.ts` | Backup/restore DB |
