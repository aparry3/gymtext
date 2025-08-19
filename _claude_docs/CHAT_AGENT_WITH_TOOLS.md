# Chat Agent with Tools Architecture

## Overview

This document outlines the architecture for enhancing the chat agent with tool-calling capabilities, specifically for automatically updating user profiles based on conversation context. We'll use LangChain's structured output and tool binding features to create a robust, type-safe implementation.

## Current State Analysis

### Existing Components
- **Chat Chain**: Uses Google Gemini 2.0 Flash with RunnableSequence
- **Context Service**: Provides conversation history and user profile
- **Message Flow**: SMS → Route → ChatService → Agent → Response

### Gaps to Address
1. No tool-calling capability in current chat agent
2. No structured output for profile updates
3. No audit trail for profile changes from conversations

## Proposed Architecture

### 1. Flow Diagram

```
User SMS
    ↓
[SMS Route] → receives message
    ↓
[ChatService] → orchestrates flow
    ↓
[Enhanced Chat Agent] → processes with tools
    ├── Generate Response (existing)
    └── Update Profile Tool (new)
            ↓
    [ProfilePatchService] → applies updates
            ↓
    [ProfileUpdateRepository] → audit trail
    ↓
[Response] → saved and sent to user
```

### 2. Technical Approach

#### 2.1 Agent Architecture Choice: LangChain with Tools

**Why not LangGraph?**
- LangGraph is better for complex multi-step workflows with conditional routing
- Our use case is simpler: respond + optionally update profile
- LangChain's tool binding is sufficient and simpler to implement

**Chosen Approach:**
- Use LangChain's `bindTools()` and `withStructuredOutput()`
- Single agent with tool-calling capability
- Structured output for both response and profile updates

#### 2.2 Implementation Strategy

**Two Approaches:**

##### Approach A: Native Tool Calling (Recommended)
The model decides when to call tools and returns `tool_calls` in the AIMessage. This is the standard LangChain pattern.

```typescript
// Core imports
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { AIMessage } from '@langchain/core/messages';

// Define the profile patch tool
const profilePatchTool = tool(
  async ({ updates, reason, confidence }, config) => {
    // Only apply updates with sufficient confidence
    if (confidence < 0.5) {
      return "Updates not applied due to low confidence";
    }
    
    // Get userId from config/context
    const userId = config?.configurable?.userId;
    
    // Call ProfilePatchService
    const patchService = new ProfilePatchService();
    await patchService.patchProfile(userId, updates, {
      source: 'chat',
      reason
    });
    
    return "Profile updated successfully";
  },
  {
    name: 'update_user_profile',
    description: `Update the user's fitness profile when they provide new information about:
      - Training availability (days per week, preferred times)
      - Equipment access or gym membership
      - Fitness goals or objectives
      - Physical metrics (weight, height, etc.)
      - Constraints or injuries
      - Preferences for workout style
      Only use with high confidence (>0.5).`,
    schema: z.object({
      updates: FitnessProfileSchema.partial(),
      reason: z.string().describe("Brief explanation of updates"),
      confidence: z.number().min(0).max(1).describe("Confidence score 0-1")
    })
  }
);

// Bind tool to model
const modelWithTools = model.bindTools([profilePatchTool]);

// Invoke and check for tool_calls
const response = await modelWithTools.invoke(messages);

// Response is an AIMessage with potential tool_calls
if (response.tool_calls && response.tool_calls.length > 0) {
  for (const toolCall of response.tool_calls) {
    if (toolCall.name === 'update_user_profile') {
      // Tool was called, execute it
      const result = await profilePatchTool.invoke(
        toolCall.args,
        { configurable: { userId } }
      );
    }
  }
}
```

##### Approach B: Structured Output with Manual Tool Decision
Force the model to always return a structured response that includes whether to update the profile.

