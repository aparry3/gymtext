# Chat Service to Agent Migration Checklist

## Phase 1: Preparation
- [x] Review current chatService.ts implementation
- [x] Review chat/chain.ts agent implementation
- [x] Verify contextualChatChain meets requirements
- [x] Identify any missing functionality in agent - See PHASE_1_ANALYSIS.md
- [x] Create backup of current chatService.ts - Created as chatService.ts.backup

## Phase 2: Agent Verification
- [x] Test contextualChatChain independently - Created test-agent.ts
- [x] Verify agent handles user context correctly - Context properly fetched and used
- [x] Check prompt alignment between service and agent - See PHASE_2_PROMPT_COMPARISON.md
- [x] Ensure agent returns expected response format - Returns {response: string, context: object}
- [x] Confirm no duplicate message persistence - Verified with test-no-duplication.ts

## Phase 3: Service Refactoring
- [ ] Remove ChatGoogleGenerativeAI import and instantiation
- [ ] Remove direct LLM variable (lines 11-15)
- [ ] Add import for contextualChatChain from agents/chat/chain
- [ ] Remove ConversationContextService instantiation (line 18)
- [ ] Remove PromptBuilder instantiation (line 19)
- [ ] Remove unused imports after refactoring

## Phase 4: Method Refactoring
- [ ] Refactor handleIncomingMessage method:
  - [ ] Remove context fetching (lines 32-36)
  - [ ] Remove prompt building logic (lines 39-49)
  - [ ] Remove direct LLM invocation (lines 60, 64)
  - [ ] Add contextualChatChain.invoke() call
  - [ ] Extract response from agent result
  - [ ] Keep SMS length constraint logic (lines 72-75)
  - [ ] Maintain error handling structure

## Phase 5: Configuration
- [ ] Keep MAX_OUTPUT_TOKENS config (verify if needed)
- [ ] Keep SMS_MAX_LENGTH config
- [ ] Remove unused configuration variables
- [ ] Verify environment variables still needed

## Phase 6: Testing
- [ ] Unit Tests:
  - [ ] Create mock for contextualChatChain
  - [ ] Test successful message handling
  - [ ] Test SMS length truncation
  - [ ] Test error scenarios
  - [ ] Test fallback responses
- [ ] Integration Tests:
  - [ ] Test with actual agent chain
  - [ ] Verify context is properly used
  - [ ] Test conversation flow
  - [ ] Ensure no message duplication

## Phase 7: Validation
- [ ] Run pnpm build - ensure no build errors
- [ ] Run pnpm lint - ensure no linting issues
- [ ] Run pnpm test - ensure all tests pass
- [ ] Test SMS flow end-to-end with pnpm sms:test
- [ ] Verify response quality matches previous implementation

## Phase 8: Future Enhancements (Post-Migration)
- [ ] Move SMS length handling to agent layer
- [ ] Implement workout update capabilities
- [ ] Implement preference update capabilities
- [ ] Implement memory saving functionality
- [ ] Implement progress tracking
- [ ] Implement notification handling
- [ ] Add structured output parsing for agent actions

## Phase 9: Documentation
- [ ] Update code comments in chatService.ts
- [ ] Document agent usage in service
- [ ] Update CLAUDE.md if architecture changes
- [ ] Create migration notes for team

## Phase 10: Deployment
- [ ] Code review
- [ ] Test in development environment
- [ ] Monitor for any issues
- [ ] Deploy to production
- [ ] Post-deployment verification

## Notes
- Each checkbox should be checked off as completed
- If any step reveals issues, document them below
- Keep track of any unexpected behaviors or edge cases

## Issues Encountered
<!-- Document any issues or blockers here -->

### Phase 1 Issues
1. **Type Error in WorkoutInstanceModel** (Fixed)
   - `microcycleId` and `mesocycleId` were typed as non-nullable but DB schema allows null
   - Fixed in `/src/server/models/workout/index.ts` lines 30-31
   - Changed types to `string | null | undefined` to match DB schema

### Phase 2 Findings
1. **Agent Testing Successful**
   - contextualChatChain works correctly with real user data
   - Response times: 1.7-2.2 seconds
   - Context properly includes conversation history and user profile

2. **Prompt Differences Identified**
   - Service uses `fitnessCoachPrompt` (1600 char limit, personalized)
   - Agent uses `contextPrompt` (200 word limit, data-focused)
   - Agent responses include emojis (not in original service)
   - See PHASE_2_PROMPT_COMPARISON.md for details

3. **No Message Duplication Confirmed**
   - contextualChatChain does NOT persist messages to database
   - Clean separation of concerns maintained

## Rollback Plan
- [x] Keep original chatService.ts as backup - `chatService.ts.backup`
- [ ] Document rollback procedure
- [ ] Test rollback in development if needed

### Rollback Command
```bash
cp src/server/services/chatService.ts.backup src/server/services/chatService.ts
```