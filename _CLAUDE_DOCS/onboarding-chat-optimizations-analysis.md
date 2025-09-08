# Onboarding Chat Flow Optimizations Analysis

## Overview
Analysis of required changes to the onboarding chat flow to implement two key optimizations:
1. Inferring user's sex/gender and asking if inference is not possible
2. Asking about preferred daily workout time instead of defaulting to 8:00am

## Current State Analysis

### Gender/Sex Collection
- **Schema Support**: ✅ `gender` field already exists in `FitnessProfileSchema` (line 198, schemas.ts)
- **Current Collection**: ❌ Not actively collected during onboarding flow
- **Profile Agent**: ✅ Could potentially extract gender from conversation context
- **Database**: ✅ Gender is stored in the `profile` JSONB field in users table

### Time Preference Collection
- **Schema Support**: ✅ `preferredSendHour` exists in User table (required field)
- **Current Behavior**: ❌ Defaults to 8am, asks for confirmation rather than preference
- **Current Prompt**: References "should I send those at 8:00am EST or would you prefer a different time/timezone?" (line 68, prompts.ts)

## Required Changes

### 1. Gender/Sex Inference and Collection

#### Changes to Profile Agent (`src/server/agents/profile/chain.ts`)
- **Add Gender Detection Tool**: Enhance the profile extraction to actively look for gender indicators in conversation
- **Inference Logic**: Look for:
  - Direct mentions ("I'm a guy", "I'm female", "as a woman")
  - Contextual clues (pregnancy mentions, male/female-specific activities)
  - Pronouns used by the user about themselves
- **Confidence Scoring**: Only update gender field when confidence > 0.7 (higher than standard 0.5)

#### Changes to Onboarding Prompts (`src/server/agents/onboardingChat/prompts.ts`)
- **Add Gender to Essential Fields**: Include gender in required fields list if not inferred
- **Gender-Specific Questions**: Add prompts to ask about gender when:
  - No gender detected after 3-4 exchanges
  - Low confidence on gender inference
- **Natural Integration**: Ask gender as part of fitness context: "To better tailor your program, are you male or female?"

#### Changes to Service Layer (`src/server/services/onboardingChatService.ts`)
- **Update Required Fields Logic**: Add gender to `computePendingRequiredFields` when confidence is low
- **Inference Tracking**: Track gender inference confidence to determine when to ask directly

### 2. Preferred Time Collection Enhancement

#### Changes to Onboarding Prompts (`src/server/agents/onboardingChat/prompts.ts`)
- **Update Batching Guidelines**: Change line 68 from:
  ```
  "should I send those at 8:00am EST or would you prefer a different time/timezone?"
  ```
  To:
  ```
  "what time works best for you to receive your daily workout (with timezone)? I can send them anytime that works for your schedule."
  ```
- **Remove 8am Default**: Stop suggesting 8am as the default preference
- **Time Context**: Ask about morning routine, schedule preferences to better suggest optimal times

#### Changes to Service Layer (`src/server/services/onboardingChatService.ts`)
- **Keep Validation**: Continue requiring `preferredSendHour` and `timezone` as essential fields
- **No Logic Changes**: The service logic remains the same, only prompt changes needed

## Implementation Strategy

### Phase 1: Gender Collection (Low Risk)
1. **Update Profile Agent**: Add gender detection patterns and confidence scoring
2. **Update Onboarding Prompts**: Add gender questions when inference fails
3. **Test Inference**: Verify gender detection works in various conversation patterns

### Phase 2: Time Preference (Medium Risk)  
1. **Update Prompts**: Change time collection approach from default + confirmation to preference gathering
2. **Test User Experience**: Ensure users still provide valid timezone/hour combinations
3. **Fallback Logic**: Add fallback to suggest 8am if user provides vague responses ("morning", "early")

## Technical Considerations

### Gender Field Usage
- **Downstream Impact**: Check if any existing fitness planning logic uses gender for workout customization
- **Privacy**: Ensure gender field is optional and not exposed in API responses unless needed
- **Inclusivity**: Consider supporting non-binary options in future ("male", "female", "non-binary", "prefer not to say")

### Time Preference UX
- **Validation**: Ensure robust parsing of various time formats ("8am", "8:00 AM EST", "morning")
- **Timezone Handling**: Continue requiring explicit timezone information for accuracy
- **Error Handling**: Graceful handling when users provide invalid time preferences

## Risk Assessment

### Low Risk Changes
- Adding gender inference to profile agent (additive change)
- Updating prompt text for time preferences

### Medium Risk Changes  
- Adding gender as required field (could slow onboarding if poorly implemented)
- Changing time collection UX (could confuse users familiar with current flow)

## Testing Strategy

### Unit Tests
- Test gender inference confidence scoring
- Test time preference parsing edge cases
- Verify required fields logic with gender inclusion

### Integration Tests
- Full onboarding flow with gender inference scenarios
- Time preference collection with various user inputs
- Edge cases: user refuses to share gender, provides invalid times

### User Testing
- A/B test time preference collection (current vs. new approach)  
- Monitor onboarding completion rates after gender addition
- Gather feedback on natural flow of gender questions

## Success Metrics

### Gender Collection
- **Inference Rate**: >70% of users should have gender inferred from conversation
- **Completion Rate**: Onboarding completion should not decrease significantly
- **User Satisfaction**: Gender questions should feel natural, not intrusive

### Time Preference
- **Preference Diversity**: Should see more variation in preferred times (not just 8am)
- **Accuracy**: Users should provide valid time/timezone combinations
- **Engagement**: Users should be more likely to engage with workouts sent at preferred times

## Implementation Priority

1. **High Priority**: Gender inference (enhances workout personalization)
2. **Medium Priority**: Time preference collection (improves user engagement)

Both changes are relatively low-risk and can be implemented independently, making them good candidates for iterative improvement of the onboarding experience.