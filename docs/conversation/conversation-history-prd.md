# Product Requirements Document: AI Trainer Conversation History

## 1. Overview of Current System

### Current SMS Message Handling
GymText currently processes SMS messages through the following flow:

1. **Inbound Messages**: Users send SMS messages to a Twilio phone number
2. **Webhook Processing**: Twilio forwards messages to `/api/sms/route.ts` endpoint
3. **Message Handling**: The system processes messages using the chat service (`/src/server/services/chat.ts`)
4. **AI Processing**: Messages are processed by AI agents to generate responses
5. **Response Delivery**: Generated responses are sent back via Twilio SMS

### Current Limitations
- Messages are processed in isolation without conversation context
- No persistence of conversation history beyond immediate session
- Limited ability to reference previous interactions
- No mechanism for trainers to review past conversations
- Inability to maintain context across multiple sessions

## 2. Problem Statement

The current system lacks the ability to maintain and leverage conversation history, resulting in several key issues:

1. **Loss of Context**: Each message is treated as an isolated interaction, preventing the AI from understanding the full conversation flow
2. **No Learning**: The system cannot learn from past interactions or user preferences expressed in previous conversations
3. **Trainer Blindness**: Human trainers have no visibility into client conversations for quality assurance or intervention
4. **Compliance Issues**: No audit trail for conversations that may contain health-related information
5. **Missed Insights**: Unable to analyze conversation patterns to improve the service

## 3. Proposed Solution

### Solution Overview
Implement a comprehensive conversation history system that:

1. **Stores all SMS conversations** in a structured format in the database
2. **Maintains conversation threads** to group related messages
3. **Provides conversation summaries** for quick context understanding
4. **Enables trainer access** to review and understand client interactions
5. **Supports AI context awareness** by providing relevant conversation history

### Key Components
1. **Conversation Storage Layer**: Database schema for storing messages and metadata
2. **Conversation Threading**: Logic to group messages into coherent conversations
3. **Summarization Service**: AI-powered service to generate conversation summaries
4. **Context Retrieval**: System to fetch relevant history for AI responses
5. **Trainer Dashboard**: Interface for trainers to review conversations

## 4. Functional Requirements - Conversation Storage

### 4.1 Message Storage
- **FR-CS-001**: Store all inbound SMS messages with full content and metadata
- **FR-CS-002**: Store all outbound SMS responses with full content and metadata
- **FR-CS-003**: Capture timestamp, phone numbers, and message direction
- **FR-CS-004**: Link messages to user accounts in the database

### 4.2 Conversation Threading
- **FR-CS-005**: Group messages into conversations based on time proximity (e.g., messages within 30 minutes)
- **FR-CS-006**: Support manual conversation splitting/merging
- **FR-CS-007**: Maintain conversation state (active, inactive, archived)
- **FR-CS-008**: Track conversation topics and tags

### 4.3 Data Retention
- **FR-CS-009**: Implement configurable retention policies
- **FR-CS-010**: Support data export for compliance
- **FR-CS-011**: Enable user-requested data deletion
- **FR-CS-012**: Archive old conversations to cold storage

## 5. Functional Requirements - Conversation Summarization

### 5.1 Automatic Summarization
- **FR-SUM-001**: Generate automatic summaries for conversations exceeding 5 messages
- **FR-SUM-002**: Update summaries as conversations progress
- **FR-SUM-003**: Extract key topics, decisions, and action items
- **FR-SUM-004**: Identify user goals and preferences mentioned

### 5.2 Summary Types
- **FR-SUM-005**: Create brief summaries (1-2 sentences) for quick scanning
- **FR-SUM-006**: Generate detailed summaries with key points
- **FR-SUM-007**: Extract fitness-specific information (exercises mentioned, goals, limitations)
- **FR-SUM-008**: Highlight any concerns or issues raised

### 5.3 Context Integration
- **FR-SUM-009**: Make summaries available to AI agents during message processing
- **FR-SUM-010**: Include relevant conversation history in AI prompts
- **FR-SUM-011**: Support filtering summaries by date range and topic
- **FR-SUM-012**: Enable summary search functionality

## 6. Technical Requirements

### 6.1 Database Schema

