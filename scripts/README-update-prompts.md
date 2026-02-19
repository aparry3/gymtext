# Update Agent Prompts Script

## Overview

This script updates the `agent_definitions` table with the new generalized agent prompts from the `prompts/` directory.

## Usage

```bash
pnpm agent:update-prompts
```

## What It Does

Reads the 8 markdown files from `prompts/` and creates/updates 4 agent definitions:

| Agent ID | System Prompt | User Prompt Template | Description |
|----------|--------------|---------------------|-------------|
| `profile:create` | `01-profile-agent.md` | `01-profile-agent-USER.md` | Creates and maintains detailed fitness profiles |
| `plan:create` | `02-plan-agent.md` | `02-plan-agent-USER.md` | Designs comprehensive periodized training programs |
| `microcycle:create` | `03-microcycle-agent.md` | `03-microcycle-agent-USER.md` | Creates specific, executable workouts for one week |
| `message:workout` | `04-workout-message-agent.md` | `04-workout-message-agent-USER.md` | Formats daily workout messages for text delivery |

## How It Works

1. Reads each markdown file from `prompts/` directory
2. For each agent mapping:
   - Checks if agent exists in database
   - If exists: merges new prompts with existing config and creates new version
   - If new: creates initial agent definition
3. Inserts/updates `system_prompt` and `user_prompt_template` fields
4. Returns version IDs for confirmation

## Database Schema

Uses these columns in `agent_definitions`:
- `agent_id` - Unique identifier (e.g., `profile:create`)
- `description` - Brief description of agent's purpose
- `system_prompt` - Full markdown content from system prompt file
- `user_prompt_template` - Full markdown content from user prompt template file
- `version_id` - Auto-incremented version number
- `is_active` - Boolean flag (all set to `true`)

## Prerequisites

- `DATABASE_URL` must be set in `.env.local`
- Markdown files must exist in `prompts/` directory

## See Also

- `agent-definition.ts` - Lower-level agent CRUD operations
- `prompts/README.md` - Documentation of the agent system design