```typescript
// Define structured output schema that includes tool decision
const ResponseWithToolDecision = z.object({
  message: z.string().describe("The response message to send to the user"),
  shouldUpdateProfile: z.boolean().describe("Whether profile updates are needed"),
  profileUpdates: z.object({
    updates: FitnessProfileSchema.partial(),
    reason: z.string(),
    confidence: z.number().min(0).max(1)
  }).optional().describe("Profile updates if shouldUpdateProfile is true")
});

// Model with structured output (no tool binding)
const structuredModel = model.withStructuredOutput(ResponseWithToolDecision);

// Get structured response
const response = await structuredModel.invoke(messages);

// Manually execute "tool" based on response
if (response.shouldUpdateProfile && response.profileUpdates) {
  if (response.profileUpdates.confidence >= 0.5) {
    const patchService = new ProfilePatchService();
    await patchService.patchProfile(userId, response.profileUpdates.updates, {
      source: 'chat',
      reason: response.profileUpdates.reason
    });
  }
}
```

**Why Approach A (Native Tool Calling) is Better:**
1. **Standard Pattern**: Follows LangChain conventions
2. **Model Autonomy**: LLM decides when tools are needed
3. **Multiple Tools**: Easy to add more tools later
4. **Better Tracing**: Tool calls are tracked in LangSmith
5. **Parallel Execution**: Multiple tools can be called in one response

### 3. Enhanced Chat Chain Implementation (Native Tool Calling)

**IMPORTANT NOTE ON TOOL CALLING BEHAVIOR:**
Most LLMs (Gemini, GPT-4, Claude) return EITHER tool_calls OR content in a single response, not both. This means:
- When the model decides to use a tool, it returns `tool_calls` but typically no `content`
- When the model answers directly, it returns `content` but no `tool_calls`

To avoid re-invoking the model after tool execution, we implement a hybrid approach with response templates.

```typescript
// src/server/agents/chat/enhancedChain.ts

import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';

// Initialize model
const model = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: "gemini-2.0-flash" 
});

// Define profile patch tool
const profilePatchTool = tool(
  async ({ updates, reason, confidence }, config) => {
    if (confidence < 0.5) {
      return JSON.stringify({ 
        success: false, 
        message: "Updates not applied due to low confidence" 
      });
    }
    
    const userId = config?.configurable?.userId;
    const patchService = new ProfilePatchService();
    
    try {
      await patchService.patchProfile(userId, updates, {
        source: 'chat',
        reason
      });
      
      return JSON.stringify({ 
        success: true, 
        message: "Profile updated successfully",
        fieldsUpdated: Object.keys(updates)
      });
    } catch (error) {
      return JSON.stringify({ 
        success: false, 
        message: `Failed to update profile: ${error.message}` 
      });
    }
  },
  {
    name: 'update_user_profile',
    description: 'Update user fitness profile based on conversation',
    schema: z.object({
      updates: FitnessProfileSchema.partial(),
      reason: z.string(),
      confidence: z.number().min(0).max(1)
    })
  }
);

// Bind tools to model
const modelWithTools = model.bindTools([profilePatchTool]);

// Helper function to generate response without re-invoking LLM
const generateProfileUpdateResponse = (fieldsUpdated: string[]): string => {
  const fieldDescriptions: Record<string, string> = {
    availability: "training schedule",
    equipment: "gym access",
    constraints: "limitations",
    preferences: "workout preferences",
    metrics: "physical stats",
    primaryGoal: "fitness goals",
    experienceLevel: "experience level"
  };
  
  const updates = fieldsUpdated
    .map(field => fieldDescriptions[field] || field)
    .join(", ");
  
  const responses = [
    `Got it! I've updated your ${updates}. This will help me provide better workout recommendations.`,
    `Thanks for the update! I've noted your ${updates} changes.`,
    `Perfect! Your ${updates} has been updated. Let's keep working toward your goals!`,
    `Noted! I've updated your ${updates}. How can I help you with your training today?`
  ];
  
  // Return a random response for variety
  return responses[Math.floor(Math.random() * responses.length)];
};

