# Phase 3 Quick Start Guide

## Overview
Phase 3 focuses on making the AI-generated programs persistent and delivering workouts daily to users.

## Priority Tasks

### 1. Database Integration (Week 1)

#### Run Migrations
```bash
npm run migrate:up
```

#### Update Services
Replace placeholder returns with actual database queries:

```typescript
// Example: WorkoutProgramService
async create(program: WorkoutProgramInput): Promise<WorkoutProgram> {
  const result = await db
    .insertInto('workout_programs')
    .values({
      id: randomUUID(),
      ...program,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returningAll()
    .executeTakeFirst();
    
  return result;
}
```

### 2. First Workout on Signup (Week 2)

Update `/api/agent` onboard action:

```typescript
case 'onboard':
  // 1. Onboard user
  await onboardUser({ userId: user.id });
  
  // 2. Generate program
  const orchestrator = new WorkoutOrchestrator();
  const programResult = await orchestrator.orchestrate({
    userId: user.id,
    mode: 'program_generation'
  });
  
  // 3. Store program in database
  const program = await WorkoutProgramService.create(programResult.data.program);
  
  // 4. Generate first workout
  const workoutResult = await orchestrator.orchestrate({
    userId: user.id,
    mode: 'session_generation',
    programId: program.id,
    weekNumber: 1,
    dayOfWeek: new Date().getDay()
  });
  
  // 5. Send welcome message
  await twilioClient.sendSMS(user.phone_number, welcomeMessage);
  
  // 6. Send first workout
  await twilioClient.sendSMS(
    user.phone_number, 
    formatWorkoutForSMS(workoutResult.data.session)
  );
  
  return NextResponse.json({ 
    success: true, 
    message: 'User onboarded, program created, and first workout sent!'
  });
```

### 3. Daily Workout Delivery (Week 3)

#### Install Dependencies
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

#### Create Delivery Service
`src/server/services/dailyDelivery.ts`:

```typescript
import cron from 'node-cron';
import { db } from '../clients/dbClient';
import { generateDailyWorkout } from '../agents/workoutGeneratorAgent';

export class DailyDeliveryService {
  private static instance: DailyDeliveryService;
  
  static getInstance(): DailyDeliveryService {
    if (!this.instance) {
      this.instance = new DailyDeliveryService();
    }
    return this.instance;
  }
  
  startScheduler() {
    // Run every hour to check for users in that timezone
    cron.schedule('0 * * * *', async () => {
      const hour = new Date().getUTCHours();
      await this.deliverWorkoutsForHour(hour);
    });
    
    console.log('✅ Daily workout delivery scheduler started');
  }
  
  async deliverWorkoutsForHour(utcHour: number) {
    // Calculate which timezones are at 6 AM
    const targetTimezones = this.getTimezonesAt6AM(utcHour);
    
    // Get users in those timezones with active programs
    const users = await db
      .selectFrom('users')
      .innerJoin('user_programs', 'users.id', 'user_programs.user_id')
      .where('user_programs.status', '=', 'active')
      .where('users.timezone', 'in', targetTimezones)
      .select(['users.id', 'users.phone_number'])
      .execute();
    
    // Deliver workouts in batches
    for (const user of users) {
      try {
        await generateDailyWorkout(user.id);
        console.log(`✅ Workout delivered to ${user.id}`);
      } catch (error) {
        console.error(`❌ Failed to deliver to ${user.id}:`, error);
        // TODO: Implement retry logic
      }
    }
  }
  
  private getTimezonesAt6AM(currentUTCHour: number): string[] {
    // Calculate which timezones are currently at 6 AM
    // This is simplified - use moment-timezone for production
    const targetLocalHour = 6;
    const offset = targetLocalHour - currentUTCHour;
    
    // Return timezone identifiers
    return [`UTC${offset >= 0 ? '+' : ''}${offset}`];
  }
}
```

#### Start Scheduler on App Start
In your app initialization:

```typescript
// app/layout.tsx or server initialization
import { DailyDeliveryService } from '@/server/services/dailyDelivery';

if (process.env.ENABLE_DAILY_DELIVERY === 'true') {
  DailyDeliveryService.getInstance().startScheduler();
}
```

## Database Schema Updates

Add timezone to users table:
```sql
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
```

## Testing Phase 3

### Test Database Integration
```bash
# Create a test program
curl -X POST http://localhost:3000/api/programs/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
  
# Verify it's stored
psql -d gymtext -c "SELECT * FROM workout_programs;"
```

### Test First Workout
```bash
# Onboard new user (should get welcome + workout)
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "onboard", "userId": "new-user-id"}'
```

### Test Daily Delivery
```bash
# Set ENABLE_DAILY_DELIVERY=true
# Check logs for scheduler start
# Manually trigger delivery for testing
```

## Common Issues & Solutions

### Issue: Migrations fail
```bash
# Check migration status
npm run migrate:status

# Rollback if needed
npm run migrate:down
```

### Issue: Types not generated
```bash
# Regenerate types after schema changes
npm run generate:types
```

### Issue: SMS not sending
- Check Twilio credentials
- Verify phone number format
- Check Twilio console for errors

## Success Metrics

- [ ] Programs stored in database
- [ ] Workouts linked to programs
- [ ] First workout sent on signup
- [ ] Daily delivery running
- [ ] 95%+ delivery success rate