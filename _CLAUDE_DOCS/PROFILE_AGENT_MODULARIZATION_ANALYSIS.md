# Profile Agent Modularization Analysis

## Executive Summary

This document analyzes the current UserProfileAgent implementation and provides a comprehensive plan for modularizing it into specialized sub-agents. The current monolithic agent handles all profile and user updates through a single LLM call with extensive prompts. The proposed modularization will create focused sub-agents that each handle specific domains while preserving the existing patch logic.

## Current Architecture Analysis

### Current Implementation Structure

The existing profile system consists of:

1. **Single Monolithic Agent** (`src/server/agents/profile/chain.ts`)
   - Handles ALL profile and user information extraction
   - Uses 239-line comprehensive system prompt
   - Returns `ProfileAgentResult` with merged updates
   - Orchestrates between `profilePatchTool` and `userInfoPatchTool`

2. **Massive System Prompt** (`src/server/agents/profile/prompts.ts`)
   - 239 lines of complex instructions
   - Covers 7+ different information domains
   - Multiple confidence thresholds and extraction rules
   - Heavy emphasis on activity data and goals

3. **Two Patch Tools**
   - `profilePatchTool`: Handles fitness profile updates with activity merging
   - `userInfoPatchTool`: Handles contact/scheduling information

### Usage Pattern

The agent is currently used in:
- `ChatService.handleIncomingMessage()` - Main SMS processing pipeline
- Two-agent architecture: Profile extraction → Chat response generation

## Schema-Based Sub-Agent Breakdown

Based on the `FitnessProfileSchema` and `UserSchema`, the following sub-agents are proposed:

### 1. User Info Agent (`userAgent`)
**Scope**: Contact details and personal demographics
- **Schema Fields**: `name`, `email`, `phoneNumber`, `age`, `gender`, `timezone`, `preferredSendHour`
- **Current Tool**: `userInfoPatchTool` (already exists)
- **Confidence Patterns**: High for explicit statements, name inference, direct demographics

### 2. Goals Agent (`goalsAgent`)
**Scope**: Fitness objectives and motivations
- **Schema Fields**: `goals.primary`, `goals.timeline`, `goals.specific`, `goals.motivation`, `goals.summary`
- **Current Tool**: `profilePatchTool` (goals section)
- **Priority**: HIGHEST - goals are most important for personalization

### 3. Activities Agent (`activitiesAgent`)
**Scope**: Activity-specific training data and experience
- **Schema Fields**: `activityData[]` (strength, cardio with experience, metrics, preferences)
- **Current Tool**: `profilePatchTool` (with complex activity merging logic)
- **Complexity**: HIGH - handles array merging, multiple activity types

### 4. Constraints Agent (`constraintsAgent`)
**Scope**: Limitations, injuries, and restrictions
- **Schema Fields**: `constraints[]` (injuries, mobility, medical, preferences)
- **Current Tool**: `profilePatchTool` (constraints section)
- **Domain**: Safety-critical information

### 5. Environment Agent (`environmentAgent`)
**Scope**: Equipment access and availability
- **Schema Fields**: `equipmentAccess`, `availability`
- **Current Tool**: `profilePatchTool` (equipment/availability sections)
- **Dependencies**: Often mentioned together (gym + schedule)

### 6. Metrics Agent (`metricsAgent`)
**Scope**: Physical measurements and fitness tracking
- **Schema Fields**: `metrics.height`, `metrics.weight`, `metrics.bodyComposition`, `metrics.fitnessLevel`
- **Current Tool**: `profilePatchTool` (metrics section)
- **Frequency**: Lower update frequency, specific measurement events

## Proposed Modular Architecture

### Directory Structure (IMPLEMENTED)
```
src/server/agents/profile/
├── chain.ts                      # Main orchestrator agent  
├── prompts.ts                    # Original monolithic prompts (preserved)
├── user/
│   ├── chain.ts                  # User info extraction agent
│   └── prompt.ts                 # User-specific prompt
├── goals/
│   ├── chain.ts                  # Goals and objectives agent
│   └── prompt.ts                 # Goals-specific prompt
├── activities/
│   ├── chain.ts                  # Activity data and experience agent
│   └── prompt.ts                 # Activities-specific prompt  
├── constraints/
│   ├── chain.ts                  # Injuries and limitations agent
│   └── prompt.ts                 # Constraints-specific prompt
├── environment/
│   ├── chain.ts                  # Equipment and availability agent  
│   └── prompt.ts                 # Environment-specific prompt
├── metrics/
│   ├── chain.ts                  # Physical metrics agent
│   └── prompt.ts                 # Metrics-specific prompt
└── ../tools/                     # Existing tools preserved (one level up)
    ├── profilePatchTool.ts
    └── userInfoPatchTool.ts
```

### Orchestrator Pattern

The main `chain.ts` becomes an orchestrator that:
1. Receives user message and current profile/user state
2. Routes to relevant sub-agents based on content classification
3. Aggregates results from multiple sub-agents if needed
4. Returns unified `ProfileAgentResult`