export const enhancedChatChain = async ({ 
  userId, 
  message, 
  conversationId 
}: { 
  userId: string;
  message: string;
  conversationId?: string;
}) => {
  // Step 1: Get context
  const contextService = new ConversationContextService();
  const context = await contextService.getContext(userId, conversationId);
  
  // Step 2: Build messages array
  const messages = [
    new SystemMessage(buildSystemPrompt(context)),
    ...context.messages.map(msg => 
      msg.direction === 'inbound' 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    ),
    new HumanMessage(message)
  ];
  
  // Step 3: Invoke model with tools
  const aiResponse = await modelWithTools.invoke(messages, {
    configurable: { userId }
  });
  
  // Step 4: Execute tool calls if present
  let profileUpdated = false;
  const toolResults = [];
  
  if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
    for (const toolCall of aiResponse.tool_calls) {
      if (toolCall.name === 'update_user_profile') {
        const result = await profilePatchTool.invoke(
          toolCall.args,
          { configurable: { userId } }
        );
        
        const parsedResult = JSON.parse(result);
        profileUpdated = parsedResult.success;
        
        // Create ToolMessage for conversation history
        toolResults.push(new ToolMessage({
          content: result,
          tool_call_id: toolCall.id || 'manual',
          name: toolCall.name
        }));
      }
    }
  }
  
  // Step 5: Generate response based on tool results
  let finalMessage = aiResponse.content;
  
  // IMPORTANT: Most models return EITHER tool_calls OR content, not both
  // To avoid re-invocation, we can use a template-based response
  if (toolResults.length > 0 && !finalMessage) {
    // Generate response without re-invoking the model
    const toolResult = JSON.parse(toolResults[0].content);
    
    if (toolResult.success) {
      // Use pre-defined response templates
      finalMessage = generateProfileUpdateResponse(toolResult.fieldsUpdated);
    } else {
      // Tool failed, use the original AI response or default
      finalMessage = aiResponse.content || "I understand. Let me know if you'd like to share more about your fitness journey.";
    }
    
    // Alternative: If you need more dynamic responses, you'll need to re-invoke
    // const finalResponse = await modelWithTools.invoke([
    //   ...messages,
    //   aiResponse,
    //   ...toolResults
    // ]);
    // finalMessage = finalResponse.content;
  }
  
  return {
    message: finalMessage,
    profileUpdated,
    toolCalls: aiResponse.tool_calls
  };
};
```

### 4. System Prompt Engineering

```typescript
const buildSystemPrompt = (context: ConversationContext) => `
You are GymText, a personalized fitness coach communicating via SMS.

Current user profile:
${JSON.stringify(context.user.parsedProfile, null, 2)}

Your responsibilities:
1. Provide helpful fitness coaching based on the user's profile and goals
2. Identify when users provide new information about their fitness journey
3. Determine if profile updates are needed based on the conversation

When to update the profile:
- User explicitly states new information (confidence: 0.9-1.0)
  Example: "I now go to the gym 5 days a week"
- User provides clear corrections (confidence: 0.8-1.0)
  Example: "Actually, I'm training for a marathon, not general fitness"
- Strong implications from context (confidence: 0.6-0.8)
  Example: "I just joined Planet Fitness" implies equipment access change

When NOT to update:
- Vague or uncertain statements (confidence < 0.5)
- Temporary situations ("I'm taking this week off")
- Questions or hypotheticals ("What if I trained 6 days?")

Profile update guidelines:
- Be conservative - only update with clear information
- Prefer asking for clarification over assuming
- Track the reason for each update for audit purposes
`;
```

### 5. Service Layer Updates

```typescript
// src/server/services/chatService.ts

