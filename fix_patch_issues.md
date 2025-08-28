# Fix Patch Issues - Simplifying Onboarding Flow

## Current Problems

1. **Over-complicated temp session storage** - The current system uses complex session management with `projectUser`, `projectProfile`, `addPendingPatch`, etc.
2. **Confusing patch tools** - The `profilePatchTool` and `userInfoPatchTool` have dual modes (apply/intercept) that add unnecessary complexity
3. **State management issues** - The onboarding flow isn't updating state correctly due to the complex session projection system
4. **Unnecessary abstraction** - We're trying to handle both authenticated and unauthenticated users in the same complex flow

## Proposed Simplified Approach

### Core Concept
- **Pass objects back and forth** between frontend and backend
- Frontend maintains current state of `Partial<User>` and `Partial<FitnessProfile>`
- Backend simply updates these objects and returns them
- No temp session storage, no complex projections, no dual-mode tools

### Flow Changes

#### Frontend Changes
1. Frontend sends current state with each message:
   ```typescript
   {
     message: string,
     currentUser?: Partial<User>,
     currentProfile?: Partial<FitnessProfile>
   }
   ```
2. Frontend receives updated state back:
   ```typescript
   {
     type: 'user_update' | 'profile_update' | 'token' | 'milestone',
     data: Partial<User> | Partial<FitnessProfile> | string
   }
   ```

#### Backend Changes
1. **OnboardingChatService** - Remove all temp session logic, just work with passed objects
2. **Simplified Tools** - One mode only, just update the objects directly
3. **No DB operations until final save** - Only save to DB when user explicitly completes onboarding

### Simplified Tool Structure

#### New `updateUserInfoTool`
- Takes current `Partial<User>` object
- Updates fields based on conversation
- Returns updated `Partial<User>` object
- No DB operations, no confidence thresholds, no dual modes

#### New `updateProfileTool` 
- Takes current `Partial<FitnessProfile>` object
- Updates fields based on conversation  
- Returns updated `Partial<FitnessProfile>` object
- No DB operations, no confidence thresholds, no dual modes

## Decisions Made

1. **Pass-Through Strategy**: Pass `Partial<User>` and `Partial<FitnessProfile>` back and forth until complete

2. **User Flow Simplification**: 
   - Keep User fields required in schema (don't make them optional)
   - Only insert user to DB when we have all required fields (`name`, `phone`, `email`)
   - No more intercepting logic - single user flow with tools

3. **Required Fields**:
   - **User**: `name`, `phone`, `email` (minimum)
   - **Profile**: `primaryGoal`, `experienceLevel`, `currentActivity`, `equipment.access` (ideal for plan generation)

4. **Confidence Scoring**: Keep it, raise threshold to 0.75

5. **Validation Strategy**: 
   - **NO individual message confirmation** ("Just to confirm, you workout 3 times a week?" = TERRIBLE UX)
   - Validate periodically after gathering multiple pieces of info
   - Present comprehensive summary for review
   - Ideally: Profile view with "Continue" button instead of chat confirmation

6. **User Experience Goal**:
   ```
   "Okay, I think I have everything I need, just double check the info--
   
   Name: Aaron Parry
   Phone: +13392223571  
   email: aprry2@gmail.com
   
   Goals: Get in better shape for ski season coming up
   Current Activity: Works out 5 times a week, some running some lifting  
   Experience: Advanced, has been lifting for years, less experience running
   
   Let me know if all of this is correct. If so we will get you started with your workout! 
   Otherwise let me know if there's anything else you'd like for me to know that will 
   help me put together your program, i.e. Current Mileage, PRs, Exercises you enjoy, 
   Injuries, Travel, etc."
   ```

7. **Ideal Frontend**: Profile view displaying all collected info with "Continue" button

## Benefits of This Approach

- **Simplicity**: No complex session management
- **Transparency**: Frontend always knows current state
- **Reliability**: No projection/intercept bugs
- **Testability**: Easy to test with simple input/output
- **Maintainability**: Much less code to maintain

## Implementation Plan

1. **Schema Changes**:
   - Keep User fields required in schema
   - Update tools to work with `Partial<User>` objects (no intercept mode)
   - Only insert when all required fields are present

2. **Tool Simplification**:
   - Remove dual-mode logic from both tools
   - Raise confidence threshold to 0.75
   - Return updated full objects instead of deltas

3. **OnboardingChatService Refactor**:
   - Remove all temp session logic (`projectUser`, `projectProfile`, etc.)
   - Work with `Partial<User>` and `Partial<FitnessProfile>` objects passed from frontend
   - Only save to DB when user has all required fields (`name`, `phone`, `email`)

4. **Frontend Updates**:
   - Create profile review view with "Continue" button
   - Maintain `Partial<User>` and `Partial<FitnessProfile>` state locally
   - Pass current partial objects with each message
   - Only trigger DB save when user confirms completion

5. **UX Improvements**:
   - Implement periodic comprehensive summaries
   - Remove individual field confirmations
   - Focus on natural conversation flow

6. **Cleanup**:
   - Remove unused temp session utilities
   - Simplify repository methods
   - Update agent prompts for better UX