```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMPTZ NOT NULL,
    last_message_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    summary TEXT,
    summary_updated_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
    content TEXT NOT NULL,
    phone_from VARCHAR(20) NOT NULL,
    phone_to VARCHAR(20) NOT NULL,
    twilio_message_sid VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation topics table
CREATE TABLE conversation_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    topic VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversation_topics_conversation_id ON conversation_topics(conversation_id);
```

### 6.2 API Endpoints

```typescript
// Get conversation history
GET /api/conversations/:userId
Query params: limit, offset, startDate, endDate

// Get specific conversation
GET /api/conversations/:conversationId

// Get conversation summary
GET /api/conversations/:conversationId/summary

// Update conversation (manual actions)
PATCH /api/conversations/:conversationId

// Search conversations
POST /api/conversations/search
Body: { query, filters, limit, offset }
```

### 6.3 Integration Points

#### Phase 1 Integration (COMPLETED)
1. **SMS Handler Update**: ✅ Modified `/api/sms/route.ts` to store messages
2. **Database Layer**: ✅ Conversation storage service implemented
3. **Circuit Breaker**: ✅ Non-blocking message storage with fallback

#### Phase 2 Integration (IN PROGRESS)
1. **Chat Service Enhancement**: Update `/src/server/services/chat.ts` to:
   - Retrieve conversation context before processing
   - Build contextual prompts with message history
   - Manage token limits for context inclusion
   
2. **AI Agent Integration**: Modify agents to:
   - Accept `ConversationContext` parameter
   - Include context in LangChain message history
   - Handle context-aware response generation
   
3. **Context Service**: New service for:
   - Efficient message retrieval with caching
   - Dynamic context window management
   - Summary generation and updates
   
4. **Performance Optimization**:
   - Redis caching for formatted contexts
   - Lazy loading of conversation history
   - Background summary updates

### 6.4 Performance Requirements

- **Message storage**: < 100ms latency
- **Summary generation**: < 5 seconds for conversations up to 100 messages
- **Context retrieval**: < 200ms for fetching relevant history
- **Search operations**: < 500ms for keyword searches

## 7. Success Metrics

### 7.1 Technical Metrics
- **Storage Success Rate**: > 99.9% of messages successfully stored
- **Summary Coverage**: > 95% of eligible conversations have summaries
- **Query Performance**: 95th percentile query time < 500ms
- **System Uptime**: > 99.5% availability

### 7.2 Business Metrics
- **Context Utilization**: > 80% of AI responses use conversation context
- **Trainer Efficiency**: 50% reduction in time to understand client situation
- **User Satisfaction**: 20% improvement in conversation quality scores
- **Support Tickets**: 30% reduction in context-related issues

### 7.3 Usage Metrics
- **Active Conversations**: Track daily/weekly/monthly active conversations
- **Message Volume**: Monitor message count trends
- **Summary Views**: Track how often summaries are accessed
- **Search Usage**: Monitor search query patterns

## 8. Phase 2: Conversation Threading Implementation

### 8.1 Overview
Phase 2 focuses on transforming the AI's single-prompt responses into contextually aware, threaded conversations. This phase will enable the AI to maintain conversation continuity by including relevant message history in each interaction.

### 8.2 Design Decisions

#### 8.2.1 Context Inclusion Method
**Decision: Hybrid Approach - System Messages + Conversation Summary**
- **System Message**: Include a conversation summary and key context points as a system message
- **Message History**: Include the last 3-5 message exchanges as assistant/user message pairs
- **Rationale**: This provides both high-level context and recent conversation flow without overwhelming the token limit

#### 8.2.2 Prompt vs Message History Approach

**Analysis of Options:**

1. **Include as Part of Prompt (String Concatenation)**
   - ✅ Pros: Simple implementation, full control over formatting
   - ❌ Cons: Less semantic structure, harder for LLM to distinguish context
   - Use Case: Quick summaries and metadata

2. **Include as Message History (Structured Messages)**
   - ✅ Pros: LLM understands conversation flow, maintains role separation
   - ❌ Cons: More complex implementation, potential token overhead
   - Use Case: Recent message exchanges

