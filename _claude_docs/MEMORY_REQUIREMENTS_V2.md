# GymText Memory System - Product Requirements Document (V2 - Simple String Approach)

## Executive Summary

The GymText memory system will enhance AI coaching by maintaining a simple, structured text-based memory for each user. This approach prioritizes simplicity and immediate value over complex vector storage, making it easier to implement, debug, and maintain while still providing significant contextual improvements.

## Problem Statement

### Current State
- Limited conversation context (only last 5 messages)
- No long-term memory of user preferences, injuries, or workout modifications
- Inability to reference past conversations when generating daily messages
- No contextual awareness for workout adjustments based on user circumstances

### Pain Points
1. **Lost Context**: When users mention travel, injuries, or preferences, this information is forgotten after conversation ends
2. **Generic Responses**: Daily messages and workout suggestions lack personalization based on user history
3. **Missed Opportunities**: Cannot proactively suggest modifications based on past user feedback

## Solution Overview

### Phase 1: Structured String Memory

A simple database table storing a structured text document for each user that acts as a "coaching notes" system. The LLM reads and updates this document during interactions, similar to how a human coach would maintain notes about their clients.

### Key Benefits
- **Simplicity**: Plain text is easy to debug, inspect, and modify
- **Immediate Context**: Full memory available in every LLM call without complex retrieval
- **Human-Readable**: Support team can easily review and edit if needed
- **Fast Implementation**: Can be built and deployed quickly

## Data Model

### Memory Table Schema
```sql
CREATE TABLE user_memories (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  version INT NOT NULL DEFAULT 1
);

-- Index for quick lookups
CREATE INDEX idx_user_memories_updated ON user_memories(updated_at);
```

### Memory Content Structure
```
=== FITNESS CONTEXT ===
Current Program: Upper/Lower Split (Week 3 of 6)
Skill Level: Intermediate
Goals: Build muscle, improve strength

=== RECENT WORKOUTS ===
- 2025-01-05: Back day - heavy deadlifts (3x5 @ 315lbs), felt strong
- 2025-01-06: Chest day - high volume bench press, slight shoulder discomfort
- 2025-01-07: Rest day - mentioned feeling sore but good

=== INJURIES & LIMITATIONS ===
- Ongoing: Mid-back tightness around shoulder blades - avoid heavy rows, focus on mobility
- Temporary: Minor knee bruising from accident (noted 2025-01-05) - avoid jumping movements until 2025-01-12

=== ENVIRONMENT & EQUIPMENT ===
- Default: Home gym with dumbbells up to 50lbs, pull-up bar, resistance bands
- Temporary: Hotel in Santa Clara until 2025-01-10 - bodyweight only, park nearby for running

=== PREFERENCES & PATTERNS ===
- Loves: Deadlifts, pull-ups, outdoor cardio
- Dislikes: Burpees, machine exercises
- Best workout time: Morning before 7am
- Responds well to: Progressive overload, clear rep targets
- Struggles with: Consistency on weekends

=== COACHING NOTES ===
- Client prefers direct, motivational language
- Tends to push too hard - remind about recovery
- Has made excellent progress on pull-ups (5 → 12 reps)
- Considering signing up for local 5K race in March
```

## Functional Requirements

### FR1: Memory Management

#### FR1.1: Memory Creation
- Automatically create memory record when new user completes onboarding
- Initialize with basic structure and information from fitness profile
- Include welcome conversation insights

#### FR1.2: Memory Updates
- Update memory after each conversation interaction
- Preserve existing valuable information while adding new insights
- Handle concurrent updates with optimistic locking (version field)

#### FR1.3: Memory Expiration
- Implement time-based expiration for temporary information
- Format: `[condition] until [date]` or `noted [date]`
- Daily cleanup job removes expired entries

### FR2: LLM Integration

#### FR2.1: Memory Inclusion
- Include full memory content in LLM context for:
  - Daily message generation
  - SMS conversation responses
  - Workout plan updates
- Format as system message or context section

#### FR2.2: Memory Update Instructions
- Provide LLM with clear instructions on how to format memory updates
- Include examples of proper structure and formatting
- Specify what should be added, modified, or removed

#### FR2.3: Update Extraction
- Extract memory updates from LLM responses
- Use structured output or marked sections (e.g., `<memory_update>...</memory_update>`)
- Validate updates before applying to database

### FR3: Time-Sensitive Content Handling

#### FR3.1: Temporal Markers
- Support date-based expiration: "until YYYY-MM-DD"
- Support duration-based expiration: "for X days/weeks"
- Support event-based expiration: "until next mesocycle"

#### FR3.2: Automatic Cleanup
- Daily cron job (midnight UTC) processes all memories
- Remove expired temporary conditions
- Archive important expired items to history section if needed

#### FR3.3: Smart Expiration Examples
```
CORRECT:
- "Hotel in Santa Clara until 2025-01-10"
- "Knee bruising (noted 2025-01-05) - avoid jumping until 2025-01-12"
- "On antibiotics until 2025-01-08 - may affect energy"

AUTOMATICALLY CLEANED:
- On 2025-01-11: "Hotel in Santa Clara" entry removed
- On 2025-01-13: "Knee bruising" moved to history or removed
```

## Technical Implementation

