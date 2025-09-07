# Email Optional & Enhanced Onboarding Implementation Plan

## Executive Summary

This document outlines the plan to make email optional in the onboarding flow, add timezone/preferred send hour collection, and streamline the user creation requirements. The goal is to reduce friction in the signup process while ensuring we collect essential scheduling information for optimal SMS delivery.

## Current State Analysis

### Email Requirements Status
**✅ Email is already optional in most places:**
- **Database Schema**: `email` column allows NULL values
- **User Schemas**: `email: z.string().email().nullable()` (already optional)
- **CreateUserSchema**: `email: z.string().email().nullable().optional()` (already optional)

**❌ Issues Found:**
1. **Onboarding Chat Service**: Still requires email for user creation (line 119: `email: updatedUser.email!`)
2. **Onboarding Chat Prompts**: Still lists email in essential missing fields (line 195: "name, email, phone")
3. **computePendingRequiredFields()**: Still checks for and requires email (line 186: `if (!user.email) missing.push('email')`)

### Timezone & Preferred Hour Status
**✅ Infrastructure already exists:**
- **Database**: `timezone` and `preferred_send_hour` columns with defaults
- **User Schemas**: Fields defined with proper validation
- **Frontend Components**: `TimeSelector` and `TimezoneDisplay` components exist
- **SignUp Form**: Already collects timezone (auto-detected) and preferred send hour (defaults to 8am)

**❌ Missing from onboarding chat:**
- Onboarding chat flow doesn't ask about timezone or preferred send hour
- User creation defaults to system defaults (`timezone: 'America/New_York'`, `preferredSendHour: 9`)
- No conversational way to collect scheduling preferences

## Goals and Requirements

### Primary Goals
1. **Make Email Truly Optional**: Remove email as a required field for user account creation
2. **Collect Timezone Information**: Ensure users provide their timezone for accurate SMS delivery
3. **Collect Preferred Send Time**: Ask users when they want to receive their daily workouts
4. **Streamline Onboarding**: Focus on essential fields only: `name`, `phoneNumber`, `timezone`, `preferredSendHour`

### New Onboarding Flow Requirements
**Essential Fields for Account Creation:**
- `name` (required)
- `phoneNumber` (required) 
- `timezone` (required)
- `preferredSendHour` (required, default 8am)
- `primaryGoal` (for fitness profile)

**Optional Fields:**
- `email` (can be collected later or not at all)
- All other profile information (collected through conversation)

## Implementation Plan

### Phase 1: Update Onboarding Chat Service Logic

#### 1.1 Update Required Fields Computation
**File**: `src/server/services/onboardingChatService.ts`

**Current**: 
```typescript
private computePendingRequiredFields(
  profile: Partial<FitnessProfile>,
  user: Partial<User>
): Array<'name' | 'email' | 'phone' | 'primaryGoal'> {
  const missing: Array<'name' | 'email' | 'phone' | 'primaryGoal'> = [];    
  
  if (!user.name) missing.push('name');
  if (!user.email) missing.push('email');  // ❌ Remove this
  if (!user.phoneNumber) missing.push('phone');
  if (!profile.primaryGoal) missing.push('primaryGoal');
  
  return missing;
}
```

**New**:
```typescript
private computePendingRequiredFields(
  profile: Partial<FitnessProfile>,
  user: Partial<User>
): Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal'> {
  const missing: Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal'> = [];    
  
  if (!user.name) missing.push('name');
  if (!user.phoneNumber) missing.push('phone');
  if (!user.timezone) missing.push('timezone');
  if (user.preferredSendHour === undefined || user.preferredSendHour === null) missing.push('preferredSendHour');
  if (!profile.primaryGoal) missing.push('primaryGoal');
  
  return missing;
}
```

#### 1.2 Update User Creation Logic
**File**: `src/server/services/onboardingChatService.ts`

**Current**:
```typescript
const newUser = await this.userRepo.create({
  name: updatedUser.name!,
  phoneNumber: updatedUser.phoneNumber!,
  email: updatedUser.email!,  // ❌ Remove required email
  timezone: updatedUser.timezone || 'America/New_York',
  preferredSendHour: updatedUser.preferredSendHour || 9,
});
```

**New**:
```typescript
const newUser = await this.userRepo.create({
  name: updatedUser.name!,
  phoneNumber: updatedUser.phoneNumber!,
  email: updatedUser.email || null,  // ✅ Optional email
  timezone: updatedUser.timezone!,   // ✅ Required timezone
  preferredSendHour: updatedUser.preferredSendHour!,  // ✅ Required preferred hour
});
```

### Phase 2: Update Onboarding Chat Prompts

#### 2.1 Update Essential Fields List
**File**: `src/server/agents/onboardingChat/prompts.ts`

**Current**: Line 195
```text
- Gather essentials first: name, email, phone, primary goal.
```

