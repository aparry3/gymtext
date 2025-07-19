# Phase 1 Implementation Checklist: Schema Creation

## Overview
Phase 1 focuses on creating the database schema for the fitness program hierarchy. This includes creating tables, constraints, indexes, and triggers in the correct dependency order.

## Pre-Implementation Tasks

### 1. Environment Setup
- [ ] Verify Kysely is properly configured in the project
- [ ] Ensure database connection is working
- [ ] Create a test database for development/testing
- [ ] Back up existing database before migrations

### 2. Migration Infrastructure
- [ ] Review existing migration patterns in `migrations/` directory
- [ ] Verify `pnpm migrate:create` command works
- [ ] Test `pnpm migrate:up` and `pnpm migrate:down` commands
- [ ] Document rollback procedures

## Implementation Tasks

### 3. Create Consolidated Fitness Program Schema Migration
- [ ] Create single migration file: `pnpm migrate:create "create_fitness_program_schema"`
- [ ] Create updated_at trigger function (if not exists)
- [ ] Create fitness_plans table:
  - [ ] id (UUID with gen_random_uuid())
  - [ ] client_id (UUID with foreign key to users)
  - [ ] program_type (VARCHAR with enum constraint)
  - [ ] goal_statement (TEXT)
  - [ ] overview (TEXT)
  - [ ] start_date (DATE, NOT NULL)
  - [ ] macrocycles (JSONB, NOT NULL)
  - [ ] created_at (TIMESTAMP WITH TIME ZONE)
  - [ ] updated_at (TIMESTAMP WITH TIME ZONE)
  - [ ] Indexes:
    - [ ] idx_fitness_plans_client (client_id, start_date DESC)
  - [ ] Apply updated_at trigger
- [ ] Create mesocycles table:
  - [ ] id (UUID with gen_random_uuid())
  - [ ] client_id (UUID with foreign key to users)
  - [ ] fitness_plan_id (UUID with foreign key to fitness_plans.id)
  - [ ] start_date (DATE, NOT NULL)
  - [ ] offset (INTEGER, NOT NULL)
  - [ ] phase (VARCHAR(255), NOT NULL)
  - [ ] length_weeks (INTEGER with CHECK > 0)
  - [ ] status (VARCHAR(50) with enum constraint)
  - [ ] created_at (TIMESTAMP WITH TIME ZONE)
  - [ ] updated_at (TIMESTAMP WITH TIME ZONE)
  - [ ] Indexes:
    - [ ] idx_mesocycles_client_active (client_id, status, start_date)
    - [ ] idx_mesocycles_fitness_plan (fitness_plan_id, offset)
  - [ ] Unique constraint: (client_id, fitness_plan_id, offset)
  - [ ] Apply updated_at trigger
- [ ] Create microcycles table:
  - [ ] id (UUID with gen_random_uuid())
  - [ ] client_id (UUID with foreign key to users)
  - [ ] fitness_plan_id (UUID with foreign key to fitness_plans.id)
  - [ ] mesocycle_id (UUID with foreign key to mesocycles.id)
  - [ ] offset (INTEGER, NOT NULL)
  - [ ] week_number (INTEGER, NOT NULL)
  - [ ] start_date (DATE, NOT NULL)
  - [ ] end_date (DATE, NOT NULL)
  - [ ] targets (JSONB)
  - [ ] actual_metrics (JSONB)
  - [ ] status (VARCHAR(50) with enum constraint)
  - [ ] created_at (TIMESTAMP WITH TIME ZONE)
  - [ ] updated_at (TIMESTAMP WITH TIME ZONE)
  - [ ] Indexes:
    - [ ] idx_microcycles_client_date (client_id, start_date)
    - [ ] idx_microcycles_mesocycle (mesocycle_id, week_number)
  - [ ] Unique constraint: (client_id, fitness_plan_id, offset)
  - [ ] Apply updated_at trigger
