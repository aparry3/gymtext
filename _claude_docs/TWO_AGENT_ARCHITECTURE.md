# Two-Agent Architecture: UserProfileAgent + ChatAgent

## Overview

This architecture separates profile management from response generation using two specialized agents:

1. **UserProfileAgent** - Analyzes messages for profile information and updates when needed
2. **ChatAgent** - Generates contextual responses using the (potentially updated) profile

## Architecture Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     Incoming SMS Message                       │
│                   "I now train 5 days a week"                 │
└─────────────────────────┬──────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│                        ChatService                             │
│                    (Orchestrates Agents)                       │
└─────────────────────────┬──────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│                    UserProfileAgent                            │
│                 (Profile Specialist)                           │
│                                                                │
│  1. Analyzes message for profile information                  │
│  2. Decides if update needed (confidence check)               │
│  3. Calls patchProfile tool if needed                         │
│  4. Returns updated profile (or original if no changes)       │
│                                                                │
│  Input: { userId, message, currentProfile }                   │
│  Output: { profile, wasUpdated, updateSummary? }              │
└─────────────────────────┬──────────────────────────────────────┘
                          ↓
              ┌───────────────────────┐
              │  Profile (Updated?)    │
              └───────────┬───────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│                        ChatAgent                               │
│                  (Response Specialist)                         │
│                                                                │
│  1. Receives updated profile from UserProfileAgent            │
│  2. Generates contextual response                             │
│  3. Can acknowledge profile updates naturally                 │
│  4. Focuses on coaching and conversation                      │
│                                                                │
│  Input: { message, profile, wasProfileUpdated, context }      │
│  Output: { response }                                         │
└─────────────────────────┬──────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│                    SMS Response to User                        │
│         "Great! 5 days a week is perfect for..."              │
└────────────────────────────────────────────────────────────────┘
```

## Benefits of Two-Agent Architecture

### 1. **Separation of Concerns**
- UserProfileAgent focuses solely on profile extraction and updates
- ChatAgent focuses solely on generating great responses
- Each agent can be optimized for its specific task

### 2. **No Re-invocation Needed**
- UserProfileAgent handles tool calling internally
- ChatAgent receives the final profile state
- Single pass through each agent

### 3. **Better Prompt Engineering**
- UserProfileAgent prompt focuses on extraction and confidence scoring
- ChatAgent prompt focuses on coaching and conversation
- Cleaner, more focused prompts for each task

### 4. **Easier Testing**
- Test profile extraction independently
- Test response generation independently
- Mock either agent for isolated testing

### 5. **Flexible Model Selection**
- Could use a smaller, faster model for UserProfileAgent
- Use a more creative model for ChatAgent
- Mix and match based on requirements

## Implementation Details

### UserProfileAgent

```typescript
// src/server/agents/profile/prompts.ts

export const buildUserProfileSystemPrompt = (currentProfile: FitnessProfile | null): string => {
  return `You are a profile extraction specialist for a fitness coaching app.
Your ONLY job is to identify and extract fitness-related information from user messages.

Current user profile:
${JSON.stringify(currentProfile, null, 2)}

When you identify new or updated information:
1. Extract ONLY explicitly stated information
2. Assess confidence (0-1):
   - 0.9-1.0: Direct statements ("I go to the gym 5 days a week")
   - 0.7-0.89: Clear implications ("Just joined Planet Fitness")
   - 0.5-0.69: Moderate confidence
   - Below 0.5: Don't update

Focus on:
- Training frequency and schedule
- Equipment access and gym membership
- Goals and objectives
- Physical metrics
- Injuries or constraints
- Workout preferences

Do NOT:
- Make assumptions
- Infer information not directly stated
- Update based on questions or hypotheticals`;
};
```

```typescript
// src/server/agents/profile/chain.ts

import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { buildUserProfileSystemPrompt } from './prompts';
import { ProfilePatchService } from '@/server/services/profilePatchService';
import { FitnessProfileSchema } from '@/server/models/user/schemas';

const profilePatchTool = tool(
  async ({ updates, reason, confidence }, config) => {
    if (confidence < 0.5) {
      return { applied: false, reason: "Low confidence" };
    }
    
    const userId = config?.configurable?.userId;
    const patchService = new ProfilePatchService();
    
    const updatedProfile = await patchService.patchProfile(userId, updates, {
      source: 'chat',
      reason
    });
    
    return { 
      applied: true, 
      updatedProfile,
      fieldsUpdated: Object.keys(updates)
    };
  },
  {
    name: 'update_user_profile',
    description: 'Update user fitness profile when new information is provided',
    schema: z.object({
      updates: FitnessProfileSchema.partial(),
      reason: z.string(),
      confidence: z.number().min(0).max(1)
    })
  }
);

