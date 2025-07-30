# Unit Test Creation Plan

## Overview

This document outlines the comprehensive unit test creation plan for GymText, prioritizing services, repositories, and agents as the core business logic components. The plan follows a systematic approach to achieve robust test coverage while focusing on critical functionality first.

## Testing Priority Order

### Phase 1: Critical Infrastructure (Week 1)
Focus on foundational components that other services depend on.

### Phase 2: Core Business Logic (Week 2-3)
Test the main services that handle user interactions and fitness planning.

### Phase 3: AI/LLM Integration (Week 3-4)
Test agent chains and prompt engineering components.

### Phase 4: Utilities and Edge Cases (Week 4-5)
Complete coverage with utility functions and error handling.

## Detailed Testing Checklist

### 🔴 Priority 1: Repositories (Target: 90% coverage)

#### Base Repository
- [ ] **baseRepository.ts**
  - [ ] Test generic CRUD operations
  - [ ] Test error handling for database failures
  - [ ] Test transaction support
  - [ ] Test query builder patterns

#### User Management
- [ ] **userRepository.ts**
  - [ ] `create()` - Test user creation with validation
  - [ ] `findById()` - Test user retrieval by ID
  - [ ] `findByPhoneNumber()` - Test phone number lookup
  - [ ] `update()` - Test user updates
  - [ ] `findWithProfile()` - Test user with fitness profile joins
  - [ ] `updateStripeCustomerId()` - Test Stripe ID updates
  - [ ] Test handling of duplicate phone numbers
  - [ ] Test soft delete functionality

#### Conversation & Messaging
- [ ] **conversationRepository.ts**
  - [ ] `create()` - Test conversation creation
  - [ ] `findByUserId()` - Test user conversation lookup
  - [ ] `findActiveByUserId()` - Test active conversation filtering
  - [ ] `update()` - Test conversation status updates
  - [ ] Test pagination for conversation lists

- [ ] **messageRepository.ts**
  - [ ] `create()` - Test message creation
  - [ ] `findByConversationId()` - Test message retrieval
  - [ ] `findRecentMessages()` - Test message history with limits
  - [ ] `updateTokenCount()` - Test token usage tracking
  - [ ] Test message ordering and timestamps

#### Fitness Planning
- [ ] **fitnessPlanRepository.ts**
  - [ ] `create()` - Test plan creation
  - [ ] `findActiveByUserId()` - Test active plan lookup
  - [ ] `updateStatus()` - Test plan status transitions
  - [ ] `findWithFullHierarchy()` - Test nested data loading
  - [ ] Test plan archival and history

- [ ] **mesocycleRepository.ts**
  - [ ] `create()` - Test mesocycle creation
  - [ ] `findByPlanId()` - Test mesocycles by plan
  - [ ] `update()` - Test phase updates
  - [ ] Test ordering by week number

- [ ] **microcycleRepository.ts**
  - [ ] `create()` - Test microcycle creation
  - [ ] `findByMesocycleId()` - Test microcycles by mesocycle
  - [ ] `findCurrentWeek()` - Test current week calculation
  - [ ] Test week progression logic

- [ ] **workoutInstanceRepository.ts**
  - [ ] `create()` - Test workout instance creation
  - [ ] `findByDateRange()` - Test date range queries
  - [ ] `findTodaysWorkout()` - Test today's workout logic
  - [ ] `markComplete()` - Test completion tracking
  - [ ] Test workout scheduling conflicts

### 🟡 Priority 2: Services (Target: 85% coverage)

#### Core Services
- [ ] **conversationService.ts**
  - [ ] `handleIncomingMessage()` - Test message processing flow
  - [ ] `createConversation()` - Test new conversation setup
  - [ ] `getConversationContext()` - Test context building
  - [ ] Test rate limiting
  - [ ] Test error responses
  - [ ] Test conversation state management

- [ ] **messageService.ts**
  - [ ] `saveUserMessage()` - Test user message persistence
  - [ ] `saveAssistantMessage()` - Test AI response persistence
  - [ ] `getMessageHistory()` - Test history retrieval
  - [ ] Test message validation
  - [ ] Test token counting

- [ ] **chatService.ts**
  - [ ] `generateResponse()` - Test AI response generation
  - [ ] `buildPrompt()` - Test prompt construction
  - [ ] Test context injection
  - [ ] Test response formatting
  - [ ] Test fallback responses
  - [ ] Mock LLM responses

#### Fitness Services
- [ ] **fitnessPlanService.ts**
  - [ ] `generatePlan()` - Test plan generation flow
  - [ ] `activatePlan()` - Test plan activation
  - [ ] `updatePlanProgress()` - Test progress tracking
  - [ ] Test plan validation
  - [ ] Test concurrent plan handling
  - [ ] Mock AI plan generation

- [ ] **mesocycleService.ts**
  - [ ] `createFromPlan()` - Test mesocycle breakdown
  - [ ] `progressToNext()` - Test phase progression
  - [ ] `calculateVolume()` - Test volume calculations
  - [ ] Test phase transitions

