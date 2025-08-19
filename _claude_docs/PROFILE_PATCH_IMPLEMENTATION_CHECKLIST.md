# Profile Patch Tool Implementation Checklist

## Architecture Overview

### Two-Agent System
We're implementing a two-agent architecture that separates concerns:
1. **UserProfileAgent** - Specializes in profile extraction and updates (has patchProfile tool)
2. **ChatAgent** - Specializes in generating responses (uses updated profile)

This eliminates the need for re-invocation after tool calls, as each agent runs once in sequence.

### System Flow Diagram
```
┌──────────────────────────────────────────────────────────────┐
│                         SMS Inbound                          │
│                    (User: "I train 5x/week")                 │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                   API Route Layer                            │
│              /api/sms/route.ts (POST)                        │
│         • Parse SMS • Find User • Call Service               │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│                 ChatService.ts                               │
│         • Orchestrate Both Agents • Save Messages            │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│              UserProfileAgent.ts (NEW)                       │
│         • Extract profile info • Update if needed            │
│         • Has patchProfile tool • Returns profile            │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                 ChatAgent.ts (UPDATED)                       │
│      • Receives updated profile • Generates response         │
│      • No tools needed • Acknowledges updates naturally      │
└────────────────────────┬─────────────────────────────────────┘
                                         ↓
                              ┌────────────────────────────────┐
                              │   ProfilePatchService (NEW)    │
                              │  • Deep merge logic            │
                              │  • Call repositories           │
                              └──────────┬─────────────────────┘
                                         ↓
                    ┌────────────────────┴────────────────────┐
                    ↓                                          ↓
        ┌──────────────────────┐                 ┌──────────────────────┐
        │   UserRepository      │                 │ ProfileUpdateRepo(NEW)│
        │ • Update profile JSONB│                 │ • Create audit record │
        └──────────────────────┘                 └──────────────────────┘
```

### Component Dependencies
```
ChatService
  ├── UserProfileAgent (NEW)
  │   ├── ChatOpenAI/ChatGoogleGenerativeAI (model)
  │   ├── profilePatchTool
  │   └── ProfilePatchService
  │       ├── UserRepository
  │       └── ProfileUpdateRepository
  ├── ChatAgent (UPDATED)
  │   ├── ChatOpenAI/ChatGoogleGenerativeAI (model)
  │   └── ConversationContextService
  └── MessageRepository
```

## Implementation Checklist

### Phase 1: Data Layer (Repositories)
- [ ] **Create ProfileUpdateRepository** (`src/server/repositories/profileUpdateRepository.ts`)
  - [ ] Extend BaseRepository
  - [ ] Implement `create(update: NewProfileUpdate)` method
  - [ ] Implement `getUserUpdates(userId: string, limit?: number)` method
  - [ ] Implement `getRecentUpdates(limit?: number)` method for monitoring
  - [ ] Add proper TypeScript types from generated DB types

- [ ] **Update UserRepository** (`src/server/repositories/userRepository.ts`)
  - [ ] Add `patchProfile(userId: string, patch: object)` method
  - [ ] Use PostgreSQL JSONB merge: `profile = profile || $1::jsonb`
  - [ ] Return updated user with merged profile
  - [ ] Add transaction support for atomic updates

### Phase 2: Service Layer
- [ ] **Create ProfilePatchService** (`src/server/services/profilePatchService.ts`)
  - [ ] Implement deep merge logic for nested profile updates
  - [ ] Add validation using Zod schemas
  - [ ] Create atomic transaction for both profile update and audit log
  - [ ] Handle constraint array merging (append vs replace logic)
  - [ ] Add error handling and rollback logic
  - [ ] Implement confidence threshold logic (0.5 minimum)

### Phase 3: Tool Creation
- [ ] **Create Profile Patch Tool** (`src/server/agents/tools/profilePatchTool.ts`)
  - [ ] Import `tool` from `@langchain/core/tools`
  - [ ] Define Zod schema for tool input
  - [ ] Implement tool function with confidence checking
  - [ ] Add proper error handling and logging
  - [ ] Return structured success/failure response
  - [ ] Pass userId through config parameter

### Phase 4: Agent Implementation
- [ ] **Create UserProfileAgent**
  - [ ] Create `src/server/agents/profile/prompts.ts`
    - [ ] Export `buildUserProfileSystemPrompt` function
    - [ ] Include extraction guidelines and confidence levels
  - [ ] Create `src/server/agents/profile/chain.ts`
    - [ ] Import necessary LangChain components
    - [ ] Initialize model with tool binding (GPT-4 or Gemini)
    - [ ] Import prompts from prompts.ts
    - [ ] Bind profilePatchTool to model
    - [ ] Implement agent function that returns profile + update status
    - [ ] Handle tool_calls internally
    - [ ] Export userProfileAgent function

- [ ] **Update ChatAgent**
  - [ ] Update `src/server/agents/chat/prompts.ts`
    - [ ] Export `buildChatSystemPrompt` function
    - [ ] Accept profile update context parameters
  - [ ] Refactor `src/server/agents/chat/chain.ts`
    - [ ] Import prompts from prompts.ts
    - [ ] Modify to accept profile as parameter (not fetch it)
    - [ ] Accept wasProfileUpdated flag
    - [ ] Remove any profile fetching logic
    - [ ] Focus purely on response generation
    - [ ] Export chatAgent function

### Phase 5: Service Integration  
- [ ] **Update ChatService** (`src/server/services/chatService.ts`)
  - [ ] Import both UserProfileAgent and ChatAgent
  - [ ] Call UserProfileAgent first with message and current profile
  - [ ] Pass updated profile to ChatAgent
  - [ ] Handle both agent responses
  - [ ] Add logging for profile updates
  - [ ] Update error handling for both agents

- [ ] **Update ConversationService** (`src/server/services/conversationService.ts`)
  - [ ] Ensure tool messages are properly stored if needed
  - [ ] Consider storing tool_calls metadata

### Phase 6: API Layer Updates
- [ ] **Review SMS Route** (`src/app/api/sms/route.ts`)
  - [ ] No changes needed - works through ChatService
  - [ ] Verify error handling still works with new flow

### Phase 7: Type Definitions
- [ ] **Update User Model Types** (`src/server/models/user/index.ts`)
  - [ ] Export ProfileUpdate types
  - [ ] Ensure FitnessProfile interface is complete

- [ ] **Export Zod Schemas** (`src/server/models/user/schemas.ts`)
  - [ ] Export schemas for use in tool and service
  - [ ] Add ProfileUpdateRecord schema for DB type

### Phase 8: Testing Infrastructure
- [ ] **Unit Tests - Repository Layer**
  - [ ] Create `profileUpdateRepository.test.ts`
    - [ ] Test create method
    - [ ] Test getUserUpdates method
    - [ ] Test with various JSONB structures
  
  - [ ] Update `userRepository.test.ts`
    - [ ] Test patchProfile method
    - [ ] Test deep merge scenarios
    - [ ] Test transaction rollback

- [ ] **Unit Tests - Service Layer**
  - [ ] Create `profilePatchService.test.ts`
    - [ ] Test validation logic
    - [ ] Test confidence thresholds
    - [ ] Test constraint merging
    - [ ] Test transaction atomicity
    - [ ] Test error scenarios

- [ ] **Unit Tests - Tool Layer**
  - [ ] Create `profilePatchTool.test.ts`
    - [ ] Test tool invocation
    - [ ] Test confidence filtering
    - [ ] Test response formatting
    - [ ] Mock ProfilePatchService

- [ ] **Integration Tests - Agent Layer**
  - [ ] Create `enhancedChatChain.test.ts`
    - [ ] Test with profile update scenarios
    - [ ] Test tool_calls detection
    - [ ] Test with no updates needed
    - [ ] Test with multiple tool calls
    - [ ] Test error handling

- [ ] **E2E Test Scenarios**
  - [ ] Create `scripts/test/chat/profile-update.ts`
    - [ ] "I now train 5 days a week"
    - [ ] "Just joined Planet Fitness"
    - [ ] "My knee is bothering me"
    - [ ] "I want to focus on strength now"
    - [ ] Ambiguous: "Maybe I'll try morning workouts"

### Phase 9: Monitoring & Observability
- [ ] **Add Logging**
  - [ ] Log all tool invocations with confidence scores
  - [ ] Log successful profile patches
  - [ ] Log validation failures
  - [ ] Log confidence rejections

- [ ] **Create Monitoring Script** (`scripts/monitor/profile-updates.ts`)
  - [ ] Query recent profile updates
  - [ ] Show confidence distribution
  - [ ] Show most updated fields
  - [ ] Identify potential issues

### Phase 10: Documentation
- [ ] **Update CLAUDE.md**
  - [ ] Add profile patching tool to agent list
  - [ ] Document new commands for testing

- [ ] **Create Tool Usage Guide** (`_claude_docs/TOOL_USAGE_GUIDE.md`)
  - [ ] Examples of good vs bad updates
  - [ ] Confidence scoring guidelines
  - [ ] Troubleshooting guide