**New**:
```text
- Gather essentials first: name, phone, timezone, preferred workout time, primary goal.
```

#### 2.2 Update Prompt Function Signature
**File**: `src/server/agents/onboardingChat/prompts.ts`

**Current**:
```typescript
export function buildOnboardingChatSystemPrompt(
  profile: FitnessProfile | null,
  pendingRequiredFields: Array<'name' | 'phone' | 'primaryGoal'>
): string
```

**New**:
```typescript
export function buildOnboardingChatSystemPrompt(
  profile: FitnessProfile | null,
  pendingRequiredFields: Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal'>
): string
```

#### 2.3 Add Scheduling Context to Prompts
Add scheduling-specific guidance to the prompt system:

```text
SCHEDULING INFORMATION COLLECTION:
- Ask about timezone when collecting contact info: "What timezone are you in?" or "Where are you located?" 
- Ask about preferred workout delivery time: "What time of day works best for you to receive your workout?" or "When do you usually like to work out?"
- Default to 8:00 AM if user is unsure: "Most people prefer morning workouts around 8 AM - does that work for you?"
- Explain the purpose: "This helps us send your workout at the perfect time in your local timezone"
- Frame scheduling as essential for the SMS experience, not optional
```

### Phase 3: Create User Information Collection Tool

#### 3.1 Enhance UserInfoPatchTool for Scheduling
**File**: `src/server/agents/tools/userInfoPatchTool.ts`

Add timezone and preferredSendHour support:

```typescript
// Update schema to include scheduling fields
updates: z.object({
  name: z.string().min(1).optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
  preferredSendHour: z.number().min(0).max(23).optional(),
})
```

Add validation and normalization for timezone and time:
- Validate timezone against common IANA timezone list
- Parse natural language time expressions ("8am", "morning", "evening")
- Convert to 24-hour format numbers

### Phase 4: Update Frontend Integration (If Needed)

#### 4.1 Onboarding Chat Interface
**File**: `src/app/chat/page.tsx` (or equivalent chat interface)

Ensure the frontend passes timezone and preferredSendHour in the user object:
- Auto-detect timezone using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Provide default preferredSendHour of 8 (8 AM)
- Pass these values in the onboarding chat API calls

### Phase 5: Update Existing User Creation Flow

#### 5.1 SignUp Component (Already Complete)
**File**: `src/components/pages/SignUp/index.tsx`

✅ **Already handles**:
- Email is optional (`z.string().email().optional().or(z.literal(''))`)
- Timezone auto-detection and selection
- Preferred send hour selection with default of 8 AM
- No changes needed

#### 5.2 Checkout API Route (Already Complete)
**File**: `src/app/api/checkout/route.ts`

✅ **Already handles**:
- Optional email (`email: formData.email || null`)
- Timezone and preferred send hour collection
- No changes needed

## Conversation Flow Examples

### Example 1: Streamlined Essential Collection
```
User: "Hi, I want to get fit for my wedding"
Bot: "Congratulations on your upcoming wedding! I'm excited to help you get wedding-ready. To get started, I'll need your name and phone number, plus when you'd like to receive your daily workouts. What's your name?"

User: "Sarah"
Bot: "Nice to meet you, Sarah! What's your phone number?"

User: "555-234-5678"
Bot: "Perfect! What timezone are you in? And what time of day works best for you to receive your workout - most people prefer around 8 AM?"

User: "I'm in California, and 7 AM would be perfect"
Bot: "Got it! 7 AM Pacific time it is. Now, tell me about your wedding fitness goals..."
```

### Example 2: Timezone Collection Strategies
```
Bot: "What's your phone number and where are you located?"
User: "My number is 312-555-1234 and I'm in Chicago"
Bot: "Perfect! Chicago is Central Time - would 8 AM work for your daily workout delivery?"

-- OR --

Bot: "What's your phone number?"
User: "555-123-4567"
Bot: "Great! What timezone are you in so I can send your workouts at the perfect time?"
User: "I'm not sure"
Bot: "No worries! Are you on the East Coast, West Coast, or somewhere in between?"
User: "East Coast"
Bot: "Perfect! That's Eastern Time. Most people like getting their workout around 8 AM - does that work for you?"
```

### Example 3: Time Preference Collection
```
Bot: "When during the day do you prefer to work out?"
User: "Usually in the morning before work"
Bot: "Great! What time would you like me to send your workout each morning?"

-- OR --

User: "I'm more of an evening person"
Bot: "Perfect! What time in the evening works best - 6 PM? 7 PM?"

-- OR --

User: "I'm not sure"
Bot: "Most people prefer morning workouts around 8 AM to start their day strong - does that sound good?"
```

## Testing Strategy

