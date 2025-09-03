# Onboarding Chat Context Implementation Plan

## Overview
Transform the onboarding chat from asking redundant questions to providing intelligent, context-aware profile building conversations.

## Phase 1: Core Context Enhancement (Critical - 2-3 hours)

### 1.1 Expand Profile Context Usage
**File**: `src/server/agents/onboardingChat/prompts.ts`
**Function**: `buildOnboardingChatSystemPrompt()`

- [ ] Replace limited 4-field summary with comprehensive profile context
- [ ] Include `specificObjective` in goal context (e.g., "ski season prep")
- [ ] Add `currentActivity` and `currentTraining` context
- [ ] Include detailed `availability` fields (preferredTimes, travelPattern, notes)
- [ ] Add `equipment` details (location, items, constraints)
- [ ] Include `preferences` context (workoutStyle, enjoyedExercises, dislikedExercises)
- [ ] Add active `constraints` summary
- [ ] Include relevant `metrics` if available
- [ ] Handle null/undefined profile fields gracefully

### 1.2 Update System Prompt Behavior
**File**: `src/server/agents/onboardingChat/prompts.ts`

- [ ] Add context awareness guidelines for profile building
- [ ] Emphasize acknowledging captured information
- [ ] Add instructions to ask contextual follow-up questions
- [ ] Include explicit "DO NOT make recommendations" instruction
- [ ] Add guidance for efficient profile completion

### 1.3 Create Helper Function
**File**: `src/server/agents/onboardingChat/prompts.ts`

- [ ] Create `buildRichProfileSummary()` function
- [ ] Implement sectioned profile display (Goals, Schedule, Equipment, etc.)
- [ ] Add intelligent field presence checking
- [ ] Include constraint formatting
- [ ] Add metrics display logic

## Phase 2: Enhanced Intelligence (Medium Priority - 1-2 hours)

### 2.1 Contextual Gap Detection
**File**: `src/server/agents/onboardingChat/prompts.ts`

- [ ] Create `computeContextualGaps()` function
- [ ] Detect timeline gaps (goal without eventDate/timelineWeeks)
- [ ] Identify equipment detail gaps (home-gym without items)
- [ ] Find constraint modification gaps (severe constraints without modifications)
- [ ] Detect schedule preference gaps (availability without preferredTimes)

### 2.2 Smarter Required Fields Logic
**File**: `src/server/services/onboardingChatService.ts`

- [ ] Review `computePendingRequiredFields()` function
- [ ] Consider expanding beyond 4 essential fields
- [ ] Add contextual completeness checks
- [ ] Ensure profile readiness for program creation phase

### 2.3 Enhanced Conversation Context
**File**: `src/server/services/onboardingChatService.ts`

- [ ] Review conversation history usage (currently maxContextMessages = 6)
- [ ] Consider increasing context window for profile extraction
- [ ] Ensure context is properly passed to chat generation

## Phase 3: Testing & Validation (Critical - 2-3 hours)

### 3.1 Unit Tests
**File**: `tests/unit/server/agents/onboardingChat/prompts.test.ts`

- [ ] Update existing tests for expanded profile context
- [ ] Add tests for `buildRichProfileSummary()` function
- [ ] Test null/undefined profile handling
- [ ] Test various profile completeness scenarios
- [ ] Add specific objective acknowledgment tests

### 3.2 Integration Tests
**File**: `tests/integration/onboardingChat/`

- [ ] Create ski season scenario test
- [ ] Create equipment context scenario test  
- [ ] Create constraint awareness scenario test
- [ ] Test profile extraction + chat response flow
- [ ] Verify no redundant questions in responses

### 3.3 Manual Testing Scenarios
**File**: Manual test checklist

- [ ] "Help me get in shape for ski season - lots of legs and cardio"
- [ ] "I have a home gym with dumbbells and a pull-up bar"
- [ ] "I have a bad knee but want to get stronger"
- [ ] "I'm training for a wedding in 6 months"
- [ ] "I go to Planet Fitness 3 times a week currently"

