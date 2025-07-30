# Daily Message Timing Implementation RFC

## 1. Executive Summary

This RFC proposes an implementation strategy for the daily message timing feature that allows users to select their preferred time to receive workout messages. The solution leverages Vercel cron jobs for scheduling, introduces timezone support in the database schema, and creates new API endpoints to handle message delivery.

## 2. Current State Analysis

### 2.1 Existing Infrastructure
- **MessageService**: `buildDailyMessage()` and `sendMessage()` functions exist
- **Database**: Users table lacks timezone and preferred time columns
- **Scheduling**: No current scheduling system for automated messages
- **Deployment**: Vercel platform with serverless functions

### 2.2 Key Gaps
- No timezone storage for users
- No preferred delivery time storage
- No scheduling mechanism
- No batch processing for message delivery

## 3. Proposed Architecture

### 3.1 High-Level Design
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Vercel Cron    │────▶│  API Endpoint    │────▶│ Message Service │
│  (Hourly)       │     │  /api/cron/      │     │                 │
└─────────────────┘     │  daily-messages  │     └─────────────────┘
                        └──────────────────┘              │
                                 │                        │
                                 ▼                        ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │ Database Query   │     │   Twilio SMS    │
                        │ (Users by hour)  │     │                 │
                        └──────────────────┘     └─────────────────┘
```

### 3.2 Database Schema Changes

```sql
-- Migration: Add timezone and preferred send hour to users table
ALTER TABLE users 
ADD COLUMN preferred_send_hour INTEGER DEFAULT 8 
CHECK (preferred_send_hour >= 0 AND preferred_send_hour <= 23);

ALTER TABLE users 
ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Los_Angeles' 
CHECK (timezone IS NOT NULL);

-- Add constraint to ensure valid IANA timezone
ALTER TABLE users ADD CONSTRAINT valid_timezone 
CHECK (timezone IN (SELECT name FROM pg_timezone_names));

-- Create index for efficient querying
CREATE INDEX idx_users_send_hour ON users(preferred_send_hour);
CREATE INDEX idx_users_timezone ON users(timezone);
```

#### Timezone Standard
The timezone column MUST contain a valid IANA Time Zone Database identifier:
- Format: `Region/City` (e.g., `America/New_York`, `Europe/London`)
- Full list: https://www.iana.org/time-zones
- PostgreSQL validation: Uses `pg_timezone_names` system view
- Library validation: Use Luxon's `IANAZone.isValidZone()` or similar

### 3.3 Implementation Options

## 4. Option 1: Hourly Cron with UTC Conversion (Recommended)

### 4.1 Overview
Run an hourly cron job that queries users based on their local time converted to UTC.

### 4.2 Implementation Details

#### Vercel Configuration (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-messages",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### API Endpoint Structure
```typescript
// src/app/api/cron/daily-messages/route.ts
export async function GET(request: Request) {
  // 1. Verify cron authentication
  // 2. Get current UTC hour
  // 3. Query users where their local time matches preferred hour
  // 4. Batch process messages
  // 5. Return success/error metrics
}
```

#### Service Layer Enhancement
```typescript
// src/server/services/dailyMessageService.ts
export class DailyMessageService {
  async processHourlyBatch(): Promise<BatchResult> {
    const currentUtcHour = new Date().getUTCHours();
    const users = await this.getUsersForHour(currentUtcHour);
    
    // Process in batches to avoid timeouts
    const results = await this.processBatch(users, BATCH_SIZE);
    return results;
  }
  
  private async getUsersForHour(utcHour: number): Promise<User[]> {
    // Complex query to find users whose local time matches
    // their preferred hour when converted from UTC
  }
}
```

### 4.3 Pros
- Simple cron configuration
- Handles all timezones globally
- Scales well with user growth
- Clear error boundaries per batch

### 4.4 Cons
- Complex timezone calculation in queries
- Potential for missed messages during DST transitions
- 1-hour granularity limitation

## 5. Option 2: Multiple Regional Cron Jobs

### 5.1 Overview
Deploy region-specific cron jobs that run at optimal times for each major timezone group.

### 5.2 Implementation Details
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-messages?region=americas",
      "schedule": "0 6-23 * * *"
    },
    {
      "path": "/api/cron/daily-messages?region=europe",
      "schedule": "0 0-17 * * *"
    },
    {
      "path": "/api/cron/daily-messages?region=asia",
      "schedule": "0 14-23,0-7 * * *"
    }
  ]
}
```

### 5.3 Pros
- More efficient database queries
- Better handling of regional patterns
- Can optimize for peak hours

### 5.4 Cons
- More complex configuration
- Harder to maintain
- Overlapping regions need deduplication

## 6. Option 3: Event-Driven with Queue (Future Enhancement)

### 6.1 Overview
Use a message queue (e.g., Vercel Queue or external service) for more precise timing.

### 6.2 Implementation Details
- Store message events in a queue
- Process queue with minute-level precision
- Better retry and error handling

### 6.3 Pros
- Minute-level precision
- Better scalability
- Robust error handling

### 6.4 Cons
- Requires additional infrastructure
- Higher complexity
- Additional costs

## 7. Recommended Implementation Plan

### 7.1 Phase 1: Database and Model Updates (Week 1)
- [ ] Create migration for timezone and preferred_send_hour columns
- [ ] Update User model and types
- [ ] Add validation for timezone values
- [ ] Create repository methods for timezone queries

