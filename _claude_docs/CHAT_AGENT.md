# Chat Service to Agent Migration Plan

## Overview
Migrate `chatService.ts` to use the existing `chat/chain.ts` agent for all LLM interactions, following a clean separation of concerns where:
- **Agents**: Handle all direct LLM interactions, prompts, and conversation loops
- **Services**: Use agents to get responses, handle business logic, and orchestrate between layers

## Current State Analysis

### chatService.ts (Current)
- Directly instantiates `ChatGoogleGenerativeAI` LLM
- Handles prompt building and context gathering
- Manages SMS length constraints
- Contains hardcoded system prompts

### chat/chain.ts (Agent)
- Already has LLM instantiation
- Has two chains: `chatChain` and `contextualChatChain`
- `chatChain`: Manages full conversation flow with DB persistence
- `contextualChatChain`: Simpler chain for context-aware responses without DB ops
- Both chains already fetch user context and handle prompting

## Migration Approach

### 1. Service Layer Changes

The `ChatService.handleIncomingMessage()` should:
- Remove direct LLM instantiation
- Remove prompt building logic
- Focus on:
  - Orchestrating the agent call
  - Handling SMS length constraints
  - Error handling and fallbacks
  - Business logic around the response

### 2. Agent Selection

Use `contextualChatChain` because:
- It doesn't manage conversation persistence (service already handles this via webhook)
- Takes userId and message as input
- Returns response with context
- Simpler integration path

### 3. Required Changes

#### chatService.ts Modifications:
```typescript
// Remove:
- LLM instantiation (lines 11-15)
- Direct prompt building
- Context service usage (already in agent)

// Add:
- Import contextualChatChain from agent
- Call agent with userId and message
- Extract response from agent result
- Keep SMS length handling
```

#### Potential Agent Enhancements:
- Consider adding SMS length constraints to agent
- May need to expose prompt customization options
- Could add support for passing existing context to avoid double-fetching

### 4. Implementation Steps

1. **Remove LLM and prompt dependencies** from chatService
2. **Import the contextualChatChain** from agents/chat/chain
3. **Refactor handleIncomingMessage** to:
   ```typescript
   async handleIncomingMessage(user: UserWithProfile, message: string) {
     try {
       // Call the agent
       const result = await contextualChatChain.invoke({
         userId: user.id,
         message: message
       });
       
       // Handle SMS length constraints
       const responseText = result.response.trim();
       if (responseText.length > SMS_MAX_LENGTH) {
         return responseText.substring(0, SMS_MAX_LENGTH - 3) + '...';
       }
       
       return responseText;
     } catch (error) {
       // Error handling
     }
   }
   ```

### 5. Benefits of Migration

- **Cleaner separation**: Services don't know about LLM details
- **Centralized LLM logic**: All prompt engineering in agents
- **Easier testing**: Mock agent responses instead of LLM
- **Consistent LLM usage**: All LLM config in one place
- **Future extensibility**: Agent can evolve independently

### 6. Considerations

#### Context Duplication
- Both service and agent currently fetch context
- Could optimize by passing context to agent
- May need to extend agent interface

#### Prompt Customization
- Current service uses `fitnessCoachPrompt` template
- Agent uses its own `contextPrompt`
- Need to ensure prompts are aligned or make agent configurable

#### Message Persistence
- Current webhook already saves messages to DB
- `contextualChatChain` doesn't duplicate this (good)
- Verify no message duplication occurs

### 7. Future Enhancements

After initial migration:
1. Move SMS length handling to agent layer
2. Add structured output parsing for agent actions
3. Implement the TODO comments (lines 52-58) as agent capabilities:
   - Workout updates
   - Preference updates
   - Memory saving
   - Progress tracking
   - Notifications

### 8. Testing Strategy

1. Unit tests for refactored service
2. Mock agent responses
3. Verify SMS length handling
4. Test error scenarios
5. Integration test with actual agent

## Summary

This migration will create a cleaner architecture where the chatService becomes a thin orchestration layer that uses the chat agent for all LLM interactions. The agent handles all prompt engineering and LLM communication, while the service focuses on business logic and integration concerns.