**Decision: Combined Approach**
```typescript
// System message for context and summary
messages = [
  {
    role: "system",
    content: `Context: ${conversationSummary}\nUser Profile: ${userProfile}`
  },
  // Previous exchanges as message history
  ...previousMessages.map(msg => ({
    role: msg.direction === 'inbound' ? 'user' : 'assistant',
    content: msg.content
  })),
  // Current message
  {
    role: "user", 
    content: currentMessage
  }
]
```

This approach:
- Maintains conversation structure for the LLM
- Provides high-level context without cluttering message flow
- Enables natural continuation of multi-turn conversations

#### 8.2.3 Message History Format
```typescript
interface ConversationContext {
  summary?: string;                    // Brief summary of conversation
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userProfile: {
    fitnessGoals?: string;
    recentTopics?: string[];
    preferences?: Record<string, any>;
  };
  conversationMetadata: {
    startTime: Date;
    messageCount: number;
    lastInteractionTime: Date;
  };
}
```

### 8.3 Functional Requirements - Phase 2

#### 8.3.1 Context Retrieval
- **FR-P2-001**: Retrieve last N messages from current conversation (configurable, default 5)
- **FR-P2-002**: Fetch conversation summary if available
- **FR-P2-003**: Include user's fitness profile and recent workout history
- **FR-P2-004**: Identify conversation gaps (>30 min) to determine context relevance

#### 8.3.2 Prompt Construction
- **FR-P2-005**: Build structured prompts that include conversation context
- **FR-P2-006**: Implement token counting to ensure context fits within limits
- **FR-P2-007**: Prioritize recent messages over older ones when space is limited
- **FR-P2-008**: Include conversation continuity hints (e.g., "Continuing from our earlier discussion about...")

#### 8.3.3 Context Management
- **FR-P2-009**: Implement sliding window for message history
- **FR-P2-010**: Support context reset on new conversation topics
- **FR-P2-011**: Handle context overflow gracefully
- **FR-P2-012**: Cache formatted contexts for performance

### 8.4 Technical Implementation

#### 8.4.1 Chat Service Enhancement
```typescript
// Enhanced chat service with context
interface ChatServiceEnhancement {
  async processMessageWithContext(
    userId: string,
    message: string,
    phoneNumber: string
  ): Promise<string> {
    // 1. Retrieve conversation context
    const context = await this.getConversationContext(userId);
    
    // 2. Build prompt with context
    const prompt = this.buildContextualPrompt(message, context);
    
    // 3. Process with AI
    const response = await this.aiAgent.process(prompt);
    
    // 4. Store response in conversation
    await this.storeMessage(userId, response);
    
    return response;
  }
}
```

#### 8.4.2 Prompt Template Structure
```typescript
const CONTEXTUAL_PROMPT_TEMPLATE = `
You are a personal fitness AI trainer continuing a conversation with a user.

## Conversation Summary
{summary}

## Recent Messages
{recentMessages}

## User Profile
- Fitness Goals: {fitnessGoals}
- Recent Topics: {recentTopics}

## Current Message
User: {currentMessage}

Please respond naturally, maintaining conversation continuity and referencing previous context when relevant.
`;
```

#### 8.4.3 Context Retrieval Service
```typescript
class ConversationContextService {
  async getContext(userId: string): Promise<ConversationContext> {
    // Get active conversation
    const conversation = await this.getActiveConversation(userId);
    
    // Fetch recent messages
    const messages = await this.getRecentMessages(
      conversation.id, 
      this.config.messageHistoryLimit
    );
    
    // Get or generate summary
    const summary = conversation.summary || 
      await this.generateQuickSummary(messages);
    
    // Compile user profile context
    const userProfile = await this.getUserProfile(userId);
    
    return {
      summary,
      recentMessages: messages,
      userProfile,
      conversationMetadata: {
        startTime: conversation.started_at,
        messageCount: conversation.message_count,
        lastInteractionTime: conversation.last_message_at
      }
    };
  }
}
```

### 8.5 Configuration Options

