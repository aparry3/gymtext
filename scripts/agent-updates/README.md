# Agent Updates

This directory contains JSON files with agent definition updates that can be applied directly to the database without migrations.

## Philosophy

- **Migrations** = schema changes only
- **Agent updates** = config/prompt data stored as reviewable JSON files

## Usage

Apply an update from a JSON file:

```bash
pnpm agent:upsert workout:generate scripts/agent-updates/workout-generate-eval-prompt.json
```

The script merges the JSON with the current agent definition and creates a new version.

## Workflow

1. **Create** a JSON file in this directory with the fields you want to update
2. **Review** the JSON in the PR
3. **Test** in staging using the upsert script
4. **Promote** to production via the admin UI (or run the script against production DB)

## Cleanup

These files can be periodically cleaned up after the updates have been promoted to production and are stable.