export class ChatService {
  async handleMessage(userId: string, message: string): Promise<string> {
    try {
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId);
      
      // Save inbound message
      await this.messageRepo.create({
        conversationId: conversation.id,
        userId,
        direction: 'inbound',
        content: message
      });
      
      // Process with enhanced agent
      const response = await enhancedChatChain.invoke({
        userId,
        message,
        conversationId: conversation.id
      });
      
      // Save outbound message
      await this.messageRepo.create({
        conversationId: conversation.id,
        userId,
        direction: 'outbound',
        content: response.message
      });
      
      // Log if profile was updated
      if (response.profileUpdated) {
        console.log(`Profile updated for user ${userId} via chat`);
      }
      
      return response.message;
      
    } catch (error) {
      console.error('Chat service error:', error);
      return "I'm having trouble processing that. Please try again.";
    }
  }
}
```

### 6. Testing Strategy

#### 6.1 Unit Tests
```typescript
describe('Enhanced Chat Agent', () => {
  it('should update profile with high confidence statements', async () => {
    const response = await enhancedChatChain.invoke({
      userId: 'test-user',
      message: "I now train 5 days a week at Gold's Gym",
      conversationId: 'test-convo'
    });
    
    expect(response.profileUpdated).toBe(true);
    // Verify profile was patched in database
  });
  
  it('should not update profile with low confidence', async () => {
    const response = await enhancedChatChain.invoke({
      userId: 'test-user',
      message: "I might start going to the gym more",
      conversationId: 'test-convo'
    });
    
    expect(response.profileUpdated).toBe(false);
  });
});
```

#### 6.2 Integration Test Scenarios
1. **Equipment Update**: "I joined Planet Fitness yesterday"
2. **Schedule Change**: "I can now work out 6 days a week"
3. **Goal Update**: "I want to focus on strength training now"
4. **Injury Report**: "My knee has been bothering me"
5. **Ambiguous Statement**: "Maybe I'll try morning workouts"

### 7. Observability & Monitoring

#### 7.1 Logging
```typescript
// Log all tool calls
const profilePatchTool = new DynamicStructuredTool({
  // ... tool config
  func: async (input) => {
    console.log('Profile patch attempt:', {
      userId,
      confidence: input.confidence,
      fieldsUpdated: Object.keys(input.updates)
    });
    // ... implementation
  }
});
```

#### 7.2 Metrics to Track
- Profile updates per conversation
- Confidence score distribution
- Most frequently updated fields
- Failed update attempts
- User satisfaction after automatic updates

### 8. Rollout Plan

#### Phase 1: Shadow Mode (Week 1-2)
- Implement tool but don't apply updates
- Log what would have been updated
- Analyze accuracy and confidence scores

#### Phase 2: Limited Rollout (Week 3-4)
- Enable for 10% of users
- Only update high-confidence fields (>0.9)
- Monitor user reactions and accuracy

#### Phase 3: Full Rollout (Week 5+)
- Enable for all users
- Use full confidence threshold (>0.5)
- Add user notification of updates

### 9. Error Handling

```typescript
const profilePatchTool = new DynamicStructuredTool({
  func: async (input) => {
    try {
      // Validate updates against schema
      const validated = FitnessProfileSchema.partial().parse(input.updates);
      
      // Apply updates
      await patchService.patchProfile(userId, validated, {
        source: 'chat',
        reason: input.reason
      });
      
      return "Profile updated successfully";
      
    } catch (error) {
      // Log but don't fail the conversation
      console.error('Profile update failed:', error);
      return "Unable to update profile at this time";
    }
  }
});
```

### 10. Future Enhancements

1. **Multi-tool Support**
   - Add tools for workout feedback
   - Add tools for progress tracking
   - Add tools for plan adjustments

2. **Confirmation Flow**
   - Ask user to confirm before applying updates
   - Provide summary of what changed

3. **Rollback Capability**
   - Allow users to undo automatic updates
   - Track update history for accountability

4. **Smart Suggestions**
   - Proactively ask about missing profile fields
   - Suggest profile optimizations based on goals

## Implementation Checklist

- [ ] Create ProfilePatchService
- [ ] Create ProfileUpdateRepository  
- [ ] Update user schemas with Zod
- [ ] Create profile patch tool
- [ ] Update chat agent with tool binding
- [ ] Add structured output schema
- [ ] Update system prompts
- [ ] Update ChatService
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add logging and monitoring
- [ ] Deploy in shadow mode
- [ ] Analyze shadow mode results
- [ ] Roll out to limited users
- [ ] Full production rollout

## Key Decisions

1. **LangChain over LangGraph**: Simpler for our single-step tool use case
2. **Confidence threshold of 0.5**: Balance between automation and accuracy
3. **Audit trail in profile_updates**: Compliance and debugging
4. **Shadow mode first**: Validate accuracy before affecting users
5. **Structured output**: Type safety and predictable responses

## References

- [LangChain Structured Outputs](https://js.langchain.com/docs/concepts/structured_outputs/)
- [LangChain Tools Documentation](https://js.langchain.com/docs/modules/agents/tools/)
- [Zod Schema Validation](https://zod.dev/)
- [Google Gemini Tool Calling](https://ai.google.dev/gemini-api/docs/function-calling)