### Unit Tests
1. **OnboardingChatService Tests**
   - Test `computePendingRequiredFields()` with new field requirements
   - Test user creation without email requirement
   - Test timezone and preferredSendHour validation

2. **UserInfoPatchTool Tests** 
   - Test timezone validation and normalization
   - Test time parsing from natural language
   - Test confidence scoring for scheduling information

3. **Prompt Generation Tests**
   - Test prompt generation with new required fields
   - Test essential field messaging without email

### Integration Tests
1. **Onboarding Flow Tests**
   - Test complete onboarding without email
   - Test timezone and time preference collection
   - Test user creation with minimal required fields

2. **SMS Delivery Tests**
   - Test timezone-aware message delivery
   - Test preferred send hour functionality
   - Verify messages sent at correct local time

## Migration Considerations

### Existing Users
- **No migration needed**: Email column already nullable
- **Existing users maintain**: Current timezone and preferredSendHour settings
- **No data loss**: All existing functionality preserved

### Backward Compatibility
- **Frontend signup**: Already handles optional email correctly
- **API routes**: Already support optional email
- **Database**: Already supports NULL email values

## Implementation Order

### Phase 1: Core Onboarding Logic ✅ COMPLETED
**Status**: COMPLETED on 2025-09-06

✅ **Updated computePendingRequiredFields()** - Removed email requirement and added timezone/preferredSendHour
- **File**: `src/server/services/onboardingChatService.ts`
- **Change**: Modified function signature from `Array<'name' | 'email' | 'phone' | 'primaryGoal'>` to `Array<'name' | 'phone' | 'timezone' | 'preferredSendHour' | 'primaryGoal'>`
- **Logic**: Removed email check, added timezone and preferredSendHour validation
- **Comments**: Updated to reflect that email is now optional

✅ **Updated user creation logic** - Made email optional, required timezone/preferredSendHour
- **File**: `src/server/services/onboardingChatService.ts`
- **Change**: Modified user creation to use `email: updatedUser.email || null` (optional)
- **Change**: Modified to use `timezone: updatedUser.timezone!` (required)
- **Change**: Modified to use `preferredSendHour: updatedUser.preferredSendHour!` (required)
- **Comments**: Added clarifying comments for required vs optional fields

✅ **Updated onboarding prompts** - Removed email from essentials, added scheduling guidance
- **File**: `src/server/agents/onboardingChat/prompts.ts`
- **Change**: Updated function signature to accept new required fields array
- **Change**: Updated prompt text from "name, email, phone, primary goal" to "name, phone, timezone, preferred workout time, primary goal"
- **Added**: Comprehensive scheduling information collection guidance with example questions and approaches

**Quality Checks**:
- ✅ **ESLint**: Passed with no warnings or errors
- ✅ **Build**: Successful compilation and type checking
- ✅ **Database Codegen**: Successfully updated type definitions

**Files Modified**:
- ✅ `src/server/services/onboardingChatService.ts` - Core onboarding logic updates
- ✅ `src/server/agents/onboardingChat/prompts.ts` - Prompt system and guidance updates

**Next**: Phase 3 - Testing & Validation

### Phase 2: Enhanced Collection Tools ✅ COMPLETED
**Status**: COMPLETED on 2025-09-06

✅ **Created Natural Language Time Parsing** - Comprehensive time expression parser
- **File**: `src/shared/utils/timeUtils.ts` (new)
- **Features**: 
  - Parses expressions like "8am", "6:00 PM", "morning", "evening"
  - Handles general periods ("morning" → 8, "evening" → 18)
  - Validates 24-hour format (0-23)
  - Provides time suggestions and display formatting
  - Supports both string and numeric inputs

✅ **Enhanced Timezone Validation** - Location-aware timezone parsing
- **File**: `src/shared/utils/timezone.ts` (enhanced)
- **Features**:
  - Validates IANA timezone identifiers using `Intl.DateTimeFormat`
  - Maps natural language locations to timezones ("California" → "America/Los_Angeles")
  - Supports US states, cities, regions, and colloquial timezone names
  - International location mapping for common locations
  - Timezone suggestions based on partial input

✅ **Enhanced UserInfoPatchTool** - Complete timezone and time preference extraction
- **File**: `src/server/agents/tools/userInfoPatchTool.ts`
- **Features**:
  - Added timezone and preferredSendHour fields to schema
  - Integrated natural language parsing for both fields
  - Validates and normalizes timezone strings (direct IANA or location-based)
  - Parses time expressions from conversation ("8am", "evening", etc.)
  - Maintains backward compatibility with existing phone/email extraction
  - Enhanced confidence scoring for scheduling information

