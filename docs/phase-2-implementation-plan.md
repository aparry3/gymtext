# Phase 2 Implementation Plan: Conversation Memory & Context

## Executive Summary

Phase 2 transforms GymText from a stateless SMS responder into an intelligent conversational AI with memory. The system will retrieve relevant conversation history and include it in AI prompts, enabling contextually aware responses that reference previous interactions naturally.

## Core Design Decision: Hybrid Context Approach

After analyzing the options, we will implement a **hybrid approach** that combines:

1. **System Messages**: Conversation summaries and user profile context
2. **Message History**: Last 3-5 message exchanges as structured LangChain messages
3. **Smart Token Management**: Dynamic context window sizing based on available tokens

This approach provides both high-level context and recent conversation flow without overwhelming token limits.

## Architecture Overview

### 1. New Services & Components

#### 1.1 ConversationContextService
```typescript
// Location: /src/server/services/conversation-context.ts
interface ConversationContextService {
  // Retrieves formatted context for AI consumption
  getContext(userId: string, config?: ContextConfig): Promise<ConversationContext>;
  
  // Manages context caching
  getCachedContext(userId: string): Promise<ConversationContext | null>;
  setCachedContext(userId: string, context: ConversationContext): Promise<void>;
  
  // Token management
  calculateTokenUsage(context: ConversationContext): number;
  optimizeContextForTokenLimit(context: ConversationContext, limit: number): ConversationContext;
}
```

#### 1.2 PromptBuilder Service
```typescript
// Location: /src/server/services/prompt-builder.ts
interface PromptBuilder {
  // Constructs LangChain-compatible message arrays
  buildMessagesWithContext(
    currentMessage: string,
    context: ConversationContext,
    systemPrompt: string
  ): BaseMessage[];
  
  // Formats context into system message
  formatContextAsSystemMessage(context: ConversationContext): string;
}
```

#### 1.3 Context Configuration
```typescript
// Location: /src/shared/config/context.config.ts
interface ContextConfig {
  messageHistoryLimit: number;        // Default: 5
  includeSystemMessages: boolean;     // Default: true
  maxContextTokens: number;          // Default: 1000
  reserveTokensForResponse: number;  // Default: 1500
  conversationGapMinutes: number;    // Default: 30
  enableCaching: boolean;            // Default: true
  cacheTTLSeconds: number;          // Default: 300
}
```

### 2. Data Schemas & Types

#### 2.1 Conversation Context Type
```typescript
// Location: /src/shared/types/conversation.ts
interface ConversationContext {
  conversationId: string;
  summary?: string;
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userProfile: {
    fitnessGoals?: string;
    currentProgram?: string;
    recentTopics?: string[];
    preferences?: Record<string, any>;
  };
  metadata: {
    startTime: Date;
    messageCount: number;
    lastInteractionTime: Date;
    isNewConversation: boolean;
  };
}
```

#### 2.2 Database Queries
```typescript
// Location: /src/server/db/queries/conversation-context.ts
interface ConversationContextQueries {
  getActiveConversation(userId: string): Promise<Conversation | null>;
  getRecentMessages(conversationId: string, limit: number): Promise<Message[]>;
  getUserFitnessProfile(userId: string): Promise<FitnessProfile | null>;
  getRecentWorkouts(userId: string, limit: number): Promise<Workout[]>;
}
```

### 3. Integration Points

#### 3.1 Chat Service Enhancement
```typescript
// Location: /src/server/services/chat.ts
// BEFORE (current implementation)
async processMessage(userId: string, message: string): Promise<string> {
  const agent = new WorkoutAgent();
  return agent.process(message);
}

// AFTER (with context)
async processMessage(userId: string, message: string): Promise<string> {
  // 1. Get conversation context
  const context = await this.contextService.getContext(userId);
  
  // 2. Build messages with context
  const messages = this.promptBuilder.buildMessagesWithContext(
    message,
    context,
    this.systemPrompt
  );
  
  // 3. Process with context-aware agent
  const agent = new WorkoutAgent();
  return agent.processWithContext(messages);
}
```

#### 3.2 AI Agent Modifications
```typescript
// Location: /src/server/agents/base-agent.ts
abstract class BaseAgent {
  // New method for context-aware processing
  async processWithContext(messages: BaseMessage[]): Promise<string> {
    const chain = this.buildChain();
    const response = await chain.invoke({
      messages: messages
    });
    return response.content;
  }
}
```

### 4. Implementation Details

#### 4.1 Message History Construction
```typescript
// Example of how messages will be formatted
const messages: BaseMessage[] = [
  // System message with context
  new SystemMessage({
    content: `You are a personal fitness AI trainer.
    
Conversation Summary: User has been working on strength training for 2 weeks. 
Recently discussed lower back pain during deadlifts.

User Profile:
- Goals: Build muscle, improve form
- Current Program: 3-day split
- Equipment: Home gym with barbell`
  }),
  
  // Previous messages
  new HumanMessage({ content: "My lower back hurts after deadlifts" }),
  new AIMessage({ content: "Let's review your deadlift form..." }),
  new HumanMessage({ content: "I think I'm rounding my back" }),
  new AIMessage({ content: "You're right to be concerned about rounding..." }),
  
  // Current message
  new HumanMessage({ content: "Should I switch to sumo deadlifts?" })
];
```

