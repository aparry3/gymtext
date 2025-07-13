# Implementation Plan: Enhanced Workout Planning System

## Overview

This document outlines the technical implementation plan for the enhanced workout planning system. The implementation will be divided into four phases, with each phase building upon the previous one to minimize risk and ensure a smooth transition.

## Phase 1: Database Foundation (Week 1-2)

### 1.1 Database Schema Design

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

### 1.2 Migration Implementation

1. Create Kysely migration files for new tables
2. Update TypeScript types generation
3. Create seed data for testing
4. Implement rollback strategy

### 1.3 Data Access Layer

Create new services in `/src/server/services/`:
- `WorkoutProgramService`: CRUD operations for programs
- `ProgramPhaseService`: Manage program phases
- `ProgramSessionService`: Handle workout sessions
- `UserProgramService`: User-specific program management

## Phase 2: Program Generation System (Week 3-4)

### 2.1 Enhanced AI Agents

Update the agent system in `/src/server/agents/`:

#### 2.1.1 Program Designer Agent
Create `program-designer.ts`:
- Analyzes user profile and goals
- Designs multi-phase program structure
- Determines appropriate periodization
- Sets weekly volume and intensity targets

#### 2.1.2 Session Builder Agent
Create `session-builder.ts`:
- Generates individual workout sessions
- Ensures exercise selection aligns with program goals
- Manages volume distribution across the week
- Handles equipment constraints

#### 2.1.3 Update Orchestrator
Modify `orchestrator.ts`:
- Coordinate program generation flow
- Integrate with new database structure
- Maintain backward compatibility

### 2.2 Prompt Engineering

Create new prompts in `/src/server/prompts/`:
- `program-design-prompt.ts`: Guide program structure creation
- `phase-planning-prompt.ts`: Design training phases
- `session-generation-prompt.ts`: Create individual workouts
- `adaptation-prompt.ts`: Handle program modifications

### 2.3 Program Generation API

Create new API endpoints:
- `POST /api/programs/generate`: Generate new program
- `GET /api/programs/:id`: Retrieve program details
- `PUT /api/programs/:id`: Update program
- `POST /api/programs/:id/regenerate-week`: Regenerate specific week

## Phase 3: Workout Generation Integration (Week 5-6)

### 3.1 Update Workout Generator

Modify `workoutGeneratorAgent.ts`:
- Fetch current program context
- Generate workouts based on program session templates
- Track workout completion against program
- Implement progressive overload logic

### 3.2 Context Management

#### 3.2.1 Program Context Service
Create `ProgramContextService`:
- Retrieve current week/phase information
- Calculate training variables
- Manage progression rules
- Handle deload scheduling

#### 3.2.2 Vector Storage Integration
Update Pinecone usage:
- Store program summaries
- Index workout history by program phase
- Enable similarity search for exercise substitutions

### 3.3 Daily Workout Scheduler

Implement automated workout delivery:
- Create cron job for daily workout generation
- Queue management for bulk generation
- Failure handling and retry logic
- SMS delivery scheduling

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

## Migration Strategy

### 1. Backward Compatibility
- Maintain existing workout generation for users without programs
- Gradual migration of active users
- Preserve historical workout data

### 2. Feature Flags
```typescript
const FEATURES = {
  STRUCTURED_PROGRAMS: process.env.ENABLE_STRUCTURED_PROGRAMS === 'true',
  AUTO_ADAPTATIONS: process.env.ENABLE_AUTO_ADAPTATIONS === 'true',
  TRAVEL_MODE: process.env.ENABLE_TRAVEL_MODE === 'true',
};
```

### 3. Rollout Plan
1. **Alpha**: Internal testing with staff accounts
2. **Beta**: 10% of new users
3. **Gradual Rollout**: Increase by 25% weekly
4. **Full Launch**: All users after stability confirmed

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

## Next Steps

1. Review and approve implementation plan
2. Set up development environment
3. Create project board with detailed tasks
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews