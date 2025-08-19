# Profile Patch Implementation Progress Tracker

## Overview
Implementation of a two-agent system for automatic profile updates from chat conversations.

**Start Date**: 2025-01-19  
**Target Completion**: TBD  
**Status**: 🟡 In Progress

---

## Phase 1: Foundation Layer ✅
*Target: Data layer and core services*

### Repositories
- [x] Create `src/server/repositories/profileUpdateRepository.ts`
  - [x] Extend BaseRepository
  - [x] Implement `create()` method
  - [x] Implement `getUserUpdates()` method
  - [x] Add TypeScript types from DB
  - [ ] Write unit tests

- [x] Update `src/server/repositories/userRepository.ts`
  - [x] Add `patchProfile()` method
  - [x] Implement JSONB merge logic
  - [x] Add transaction support
  - [ ] Write unit tests

### Services
- [x] Create `src/server/services/profilePatchService.ts`
  - [x] Implement deep merge logic
  - [x] Add Zod validation
  - [x] Create atomic transaction
  - [x] Handle constraint merging
  - [x] Add error handling
  - [x] Implement confidence threshold
  - [ ] Write unit tests

---

## Phase 2: Tool Layer ✅
*Target: Profile patching tool*

- [x] Create `src/server/agents/tools/profilePatchTool.ts`
  - [x] Import tool from @langchain/core/tools
  - [x] Define Zod schema for input
  - [x] Implement tool function
  - [x] Add confidence checking (0.5 threshold)
  - [x] Add error handling and logging
  - [x] Return structured response
  - [ ] Write unit tests

---

## Phase 3: UserProfileAgent ✅
*Target: Profile extraction and update agent*

### Prompts
- [x] Create `src/server/agents/profile/prompts.ts`
  - [x] Export `buildUserProfileSystemPrompt()` function
  - [x] Include extraction guidelines
  - [x] Define confidence levels (0-1 scale)
  - [x] Add focus areas list
  - [x] Add "Do NOT" guidelines

### Chain
- [x] Create `src/server/agents/profile/chain.ts`
  - [x] Import LangChain components
  - [x] Import profilePatchTool
  - [x] Initialize model (GPT-4 or Gemini)
  - [x] Set temperature to 0.2
  - [x] Bind tool to model
  - [x] Implement `userProfileAgent` function
  - [x] Handle tool_calls
  - [x] Return profile + update status
  - [ ] Write integration tests

---

## Phase 4: ChatAgent Updates ✅
*Target: Refactor existing chat agent*

### Prompts
- [x] Update `src/server/agents/chat/prompts.ts`
  - [x] Export `buildChatSystemPrompt()` function
  - [x] Accept profile parameter
  - [x] Accept wasProfileUpdated flag
  - [x] Add update acknowledgment context

### Chain
- [x] Refactor `src/server/agents/chat/chain.ts`
  - [x] Rename to `chatAgent` export
  - [x] Import prompts from prompts.ts
  - [x] Accept profile as parameter
  - [x] Remove profile fetching logic
  - [x] Accept wasProfileUpdated flag
  - [x] Focus on response generation
  - [ ] Write integration tests

---

## Phase 5: Service Orchestration ⏳
*Target: Wire everything together*

- [ ] Update `src/server/services/chatService.ts`
  - [ ] Import userProfileAgent
  - [ ] Import chatAgent
  - [ ] Call userProfileAgent first
  - [ ] Pass results to chatAgent
  - [ ] Handle both agent responses
  - [ ] Add profile update logging
  - [ ] Update error handling
  - [ ] Write integration tests

---

## Phase 6: Testing Suite ⏳
*Target: Comprehensive test coverage*

### Unit Tests
- [ ] `profileUpdateRepository.test.ts`
- [ ] `userRepository.test.ts` (update)
- [ ] `profilePatchService.test.ts`
- [ ] `profilePatchTool.test.ts`

### Integration Tests
- [ ] `userProfileAgent.test.ts`
- [ ] `chatAgent.test.ts`
- [ ] `chatService.test.ts`

