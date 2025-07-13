# Phase 2 Implementation: Program Generation System

## Overview

Phase 2 of the workout planning system has been implemented, introducing AI-powered program generation capabilities. This phase creates a program-first approach where all workouts are generated from structured, multi-week programs with proper periodization.

## Key Changes

- **Program-First Approach**: All users must have an active program to receive workouts
- **No Backward Compatibility**: Legacy daily workout generation has been removed
- **Structured Workflow**: Onboarding → Program Generation → Daily Workouts

## Completed Components

### 1. AI Agents

#### Program Designer Agent (`src/server/agents/program-designer.ts`)
- Analyzes user fitness profiles to design comprehensive programs
- Creates multi-phase program structures with periodization
- Supports program adaptation based on user feedback
- Outputs structured program data including:
  - Program type (strength, hypertrophy, endurance, hybrid)
  - Duration and phases
  - Training variables per phase
  - Weekly structure

#### Session Builder Agent (`src/server/agents/session-builder.ts`)
- Generates individual workout sessions based on program context
- Supports different session types (strength, hypertrophy, conditioning, recovery)
- Handles equipment constraints and time limitations
- Provides exercise alternatives and modifications
- Includes warmup and cooldown structures

#### Workout Orchestrator (`src/server/agents/orchestrator.ts`)
- Coordinates between different agents
- Manages three orchestration modes:
  - `program_generation`: Creates new workout programs
  - `session_generation`: Generates individual sessions from programs
  - `adapt_program`: Modifies existing programs based on user needs
- Handles context management and error handling

### 2. Prompt Templates

#### Program Design Prompts (`src/server/prompts/program-design-prompt.ts`)
- System prompts for AI expertise
- Templates for different program types
- Structured templates for beginner/intermediate/advanced users
- Adaptation prompts for program modifications

#### Phase Planning Prompts (`src/server/prompts/phase-planning-prompt.ts`)
- Phase-specific prompt templates
- Progression rules for volume and intensity
- Phase transition guidelines
- Adaptation triggers and responses

#### Session Generation Prompts (`src/server/prompts/session-generation-prompt.ts`)
- Session-specific templates (standard, minimal, bodyweight, hotel, recovery)
- Exercise selection rules by movement pattern
- Equipment substitution guidelines
- Session structure templates

#### Adaptation Prompts (`src/server/prompts/adaptation-prompt.ts`)
- Performance-based adaptations
- Injury modifications
- Lifestyle change adjustments
- Communication adaptations by skill level

### 3. API Endpoints

All endpoints follow RESTful conventions and include proper validation:

#### Program Management

##### POST `/api/programs/generate`
- Generates a new workout program for a user
- Request body:
  ```json
  {
    "userId": "uuid",
    "regenerate": false,
    "preferences": {
      "programType": "strength",
      "duration": 12,
      "startDate": "2024-01-01"
    }
  }
  ```

##### GET `/api/programs`
- Lists all programs for a user
- Query parameter: `userId`

##### GET `/api/programs/:id`
- Retrieves detailed program information

##### PUT `/api/programs/:id`
- Updates program details or status
- Supports partial updates

##### DELETE `/api/programs/:id`
- Removes a program

##### POST `/api/programs/:id/regenerate-week`
- Regenerates a specific week of the program
- Useful for adaptations or changes in circumstances

#### Workout Delivery

##### POST `/api/workouts/daily`
- Generates and delivers daily workout via SMS
- Requires active program
- Request body:
  ```json
  {
    "userId": "uuid",
    "regenerate": false
  }
  ```

#### Agent Actions

##### POST `/api/agent`
Updated actions:
- `onboard`: Creates user profile AND generates initial program
- `daily-workout`: Delivers today's workout from active program
- `adapt-program`: Modifies existing program based on user needs

## Integration Points

### Program-First Workflow
1. **User Onboarding**: Profile creation + automatic program generation
2. **Daily Workouts**: Generated from active program sessions
3. **Adaptations**: Programs can be modified based on user feedback
4. **SMS Integration**: Chat commands can trigger program adaptations

### Database Integration (Pending)
- Program storage structure defined
- Services prepared for database operations
- Migration scripts ready (from Phase 1)

## Usage Examples

### Complete User Flow

```typescript
// 1. Onboard user (includes program generation)
const onboardResponse = await fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'onboard',
    userId: 'user-uuid'
  })
});

// 2. Daily workout delivery
const workoutResponse = await fetch('/api/workouts/daily', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid'
  })
});

// 3. Adapt program based on user needs
const adaptResponse = await fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'adapt-program',
    userId: 'user-uuid',
    programId: 'program-uuid',
    reason: 'traveling for 2 weeks',
    feedback: 'need bodyweight exercises only'
  })
});
```

## Next Steps

1. **Database Integration**: Connect the agents to the database layer
2. **Testing**: Add comprehensive tests for agents and API endpoints
3. **SMS Integration**: Update SMS handlers to deliver program-based workouts
4. **User Interface**: Create UI for program management
5. **Analytics**: Implement tracking for program adherence and outcomes

## Technical Notes

- All agents use structured output parsing with Zod schemas
- Temperature settings optimized for consistent generation
- Error handling implemented at all levels
- Type safety maintained throughout

## Configuration

No new environment variables required for Phase 2. The system uses existing LLM configuration (OpenAI/Google Gemini).

## Important Changes from Original Design

1. **No Standalone Workouts**: All workouts must come from an active program
2. **Mandatory Program Generation**: Users cannot receive workouts without a program
3. **Simplified Architecture**: Removed legacy workout generation paths
4. **Program-Centric SMS**: All SMS interactions assume program context

## Current Limitations

- Database operations return placeholder responses (to be implemented)
- Program templates are not yet persisted
- User program tracking not yet active
- Analytics and reporting pending
- SMS chat needs updating to handle program-specific queries