### 7.2 Phase 2: API Endpoints (Week 1-2)
- [ ] Create user preference endpoints (GET/PUT)
- [ ] Add timezone detection to signup flow
- [ ] Create cron endpoint for daily messages
- [ ] Implement authentication for cron jobs

### 7.3 Phase 3: Service Layer (Week 2)
- [ ] Create DailyMessageService class
- [ ] Implement timezone-aware user queries
- [ ] Add batch processing with error handling
- [ ] Integrate with existing MessageService

### 7.4 Phase 4: Frontend Updates (Week 3)
- [ ] Add time preference to signup form
- [ ] Create settings UI for updating preferences
- [ ] Add timezone detection logic
- [ ] Display next message time to users

### 7.5 Phase 5: Testing and Monitoring (Week 4)
- [ ] Unit tests for timezone calculations
- [ ] Integration tests for cron endpoints
- [ ] Load testing for peak hours
- [ ] Monitoring and alerting setup

## 8. Technical Considerations

### 8.1 Timezone Library
Recommended: Use **Luxon** for IANA timezone support and validation:
```typescript
import { DateTime, IANAZone } from 'luxon';

// Validate timezone
function isValidTimezone(timezone: string): boolean {
  return IANAZone.isValidZone(timezone);
}

// Get user's current local hour
function getUserLocalHour(utcDate: Date, timezone: string): number {
  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
  const dt = DateTime.fromJSDate(utcDate).setZone(timezone);
  return dt.hour;
}

// Common IANA timezones for UI
const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
];
```

### 8.2 Database Query Optimization
```typescript
// Efficient query to find users for current hour
const query = db
  .selectFrom('users')
  .leftJoin('fitness_profiles', 'users.id', 'fitness_profiles.user_id')
  .where((eb) => {
    const conditions = timezones.map(tz => {
      const localHour = getLocalHourForTimezone(currentUtcTime, tz);
      return eb.and([
        eb('users.timezone', '=', tz),
        eb('users.preferred_send_hour', '=', localHour)
      ]);
    });
    return eb.or(conditions);
  })
  .where('users.subscription_status', '=', 'active');
```

### 8.3 Error Handling and Retry Logic
```typescript
class MessageBatchProcessor {
  async processBatch(users: User[], batchSize: number) {
    const batches = chunk(users, batchSize);
    const results = await Promise.allSettled(
      batches.map(batch => this.processSingleBatch(batch))
    );
    
    // Log failures for retry
    const failures = results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason);
      
    if (failures.length > 0) {
      await this.queueForRetry(failures);
    }
  }
}
```

### 8.4 Monitoring and Metrics
- Track delivery success rate by hour
- Monitor message latency (scheduled vs actual send time)
- Alert on batch processing failures
- Dashboard for timezone distribution

## 9. Security Considerations

### 9.1 Cron Authentication
```typescript
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Process cron job
}
```

### 9.2 Rate Limiting
- Implement per-user daily message limits
- Protect against timezone manipulation attacks
- Monitor for unusual patterns

## 10. Migration Strategy

### 10.1 Gradual Rollout
1. Deploy with feature flag disabled
2. Test with internal users
3. Enable for 10% of users
4. Monitor metrics and errors
5. Gradually increase to 100%

### 10.2 Backward Compatibility
- Default existing users to 8 AM in their likely timezone
- Send one-time notification about new feature
- Provide easy way to update preferences

## 11. Future Enhancements

### 11.1 Near Term (3-6 months)
- Minute-level precision
- Smart time suggestions based on workout completion
- Multiple daily messages support
- Weekend vs weekday preferences

### 11.2 Long Term (6-12 months)
- ML-based optimal time prediction
- Calendar integration
- Weather-based adjustments
- Temporary schedule overrides

## 12. Decision Matrix

| Criteria | Option 1 (Hourly UTC) | Option 2 (Regional) | Option 3 (Queue) |
|----------|----------------------|---------------------|------------------|
| Implementation Complexity | Low | Medium | High |
| Operational Complexity | Low | Medium | High |
| Scalability | High | Medium | Very High |
| Precision | Hour | Hour | Minute |
| Cost | Low | Low | Medium |
| Time to Market | 2-3 weeks | 3-4 weeks | 6-8 weeks |

## 13. Recommendation

**Proceed with Option 1 (Hourly Cron with UTC Conversion)** for the initial implementation because:

1. Fastest time to market
2. Simplest to implement and maintain
3. Meets core requirements
4. Easy to migrate to Option 3 later if needed
5. Proven pattern used by many SaaS applications

## 14. Appendix

### 14.1 Sample Cron Endpoint Implementation
```typescript
// /api/cron/daily-messages/route.ts
import { NextResponse } from 'next/server';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { verifyWebhookSignature } from '@/server/utils/auth';

export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request
    const isValid = verifyWebhookSignature(
      request.headers.get('authorization'),
      process.env.CRON_SECRET
    );
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const service = new DailyMessageService();
    const result = await service.processHourlyBatch();
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      duration: result.duration
    });
    
  } catch (error) {
    console.error('Daily message cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 14.2 Timezone Testing Checklist
- [ ] Standard timezones (EST, PST, GMT)
- [ ] Half-hour timezones (India, parts of Australia)
- [ ] Daylight saving transitions
- [ ] Users near date line
- [ ] Invalid timezone handling

---

**Document Version**: 1.0  
**Created**: [Current Date]  
**Status**: Ready for Review  
**Next Steps**: Review with team, decide on approach, begin implementation