### Individual Sub-Agent Structure

Each sub-agent follows this pattern:
```typescript
export interface SubAgentResult {
  updates: Partial<FitnessProfile> | Partial<User>;
  wasUpdated: boolean;
  confidence: number;
  reason?: string;
  fieldsUpdated: string[];
}

export const [domain]Agent = async ({
  message,
  current[Domain]Data,
  config
}: {
  message: string;
  current[Domain]Data: Partial<[DomainType]>;
  config?: AgentConfig;
}): Promise<SubAgentResult>
```

## Preserving Existing Patch Logic

### Key Behaviors to Maintain

1. **Activity Merging Logic** (`activitiesAgent`)
   - Complex array merging in `profilePatchTool.mergeActivityData()`
   - Handles multiple activity types simultaneously
   - Preserves existing activities while adding new ones
   - Equipment and goals array deduplication

2. **Confidence Thresholds**
   - 0.75+ threshold for updates (configurable)
   - Different confidence patterns per domain
   - Gender/age extraction has specific confidence rules

3. **Tool Orchestration**
   - `profilePatchTool` for fitness data
   - `userInfoPatchTool` for contact information
   - Proper field tracking and update summaries

4. **Response Format**
   - Maintain `ProfileAgentResult` interface
   - Aggregate field updates across sub-agents
   - Combined confidence scoring and reasoning

### Implementation Strategy

**Current Status**: Directory structure is complete with placeholder files

1. **Phase 1**: Extract prompts from monolithic `prompts.ts` into domain-specific `prompt.ts` files
2. **Phase 2**: Implement individual sub-agent `chain.ts` files with existing tools
3. **Phase 3**: Build orchestrator in main `chain.ts` with routing logic  
4. **Phase 4**: Add multi-agent result aggregation and parallel execution
5. **Phase 5**: Performance optimization, testing, and gradual rollout

**Files Ready for Implementation**:
- ✅ Directory structure complete
- ⏳ 6 prompt files (currently empty)
- ⏳ 6 chain files (currently empty) 
- ⏳ Main orchestrator (currently monolithic)
- ✅ Existing tools preserved

## Domain-Specific Prompt Breakdown

### Goals Agent Prompt (Highest Priority)
- Primary goal inference from activities
- Activity → goal mapping (hiking → endurance, lifting → strength)
- Timeline and motivation extraction
- Event-based goals (ski season, wedding, marathon)

### Activities Agent Prompt (Complex)
- Multi-activity detection (running + lifting)
- Activity-specific experience levels
- Equipment and metric extraction per activity
- Array format requirements (even single activities)

### User Agent Prompt (Demographics)
- Gender detection patterns (0.95+ for explicit, 0.8+ for names)
- Age extraction (13-120 validation)
- Time preference parsing (6am, morning, evening)
- Contact information normalization

### Constraints Agent Prompt (Safety)
- Injury severity assessment
- Mobility limitations
- Medical considerations
- Movement restrictions

### Environment Agent Prompt (Context)
- Gym access and type detection
- Home equipment inventory
- Schedule availability patterns
- Equipment limitations

### Metrics Agent Prompt (Measurements)
- Weight and height extraction
- Fitness level assessment
- Body composition data
- Progress tracking metrics

## Benefits of Modularization

### Maintainability
- Smaller, focused prompts (20-40 lines vs 239 lines)
- Domain-specific expertise and tuning
- Easier testing and validation per domain

### Performance
- Only run relevant agents based on message content
- Parallel execution for independent domains
- Reduced token usage per individual call

### Accuracy
- Specialized prompts reduce context bleeding
- Domain-specific confidence thresholds
- Better extraction precision per area

### Extensibility
- Easy to add new domains (nutrition, sleep, etc.)
- Independent agent versioning and updates
- A/B testing per domain

## Migration Considerations

### Backward Compatibility
- Maintain `ProfileAgentResult` interface
- Preserve all existing tool behaviors
- Same confidence thresholds and validation

### Testing Strategy
- Unit tests per sub-agent
- Integration tests for orchestrator
- Regression tests against current behavior
- A/B testing in production

### Performance Impact
- Multiple LLM calls vs single large call
- Network latency considerations
- Token usage optimization
- Parallel execution benefits

### Rollout Plan
- Feature flag for new vs old agent
- Gradual rollout with monitoring
- Fallback to monolithic agent if needed
- Performance and accuracy metrics comparison

## Conclusion

The modularization of the UserProfileAgent represents a significant architectural improvement that will enhance maintainability, accuracy, and extensibility while preserving all existing functionality. The domain-based breakdown aligns well with the schema structure and natural information categories.

The key to success will be careful preservation of the existing patch logic, particularly the complex activity merging behavior, while breaking down the massive prompt into focused, domain-specific instructions.

This change positions the system for future enhancements like specialized domain models, parallel processing, and more sophisticated confidence scoring per information type.