# Phase 2: Prompt Comparison Analysis

## Current Service Prompt (fitnessCoachPrompt)
**Location**: `/src/server/prompts/templates.ts`

### Key Characteristics:
- **Role**: Personal fitness coach via SMS
- **User Context**: Uses `fitnessProfileSubstring` helper
- **Focus Areas**:
  - Answer workout questions
  - Exercise form tips
  - Motivation and encouragement
  - Progress tracking
  - Workout adjustments
- **Communication Style**:
  - SMS-friendly (under 1600 chars)
  - Clear, actionable language
  - Encouraging and supportive
  - Personalized responses

## Agent Prompt (contextPrompt)
**Location**: `/src/server/agents/chat/prompts.ts`

### Key Characteristics:
- **Role**: Generic fitness coach providing contextual information
- **User Context**: Simple name reference
- **Focus Areas**:
  - Uses provided context data
  - References specific data points
  - Explains fitness terms
  - Provides recommendations
- **Communication Style**:
  - Under 200 words limit (much shorter!)
  - Focused and specific

## Critical Differences

### 1. Response Length
- **Service**: 1600 characters (SMS limit)
- **Agent**: 200 words (~800-1000 chars)
- **Impact**: Agent may truncate responses unnecessarily

### 2. Personality & Tone
- **Service**: Explicit "trusted fitness partner" personality
- **Agent**: More clinical/data-focused approach
- **Impact**: Less engaging, personal connection

### 3. Context Usage
- **Service**: Rich profile formatting via `fitnessProfileSubstring`
- **Agent**: Raw JSON context dump
- **Impact**: Less structured context interpretation

### 4. Missing Elements in Agent
- ❌ No motivation/encouragement emphasis
- ❌ No progress celebration
- ❌ No personalization guidelines
- ❌ No safety considerations

## Recommendation for Migration

### Option 1: Update contextPrompt (Recommended)
Modify the agent's `contextPrompt` to match the service's approach:
- Increase word limit to match SMS constraints
- Add personality and engagement guidelines
- Include structured profile formatting
- Add safety and encouragement aspects

### Option 2: Create New Prompt
Create a dedicated `fitnessCoachChatPrompt` that combines best of both:
- Keep the service's personality
- Use agent's context structure
- Maintain SMS length awareness

### Option 3: Use chatPrompt Instead
The `chatPrompt` in the agent file is actually closer to what we need:
- Has conversation history
- Better personality (uses emojis)
- 300 words limit (better than 200)
- More comprehensive instructions

## Test Results Validation

From our test runs:
- ✅ Agent returns valid response format
- ✅ Context is properly included
- ✅ User profile is fetched correctly
- ⚠️ Response style differs (uses emojis, different tone)
- ⚠️ Response length varies (686-948 chars in tests)

## Next Steps for Phase 2

1. **Decision Needed**: Which prompt approach to use?
2. **Test with chatPrompt**: The `chatChain` might be better than `contextualChatChain`
3. **Verify no duplication**: Check database for message persistence