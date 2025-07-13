# RFC: Conversation History Phase 1 - Foundation Implementation

**RFC Status**: Draft  
**Author**: AI Trainer Team  
**Created**: 2025-01-10  
**Target Implementation**: Weeks 1-2  

## 1. Executive Summary

This RFC details the implementation plan for Phase 1 of the conversation history feature, focusing on establishing the foundational infrastructure for storing and threading SMS conversations. Phase 1 will implement core database schema, message storage functionality, conversation threading logic, and necessary API integrations without yet implementing summarization or advanced features.

## 2. Goals and Non-Goals

### Goals
- Create database schema for conversations, messages, and related tables
- Implement automatic message storage for all SMS interactions
- Build conversation threading logic to group related messages
- Update existing SMS handler to integrate with new storage system
- Ensure zero downtime during deployment
- Maintain current SMS response times

### Non-Goals
- Conversation summarization (Phase 2)
- Trainer dashboard UI (Phase 3)
- Search functionality (Phase 3)
- Analytics or reporting (Phase 3)
- Data migration of historical messages (Future)

## 3. Detailed Design

### 3.1 Database Schema Implementation

#### Migration Files
Create Kysely migrations using the npm scripts:

**Migration 1: Core Tables**
```bash
npm run migrate:create -- create-conversation-tables
```
This will create a timestamped migration file in `/migrations/` containing:
- conversations table
- messages table
- Primary indexes

**Migration 2: Extended Schema**
```bash
npm run migrate:create -- add-conversation-metadata
```
This migration will add:
- conversation_topics table
- Additional indexes for performance
- Foreign key constraints

**Migration 3: Triggers and Functions**
```bash
npm run migrate:create -- add-conversation-triggers
```
This migration will implement:
- Updated_at timestamp triggers
- Conversation last_message_at auto-update
- Message count maintenance

#### Table Design Decisions

**Conversations Table**
- `id`: UUID for global uniqueness and security
- `user_id`: Links to existing users table
- `started_at`: First message timestamp
- `last_message_at`: For efficient sorting and threading
- `status`: enum('active', 'inactive', 'archived')
- `metadata`: JSONB for flexibility (workout type, user state, etc.)
- `message_count`: Denormalized for performance
- `created_at/updated_at`: Audit timestamps

**Messages Table**
- `id`: UUID primary key
- `conversation_id`: Foreign key with CASCADE delete
- `direction`: enum('inbound', 'outbound')
- `content`: TEXT for full SMS content (max 1600 chars)
- `twilio_message_sid`: For reconciliation and debugging
- `metadata`: JSONB for Twilio webhooks data
- `created_at`: Immutable timestamp

**Design Rationale**
- UUIDs prevent enumeration attacks and support distributed systems
- JSONB metadata fields provide flexibility without schema changes
- Denormalized message_count avoids expensive COUNT queries
- Separate topics table allows many-to-many relationships

### 3.2 Message Storage Implementation

#### Storage Flow
1. SMS webhook receives message at `/api/sms/route.ts`
2. New middleware intercepts before chat processing
3. Message stored with transaction guarantee
4. Conversation threading logic executes
5. Original chat flow continues unchanged
6. Response stored after generation

#### Storage Service Interface
```typescript
interface ConversationStorageService {
  storeInboundMessage(params: {
    userId: string;
    from: string;
    to: string;
    content: string;
    twilioData: TwilioWebhookData;
  }): Promise<Message>;

  storeOutboundMessage(params: {
    userId: string;
    from: string;
    to: string;
    content: string;
    twilioMessageSid?: string;
  }): Promise<Message>;

  getOrCreateConversation(userId: string): Promise<Conversation>;
}
```

#### Error Handling Strategy
- Storage failures should NOT block SMS responses
- Implement circuit breaker pattern
- Log failures to monitoring system
- Retry failed stores in background queue

### 3.3 Conversation Threading Logic

#### Threading Algorithm
```
1. Retrieve user's last conversation
2. IF no conversation exists:
   - Create new conversation
3. ELSE IF last message > 30 minutes ago:
   - Mark previous conversation as 'inactive'
   - Create new conversation
4. ELSE:
   - Add message to existing conversation
   - Update conversation.last_message_at
   - Increment conversation.message_count
```

#### Configurable Parameters
- `CONVERSATION_TIMEOUT_MINUTES`: Default 30, env variable
- `MAX_CONVERSATION_LENGTH`: Default 100 messages
- `INACTIVE_THRESHOLD_DAYS`: Default 7 days

#### State Transitions
- `active`: Currently receiving messages
- `inactive`: No messages for 30+ minutes
- `archived`: Manually archived or > 30 days old

### 3.4 SMS Handler Integration

#### Current Flow Analysis
```
/api/sms/route.ts
  ↓
validateTwilioRequest()
  ↓
chatService.processMessage()
  ↓
AI agents generate response
  ↓
twilioService.sendSMS()
```

#### Updated Flow
```
/api/sms/route.ts
  ↓
validateTwilioRequest()
  ↓
[NEW] conversationStorage.storeInboundMessage()
  ↓
chatService.processMessage()
  ↓
AI agents generate response
  ↓
[NEW] conversationStorage.storeOutboundMessage()
  ↓
twilioService.sendSMS()
```

#### Integration Points
1. Create `ConversationMiddleware` class
2. Inject into SMS route handler
3. Wrap storage calls in try-catch to prevent failures
4. Add timing metrics for performance monitoring

### 3.5 Data Access Layer

#### Repository Pattern Implementation
```
/src/server/repositories/
  ├── conversation.repository.ts
  ├── message.repository.ts
  └── base.repository.ts
```

