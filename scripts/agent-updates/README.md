# Agent Updates

This directory contains subdirectories with agent definition updates that can be applied directly to the database without migrations.

## Philosophy

- **Migrations** = schema changes only
- **Agent updates** = config/prompt data stored as reviewable JSON files

## Structure

Each update gets its own subdirectory with:
- `update.json` - The data to merge into the agent definition
- `README.md` - Documentation of what's changing and why

Example:
```
agent-updates/
├── README.md (this file)
├── workout-generate-eval-prompt/
│   ├── update.json
│   └── README.md
└── another-update/
    ├── update.json
    └── README.md
```

## Usage

Apply an update from a subdirectory:

```bash
pnpm agent:upsert workout:generate scripts/agent-updates/workout-generate-eval-prompt/update.json
```

The script merges the JSON with the current agent definition and creates a new version.

## Workflow

1. **Create** a subdirectory for your update with `update.json` and `README.md`
2. **Review** the changes in the PR
3. **Test** in staging using the upsert script
4. **Promote** to production via the admin UI (or run the script against production DB)

## Cleanup

Update directories can be periodically cleaned up after the updates have been promoted to production and are stable.