// Specialized model for profile extraction
const profileModel = new ChatOpenAI({ 
  model: "gpt-4-turbo",
  temperature: 0.2  // Lower temperature for consistent extraction
}).bindTools([profilePatchTool]);

export const userProfileAgent = async ({
  userId,
  message,
  currentProfile
}: {
  userId: string;
  message: string;
  currentProfile: FitnessProfile | null;
}) => {
  const systemPrompt = buildUserProfileSystemPrompt(currentProfile);

  const response = await profileModel.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ], {
    configurable: { userId }
  });

  // Check if tool was called
  let wasUpdated = false;
  let updatedProfile = currentProfile;
  let updateSummary = null;

  if (response.tool_calls && response.tool_calls.length > 0) {
    for (const toolCall of response.tool_calls) {
      if (toolCall.name === 'update_user_profile') {
        const result = await profilePatchTool.invoke(
          toolCall.args,
          { configurable: { userId } }
        );
        
        if (result.applied) {
          wasUpdated = true;
          updatedProfile = result.updatedProfile;
          updateSummary = {
            fieldsUpdated: result.fieldsUpdated,
            reason: toolCall.args.reason
          };
        }
      }
    }
  }

  return {
    profile: updatedProfile,
    wasUpdated,
    updateSummary
  };
};
```

### ChatAgent (Enhanced)

```typescript
// src/server/agents/chat/prompts.ts

export const buildChatSystemPrompt = (
  profile: FitnessProfile | null,
  wasProfileUpdated: boolean,
  updateSummary?: { fieldsUpdated: string[], reason: string }
): string => {
  let prompt = `You are GymText, a personalized fitness coach communicating via SMS.

User Profile:
${JSON.stringify(profile, null, 2)}

Your role:
- Provide personalized fitness coaching
- Answer questions about workouts and fitness
- Offer encouragement and motivation
- Keep responses concise for SMS (max 160 chars ideal, 320 chars max)`;

  // Add context about profile update if it happened
  if (wasProfileUpdated && updateSummary) {
    prompt += `\n\nNOTE: The user's profile was just updated (${updateSummary.reason}).
Acknowledge this naturally in your response if relevant, but focus on being helpful.`;
  }

  return prompt;
};
```

```typescript
// src/server/agents/chat/chain.ts

import { ChatOpenAI } from '@langchain/openai';
import { buildChatSystemPrompt } from './prompts';

const chatModel = new ChatOpenAI({ 
  model: "gpt-4",
  temperature: 0.7  // Higher temperature for more natural conversation
});

export const chatAgent = async ({
  userId,
  message,
  profile,
  wasProfileUpdated,
  updateSummary,
  conversationHistory
}: {
  userId: string;
  message: string;
  profile: FitnessProfile | null;
  wasProfileUpdated: boolean;
  updateSummary?: { fieldsUpdated: string[], reason: string };
  conversationHistory: Message[];
}) => {
  const systemPrompt = buildChatSystemPrompt(profile, wasProfileUpdated, updateSummary);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.direction === 'inbound' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  const response = await chatModel.invoke(messages);
  
  return {
    message: response.content
  };
};
```

### ChatService (Orchestrator)

```typescript
// src/server/services/chatService.ts