### Memory Service Interface
```typescript
interface MemoryService {
  // Retrieve user's memory
  getMemory(userId: string): Promise<string>;
  
  // Update user's memory (with conflict resolution)
  updateMemory(userId: string, content: string): Promise<void>;
  
  // Process time-sensitive content
  cleanExpiredContent(userId: string): Promise<void>;
  
  // Batch cleanup for all users
  cleanAllExpiredContent(): Promise<void>;
}
```

### LLM Prompt Integration
```typescript
// For daily messages
const dailyMessagePrompt = `
You are a fitness coach sending a daily workout message.

USER CONTEXT:
${userMemory}

TODAY'S WORKOUT:
${workoutDetails}

Generate a personalized SMS message that:
1. References relevant context from user's history
2. Addresses any current limitations or circumstances
3. Provides motivation based on their preferences

After generating the message, provide any memory updates in this format:
<memory_update>
[Specify what to ADD, MODIFY, or REMOVE from the memory]
</memory_update>
`;
```

### Update Processing Flow
```
1. User sends SMS
2. Retrieve current memory
3. Include memory in LLM context
4. LLM generates response + memory updates
5. Send SMS response to user
6. Parse and apply memory updates
7. Run expiration check if needed
```

## Memory Update Examples

### Example 1: User Mentions Injury
**User SMS**: "My shoulder is really sore from yesterday's workout"

**Memory Update**:
```
ADD to INJURIES & LIMITATIONS:
- Shoulder soreness from chest day (noted 2025-01-07) - reduce pressing volume for 1 week

MODIFY in RECENT WORKOUTS:
- 2025-01-06: Chest day - high volume bench press, shoulder overworked
```

### Example 2: User Traveling
**User SMS**: "Hey, I'm going to be in NYC for a conference next week. Hotel has a decent gym"

**Memory Update**:
```
ADD to ENVIRONMENT & EQUIPMENT:
- NYC hotel gym from 2025-01-14 until 2025-01-21 - standard commercial gym equipment available
```

### Example 3: Workout Completion
**Daily Message Response**: User completes workout and mentions feeling great

**Memory Update**:
```
ADD to RECENT WORKOUTS:
- 2025-01-07: Legs day - squats felt strong, hit all targets

ADD to COACHING NOTES:
- Responding well to current leg program - consider progression next week
```

## Implementation Phases

### Phase 1A: Basic Implementation (Week 1-2)
1. Create database table and migration
2. Implement basic MemoryService (get/update)
3. Integrate with chatAgent for reading memory
4. Manual memory updates (no automatic extraction)

### Phase 1B: Automatic Updates (Week 3-4)
1. Implement LLM-based memory extraction
2. Add memory update parsing from LLM responses
3. Integrate with daily message system
4. Add basic conflict resolution

### Phase 1C: Time Management (Week 5)
1. Implement temporal marker parsing
2. Create expiration cleanup job
3. Add date-aware memory formatting
4. Test and refine expiration rules

## Success Metrics

### Quantitative Metrics
- **Context Usage**: Memory referenced in 60% of daily messages
- **Update Frequency**: Average 2-3 memory updates per user per week
- **Performance**: Memory retrieval < 50ms (simple DB query)
- **Storage**: Average memory size < 2KB per user

### Qualitative Metrics
- **Relevance**: Coach messages demonstrate awareness of user's situation
- **Accuracy**: Memory updates accurately reflect conversation content
- **Timeliness**: Time-sensitive information properly maintained

## Advantages of String-Based Approach

### Pros
1. **Simplicity**: No vector embeddings or similarity search complexity
2. **Debuggability**: Easy to inspect and manually correct
3. **Performance**: Single database read, no complex retrieval
4. **Flexibility**: LLM can reorganize/reformat as needed
5. **Cost-Effective**: No embedding API costs or vector storage

### Cons (and Mitigations)
1. **Token Usage**: Full memory in each call
   - Mitigation: Keep memory concise (<1000 tokens), implement summarization
2. **No Semantic Search**: Can't query for similar memories
   - Mitigation: Well-structured format makes scanning efficient
3. **Scalability**: String grows over time
   - Mitigation: Periodic summarization, archiving old entries

## Migration Path to Advanced System

When ready for Phase 2 (vector-based memory):
1. Use existing string memories as source data
2. Generate embeddings from structured sections
3. Maintain string format as fallback/cache
4. Gradually transition to hybrid approach

## Risk Mitigation

### Data Loss Prevention
- Version tracking on updates
- Daily backups of memory table
- Audit log of all changes

### Quality Control
- Validation rules for memory structure
- Maximum memory size limits (e.g., 5000 characters)
- Review system for flagged updates

### Privacy & Security
- Encryption at rest
- No PII in memory beyond what's already in user profile
- User ability to view and request deletion

## Next Steps

### Immediate Actions
1. Review and approve simplified approach
2. Create database migration for memory table
3. Implement basic MemoryService
4. Create memory update prompt templates
5. Test with small user cohort

### Timeline
- Week 1-2: Basic implementation
- Week 3-4: Automatic updates
- Week 5: Time management
- Week 6: Testing and refinement
- Week 7-8: Gradual rollout

---

**Document Version**: 2.0  
**Last Updated**: 2025-01-06  
**Key Change**: Simplified from vector-based to string-based memory system