# Agent Architecture Documentation

## Overview

GymText follows a clean architecture pattern where AI/LLM interactions are handled by specialized agents, while services focus on business logic and orchestration.

## Architecture Layers

```
┌─────────────────────────────────────┐
│         API Routes Layer            │
│  (Next.js API routes in app/api)    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Service Layer               │
│  (Business logic & orchestration)   │
│  Example: chatService.ts            │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│          Agent Layer                │
│    (LLM interactions & prompts)     │
│  Example: contextualChatChain       │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│       Repository Layer              │
│    (Database operations)            │
└─────────────────────────────────────┘
```

## Key Principles

### 1. Separation of Concerns
- **Services**: Handle business logic, validation, and orchestration
- **Agents**: Manage all LLM interactions, prompt engineering, and AI responses
- **Repositories**: Perform database operations

### 2. Agent Responsibilities
Each agent is responsible for:
- Constructing appropriate prompts
- Managing LLM configuration
- Handling context and memory
- Processing LLM responses
- Error handling for AI operations

### 3. Service Responsibilities
Services focus on:
- Business rule enforcement
- Orchestrating multiple agents/repositories
- Data validation and transformation
- Error handling and fallbacks
- External service integration (SMS, payments, etc.)

## Agent Patterns

### Contextual Chat Agent
**Location**: `src/server/agents/chat/chain.ts`

**Purpose**: Handles conversational AI responses with context awareness

**Key Features**:
- Fetches conversation history
- Includes user fitness profile in context
- Manages prompt templates
- Returns structured responses

**Usage Example**:
```typescript
const result = await contextualChatChain.invoke({
  userId: user.id,
  message: "What workout should I do?"
});
```

### Other Specialized Agents

#### Daily Workout Agent
- **Location**: `src/server/agents/fitness/dailyWorkout.ts`
- **Purpose**: Generates daily workout plans
- **Model**: Gemini 2.0 Flash

#### Fitness Plan Agent
- **Location**: `src/server/agents/fitness/generateFitnessPlanAgent.ts`
- **Purpose**: Creates comprehensive fitness plans with mesocycles

#### Welcome Message Agent
- **Location**: `src/server/agents/messaging/welcomeMessageAgent.ts`
- **Purpose**: Generates personalized onboarding messages

## Migration Pattern

When migrating from direct LLM usage to agent pattern:

### Before (Direct LLM in Service)
```typescript
class SomeService {
  private llm = new ChatGoogleGenerativeAI({...});
  
  async processMessage(message: string) {
    const prompt = this.buildPrompt(message);
    const response = await this.llm.invoke(prompt);
    return response.content;
  }
}
```

### After (Using Agent)
```typescript
class SomeService {
  async processMessage(message: string) {
    const result = await someAgent.invoke({
      message: message
    });
    return result.response;
  }
}
```

## Benefits

1. **Testability**: Services can be unit tested with mocked agents
2. **Maintainability**: Prompt changes don't affect service logic
3. **Reusability**: Agents can be shared across multiple services
4. **Consistency**: All LLM interactions follow the same pattern
5. **Debugging**: Easier to trace and debug AI behaviors

## Configuration

### Environment Variables
- `GOOGLE_API_KEY`: For Gemini models
- `OPENAI_API_KEY`: For OpenAI models (if used)
- `SMS_MAX_LENGTH`: Maximum SMS message length (default: 1600)

### Model Selection
Different agents use different models based on requirements:
- **Fast responses**: Gemini 2.0 Flash
- **Complex reasoning**: GPT-4 or similar
- **Cost optimization**: Smaller models for simple tasks

## Testing Strategy

### Unit Tests
- Mock agent responses
- Test service logic independently
- Verify error handling

### Integration Tests
- Test with real agents (requires API keys)
- Verify end-to-end flows
- Test context management

## Future Enhancements

### Planned Agent Capabilities
- **Workout Updates**: Modify workouts based on feedback
- **Preference Management**: Update user preferences via conversation
- **Memory System**: Long-term conversation memory
- **Progress Tracking**: Analyze and track fitness progress
- **Notification Control**: Manage notification preferences

### Agent Composition
Future agents may compose multiple sub-agents:
```typescript
const complexAgent = new SequentialChain({
  chains: [
    contextAgent,
    analysisAgent,
    responseAgent
  ]
});
```

## Best Practices

1. **Keep Agents Focused**: Each agent should have a single, clear purpose
2. **Document Prompts**: Include comments explaining prompt design decisions
3. **Handle Errors Gracefully**: Always provide fallback responses
4. **Monitor Token Usage**: Track and optimize token consumption
5. **Version Prompts**: Keep track of prompt changes over time
6. **Test Thoroughly**: Include both unit and integration tests

## Related Documentation

- [Chat Agent Migration Checklist](./_claude_docs/CHAT_AGENT_MIGRATION_CHECKLIST.md)
- [Phase Summaries](./_claude_docs/PHASE_*_SUMMARY.md)
- [CLAUDE.md](./CLAUDE.md) - Project overview and guidelines