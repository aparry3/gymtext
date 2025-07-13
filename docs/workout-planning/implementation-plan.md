# Implementation Plan: Enhanced Workout Planning System

## Overview

This document outlines the technical implementation plan for the enhanced workout planning system. The implementation is divided into phases, with Phase 2 (Program Generation System) now complete.

## Progress Update

- ✅ **Phase 1**: Database Foundation (Schema created, awaiting integration)
- ✅ **Phase 2**: Program Generation System (Complete - AI agents and APIs implemented)
- 🚧 **Phase 3**: Database Integration & Workout Creation (Next priority)
- 📅 **Phase 4**: Daily Delivery & Adaptability Features (Planned)

## Phase 1: Database Foundation ✅ (Schema Complete)

### 1.1 Database Schema Design ✅

Create new tables to support structured workout programs:

```sql
-- Core program tables
CREATE TABLE workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    program_type VARCHAR(50), -- 'strength', 'hypertrophy', 'endurance', 'hybrid'
    duration_type VARCHAR(20), -- 'fixed', 'ongoing'
    duration_weeks INTEGER,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed'
    goals JSONB,
    equipment_required JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Program phases for periodization
CREATE TABLE program_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    focus VARCHAR(50), -- 'strength', 'volume', 'deload', etc.
    start_week INTEGER NOT NULL,
    end_week INTEGER NOT NULL,
    training_variables JSONB, -- intensity, volume, frequency guidelines
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly workout templates
CREATE TABLE program_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES program_phases(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    name VARCHAR(255),
    description TEXT,
    weekly_volume_target JSONB,
    training_split JSONB, -- defines which body parts/movements each day
    created_at TIMESTAMP DEFAULT NOW()
);

-- Individual workout session templates
CREATE TABLE program_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES program_weeks(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    session_type VARCHAR(50), -- 'strength', 'conditioning', 'recovery'
    name VARCHAR(255),
    description TEXT,
    duration_minutes INTEGER,
    exercises JSONB, -- structured exercise data
    created_at TIMESTAMP DEFAULT NOW()
);

-- User-specific program instances
CREATE TABLE user_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    current_week INTEGER DEFAULT 1,
    current_phase_id UUID REFERENCES program_phases(id),
    adaptations JSONB, -- user-specific modifications
    status VARCHAR(20) DEFAULT 'active',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Link generated workouts to program sessions
ALTER TABLE workouts ADD COLUMN program_session_id UUID REFERENCES program_sessions(id);
ALTER TABLE workouts ADD COLUMN user_program_id UUID REFERENCES user_programs(id);

-- Program templates for reuse
CREATE TABLE program_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL, -- full program structure
    category VARCHAR(50),
    experience_level VARCHAR(20),
    equipment_required JSONB,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Migration Implementation 🚧 (Next Priority)

1. ✅ Create Kysely migration files for new tables
2. ✅ Update TypeScript types generation  
3. 🚧 Create seed data for testing
4. 🚧 Implement rollback strategy

### 1.3 Data Access Layer 🚧 (In Progress)

Services created in `/src/server/services/` (need database connection):
- ✅ `WorkoutProgramService`: CRUD operations for programs (placeholder)
- ✅ `ProgramPhaseService`: Manage program phases (placeholder)
- ✅ `ProgramSessionService`: Handle workout sessions (placeholder)
- ✅ `UserProgramService`: User-specific program management (placeholder)

## Phase 2: Program Generation System ✅ (Complete)

### 2.1 Enhanced AI Agents ✅

All agents implemented in `/src/server/agents/`:

#### 2.1.1 Program Designer Agent ✅
- ✅ `program-designer.ts`: Analyzes profiles and generates structured programs
- ✅ Multi-phase program structure with periodization
- ✅ Adaptation capabilities for user feedback

#### 2.1.2 Session Builder Agent ✅
- ✅ `session-builder.ts`: Generates individual workout sessions
- ✅ Equipment-aware exercise selection
- ✅ Time-constrained workout options
- ✅ Warmup and cooldown included

#### 2.1.3 Workout Orchestrator ✅
- ✅ `orchestrator.ts`: Coordinates all agents
- ✅ Three modes: program_generation, session_generation, adapt_program
- ✅ **Note**: Removed backward compatibility - all workouts require programs

### 2.2 Prompt Engineering ✅

All prompts created in `/src/server/prompts/`:
- ✅ `program-design-prompt.ts`: Program structure templates
- ✅ `phase-planning-prompt.ts`: Phase progression rules
- ✅ `session-generation-prompt.ts`: Exercise selection guidelines
- ✅ `adaptation-prompt.ts`: Modification strategies

### 2.3 Program Generation API ✅

All endpoints implemented:
- ✅ `POST /api/programs/generate`: Generate new program
- ✅ `GET /api/programs/:id`: Retrieve program details (placeholder)
- ✅ `PUT /api/programs/:id`: Update program (placeholder)
- ✅ `POST /api/programs/:id/regenerate-week`: Regenerate specific week
- ✅ `POST /api/workouts/daily`: Generate daily workout from program
- ✅ Updated `/api/agent` with program-first actions

## Phase 3: Database Integration & Workout Creation 🚧 (Next Priority)

### 3.1 Complete Database Integration

#### 3.1.1 Connect Services to Database
Update all placeholder services to use actual database:
- 🚧 `WorkoutProgramService`: Implement CRUD operations
- 🚧 `ProgramPhaseService`: Store and retrieve phases
- 🚧 `ProgramSessionService`: Manage workout templates
- 🚧 `UserProgramService`: Track user progress

#### 3.1.2 Implement Program Storage
- 🚧 Store AI-generated programs in database
- 🚧 Link programs to users
- 🚧 Track current week and phase
- 🚧 Store generated workouts with program reference

### 3.2 Workout Creation Flow

#### 3.2.1 Update Workout Generator ✅ (Partial)
`workoutGeneratorAgent.ts` updated to:
- ✅ Require active program for workout generation
- ✅ Format workouts for SMS delivery
- 🚧 Fetch actual program from database
- 🚧 Track workout completion

#### 3.2.2 First Workout on Signup
- 🚧 Update onboarding flow to include:
  1. Create user profile
  2. Generate program
  3. Generate first workout
  4. Send welcome message + first workout
- 🚧 Modify `/api/agent` onboard action

### 3.3 Daily Workout Delivery System

#### 3.3.1 Scheduled Job Implementation
- 🚧 Create cron job using node-cron or similar
- 🚧 Run daily at configured time (e.g., 6 AM user's timezone)
- 🚧 Query users with active programs
- 🚧 Generate and send workouts in batches

#### 3.3.2 Delivery Service
Create `DailyWorkoutDeliveryService`:
```typescript
interface DeliveryService {
  scheduleDaily(): void;
  deliverWorkoutsForTimezone(timezone: string): Promise<void>;
  deliverWorkoutToUser(userId: string): Promise<void>;
  handleDeliveryFailure(userId: string, error: Error): void;
}
```

#### 3.3.3 SMS Integration Updates
- 🚧 Ensure workout formatting fits SMS limits
- 🚧 Handle delivery confirmations
- 🚧 Queue management for rate limiting

## Phase 4: Adaptability Features (Week 7-8)

### 4.1 Feedback Processing

#### 4.1.1 Workout Feedback Handler
Create `WorkoutFeedbackService`:
- Process completion data
- Analyze performance trends
- Trigger adaptation recommendations
- Update user progression metrics

#### 4.1.2 Adaptation Engine
Create `AdaptationEngine`:
- Rule-based adaptation logic
- AI-powered modification suggestions
- Validation of proposed changes
- Apply adaptations to programs

### 4.2 Circumstantial Modifications

#### 4.2.1 Travel Mode
- Detect travel notifications
- Generate bodyweight/minimal equipment alternatives
- Maintain program progression
- Revert after travel period

#### 4.2.2 Time Constraints
- Offer shortened workout versions
- Prioritize compound movements
- Adjust volume while maintaining stimulus
- Track accumulated fatigue

#### 4.2.3 Injury Management
- Flag problematic exercises
- Suggest modifications or substitutions
- Adjust program volume/intensity
- Track recovery progress

### 4.3 User Communication

#### 4.3.1 Language Adaptation Service
Create `LanguageAdaptationService`:
- Detect user experience level from profile
- Maintain terminology mapping dictionary
- Transform technical terms to user-appropriate language
- Support gradual education mode

#### 4.3.2 Communication Templates
```typescript
interface CommunicationTemplate {
  technicalTerm: string;
  beginnerTerm: string;
  intermediateTerm: string;
  explanation?: string;
}

