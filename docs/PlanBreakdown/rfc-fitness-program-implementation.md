# RFC: Fitness Program Database Implementation

## Summary

This RFC details the implementation of the fitness program database schema for GymText, introducing four new tables to store hierarchical training programs from high-level plans down to individual workouts. The design enables efficient queries for daily workouts while maintaining program structure and supporting user customization.

## Overview

The implementation introduces a four-tier hierarchy:

1. **FitnessPlan** - High-level program template with macrocycle structure
2. **Mesocycle** - Training phase (4-6 weeks) with specific adaptations
3. **Microcycle** - Weekly training block with targets
4. **WorkoutInstance** - Individual workout with exercises and tracking

Each level maintains references to its parent and the client, enabling both hierarchical navigation and direct access patterns.

## Database Schema

### Table: fitness_plans

Stores the overall program structure and macrocycle planning.

```sql
CREATE TABLE fitness_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other')),
    goal_statement TEXT,
    overview TEXT,
    start_date DATE NOT NULL,
    macrocycles JSONB NOT NULL, -- Array of macrocycle plans with mesocycle breakdowns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_fitness_plans_client (client_id, start_date DESC),
    INDEX idx_fitness_plans_program (program_id)
);
```

**JSONB Structure for macrocycles:**
```json
[{
    "lengthWeeks": 12,
    "mesocycles": [{
        "offset": 0,
        "phase": "Base Building",
        "lengthWeeks": 4,
        "weeklyTargets": [{
            "weekOffset": 0,
            "split": "Upper/Lower/Run/Rest/Full/Run/Rest",
            "totalMileage": 15,
            "avgIntensityPct1RM": 70,
            "totalSetsMainLifts": 20,
            "deload": false
        }]
    }]
}]
```

### Table: mesocycles

Represents a training phase within the program.

```sql
CREATE TABLE mesocycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    program_id VARCHAR(255) NOT NULL REFERENCES fitness_plans(program_id),
    start_date DATE NOT NULL,
    offset INTEGER NOT NULL, -- Weeks from program start
    phase VARCHAR(255) NOT NULL,
    length_weeks INTEGER NOT NULL CHECK (length_weeks > 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_mesocycles_client_active (client_id, status, start_date),
    INDEX idx_mesocycles_program (program_id, offset),
    UNIQUE (client_id, program_id, offset)
);
```

### Table: microcycles

Represents a weekly training block.

```sql
CREATE TABLE microcycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    program_id VARCHAR(255) NOT NULL REFERENCES fitness_plans(program_id),
    mesocycle_id VARCHAR(255) NOT NULL REFERENCES mesocycles(mesocycle_id),
    offset INTEGER NOT NULL, -- Weeks from program start
    week_number INTEGER NOT NULL, -- Week within mesocycle (1-based)
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    targets JSONB, -- Weekly targets including split, mileage, intensity
    actual_metrics JSONB, -- Tracked completion metrics
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'partial', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_microcycles_client_date (client_id, start_date),
    INDEX idx_microcycles_mesocycle (mesocycle_id, week_number),
    UNIQUE (client_id, program_id, offset)
);
```

**JSONB Structure for targets:**
```json
{
    "split": "Upper/Lower/Run/Rest/Full/Run/Rest",
    "totalMileage": 20,
    "longRunMileage": 8,
    "avgIntensityPct1RM": 75,
    "totalSetsMainLifts": 24,
    "deload": false
}
```

**JSONB Structure for actual_metrics:**
```json
{
    "completedWorkouts": 5,
    "totalWorkouts": 6,
    "actualMileage": 18.5,
    "actualSets": 22,
    "avgDifficulty": 7.5,
    "notes": "Felt strong this week"
}
```

### Table: workout_instances

Stores individual workouts with full details.

```sql
CREATE TABLE workout_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    program_id VARCHAR(255) NOT NULL REFERENCES fitness_plans(program_id),
    mesocycle_id VARCHAR(255) NOT NULL REFERENCES mesocycles(mesocycle_id),
    microcycle_id VARCHAR(255) NOT NULL REFERENCES microcycles(microcycle_id),
    date DATE NOT NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('run', 'lift', 'metcon', 'mobility', 'rest', 'other')),
    goal TEXT,
    details JSONB NOT NULL, -- Workout blocks and exercises
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_workout_instances_daily (client_id, date),
    INDEX idx_workout_instances_date_status (date, status),
    INDEX idx_workout_instances_microcycle (microcycle_id, date),
    UNIQUE (client_id, date, session_type)
);
```