export class ChatService {
  async handleIncomingMessage(
    user: UserWithProfile,
    message: string
  ): Promise<string> {
    try {
      // Step 1: Get conversation context
      const conversation = await this.getOrCreateConversation(user.id);
      const history = await this.messageRepo.getRecentMessages(
        conversation.id, 
        10
      );
      
      // Step 2: Process through UserProfileAgent
      const profileResult = await userProfileAgent({
        userId: user.id,
        message,
        currentProfile: user.parsedProfile
      });
      
      // Step 3: Generate response through ChatAgent
      const chatResult = await chatAgent({
        userId: user.id,
        message,
        profile: profileResult.profile,
        wasProfileUpdated: profileResult.wasUpdated,
        updateSummary: profileResult.updateSummary,
        conversationHistory: history
      });
      
      // Step 4: Save messages
      await this.messageRepo.create({
        conversationId: conversation.id,
        userId: user.id,
        direction: 'inbound',
        content: message
      });
      
      await this.messageRepo.create({
        conversationId: conversation.id,
        userId: user.id,
        direction: 'outbound',
        content: chatResult.message
      });
      
      // Step 5: Log profile update if it happened
      if (profileResult.wasUpdated) {
        console.log(`Profile updated for user ${user.id}:`, 
          profileResult.updateSummary
        );
      }
      
      return chatResult.message;
      
    } catch (error) {
      console.error('Chat service error:', error);
      return "I'm having trouble processing that. Please try again.";
    }
  }
}
```

## System Prompts

### UserProfileAgent System Prompt
- Focused on extraction and confidence scoring
- Clear guidelines on what to extract
- No conversation or coaching elements
- Strict confidence thresholds

### ChatAgent System Prompt  
- Focused on coaching and conversation
- Receives profile as context
- Can acknowledge updates naturally
- Maintains conversational flow

## Example Flow

### User Message
"I just joined Planet Fitness and can now train 5 days a week"

### UserProfileAgent Processing
1. Identifies: Equipment access change + availability change
2. Confidence: 0.95 (direct statement)
3. Calls tool: Updates equipment.access and availability.daysPerWeek
4. Returns: Updated profile with changes

### ChatAgent Processing
1. Receives: Updated profile + update notification
2. Generates: "Awesome! Planet Fitness has great equipment. With 5 days a week, we can really dial in your training. Ready for tomorrow's workout?"

### Result
- Profile updated automatically
- Natural acknowledgment in response
- No re-invocation needed

## Testing Strategy

### Unit Tests

#### UserProfileAgent Tests
```typescript
describe('UserProfileAgent', () => {
  it('should extract and update profile information', async () => {
    const result = await userProfileAgent({
      userId: 'test-user',
      message: 'I can train 5 days a week now',
      currentProfile: { availability: { daysPerWeek: 3 } }
    });
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile.availability.daysPerWeek).toBe(5);
  });
  
  it('should not update on low confidence', async () => {
    const result = await userProfileAgent({
      userId: 'test-user',
      message: 'Maybe I could train more',
      currentProfile: { availability: { daysPerWeek: 3 } }
    });
    
    expect(result.wasUpdated).toBe(false);
  });
});
```

#### ChatAgent Tests
```typescript
describe('ChatAgent', () => {
  it('should acknowledge profile updates', async () => {
    const result = await chatAgent({
      userId: 'test-user',
      message: 'I joined a gym',
      profile: { equipment: { access: 'full-gym' } },
      wasProfileUpdated: true,
      updateSummary: { 
        fieldsUpdated: ['equipment'], 
        reason: 'User joined gym' 
      },
      conversationHistory: []
    });
    
    expect(result.message).toContain('gym');
  });
});
```

## File Structure

```
src/server/agents/
├── profile/                    # UserProfileAgent (NEW)
│   ├── chain.ts               # Agent logic with tool
│   └── prompts.ts             # System prompts
├── chat/                       # ChatAgent
│   ├── chain.ts               # Agent logic (refactored)
│   └── prompts.ts             # System prompts (updated)
└── tools/                      # Shared tools (NEW)
    └── profilePatchTool.ts    # Profile update tool

src/server/services/
├── chatService.ts             # Orchestrates both agents
└── profilePatchService.ts    # Profile update logic (NEW)

src/server/repositories/
├── userRepository.ts          # Add patchProfile method
└── profileUpdateRepository.ts # Audit trail (NEW)
```

## Migration Path

### Phase 1: Implement UserProfileAgent
1. Create agent with tool
2. Create prompts.ts for system prompts
3. Test profile extraction
4. Validate confidence scoring

### Phase 2: Update ChatAgent
1. Refactor existing chain.ts to separate prompts
2. Modify to accept profile parameter
3. Add update acknowledgment logic
4. Test response generation

### Phase 3: Update ChatService
1. Orchestrate both agents
2. Handle error cases
3. Add logging

### Phase 4: Testing & Rollout
1. Shadow mode testing
2. A/B testing
3. Full rollout

## Advantages Over Single Agent

1. **Cleaner Code**: Each agent has a single responsibility
2. **Better Performance**: Can optimize each agent separately  
3. **Easier Debugging**: Clear separation of extraction vs generation
4. **Flexible Scaling**: Can run agents on different infrastructure
5. **Model Flexibility**: Can use different models for each task
6. **No Re-invocation**: Each agent runs once
7. **Better Testing**: Can test each component in isolation

## Future Enhancements

1. **Cache UserProfileAgent**: If message doesn't contain profile info, skip it
2. **Batch Processing**: Process multiple messages through UserProfileAgent
3. **Profile Completeness**: UserProfileAgent could suggest questions
4. **Confidence Learning**: Track and improve confidence scoring over time
5. **Multi-Tool Support**: Add more tools to UserProfileAgent (preferences, goals, etc.)