```typescript
interface Phase2Config {
  // Message history settings
  messageHistoryLimit: number;        // Default: 5
  includeSystemMessages: boolean;     // Default: true
  
  // Token management
  maxContextTokens: number;          // Default: 1000
  reserveTokensForResponse: number;  // Default: 1500
  
  // Context behavior
  conversationGapMinutes: number;    // Default: 30
  contextResetKeywords: string[];    // ["start over", "new topic", etc.]
  
  // Performance
  enableContextCaching: boolean;     // Default: true
  contextCacheTTL: number;          // Default: 300 seconds
}
```

### 8.6 Success Criteria for Phase 2

1. **Conversation Continuity**: 90% of responses appropriately reference previous context
2. **Response Relevance**: No degradation in response quality vs. single-prompt
3. **Performance**: Context retrieval adds <200ms to response time
4. **Token Efficiency**: Context uses <40% of available tokens
5. **User Satisfaction**: Positive feedback on conversation flow

### 8.7 Testing Strategy

1. **Unit Tests**: Context retrieval, prompt building, token counting
2. **Integration Tests**: End-to-end conversation flow with context
3. **Performance Tests**: Load testing with concurrent conversations
4. **User Acceptance**: Beta test with subset of users

### 8.8 Rollout Plan

1. **Week 1**: Implement context retrieval and storage
2. **Week 2**: Build prompt construction system
3. **Week 3**: Integrate with existing chat service
4. **Week 4**: Testing and optimization
5. **Week 5**: Gradual rollout (10% → 50% → 100%)

## 9. Timeline and Phases

### Phase 1: Foundation (COMPLETED)
- ✅ Implement database schema and migrations
- ✅ Create basic message storage functionality
- ✅ Update SMS handler to store messages
- ✅ Build conversation threading logic

### Phase 2: Conversation Threading & Context (Current Phase)
- Implement conversation context retrieval for AI agents
- Add previous messages/summaries to LLM prompts
- Create context window management system
- Optimize prompt construction for threaded conversations

### Phase 3: Summarization & Intelligence (Weeks 3-4)
- Implement conversation summarization service
- Create intelligent context selection algorithms
- Add conversation continuity detection
- Build context-aware response generation

### Phase 4: Advanced Features (Weeks 5-6)
- Create API endpoints for conversation access
- Implement semantic search using vector embeddings
- Add advanced summarization capabilities
- Build conversation analytics

### Phase 5: UI & Deployment (Weeks 7-8)
- Create trainer dashboard
- Performance optimization
- Comprehensive testing
- Gradual rollout to production

### Future Enhancements
- Machine learning models for better conversation understanding
- Automated conversation insights and recommendations
- Integration with CRM systems
- Advanced analytics and reporting dashboard
- Multi-language support for conversations

## 9. Security and Compliance

### 9.1 Data Security
- Encrypt sensitive message content at rest
- Implement access controls for conversation data
- Audit log all data access
- Regular security assessments

### 9.2 Privacy Compliance
- GDPR compliance for EU users
- HIPAA considerations for health information
- User consent for data storage
- Clear data retention and deletion policies

### 9.3 Access Control
- Role-based access for trainers
- User access to own conversations only
- Admin access for support and compliance
- API authentication and rate limiting

## 10. Phase 2 Summary: From Storage to Intelligence

### 10.1 What Phase 1 Delivered
- ✅ Persistent storage of all SMS conversations
- ✅ Basic conversation threading and grouping
- ✅ Database schema and infrastructure
- ✅ Non-blocking message storage with circuit breaker

### 10.2 What Phase 2 Adds
Phase 2 transforms the stored conversations into actionable context for the AI:

1. **Contextual Awareness**: The AI will understand and reference previous messages
2. **Conversation Threading**: Multi-turn conversations with maintained context
3. **Intelligent Prompting**: Hybrid approach using both system messages and message history
4. **Performance Optimization**: Caching and token management for efficient context inclusion

### 10.3 Key Technical Changes
- **Chat Service**: Enhanced to retrieve and include conversation context
- **AI Agents**: Modified to accept and utilize conversation history
- **New Services**: ConversationContextService for efficient context management
- **Prompt Engineering**: Structured prompts that maintain conversation flow

### 10.4 Expected Outcomes
- Users experience natural, flowing conversations instead of isolated interactions
- AI responses are more personalized and contextually relevant
- Reduced repetition and improved conversation quality
- Foundation for future features like proactive follow-ups and insights