**JSONB Structure for details:**
```json
{
    "blocks": [{
        "label": "Warm-up",
        "activities": ["5 min easy jog", "Dynamic stretching", "2x10 bodyweight squats"]
    }, {
        "label": "Main",
        "activities": ["5x5 Back Squat @ 85%", "3x8 Romanian Deadlift", "4x12 Leg Press"]
    }],
    "targets": {
        "totalSets": 12,
        "mainLiftIntensity": 85,
        "duration": 60
    }
}
```


## Migration Strategy

### Phase 1: Schema Creation
1. Create tables in dependency order: fitness_plans → mesocycles → microcycles → workout_instances
2. Add foreign key constraints and indexes
3. Create update triggers for updated_at timestamps

### Phase 2: Data Population
1. Import existing workout templates into staging area
2. Generate fitness_plans for existing users based on their profiles
3. Create mesocycles and microcycles based on plan structure
4. Generate workout_instances for the next 4 weeks

### Phase 3: Integration
1. Update repositories to include new tables
2. Add services for program management
3. Integrate with existing SMS workflow
4. Implement daily workout scheduling job

## Query Patterns

### Get Today's Workout
```sql
SELECT wi.*, m.phase, mc.targets as weekly_targets
FROM workout_instances wi
JOIN mesocycles m ON wi.mesocycle_id = m.mesocycle_id
JOIN microcycles mc ON wi.microcycle_id = mc.microcycle_id
WHERE wi.client_id = $1 
  AND wi.date = CURRENT_DATE
  AND wi.status = 'scheduled';
```

### Get Active Program Overview
```sql
SELECT fp.*, 
       m.phase as current_phase,
       m.offset as weeks_completed
FROM fitness_plans fp
LEFT JOIN mesocycles m ON fp.program_id = m.program_id 
  AND m.client_id = fp.client_id 
  AND m.status = 'active'
WHERE fp.client_id = $1
  AND fp.start_date <= CURRENT_DATE
ORDER BY fp.start_date DESC
LIMIT 1;
```

### Get Week's Workouts
```sql
SELECT wi.*, 
       CASE WHEN wi.status = 'completed' THEN wi.feedback ELSE NULL END as feedback
FROM workout_instances wi
WHERE wi.client_id = $1
  AND wi.date >= DATE_TRUNC('week', CURRENT_DATE)
  AND wi.date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
ORDER BY wi.date, wi.session_type;
```

### Update Workout Completion
```sql
UPDATE workout_instances
SET status = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    feedback = $2,
    metrics = $3,
    alterations = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE workout_id = $1
RETURNING *;
```

## Data Flow

### Program Creation Flow
1. AI agent generates FitnessProgram structure
2. Service creates fitness_plans record with full macrocycle structure
3. Background job creates mesocycle records based on start date
4. Weekly job creates microcycle records 2 weeks ahead
5. Daily job creates workout_instances 1 week ahead

### Workout Delivery Flow
1. SMS service queries today's workout for user
2. System formats workout details into SMS message
3. User completes workout and sends feedback
4. System updates workout_instances with completion data
5. Metrics aggregate to microcycle actual_metrics

### Program Modification Flow
1. User requests change (e.g., "easier workouts")
2. AI agent analyzes current progress
3. System updates future workout_instances
4. Alterations tracked in alterations field
5. Original plan preserved in fitness_plans

## Advantages of This Design

1. **Performance**: Direct queries for daily workouts via indexed date lookup
2. **Flexibility**: JSONB stores variable workout structures without schema changes
3. **Tracking**: Complete history of planned vs actual performance
4. **Scalability**: Efficient indexes support thousands of concurrent users
5. **Modularity**: Each table has a clear responsibility
6. **Extensibility**: Easy to add new fields to JSONB structures

## Considerations

### Data Consistency
- Use transactions when creating program hierarchy
- Implement cascade deletes carefully
- Validate JSONB structures at application level

### Storage Optimization
- Archive completed programs after 6 months
- Compress historical workout data
- Consider partitioning workout_instances by date

### Query Optimization
- Monitor slow queries and adjust indexes
- Consider materialized views for analytics
- Use connection pooling for high concurrency

## Future Enhancements

1. **Program Templates**: Separate table for reusable program templates
2. **Progress Analytics**: Dedicated analytics schema for performance trends
3. **Social Features**: Share workouts or compete with other users
4. **Coach Interface**: Web dashboard for trainers to manage multiple clients
5. **Integration APIs**: Export to fitness tracking apps

## Conclusion

This implementation provides a robust foundation for GymText's fitness programming needs. The hierarchical structure maintains data integrity while JSONB fields provide flexibility for varied workout formats. The design prioritizes query performance for daily operations while supporting comprehensive tracking and customization capabilities.