# RFC: Conversation Threading Implementation (Phase 2)

**RFC Status**: Draft  
**Authors**: GymText Engineering Team  
**Created**: 2025-01-10  
**Target Release**: v2.1.0  

## 1. Executive Summary

This RFC proposes the implementation of conversation threading for GymText's AI trainer, building upon the Phase 1 conversation storage infrastructure. The goal is to transform single-prompt AI responses into contextually aware, multi-turn conversations by including relevant message history in each interaction.

### 1.1 Key Changes
- Enhanced chat service to retrieve and include conversation context
- New ConversationContextService for efficient context management
- Modified AI agents to accept and utilize conversation history
- Hybrid prompting approach using system messages and message history

### 1.2 Expected Impact
- Improved conversation continuity and user experience
- More personalized and contextually relevant AI responses
- Foundation for advanced features like proactive follow-ups

## 2. Background and Motivation

### 2.1 Current State
- Phase 1 successfully implemented conversation storage
- All SMS messages are persisted in the database
- Conversations are grouped by time proximity
- However, AI responses remain single-prompt without context

### 2.2 Problem
- Users must repeat information across messages
- AI cannot reference previous discussions
- Conversations feel disconnected and robotic
- Lost opportunities for personalization

### 2.3 Solution
Implement a conversation threading system that:
1. Retrieves relevant conversation history
2. Includes context in AI prompts
3. Maintains token efficiency
4. Preserves response quality

## 3. Detailed Design

### 3.1 Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   SMS Handler   │────▶│   Enhanced Chat      │────▶│    AI Agents    │
│  (/api/sms)     │     │     Service          │     │  (LangChain)    │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                │                              ▲
                                ▼                              │
                        ┌──────────────────────┐               │
                        │ ConversationContext  │               │
                        │      Service         │───────────────┘
                        └──────────────────────┘
                                │
                                ▼
                        ┌──────────────────────┐
                        │   Database Layer     │
                        │  (Conversations)     │
                        └──────────────────────┘
```

### 3.2 Core Components

#### 3.2.1 ConversationContextService

**Purpose**: Centralized service for retrieving and formatting conversation context

**Responsibilities**:
- Fetch recent messages from active conversations
- Generate or retrieve conversation summaries
- Format context for AI consumption
- Manage context caching
- Handle token limit constraints

**Location**: `/src/server/services/conversation-context.ts`

#### 3.2.2 Enhanced Chat Service

**Purpose**: Modified chat service that incorporates conversation context

**Changes**:
- Add context retrieval before message processing
- Build contextual prompts with message history
- Pass context to AI agents
- Maintain backward compatibility

**Location**: `/src/server/services/chat.ts`

#### 3.2.3 AI Agent Modifications

**Purpose**: Enable agents to utilize conversation context

**Changes**:
- Accept ConversationContext parameter
- Include context in LangChain message construction
- Maintain conversation flow in responses

**Affected Files**:
- `/src/server/agents/orchestrator.ts`
- `/src/server/agents/workout-designer.ts`
- `/src/server/agents/exercise-selector.ts`

### 3.3 Data Models

#### 3.3.1 ConversationContext Interface

```typescript
interface ConversationContext {
  // Conversation summary for high-level context
  summary?: string;
  
  // Recent message exchanges
  recentMessages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  
  // User profile information
  userProfile: {
    userId: string;
    fitnessGoals?: string;
    skillLevel?: string;
    recentTopics?: string[];
    preferences?: Record<string, any>;
  };
  
  // Metadata about the conversation
  conversationMetadata: {
    conversationId: string;
    startTime: Date;
    messageCount: number;
    lastInteractionTime: Date;
    isNewConversation: boolean;
  };
}
```

#### 3.3.2 Context Configuration

```typescript
interface ContextConfig {
  // Message history settings
  messageHistoryLimit: number;           // Default: 5
  includeSystemMessages: boolean;        // Default: false
  
  // Token management
  maxContextTokens: number;             // Default: 1000
  reserveTokensForResponse: number;     // Default: 1500
  tokenCountingModel: string;           // Default: 'gpt-4'
  
  // Context behavior
  conversationGapMinutes: number;       // Default: 30
  contextResetKeywords: string[];       // ["start over", "new topic", "reset"]
  
  // Performance settings
  enableContextCaching: boolean;        // Default: true
  contextCacheTTL: number;             // Default: 300 (5 minutes)
  