// Example mappings
const terminologyMap: CommunicationTemplate[] = [
  {
    technicalTerm: "hypertrophy",
    beginnerTerm: "muscle building",
    intermediateTerm: "hypertrophy (muscle growth)",
    explanation: "Training to increase muscle size"
  },
  {
    technicalTerm: "progressive overload",
    beginnerTerm: "gradually getting stronger",
    intermediateTerm: "progressive overload",
    explanation: "Slowly increasing weight or reps over time"
  }
];
```

#### 4.3.3 SMS Handler Updates
Update SMS handlers:
- Apply language adaptation before sending messages
- Parse adaptation requests with fuzzy matching
- Confirm program modifications in user's language
- Send progress summaries with appropriate terminology
- Handle program-related queries with context-aware responses

## Technical Implementation Details

### 1. Type Safety

Update shared types in `/src/shared/types/`:
```typescript
export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  programType: 'strength' | 'hypertrophy' | 'endurance' | 'hybrid';
  durationType: 'fixed' | 'ongoing';
  durationWeeks?: number;
  goals: ProgramGoals;
  // ... other fields
}

export interface ProgramPhase {
  id: string;
  programId: string;
  phaseNumber: number;
  name: string;
  focus: 'strength' | 'volume' | 'peaking' | 'deload';
  // ... other fields
}
```

### 2. API Design

Implement RESTful endpoints with proper validation:
```typescript
// Example: Program generation endpoint
export async function POST(req: Request) {
  const body = await req.json();
  const validated = CreateProgramSchema.parse(body);
  
  // Generate program using AI agents
  const program = await ProgramDesignerAgent.generate(validated);
  
  // Store in database
  const saved = await WorkoutProgramService.create(program);
  
  // Initialize user program
  await UserProgramService.initialize(saved.id, validated.userId);
  
  return Response.json({ program: saved });
}
```

### 3. Testing Strategy

1. **Unit Tests**: Service layer methods
2. **Integration Tests**: Database operations
3. **E2E Tests**: Full program generation flow
4. **Load Tests**: Bulk workout generation

### 4. Monitoring and Analytics

Track key metrics:
- Program generation success rate
- Workout delivery reliability
- User engagement by program type
- Adaptation frequency and types

## Implementation Priorities

### Immediate Next Steps (Phase 3)

1. **Database Integration**
   - Run migrations to create program tables
   - Implement service layer database operations
   - Test program storage and retrieval

2. **Workout Creation Flow**
   - Update onboarding to generate first workout
   - Implement program-to-workout pipeline
   - Store workouts with program references

3. **Daily Delivery System**
   - Set up cron job infrastructure
   - Implement timezone-aware delivery
   - Add delivery tracking and retry logic

### Updated Timeline

- **Week 1-2**: Complete database integration
- **Week 3**: Implement workout creation flow
- **Week 4**: Set up daily delivery system
- **Week 5-6**: Testing and refinement
- **Week 7-8**: Phase 4 adaptability features

## Migration Strategy (Updated)

### 1. Program-First Approach
- ❌ ~~Backward compatibility removed~~
- ✅ All users must have active programs
- ✅ Onboarding creates initial program automatically

### 2. Feature Flags
```typescript
const FEATURES = {
  DAILY_WORKOUT_DELIVERY: process.env.ENABLE_DAILY_DELIVERY === 'true',
  AUTO_ADAPTATIONS: process.env.ENABLE_AUTO_ADAPTATIONS === 'true',
  TRAVEL_MODE: process.env.ENABLE_TRAVEL_MODE === 'true',
};
```

### 3. Rollout Plan
1. **Testing**: Use test users created in Phase 2
2. **Soft Launch**: Enable daily delivery for test group
3. **Full Launch**: Enable for all users after validation

## Risk Mitigation

### 1. Technical Risks
- **Database Performance**: Index optimization, query monitoring
- **AI Token Costs**: Caching, batch processing, prompt optimization
- **SMS Delivery**: Queue management, retry logic, fallback options

### 2. User Experience Risks
- **Complexity**: Maintain simple SMS interface
- **Migration Issues**: Clear communication, support documentation
- **Program Quality**: Human review process, feedback loops

### 3. Operational Risks
- **Scalability**: Horizontal scaling plan
- **Monitoring**: Comprehensive alerting
- **Support**: Documentation and training

## Success Criteria

1. **Phase 1**: Database schema deployed, migrations successful
2. **Phase 2**: AI generates structured programs, 90% success rate
3. **Phase 3**: Workouts linked to programs, daily delivery working
4. **Phase 4**: Adaptations processing, user satisfaction increased

## Detailed Phase 3 Implementation Tasks

### Task 1: Database Integration
```bash
# 1. Run migrations
npm run migrate:up