### E2E Test Scenarios
- [ ] Create `scripts/test/chat/profile-update.ts`
  - [ ] "I now train 5 days a week"
  - [ ] "Just joined Planet Fitness"
  - [ ] "My knee is bothering me"
  - [ ] "I want to focus on strength"
  - [ ] "Maybe I'll try morning workouts" (low confidence)

---

## Phase 7: Documentation ⏳
*Target: Update all relevant docs*

- [ ] Update `CLAUDE.md`
  - [ ] Add UserProfileAgent to agent list
  - [ ] Document new testing commands
  - [ ] Add profile patching explanation

- [ ] Create `_claude_docs/TOOL_USAGE_GUIDE.md`
  - [ ] Examples of good vs bad updates
  - [ ] Confidence scoring guidelines
  - [ ] Troubleshooting guide

---

## Phase 8: Monitoring & Rollout ⏳
*Target: Production readiness*

### Monitoring
- [ ] Create `scripts/monitor/profile-updates.ts`
  - [ ] Query recent updates
  - [ ] Show confidence distribution
  - [ ] Show most updated fields
  - [ ] Identify issues

### Shadow Mode
- [ ] Add feature flag `PROFILE_PATCH_ENABLED=shadow`
- [ ] Log without applying updates
- [ ] Collect metrics for 1 week
- [ ] Analyze results

### Limited Rollout
- [ ] Create user allowlist
- [ ] Enable for test accounts
- [ ] Monitor for 1 week
- [ ] Gather feedback

### Production
- [ ] Remove feature flags
- [ ] Enable for all users
- [ ] Monitor for 48 hours
- [ ] Document lessons learned

---

## Completion Checklist

### Code Complete
- [ ] All repositories implemented
- [ ] All services implemented
- [ ] Both agents working
- [ ] ChatService orchestrating correctly

### Quality Gates
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E scenarios validated
- [ ] Code review completed

### Documentation
- [ ] Technical docs updated
- [ ] User guides created
- [ ] Monitoring guides ready

### Production Ready
- [ ] Shadow mode tested
- [ ] Limited rollout successful
- [ ] Monitoring in place
- [ ] Rollback plan documented

---

## Notes & Blockers

### Current Blockers
- None yet

### Decisions Made
1. Two-agent architecture (UserProfileAgent + ChatAgent)
2. Confidence threshold: 0.5
3. Separate prompts.ts files for each agent
4. Profile extraction temp: 0.2, Chat temp: 0.7

### Open Questions
1. Which model for each agent? (GPT-4 vs Gemini)
2. Should we cache UserProfileAgent results?
3. Notification strategy for users?

---

## Progress Log

### 2025-01-19
- ✅ Created architecture documentation
- ✅ Created implementation checklist
- ✅ Designed two-agent system
- ✅ Created Zod schemas
- ✅ Phase 1: Foundation Layer (repositories and services)
- ✅ Phase 2: Tool Layer (profile patch tool)
- ✅ Phase 3: UserProfileAgent (extraction agent)
- ✅ Phase 4: ChatAgent Updates (refactored for two-agent architecture)

### Next Steps
1. ~~Phase 4: Update existing ChatAgent~~ ✅
2. Phase 5: Update ChatService orchestration  
3. Phase 6: Create comprehensive test suite

---

## Quick Status

```
Phase 1: Foundation Layer    [✅✅✅✅✅] 100%
Phase 2: Tool Layer          [✅✅✅✅✅] 100%
Phase 3: UserProfileAgent    [✅✅✅✅✅] 100%
Phase 4: ChatAgent Updates   [✅✅✅✅✅] 100%
Phase 5: Service Orchestra   [⬜⬜⬜⬜⬜] 0%
Phase 6: Testing Suite       [⬜⬜⬜⬜⬜] 0%
Phase 7: Documentation       [⬜⬜⬜⬜⬜] 0%
Phase 8: Monitoring & Roll   [⬜⬜⬜⬜⬜] 0%

Overall Progress:            [✅✅✅⬜⬜] 50%
```