  // Summary settings
  autoGenerateSummary: boolean;        // Default: true
  summaryMessageThreshold: number;     // Default: 10
}
```

### 3.4 Implementation Details

#### 3.4.1 Context Retrieval Flow

```typescript
// Pseudo-code for context retrieval
async function getConversationContext(userId: string): Promise<ConversationContext> {
  // 1. Check cache first
  const cached = await cache.get(`context:${userId}`);
  if (cached && !isExpired(cached)) {
    return cached;
  }
  
  // 2. Get active conversation
  const conversation = await db.getActiveConversation(userId);
  if (!conversation) {
    return createNewConversationContext(userId);
  }
  
  // 3. Check for conversation gap
  const timeSinceLastMessage = Date.now() - conversation.lastMessageAt;
  if (timeSinceLastMessage > config.conversationGapMinutes * 60 * 1000) {
    return createNewConversationContext(userId);
  }
  
  // 4. Fetch recent messages
  const messages = await db.getRecentMessages(
    conversation.id,
    config.messageHistoryLimit
  );
  
  // 5. Get or generate summary
  const summary = conversation.summary || 
    (messages.length > config.summaryMessageThreshold 
      ? await generateSummary(messages)
      : undefined);
  
  // 6. Build context object
  const context = buildContext(conversation, messages, summary, userId);
  
  // 7. Cache and return
  await cache.set(`context:${userId}`, context, config.contextCacheTTL);
  return context;
}
```

#### 3.4.2 Prompt Construction Strategy

```typescript
// Hybrid approach: System message + Message history
function buildPromptMessages(
  currentMessage: string,
  context: ConversationContext
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  
  // 1. System message with context
  const systemContent = buildSystemMessage(context);
  if (systemContent) {
    messages.push({
      role: 'system',
      content: systemContent
    });
  }
  
  // 2. Recent message history
  for (const msg of context.recentMessages) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  }
  
  // 3. Current user message
  messages.push({
    role: 'user',
    content: currentMessage
  });
  
  return messages;
}

function buildSystemMessage(context: ConversationContext): string {
  const parts: string[] = [];
  
  // Base system prompt
  parts.push("You are a personal fitness AI trainer.");
  
  // Add conversation context if not new
  if (!context.conversationMetadata.isNewConversation) {
    parts.push("You are continuing an ongoing conversation.");
    
    if (context.summary) {
      parts.push(`\nConversation Summary: ${context.summary}`);
    }
  }
  
  // Add user profile
  if (context.userProfile.fitnessGoals) {
    parts.push(`\nUser's Fitness Goals: ${context.userProfile.fitnessGoals}`);
  }
  
  if (context.userProfile.skillLevel) {
    parts.push(`User's Skill Level: ${context.userProfile.skillLevel}`);
  }
  
  return parts.join('\n');
}
```

#### 3.4.3 Token Management

```typescript
class TokenManager {
  private encoder: TiktokenEncoder;
  
  constructor(private config: ContextConfig) {
    this.encoder = getEncoderForModel(config.tokenCountingModel);
  }
  
  async optimizeContext(
    messages: ChatMessage[],
    maxTokens: number
  ): Promise<ChatMessage[]> {
    // Count current tokens
    let totalTokens = this.countTokens(messages);
    
    // If within limit, return as-is
    if (totalTokens <= maxTokens) {
      return messages;
    }
    
    // Optimization strategies in order:
    // 1. Remove oldest messages (keep system and latest)
    // 2. Truncate long messages
    // 3. Summarize middle messages
    
    return this.applyOptimizationStrategies(messages, maxTokens);
  }
  
  private countTokens(messages: ChatMessage[]): number {
    return messages.reduce((total, msg) => {
      return total + this.encoder.encode(msg.content).length;
    }, 0);
  }
}
```

### 3.5 Database Queries

#### 3.5.1 Get Active Conversation
```sql
-- Get the most recent active conversation for a user
SELECT c.*, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.user_id = $1
  AND c.status = 'active'
  AND c.last_message_at > NOW() - INTERVAL '30 minutes'
GROUP BY c.id
ORDER BY c.last_message_at DESC
LIMIT 1;
```

#### 3.5.2 Get Recent Messages
```sql
-- Get recent messages from a conversation
SELECT 
  id,
  content,
  direction,
  created_at as timestamp
FROM messages
WHERE conversation_id = $1
ORDER BY created_at DESC
LIMIT $2;
```

#### 3.5.3 Update Conversation Summary
```sql
-- Update conversation summary
UPDATE conversations
SET 
  summary = $2,
  summary_updated_at = NOW(),
  updated_at = NOW()
WHERE id = $1;
```

## 4. API Changes

### 4.1 Internal API Changes

No external API changes are required. All modifications are internal to the message processing flow.

### 4.2 Configuration API

New environment variables:
```bash
# Context configuration
CONTEXT_MESSAGE_HISTORY_LIMIT=5
CONTEXT_MAX_TOKENS=1000
CONTEXT_CONVERSATION_GAP_MINUTES=30
CONTEXT_ENABLE_CACHING=true
CONTEXT_CACHE_TTL=300
```

## 5. Migration Strategy

### 5.1 Database Migrations

No new database tables required. Optional indexes for performance:

```sql
-- Optimize conversation queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_status_last_message 
ON conversations(user_id, status, last_message_at DESC);