#### Integration Services
- [ ] **twilioService.ts**
  - [ ] `sendSMS()` - Test SMS sending (mocked)
  - [ ] `validatePhoneNumber()` - Test number validation
  - [ ] `formatMessage()` - Test message formatting
  - [ ] Test rate limiting
  - [ ] Test error handling
  - [ ] Mock Twilio client

#### Context Services
- [ ] **contextService.ts**
  - [ ] `buildUserContext()` - Test context aggregation
  - [ ] `mergeContexts()` - Test context merging
  - [ ] Test context caching
  - [ ] Test partial context building

- [ ] **memoryService.ts**
  - [ ] `saveMemory()` - Test memory persistence
  - [ ] `retrieveRelevantMemories()` - Test memory search
  - [ ] Test memory expiration
  - [ ] Mock vector database

- [ ] **promptService.ts**
  - [ ] `getPromptTemplate()` - Test template retrieval
  - [ ] `renderPrompt()` - Test template rendering
  - [ ] Test variable substitution
  - [ ] Test prompt validation

### 🟢 Priority 3: Agents (Target: 80% coverage)

#### Base Agent
- [ ] **base.ts**
  - [ ] Test base chain construction
  - [ ] Test error handling
  - [ ] Test retry logic
  - [ ] Test timeout handling

#### Conversation Agents
- [ ] **chat/chain.ts**
  - [ ] `invoke()` - Test chat response generation
  - [ ] Test context usage in prompts
  - [ ] Test response parsing
  - [ ] Test conversation flow
  - [ ] Mock LLM responses

- [ ] **welcomeMessage/chain.ts**
  - [ ] `invoke()` - Test welcome message generation
  - [ ] Test personalization
  - [ ] Test onboarding flow
  - [ ] Mock LLM responses

- [ ] **dailyMessage/chain.ts**
  - [ ] `invoke()` - Test daily message generation
  - [ ] Test workout formatting
  - [ ] Test motivational content
  - [ ] Test rest day handling
  - [ ] Mock LLM responses

#### Planning Agents
- [ ] **fitnessPlan/chain.ts**
  - [ ] `invoke()` - Test plan generation
  - [ ] Test plan structure validation
  - [ ] Test goal alignment
  - [ ] Test equipment considerations
  - [ ] Mock complex plan responses

- [ ] **mesocycleBreakdown/chain.ts**
  - [ ] `invoke()` - Test mesocycle breakdown
  - [ ] Test workout distribution
  - [ ] Test progressive overload
  - [ ] Test exercise selection
  - [ ] Mock breakdown responses

### 🔵 Priority 4: Utilities (Target: 95% coverage)

- [ ] **circuitBreaker.ts**
  - [ ] Test circuit states (closed, open, half-open)
  - [ ] Test failure threshold
  - [ ] Test reset timeout
  - [ ] Test success recovery

- [ ] **token-manager.ts**
  - [ ] Test token counting
  - [ ] Test token limits
  - [ ] Test cost calculations

## Testing Guidelines

### 1. Mock Strategy
- **Database**: Use mock Kysely instance with chained method returns
- **External Services**: Mock Twilio, Stripe, OpenAI, Pinecone
- **Time**: Use `vi.useFakeTimers()` for time-dependent tests

### 2. Test Data Builders
Create builders for:
- [ ] UserBuilder
- [ ] FitnessProfileBuilder
- [ ] WorkoutBuilder
- [ ] ConversationBuilder
- [ ] MessageBuilder
- [ ] FitnessPlanBuilder

### 3. Common Test Scenarios
Each component should test:
- Happy path (successful operation)
- Validation errors
- Database failures
- External service failures
- Edge cases (null, undefined, empty)
- Concurrent operations

### 4. Coverage Targets
- **Overall**: 85%
- **Critical paths**: 95%
- **Error handling**: 90%

## Implementation Timeline

### Week 1: Foundation
- Set up test infrastructure
- Create mock factories
- Test all repositories

### Week 2-3: Core Services
- Test conversation flow
- Test fitness planning
- Test message handling

### Week 3-4: AI Integration
- Test all agents
- Test prompt engineering
- Test context building

### Week 4-5: Completion
- Test utilities
- Improve coverage
- Performance tests

## Test Organization

```
tests/
├── unit/
│   ├── server/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── agents/
│   └── shared/
│       └── utils/
├── fixtures/
│   ├── builders.ts
│   └── mock-data.ts
├── mocks/
│   ├── database.ts
│   ├── external-services.ts
│   └── llm.ts
└── setup/
    ├── custom-matchers.ts
    └── test-environment.ts
```

## Success Metrics

1. **Coverage**: Meet or exceed target coverage for each category
2. **Reliability**: All tests pass consistently
3. **Speed**: Unit test suite runs in < 30 seconds
4. **Maintainability**: Tests are clear and easy to update

## Next Steps

1. Create test directory structure
2. Set up mock factories
3. Begin with UserRepository tests
4. Follow the priority order
5. Track progress using this checklist

---

*Use this document to track progress. Check off items as they're completed and add notes about any challenges or decisions made during implementation.*