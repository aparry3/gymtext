# Onboarding Flow Simplification - Implementation Plan

## Overview
Transform the complex temp session-based onboarding flow into a simple pass-through system using `Partial<User>` and `Partial<FitnessProfile>` objects.

## Current State Analysis

### What We're Removing
- `src/server/utils/session/onboardingSession.ts` - All temp session utilities
- Dual-mode logic in both patch tools (apply/intercept modes)
- Complex session projection (`projectUser`, `projectProfile`, `addPendingPatch`)
- Temp session cookies (`gt_temp_session`)
- Database operations during chat (except final save)

### What We're Keeping
- Core tool functionality (confidence scoring, field extraction)
- SSE streaming architecture
- Agent/service layer structure
- Final database persistence

## Implementation Phases

### Phase 1: Tool Layer Refactoring
**Files to modify:**
- `src/server/agents/tools/profilePatchTool.ts`
- `src/server/agents/tools/userInfoPatchTool.ts`

**Changes:**
1. **Remove dual-mode logic**
   - Remove `mode` parameter from tool configs
   - Remove `intercept` vs `apply` branching
   - Remove `tempSessionId` handling

2. **Update tool schemas**
   ```typescript
   // New input schema
   {
     currentProfile: Partial<FitnessProfile>,
     updates: Partial<FitnessProfile>,
     reason: string,
     confidence: number
   }
   ```

3. **Raise confidence threshold**
   - Change from 0.5 to 0.6
   - Update validation logic

4. **Return updated objects**
   - Instead of DB operations, merge updates into current object
   - Return full updated `Partial<FitnessProfile>` or `Partial<User>`

5. **Remove dependencies**
   - Remove ProfilePatchService usage
   - Remove UserRepository operations
   - Remove session utility imports

**Expected Result:** Tools become pure functions that take partial objects and return updated partial objects.

### Phase 2: Service Layer Simplification
**Files to modify:**
- `src/server/services/onboardingChatService.ts`

**Changes:**
1. **Update service interface**
   ```typescript
   interface OnboardingMessageInput {
     message: string;
     currentUser?: Partial<User>;
     currentProfile?: Partial<FitnessProfile>;
     saveWhenReady?: boolean; // Trigger DB save
   }
   ```

2. **Remove temp session logic**
   - Remove all imports from `onboardingSession` utils
   - Remove `tempSessionId` parameter handling
   - Remove session projection logic
   - Remove `projectUser` and `projectProfile` calls

3. **Update tool invocation**
   - Pass current objects to tools instead of using config modes
   - Receive updated objects back from tools
   - No longer call repository methods during chat

4. **Add completion logic**
   - Check if user has required fields (`name`, `phone`, `email`)
   - When `saveWhenReady` is true and requirements met, save to DB
   - Return appropriate milestones based on completion state

5. **Update event streaming**
   ```typescript
   // New event types
   | { type: 'user_update'; data: Partial<User> }
   | { type: 'profile_update'; data: Partial<FitnessProfile> }
   | { type: 'ready_to_save'; data: { canSave: boolean; missing: string[] } }
   ```

**Expected Result:** Service becomes stateless processor that works with passed objects.

### Phase 3: API Route Updates
**Files to modify:**
- `src/app/api/chat/onboarding/route.ts`

**Changes:**
1. **Update request interface**
   ```typescript
   interface RequestBody {
     message: string;
     currentUser?: Partial<User>;
     currentProfile?: Partial<FitnessProfile>;
     saveWhenReady?: boolean;
   }
   ```

2. **Remove temp session cookie logic**
   - Remove cookie generation/validation
   - Remove `gt_temp_session` cookie handling
   - Remove `sessionId` parameter

3. **Update service call**
   - Pass received partial objects to service
   - Remove `tempSessionId` parameter

4. **Update response handling**
   - Stream new event types (`user_update`, `profile_update`)
   - Remove session-related headers

**Expected Result:** Clean API that accepts and returns partial objects via SSE.

### Phase 4: Frontend Integration
**Files to modify:**
- Frontend onboarding components (location TBD)
- State management hooks/contexts

**Changes:**
1. **Local state management**
   ```typescript
   const [currentUser, setCurrentUser] = useState<Partial<User>>({});
   const [currentProfile, setCurrentProfile] = useState<Partial<FitnessProfile>>({});
   ```

2. **Update message sending**
   - Include current objects in each request
   - Remove temp session ID handling

3. **Handle SSE events**
   - Listen for `user_update` and `profile_update` events
   - Update local state with received objects
   - Handle `ready_to_save` events for UI feedback

4. **Profile review interface**
   - Display collected user info and profile data
   - "Continue" button to trigger final save
   - Edit capabilities for corrections

5. **Persistence handling**
   - Only send `saveWhenReady: true` when user confirms
   - Handle success/error responses
   - Navigate to next step after successful save

**Expected Result:** Frontend maintains state locally and coordinates final save.

### Phase 5: Cleanup and Optimization
**Files to remove/modify:**

1. **Remove temp session utilities**
   - Delete `src/server/utils/session/onboardingSession.ts`
   - Update imports across codebase
   - Remove from tests

2. **Update type definitions**
   - Simplify event types
   - Remove session-related interfaces
   - Update service interfaces

3. **Update agent prompts**
   - Remove references to temp sessions
   - Focus on natural conversation flow
   - Emphasize comprehensive summaries over confirmations

4. **Database cleanup**
   - Consider removing temp session tables if they exist
   - Update migration scripts if needed

## Risk Mitigation

### Rollback Plan
1. **Feature flag approach**: Implement behind feature flag for gradual rollout
2. **Keep old code**: Don't delete temp session code until new flow is proven
3. **Database preservation**: Ensure no data loss during transition

### Testing Strategy
1. **Unit tests**: Update tool and service tests for new interfaces
2. **Integration tests**: Test full onboarding flow end-to-end  
3. **UX testing**: Ensure improved user experience vs current flow

### Migration Considerations
1. **Existing sessions**: Handle users mid-onboarding gracefully
2. **Browser refresh**: Frontend state recovery strategy
3. **Backward compatibility**: Ensure API changes don't break other clients

## Success Metrics

### Code Quality
- [ ] Remove ~200+ lines of temp session code
- [ ] Reduce cognitive complexity in tools by 50%+
- [ ] Eliminate dual-mode branching logic

### User Experience  
- [ ] No individual field confirmations
- [ ] Comprehensive profile review before save
- [ ] Smoother conversation flow

### Reliability
- [ ] Eliminate session projection bugs
- [ ] Reduce state management complexity
- [ ] Improve error handling

## Implementation Timeline

**Phase 1-2**: 1-2 days (Backend refactoring)
**Phase 3**: 0.5 days (API updates)  
**Phase 4**: 2-3 days (Frontend integration)
**Phase 5**: 0.5-1 day (Cleanup)

**Total Estimated Time**: 4-6 days

## Dependencies

- Frontend framework/state management patterns
- Existing test coverage for onboarding flow
- Current user base using onboarding (migration impact)
- Database schema constraints