-- Optimize message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);
```

### 5.2 Code Migration

1. **Week 1**: Implement ConversationContextService
2. **Week 2**: Enhance Chat Service with context retrieval
3. **Week 3**: Modify AI agents to accept context
4. **Week 4**: Testing and optimization

### 5.3 Feature Flags

```typescript
const FEATURE_FLAGS = {
  ENABLE_CONVERSATION_CONTEXT: process.env.ENABLE_CONVERSATION_CONTEXT === 'true',
  CONTEXT_ROLLOUT_PERCENTAGE: parseInt(process.env.CONTEXT_ROLLOUT_PERCENTAGE || '0'),
};

// Gradual rollout logic
function shouldUseContext(userId: string): boolean {
  if (!FEATURE_FLAGS.ENABLE_CONVERSATION_CONTEXT) {
    return false;
  }
  
  // Use consistent hashing for user rollout
  const userHash = hashUserId(userId);
  return userHash % 100 < FEATURE_FLAGS.CONTEXT_ROLLOUT_PERCENTAGE;
}
```

## 6. Testing Strategy

### 6.1 Unit Tests

```typescript
// Test examples
describe('ConversationContextService', () => {
  it('should retrieve recent messages within time window');
  it('should create new context after conversation gap');
  it('should handle missing conversations gracefully');
  it('should respect message history limit');
  it('should cache contexts efficiently');
});

describe('TokenManager', () => {
  it('should count tokens accurately');
  it('should optimize context within token limit');
  it('should preserve system and recent messages');
});
```

### 6.2 Integration Tests

```typescript
describe('Chat Service with Context', () => {
  it('should include context in AI prompts');
  it('should handle context retrieval failures gracefully');
  it('should maintain conversation flow');
  it('should reset context on trigger keywords');
});
```

### 6.3 Performance Tests

- Context retrieval latency: < 200ms at p95
- Token counting performance: < 50ms for typical context
- Cache hit rate: > 80% for active conversations
- Memory usage: < 100MB for context cache

### 6.4 User Acceptance Criteria

1. Conversations feel natural and connected
2. AI references previous messages appropriately
3. No degradation in response time
4. Context resets work as expected

## 7. Rollout Plan

### 7.1 Phase 2.1: Internal Testing (Week 1)
- Deploy to staging environment
- Internal team testing with real conversations
- Performance baseline establishment

### 7.2 Phase 2.2: Beta Testing (Week 2)
- 10% rollout to active users
- Monitor metrics and gather feedback
- Fix critical issues

### 7.3 Phase 2.3: Gradual Rollout (Week 3-4)
- 25% → 50% → 100% rollout
- A/B testing for conversation quality
- Performance monitoring and optimization

### 7.4 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context Retrieval Latency | < 200ms p95 | APM monitoring |
| Conversation Continuity | > 90% | Manual review sampling |
| User Satisfaction | +20% | Post-conversation surveys |
| Token Efficiency | < 40% of limit | Token counting logs |
| Cache Hit Rate | > 80% | Redis metrics |

## 8. Security Considerations

### 8.1 Data Access
- Context service respects existing user permissions
- No cross-user data leakage
- Audit logging for context access

### 8.2 Performance
- Rate limiting on context retrieval
- Circuit breaker for database failures
- Graceful degradation to single-prompt mode

### 8.3 Privacy
- No changes to data retention policies
- Context cache follows same TTL as messages
- User data deletion includes context cache

## 9. Future Enhancements

### 9.1 Phase 3 Opportunities
- Conversation summarization service
- Semantic search for relevant context
- Proactive follow-up suggestions
- Multi-modal context (images, voice)

### 9.2 Long-term Vision
- ML-powered context selection
- Personalized conversation styles
- Cross-channel context (SMS + Web)
- Conversation insights dashboard

## 10. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01-10 | Hybrid prompt approach | Balances structure with flexibility |
| 2025-01-10 | 5-message default history | Optimal for token usage and context |
| 2025-01-10 | Redis caching | Fast, reliable, already in infrastructure |
| 2025-01-10 | Gradual rollout | Minimize risk, gather feedback |

## 11. Open Questions

1. Should we implement conversation summary generation in Phase 2 or defer to Phase 3?
2. What's the optimal strategy for handling very long conversations (>100 messages)?
3. Should context include workout completion data from other tables?
4. How do we handle context for users with multiple phone numbers?

## 12. References

- [Phase 1 Implementation](./conversation-history-prd.md)
- [LangChain Message History](https://python.langchain.com/docs/modules/memory/)
- [OpenAI Token Counting](https://github.com/openai/tiktoken)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)