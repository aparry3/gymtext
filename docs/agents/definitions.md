# Agent Definitions Reference

This document provides a reference for all agent definitions in the system.

## Agent ID Reference

| Agent ID | Purpose | Key Tools | Key Context |
|----------|---------|-----------|-------------|
| `chat:generate` | Main chat response | update_profile, get_workout, make_modification | user, userProfile, fitnessPlan, currentWorkout |
| `profile:fitness` | Extract fitness profile | (via service) | user, previousMessages |
| `profile:user` | Extract user info | (via service) | user |
| `plan:generate` | Create fitness plans | (via service) | userProfile, preferences |
| `workout:generate` | Generate daily workouts | (via service) | userProfile, currentMicrocycle |
| `microcycle:generate` | Create weekly patterns | (via service) | fitnessPlan, preferences |
| `modifications:router` | Route modification requests | modify_workout, modify_week, modify_plan | currentWorkout, fitnessPlan |

## Chat Agents

### chat:generate

Main conversational AI agent for handling user messages.

**System Prompt (truncated):**
> You are a helpful fitness coaching assistant. You help users with their workouts, answer fitness questions, and provide motivation...

**User Prompt Template:**
```
User: {{input}}
User profile: {{userProfile}}
Today's workout: {{currentWorkout}}
Date: {{dateContext}}
Conversation history:
{{history}}

Respond helpfully to the user's message. Use tools when needed.
```

**Configuration:**
- Model: `gpt-4o`
- Temperature: 0.7
- Max tokens: 1000

## Profile Agents

### profile:fitness

Extracts and updates fitness profile from conversation.

**Sub-agents:**
- `profile:structured` - Structured data extraction

**Output Schema:**
```json
{
  "goal": "string",
  "experienceLevel": "string",
  "availableEquipment": ["string"],
  "limitations": ["string"],
  "preferences": { ... }
}
```

### profile:user

Extracts basic user information (name, gender, etc.).

## Plan Agents

### plan:generate

Creates comprehensive fitness plans with mesocycle structure.

**Sub-agents:**
- Generates mesocycle breakdown

**Output:**
- Complete fitness plan with phases
- Mesocycle definitions
- Progression strategy

## Workout Agents

### workout:generate

Generates daily workouts.

**Sub-agents:**
- `workout:message` - Natural language description
- `workout:structured` - Structured exercise data

### microcycle:generate

Creates weekly training patterns.

## Modification Agents

### modifications:router

Routes modification requests to appropriate sub-agents.

**Modification Types:**
- `workout` → modify_workout
- `week` → modify_week  
- `plan` → modify_plan

## Managing Agents

### Viewing Agents

```bash
# List all agents
pnpm agent:list

# Get specific agent
pnpm agent:get chat:generate
```

### Updating Agents

```bash
# Update agent prompts
pnpm agent:update-prompts --agent chat:generate
```

### Adding New Agents

1. Create migration to add agent definition
2. Add agent ID constant in `constants.ts`
3. Register any required tools in Tool Registry
4. Register any required context in Context Registry

## Validation Rules

Agents can use declarative validation rules:

```json
{
  "validation_rules": [
    {
      "field": "response",
      "rules": [
        { "type": "nonEmpty" },
        { "type": "length", "max": 1600 }
      ]
    }
  ]
}
```

**Available Rules:**
- `truthy` - Value is truthy
- `nonEmpty` - String/array is not empty
- `equals` - Value equals expected
- `length` - String/array length constraints

## Related Documentation

- [Agent System](./index.md) - Agent system overview
- [Tools](./tools.md) - Available agent tools
- [Context Providers](./context.md) - Context resolution