## Phase 4: Edge Cases & Polish (Low Priority - 1 hour)

### 4.1 Error Handling
**File**: `src/server/agents/onboardingChat/prompts.ts`

- [ ] Handle malformed profile data gracefully
- [ ] Add fallback behavior for missing context
- [ ] Ensure backward compatibility with existing profiles

### 4.2 Token Usage Optimization
**File**: `src/server/agents/onboardingChat/prompts.ts`

- [ ] Monitor system prompt length with expanded context
- [ ] Optimize context display for essential information
- [ ] Consider truncation for very large profiles

### 4.3 Logging & Debugging
**File**: `src/server/services/onboardingChatService.ts`

- [ ] Add debug logging for profile context usage
- [ ] Log contextual gaps detection
- [ ] Add conversation flow tracking

## Implementation Checklist by File

### `src/server/agents/onboardingChat/prompts.ts`
- [ ] **Function**: `buildRichProfileSummary(profile: FitnessProfile | null): string`
  - Goals & Objectives section
  - Current Training Context section  
  - Detailed Availability section
  - Equipment & Location section
  - Experience & Preferences section
  - Active Constraints section
  - Physical Context section
  
- [ ] **Function**: `buildOnboardingChatSystemPrompt()` updates
  - Replace 4-field summary with `buildRichProfileSummary()`
  - Add contextual profile building guidelines
  - Include "DO NOT recommend" instructions
  - Add acknowledgment behavior guidelines

- [ ] **Function**: `computeContextualGaps(profile: FitnessProfile): string[]`
  - Timeline gap detection
  - Equipment detail gaps
  - Constraint modification gaps
  - Schedule preference gaps

### `src/server/services/onboardingChatService.ts`
- [ ] **Review**: Profile data passed to `buildOnboardingChatSystemPrompt()`
- [ ] **Review**: Conversation context handling
- [ ] **Optional**: Expand `computePendingRequiredFields()` logic

### Test Files
- [ ] **Update**: `tests/unit/server/agents/onboardingChat/prompts.test.ts`
- [ ] **Create**: Integration test scenarios
- [ ] **Create**: Manual testing checklist

## Success Criteria

### Before Implementation
- [ ] User says: "Help me get in shape for ski season"
- [ ] System responds: "What is your primary fitness goal?"
- [ ] Result: Frustrating redundant question

### After Implementation  
- [ ] User says: "Help me get in shape for ski season"
- [ ] System responds: "Great! For ski season prep, when are you hoping to be ready? And what's your current fitness level?"
- [ ] Result: Context-aware, efficient profile building

## Risk Mitigation

### High Risk Items
- [ ] System prompt becomes too long (monitor token usage)
- [ ] Profile extraction breaks with expanded context
- [ ] Existing conversations/profiles become incompatible

### Mitigation Strategies
- [ ] Implement gradual rollout with feature flags
- [ ] Maintain backward compatibility with existing profiles
- [ ] Add comprehensive error handling
- [ ] Test with various profile completeness states

## Definition of Done

- [ ] Ski season test case passes (acknowledges objective, asks contextual follow-ups)
- [ ] No redundant questions when profile information already captured
- [ ] System prompt maintains focus on profile building (no recommendations)  
- [ ] All unit tests pass
- [ ] Integration tests cover main scenarios
- [ ] Manual testing scenarios all pass
- [ ] Token usage remains reasonable (<2000 tokens for system prompt)
- [ ] Error handling covers edge cases
- [ ] Code review completed
- [ ] Documentation updated

## Estimated Timeline
- **Phase 1**: 2-3 hours (core functionality)
- **Phase 2**: 1-2 hours (enhanced intelligence)  
- **Phase 3**: 2-3 hours (testing & validation)
- **Phase 4**: 1 hour (polish & edge cases)
- **Total**: 6-9 hours

## Dependencies
- No external dependencies
- Requires understanding of existing profile extraction flow
- Should coordinate with any ongoing profile schema changes