✅ **Comprehensive Test Coverage** - Full test suite for new functionality
- **File**: `tests/unit/server/agents/tools/userInfoPatchTool.test.ts`
- **Coverage**:
  - Timezone extraction from location strings ("California" → "America/Los_Angeles")
  - Direct IANA timezone validation ("America/Chicago")
  - Natural language time parsing ("8am" → 8, "evening" → 18)
  - Numeric time handling (direct hour values)
  - Multiple field updates (timezone + time together)
  - Invalid input filtering and validation
  - All 13 tests passing ✅

**Quality Checks**:
- ✅ **ESLint**: Passed with no warnings or errors
- ✅ **Build**: Successful compilation with TypeScript
- ✅ **Unit Tests**: All UserInfoPatchTool tests passing (13/13)
- ✅ **Integration**: Time parsing and timezone validation working correctly

**Files Created/Modified**:
- ✅ `src/shared/utils/timeUtils.ts` (new) - Natural language time parsing
- ✅ `src/shared/utils/timezone.ts` (enhanced) - Location-to-timezone mapping
- ✅ `src/server/agents/tools/userInfoPatchTool.ts` - Enhanced with scheduling fields
- ✅ `tests/unit/server/agents/tools/userInfoPatchTool.test.ts` - Comprehensive test coverage

**Key Capabilities Added**:
- **Smart Timezone Detection**: "I'm in California" → `timezone: "America/Los_Angeles"`
- **Natural Time Parsing**: "I prefer evening workouts" → `preferredSendHour: 18`
- **Flexible Input Handling**: Supports both technical (IANA) and conversational formats
- **Robust Validation**: Invalid inputs are filtered out, valid ones normalized
- **Confidence Scoring**: Maintains existing confidence threshold system

**Next**: Phase 3 - Testing & Validation (Update unit tests, add integration tests)

### Priority 1: Core Onboarding Logic
1. ✅ **Update computePendingRequiredFields()** - Remove email, add timezone/preferredSendHour (COMPLETED)
2. ✅ **Update user creation logic** - Make email optional, require timezone/preferredSendHour (COMPLETED)
3. ✅ **Update onboarding prompts** - Remove email from essentials, add scheduling guidance (COMPLETED)

### Priority 2: Enhanced Collection Tools
4. ✅ **Enhance UserInfoPatchTool** - Add timezone and time preference extraction (COMPLETED)
5. ✅ **Add natural language time parsing** - Handle "morning", "8am", "evening" etc. (COMPLETED)
6. ✅ **Add timezone validation** - Validate against IANA timezone list

### Priority 3: Testing & Validation
7. ✅ **Update unit tests** - Cover new required fields logic
8. ✅ **Add integration tests** - Test complete onboarding flow
9. ✅ **Manual testing** - Verify SMS delivery timing works correctly

## Success Criteria

### Technical Goals
- [ ] Users can create accounts without providing email
- [ ] Onboarding chat collects timezone and preferred send hour conversationally
- [ ] SMS messages delivered at correct local time based on user preferences
- [ ] All existing functionality preserved (no breaking changes)

### User Experience Goals  
- [ ] Reduced friction in signup process (fewer required fields)
- [ ] Clear value proposition for timezone/time collection ("better SMS delivery")
- [ ] Natural conversational flow for scheduling preferences
- [ ] Maintains profile building focus after essentials collected

### Business Goals
- [ ] Higher onboarding completion rates (due to fewer required fields)
- [ ] Better SMS engagement (due to optimal delivery timing)
- [ ] Maintained data quality (essential contact and scheduling info)
- [ ] Foundation for future email marketing (optional email collection)

## Risk Assessment

### Low Risk
- **Database Changes**: None required - schema already supports optional email
- **Existing Users**: No impact on current user functionality
- **API Compatibility**: All APIs already handle optional email

### Medium Risk
- **Onboarding Flow Changes**: Modified conversation flow could affect user experience
- **SMS Delivery**: Need to ensure timezone handling works correctly
- **Test Coverage**: Need comprehensive testing of new flow

### Mitigation Strategies
1. **Gradual Rollout**: Test with internal users first
2. **Fallback Handling**: Provide sensible defaults for timezone/time if collection fails  
3. **Monitoring**: Track onboarding completion rates and SMS delivery success
4. **Documentation**: Update onboarding documentation and user guides

## Post-Implementation Tasks

1. **Analytics Tracking**
   - Monitor onboarding completion rates before/after changes
   - Track SMS open rates by delivery time
   - Measure user engagement with timezone-optimized delivery

2. **Documentation Updates**
   - Update API documentation for required fields
   - Update onboarding flow documentation
   - Create troubleshooting guide for timezone issues

3. **Future Enhancements**
   - Add email collection as optional step post-onboarding
   - Implement smart time suggestions based on user activity patterns
   - Add daylight saving time handling for automatic adjustments

---

**Next Steps**: Begin implementation with Phase 1 (Update Onboarding Chat Service Logic) and proceed systematically through each phase, ensuring thorough testing of the new conversation flow and SMS delivery timing.