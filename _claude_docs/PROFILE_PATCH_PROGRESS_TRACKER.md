# Profile Patch Implementation Progress Tracker

## Overview
Implementation of a two-agent system for automatic profile updates from chat conversations.

**Start Date**: 2025-01-19  
**Target Completion**: TBD  
**Status**: 🟡 In Progress

---

## Phase 1: Foundation Layer ⏳
*Target: Data layer and core services*

### Repositories
- [ ] Create `src/server/repositories/profileUpdateRepository.ts`
  - [ ] Extend BaseRepository
  - [ ] Implement `create()` method
  - [ ] Implement `getUserUpdates()` method
  - [ ] Add TypeScript types from DB
  - [ ] Write unit tests

- [ ] Update `src/server/repositories/userRepository.ts`
  - [ ] Add `patchProfile()` method
  - [ ] Implement JSONB merge logic
  - [ ] Add transaction support
  - [ ] Write unit tests

### Services
- [ ] Create `src/server/services/profilePatchService.ts`
  - [ ] Implement deep merge logic
  - [ ] Add Zod validation
  - [ ] Create atomic transaction
  - [ ] Handle constraint merging
  - [ ] Add error handling
  - [ ] Implement confidence threshold
  - [ ] Write unit tests

---

## Phase 2: Tool Layer ⏳
*Target: Profile patching tool*

- [ ] Create `src/server/agents/tools/profilePatchTool.ts`
  - [ ] Import tool from @langchain/core/tools
  - [ ] Define Zod schema for input
  - [ ] Implement tool function
  - [ ] Add confidence checking (0.5 threshold)
  - [ ] Add error handling and logging
  - [ ] Return structured response
  - [ ] Write unit tests

---

## Phase 3: UserProfileAgent ⏳
*Target: Profile extraction and update agent*

### Prompts
- [ ] Create `src/server/agents/profile/prompts.ts`
  - [ ] Export `buildUserProfileSystemPrompt()` function
  - [ ] Include extraction guidelines
  - [ ] Define confidence levels (0-1 scale)
  - [ ] Add focus areas list
  - [ ] Add "Do NOT" guidelines

### Chain
- [ ] Create `src/server/agents/profile/chain.ts`
  - [ ] Import LangChain components
  - [ ] Import profilePatchTool
  - [ ] Initialize model (GPT-4 or Gemini)
  - [ ] Set temperature to 0.2
  - [ ] Bind tool to model
  - [ ] Implement `userProfileAgent` function
  - [ ] Handle tool_calls
  - [ ] Return profile + update status
  - [ ] Write integration tests

---

## Phase 4: ChatAgent Updates ⏳
*Target: Refactor existing chat agent*

### Prompts
- [ ] Update `src/server/agents/chat/prompts.ts`
  - [ ] Export `buildChatSystemPrompt()` function
  - [ ] Accept profile parameter
  - [ ] Accept wasProfileUpdated flag
  - [ ] Add update acknowledgment context

### Chain
- [ ] Refactor `src/server/agents/chat/chain.ts`
  - [ ] Rename to `chatAgent` export
  - [ ] Import prompts from prompts.ts
  - [ ] Accept profile as parameter
  - [ ] Remove profile fetching logic
  - [ ] Accept wasProfileUpdated flag
  - [ ] Focus on response generation
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
- 🟡 Starting implementation...

### Next Steps
1. Begin Phase 1: Create repositories
2. Implement ProfilePatchService
3. Create profile patch tool

---

## Quick Status

```
Phase 1: Foundation Layer    [⬜⬜⬜⬜⬜] 0%
Phase 2: Tool Layer          [⬜⬜⬜⬜⬜] 0%
Phase 3: UserProfileAgent    [⬜⬜⬜⬜⬜] 0%
Phase 4: ChatAgent Updates   [⬜⬜⬜⬜⬜] 0%
Phase 5: Service Orchestra   [⬜⬜⬜⬜⬜] 0%
Phase 6: Testing Suite       [⬜⬜⬜⬜⬜] 0%
Phase 7: Documentation       [⬜⬜⬜⬜⬜] 0%
Phase 8: Monitoring & Roll   [⬜⬜⬜⬜⬜] 0%

Overall Progress:            [⬜⬜⬜⬜⬜] 0%
```