#### 4.2 Token Management Strategy
```typescript
class TokenManager {
  private encoder: Tiktoken;
  
  calculateTokens(messages: BaseMessage[]): number {
    // Use tiktoken to count tokens accurately
    return messages.reduce((total, msg) => {
      return total + this.encoder.encode(msg.content).length;
    }, 0);
  }
  
  truncateToLimit(messages: BaseMessage[], limit: number): BaseMessage[] {
    // Keep system message and current message
    // Trim historical messages from oldest to newest
    while (this.calculateTokens(messages) > limit && messages.length > 2) {
      // Remove oldest historical message
      messages.splice(1, 1);
    }
    return messages;
  }
}
```

### 5. Caching Strategy

#### 5.1 Redis Cache Structure
```typescript
// Cache key format: context:{userId}:{conversationId}
interface CachedContext {
  context: ConversationContext;
  formattedMessages: BaseMessage[];
  tokenCount: number;
  timestamp: number;
}
```

#### 5.2 Cache Implementation
```typescript
class ContextCache {
  private redis: RedisClient;
  private ttl: number = 300; // 5 minutes
  
  async get(userId: string): Promise<CachedContext | null> {
    const key = `context:${userId}:latest`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(userId: string, context: CachedContext): Promise<void> {
    const key = `context:${userId}:latest`;
    await this.redis.setex(key, this.ttl, JSON.stringify(context));
  }
}
```

## Implementation Steps

### Step 1: Create Context Service (Week 1)
1. Implement `ConversationContextService`
2. Create database queries for context retrieval
3. Add token counting utilities
4. Implement basic caching

### Step 2: Build Prompt System (Week 1-2)
1. Create `PromptBuilder` service
2. Implement message formatting logic
3. Add token optimization
4. Create context templates

### Step 3: Integrate with Chat Service (Week 2)
1. Modify `chat.ts` to use context
2. Update SMS handler integration
3. Add error handling and fallbacks
4. Implement performance monitoring

### Step 4: Update AI Agents (Week 2-3)
1. Modify base agent class
2. Update all agent implementations
3. Test context-aware responses
4. Optimize prompt engineering

### Step 5: Testing & Optimization (Week 3-4)
1. Unit tests for all new services
2. Integration tests for full flow
3. Performance testing
4. Beta user testing

## Human Tasks & Requirements

### 1. Environment Variables
Add the following to `.env`:
```bash
# Redis configuration for context caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password_here

# Context configuration
CONTEXT_MESSAGE_HISTORY_LIMIT=5
CONTEXT_MAX_TOKENS=1000
CONTEXT_CACHE_TTL=300
CONTEXT_CONVERSATION_GAP_MINUTES=30
```

### 2. Dependencies to Install
```bash
npm install redis @redis/client
npm install @dqbd/tiktoken
npm install @langchain/core
```

### 3. Database Migrations
No new migrations needed - using existing tables from Phase 1.

### 4. Redis Setup
- Install Redis locally or use Redis Cloud
- Configure connection in environment variables
- Ensure Redis is running before starting the app

### 5. Configuration Updates
Update `next.config.js` if needed for Redis connection.

### 6. Testing Requirements
- Create test conversations with multiple messages
- Prepare test scenarios for context continuity
- Set up performance monitoring

### 7. Monitoring & Logging
- Add context retrieval metrics to logging
- Monitor token usage and cache hit rates
- Track response latency changes

## Performance Considerations

### 1. Latency Targets
- Context retrieval: < 50ms (with cache)
- Context retrieval: < 200ms (without cache)
- Total additional latency: < 250ms

### 2. Optimization Strategies
- Aggressive caching of formatted contexts
- Parallel fetching of conversation data
- Lazy loading of user profile data
- Background cache warming

### 3. Scaling Considerations
- Redis cluster for high availability
- Connection pooling for database
- Horizontal scaling of context service

## Success Metrics

### 1. Technical Metrics
- Cache hit rate > 80%
- Context retrieval p95 < 200ms
- Token usage < 40% of limit
- Zero context-related errors

### 2. User Experience Metrics
- Conversation continuity score > 90%
- Reduced repetitive questions by 50%
- Improved user satisfaction ratings
- Natural conversation flow

## Rollout Strategy

### Week 1-2: Development
- Build core services
- Implement caching
- Create prompt templates

### Week 3: Testing
- Comprehensive testing
- Performance optimization
- Bug fixes

### Week 4: Gradual Rollout
- 10% of users (Day 1-2)
- 50% of users (Day 3-4)
- 100% of users (Day 5-7)

## Risk Mitigation

### 1. Performance Risks
- **Risk**: Slow context retrieval
- **Mitigation**: Aggressive caching, circuit breakers

### 2. Token Limit Risks
- **Risk**: Context exceeds token limits
- **Mitigation**: Smart truncation, priority ordering

### 3. Quality Risks
- **Risk**: Confusing context mixing
- **Mitigation**: Clear conversation boundaries, testing

## Future Enhancements

1. **Semantic Search**: Use embeddings to find relevant past conversations
2. **Proactive Follow-ups**: AI initiates check-ins based on context
3. **Multi-conversation Context**: Reference workouts from weeks ago
4. **Conversation Insights**: Analytics on conversation patterns

## Conclusion

Phase 2 transforms GymText into a truly conversational AI that remembers and learns from each interaction. By implementing a hybrid context approach with smart token management and caching, we can provide natural, flowing conversations while maintaining performance and staying within token limits.