# 2. Generate types
npm run generate:types

# 3. Update services with actual queries
```

### Task 2: Onboarding with First Workout
```typescript
// Update /api/agent onboard action to:
1. Create user profile
2. Generate program (store in DB)
3. Generate first workout from program
4. Send welcome SMS + first workout SMS
```

### Task 3: Daily Workout Delivery
```typescript
// Create new service: src/server/services/dailyDelivery.ts
import cron from 'node-cron';

export class DailyDeliveryService {
  // Schedule job for 6 AM in each timezone
  scheduleDelivery() {
    cron.schedule('0 6 * * *', async () => {
      await this.processDeliveryQueue();
    });
  }
}
```

### Task 4: Environment Variables
```env
# Add to .env.local
ENABLE_DAILY_DELIVERY=false
DELIVERY_TIME_HOUR=6
DELIVERY_BATCH_SIZE=50
DELIVERY_RETRY_ATTEMPTS=3
```

## Next Steps

1. ✅ ~~Review and approve implementation plan~~
2. ✅ ~~Set up development environment~~
3. ✅ ~~Create project board with detailed tasks~~
4. ✅ ~~Complete Phase 2 implementation~~
5. 🚧 **Begin Phase 3: Database Integration**
   - Run migrations
   - Connect services to database
   - Implement program storage
6. 🚧 **Implement workout creation flow**
7. 🚧 **Set up daily delivery system**