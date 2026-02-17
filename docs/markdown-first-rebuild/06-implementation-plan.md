# Implementation Plan - Rebuilding GymText AI

This plan outlines the staged approach to rebuilding the GymText AI layer from a JSON-first architecture to a Markdown-first architecture.

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Database Setup
- [ ] Implement new schema in PostgreSQL (see `02-database-schema.md`).
- [ ] Create `user_dossiers`, `training_plans`, `workouts`, and `agent_invocations` tables.
- [ ] Set up triggers for `updated_at` and cache versioning.

### 1.2 Core Tools Development
- [ ] Create `read_user_dossier` tool.
- [ ] Create `read_training_plan` tool.
- [ ] Create `read_recent_workouts` tool.
- [ ] Create `search_exercises` tool (semantic search on exercise DB).

### 1.3 Seeding Examples
- [ ] Create 15 high-quality `workout_examples`.
- [ ] Create 10 high-quality `plan_examples`.
- [ ] Populate `plan_examples` and `workout_examples` tables.

## Phase 2: Core Agent Development (Weeks 3-5)

### 2.1 Fitness Plan Agent
- [ ] Define system prompt with Markdown-first requirements.
- [ ] Implement validation logic (section checking).
- [ ] Test with variety of user profiles.

### 2.2 Microcycle Agent
- [ ] Define system prompt for weekly generation.
- [ ] Implement weight-calculation logic (Progression Engine).
- [ ] Test multi-workout generation (7 days at once).

### 2.3 Format Converters (Sub-Agents)
- [ ] Implement `workout_message` (Markdown -> SMS).
- [ ] Implement `workout_structure` (Markdown -> JSON).
- [ ] Implement `analytics_agent` (History -> JSON).

## Phase 3: Integration & Testing (Weeks 6-8)

### 3.1 Orchestration Layer
- [ ] Connect Sunday night cron to Microcycle Agent.
- [ ] Connect Morning delivery cron to Workout Message Agent.
- [ ] Implement async cache generation for structured views.

### 3.2 Chat Agent Integration
- [ ] Implement Chat Agent with new tools.
- [ ] Connect to BlueBubbles/SMS webhook.
- [ ] Test real-time workout modifications and dossier updates.

### 3.3 UI Integration
- [ ] Update web/mobile frontend to read from `structured_workout` JSONB columns.
- [ ] Implement JIT (Just-In-Time) generation for cache misses.

## Phase 4: Migration & Cutover (Weeks 9-12)

### 4.1 Synthetic User Testing
- [ ] Run 50 synthetic users through 4 weeks of training in a sandbox.
- [ ] Verify progression, SMS delivery, and analytics accuracy.

### 4.2 Gradual User Migration
- [ ] Migrate first 5% of users (Beta group).
- [ ] Monitor `agent_invocations` for errors and token usage.
- [ ] Expand migration in batches (10%, 25%, 50%, 100%).

### 4.3 Decommissioning
- [ ] Archive old JSON-first tables.
- [ ] Remove legacy agent definitions and logic.
- [ ] Final architecture audit.