- [ ] Create workout_instances table:
  - [ ] id (UUID with gen_random_uuid())
  - [ ] client_id (UUID with foreign key to users)
  - [ ] fitness_plan_id (UUID with foreign key to fitness_plans.id)
  - [ ] mesocycle_id (UUID with foreign key to mesocycles.id)
  - [ ] microcycle_id (UUID with foreign key to microcycles.id)
  - [ ] date (DATE, NOT NULL)
  - [ ] session_type (VARCHAR(50) with enum constraint)
  - [ ] status (VARCHAR(50) with enum constraint)
  - [ ] goal (TEXT)
  - [ ] details (JSONB, NOT NULL)
  - [ ] feedback (JSONB)
  - [ ] metrics (JSONB)
  - [ ] alterations (JSONB)
  - [ ] completed_at (TIMESTAMP WITH TIME ZONE)
  - [ ] created_at (TIMESTAMP WITH TIME ZONE)
  - [ ] updated_at (TIMESTAMP WITH TIME ZONE)
  - [ ] Indexes:
    - [ ] idx_workout_instances_daily (client_id, date)
    - [ ] idx_workout_instances_date_status (date, status)
    - [ ] idx_workout_instances_microcycle (microcycle_id, date)
  - [ ] Unique constraint: (client_id, date, session_type)
  - [ ] Apply updated_at trigger
- [ ] Write comprehensive down migration
- [ ] Test migration up/down

## Kysely Integration Tasks

### 9. Type Definitions
- [ ] Run Kysely type generation script after migrations are complete
- [ ] Verify generated types include new tables:
  - [ ] FitnessPlans
  - [ ] Mesocycles
  - [ ] Microcycles
  - [ ] WorkoutInstances
- [ ] Create TypeScript interfaces for JSONB field structures:
  - [ ] MacrocycleStructure
  - [ ] MesocycleTargets
  - [ ] MicrocycleTargets
  - [ ] MicrocycleActualMetrics
  - [ ] WorkoutDetails
- [ ] Import and use generated types in repositories

### 10. Schema Validation
- [ ] Create Zod schemas for JSONB fields in `src/shared/schemas/`
  - [ ] MacrocycleSchema
  - [ ] MesocycleTargetsSchema
  - [ ] MicrocycleTargetsSchema
  - [ ] MicrocycleActualMetricsSchema
  - [ ] WorkoutDetailsSchema
- [ ] Create validation utilities

## Testing Tasks

### 11. Migration Testing
- [ ] Test all migrations on fresh database
- [ ] Test rollback of all migrations
- [ ] Verify foreign key constraints work correctly
- [ ] Test unique constraints
- [ ] Verify check constraints
- [ ] Test trigger functions

### 12. Query Testing
- [ ] Write test queries for each table
- [ ] Verify indexes are being used (EXPLAIN ANALYZE)
- [ ] Test JSONB queries
- [ ] Performance test with sample data

## Documentation Tasks

### 13. Update Documentation
- [ ] Document any schema changes from RFC
- [ ] Create example JSONB structures
- [ ] Document migration commands
- [ ] Add to CLAUDE.md if needed

### 14. Code Review Preparation
- [ ] Ensure all migrations follow project conventions
- [ ] Verify naming conventions
- [ ] Check for SQL injection vulnerabilities
- [ ] Review index strategy

## Post-Implementation Tasks

### 15. Deployment Preparation
- [ ] Create production migration plan
- [ ] Estimate migration time
- [ ] Plan for zero-downtime deployment
- [ ] Create rollback plan

### 16. Monitoring Setup
- [ ] Plan database monitoring for new tables
- [ ] Set up slow query alerts
- [ ] Monitor table sizes
- [ ] Track index usage

## Notes and Considerations

### Schema Discrepancies to Resolve
1. **Foreign Key Types**: RFC shows VARCHAR references but should likely be UUID
2. **Missing Fields**: Several fields mentioned in RFC queries but not in schema
3. **program_id**: Referenced in indexes but not defined in fitness_plans table

### Performance Considerations
1. JSONB indexing strategy for frequently queried fields
2. Partitioning strategy for workout_instances table
3. Archive strategy for old data

### Security Considerations
1. Row-level security for multi-tenant data
2. JSONB validation to prevent malformed data
3. Audit trail for program modifications

## Success Criteria
- [ ] All migrations run successfully
- [ ] All down migrations work correctly
- [ ] No breaking changes to existing functionality
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Documentation complete

## Timeline Estimate
- Environment Setup: 1 hour
- Migration Creation: 4-6 hours
- Kysely Integration: 2-3 hours
- Testing: 2-3 hours
- Documentation: 1-2 hours
- **Total: 10-15 hours**