#### Query Optimizations
- Use prepared statements for common queries
- Implement connection pooling
- Add query timeout limits
- Create composite indexes for common WHERE clauses

#### Caching Strategy
- No caching in Phase 1 (add complexity)
- Redis integration planned for Phase 2
- Focus on query optimization first

## 4. Implementation Checklist

### Database Setup
- [ ] Create migration files using `npm run migrate:create`
- [ ] Test migrations with `npm run migrate:up`
- [ ] Verify rollback with `npm run migrate:down`
- [ ] Update database types generation

### Core Services
- [ ] Implement ConversationStorageService
- [ ] Create repository classes
- [ ] Add comprehensive error handling
- [ ] Write integration tests

### SMS Handler Integration  
- [ ] Update /api/sms/route.ts
- [ ] Add storage middleware
- [ ] Implement circuit breaker
- [ ] Update error handling

### Production Preparation
- [ ] Add monitoring and alerting
- [ ] Update environment variables
- [ ] Load testing
- [ ] Deployment scripts

## 5. Testing Strategy

### Unit Tests
- Repository methods
- Threading algorithm logic
- Error handling paths
- State transitions

### Integration Tests
- Full SMS flow with storage
- Database transaction handling
- Concurrent message handling
- Failure recovery

### Performance Tests
- 1000 concurrent messages
- Large conversation handling (100+ messages)
- Database query performance
- Storage latency impact

### Test Data Requirements
- Multiple user scenarios
- Various conversation patterns
- Edge cases (empty messages, unicode)
- Timezone variations

## 6. Rollout Strategy

### Feature Flags
```typescript
const FEATURE_FLAGS = {
  ENABLE_CONVERSATION_STORAGE: process.env.ENABLE_CONVERSATION_STORAGE === 'true',
  STORAGE_FAILURE_BLOCKS_SMS: false, // Never block SMS
};
```

### Gradual Rollout Plan
1. Deploy with storage disabled
2. Enable for internal test accounts (5%)
3. Enable for beta users (20%)
4. Monitor metrics and errors
5. Full rollout (100%)

### Rollback Plan
- Feature flag to disable storage instantly
- Migration rollback scripts ready
- Previous version tagged and deployable
- Database backup before migration

## 7. Monitoring and Observability

### Key Metrics
- Message storage success rate
- Storage latency (p50, p95, p99)
- Conversation creation rate
- Database connection pool usage
- Error rates by type

### Alerts
- Storage success rate < 99%
- Storage latency > 200ms (p95)
- Database connection exhaustion
- Repeated storage failures

### Dashboards
- Real-time message flow
- Conversation statistics
- Error tracking
- Performance trends

## 8. Security Considerations

### Data Protection
- No PII in logs
- Encrypted database connections
- Prepared statements only (no SQL injection)
- Rate limiting on storage operations

### Access Control
- Service-to-service authentication
- Database user with minimal permissions
- No direct database access from handlers
- Audit logging for sensitive operations

## 9. Performance Considerations

### Expected Load
- Peak: 1000 messages/minute
- Average: 100 messages/minute
- Storage latency budget: 50ms
- No impact on SMS response time

### Optimization Strategies
- Batch inserts where possible
- Async storage operations
- Connection pooling (min: 5, max: 20)
- Index optimization based on query patterns

## 10. Future Considerations

### Phase 2 Preparation
- Design summarization service interface
- Plan vector embedding storage
- Consider caching layer needs
- API design for context retrieval

### Technical Debt
- Add comprehensive logging
- Implement message deduplication
- Add data export functionality
- Create admin tools

## 11. Open Questions

1. Should we implement soft deletes for messages?
2. How long should we retain conversation metadata after archival?
3. Should we track message delivery status from Twilio callbacks?
4. Do we need to support message editing/deletion for compliance?

## 12. Success Criteria

### Phase 1 Complete When:
- [ ] All messages are stored successfully (>99.9%)
- [ ] Conversations are threaded correctly
- [ ] No impact on SMS response times
- [ ] Zero downtime deployment
- [ ] Monitoring and alerts active
- [ ] Documentation complete

## Appendix A: Kysely Migration Examples

### Example Migration Structure
```typescript
// migrations/TIMESTAMP_create_conversation_tables.ts
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create conversations table
  await db.schema
    .createTable('conversations')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('started_at', 'timestamptz', (col) => col.notNull())
    .addColumn('last_message_at', 'timestamptz', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => 
      col.notNull().defaultTo('active')
    )
    .addColumn('message_count', 'integer', (col) => 
      col.notNull().defaultTo(0)
    )
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute()

  // Create indexes
  await db.schema
    .createIndex('idx_conversations_user_id')
    .on('conversations')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('conversations').execute()
}
```

## Appendix B: Environment Variables

### New Required Variables
```bash
# Conversation Storage Configuration
ENABLE_CONVERSATION_STORAGE=true
CONVERSATION_TIMEOUT_MINUTES=30
MAX_CONVERSATION_LENGTH=100
INACTIVE_THRESHOLD_DAYS=7

# Database Pool Configuration  
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_QUERY_TIMEOUT_MS=5000

# Monitoring
SENTRY_DSN=your-sentry-dsn
ENABLE_PERFORMANCE_MONITORING=true
```

## Appendix C: TypeScript Interfaces

### Domain Models
```typescript
interface Conversation {
  id: string;
  userId: string;
  startedAt: Date;
  lastMessageAt: Date;
  status: 'active' | 'inactive' | 'archived';
  messageCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  conversationId: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  phoneFrom: string;
  phoneTo: string;
  twilioMessageSid?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
```