- [ ] **Update API Documentation**
  - [ ] Document profile_updates table structure
  - [ ] Document new service methods

### Phase 11: Rollout Strategy
- [ ] **Shadow Mode Implementation**
  - [ ] Add feature flag: `PROFILE_PATCH_ENABLED=shadow`
  - [ ] Log what would be updated without applying
  - [ ] Collect metrics for 1 week

- [ ] **Limited Rollout**
  - [ ] Create user allowlist mechanism
  - [ ] Enable for internal testing accounts
  - [ ] Monitor for 1 week

- [ ] **Production Rollout**
  - [ ] Remove feature flags
  - [ ] Enable for all users
  - [ ] Monitor closely for first 48 hours

## File Creation/Modification Summary

### New Files to Create (10 files)
1. `src/server/repositories/profileUpdateRepository.ts`
2. `src/server/services/profilePatchService.ts`
3. `src/server/agents/tools/profilePatchTool.ts`
4. `src/server/agents/profile/chain.ts` (NEW)
5. `src/server/agents/profile/prompts.ts` (NEW)
6. `scripts/test/chat/profile-update.ts`
7. `scripts/monitor/profile-updates.ts`
8. `_claude_docs/TOOL_USAGE_GUIDE.md`
9. Tests: `*.test.ts` files (6-7 files)
10. Tests for new agents

### Files to Modify (7 files)
1. `src/server/repositories/userRepository.ts` - Add patchProfile method
2. `src/server/agents/chat/chain.ts` - Refactor to chatAgent.ts
3. `src/server/services/chatService.ts` - Orchestrate both agents
4. `src/server/models/user/index.ts` - Export new types
5. `src/server/models/user/schemas.ts` - Already created, may need exports
6. `CLAUDE.md` - Document new capability
7. `package.json` - Potentially add test scripts

## Dependencies & Prerequisites

### Required npm packages (already installed)
- ✅ `@langchain/core`: ^0.3.45
- ✅ `@langchain/google-genai`: ^0.2.4
- ✅ `langchain`: ^0.3.23
- ✅ `zod`: ^3.22.4
- ✅ `kysely`: ^0.28.0
- ✅ `pg`: ^8.14.1

### Database Requirements
- ✅ `profile_updates` table exists (from migration)
- ✅ `users.profile` is JSONB column
- ✅ PostgreSQL with JSONB support

## Risk Assessment & Mitigation

### High Risk Areas
1. **Data Loss**: Profile overwrites
   - Mitigation: Audit trail in profile_updates table
   - Mitigation: Use JSONB merge, not replace

2. **Incorrect Updates**: Low confidence changes
   - Mitigation: 0.5 confidence threshold
   - Mitigation: Shadow mode first

3. **Performance**: Large profile objects
   - Mitigation: Efficient JSONB operations
   - Mitigation: Limit update frequency

### Medium Risk Areas
1. **User Trust**: Unexpected changes
   - Mitigation: Clear audit trail
   - Mitigation: Consider confirmation flow later

2. **Constraint Conflicts**: Array merging logic
   - Mitigation: Clear append vs replace rules
   - Mitigation: Comprehensive testing

## Success Criteria

### Technical Success
- [ ] All tests pass (unit, integration, E2E)
- [ ] No performance degradation in chat response time
- [ ] Audit trail captures all updates
- [ ] Confidence threshold prevents bad updates

### Business Success
- [ ] Profile completion rate increases
- [ ] User engagement improves
- [ ] Support tickets don't increase
- [ ] Users report satisfaction with auto-updates

## Estimated Timeline

### Week 1: Foundation (Days 1-3)
- Data Layer (Repositories)
- Service Layer
- Tool Creation

### Week 1: Integration (Days 4-5)
- Agent Enhancement
- Service Integration
- Basic Testing

### Week 2: Quality & Testing (Days 6-8)
- Comprehensive Testing
- Monitoring Setup
- Documentation

### Week 2: Rollout (Days 9-10)
- Shadow Mode
- Analysis & Adjustments

### Week 3: Production
- Limited Rollout
- Full Production Release

## Notes & Considerations

1. **Gemini 2.0 Flash** supports tool calling natively
2. **Transaction safety** is critical for atomic updates
3. **Confidence scoring** needs refinement based on real data
4. **Consider user notification** of profile updates in future
5. **Monitor token usage** as tool calling may increase costs
6. **Profile versioning** might be needed for future A/B testing