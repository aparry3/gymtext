# GymText Repository Cleanup Plan

## Overview

This document outlines a comprehensive cleanup plan for the GymText repository to improve code organization, remove redundancy, and establish clear architectural patterns. The analysis revealed several organizational issues including mixed responsibilities, duplicate code, and inconsistent patterns that should be addressed.

## Current Issues Summary

### 1. **Architectural Confusion**
- Mixed repository and service logic in single files
- Inconsistent database access patterns (repositories vs direct queries vs DB functions)
- Duplicate database connection management

### 2. **Code Redundancy**
- Two identical database client files
- Duplicate conversation context implementations
- Interface/type definitions repeated across files

### 3. **Dead Code**
- Commented out files (`workoutUpdateAgentt.ts`)
- Unused dependencies in package.json
- Placeholder methods never implemented

### 4. **Naming & Organization**
- Typos in filenames
- Inconsistent naming conventions
- Files in wrong directories based on their actual purpose

## Proposed Architecture

### Directory Structure

```
src/
├── server/
│   ├── repositories/          # Data access layer
│   │   ├── base.repository.ts
│   │   ├── conversation.repository.ts
│   │   ├── message.repository.ts
│   │   ├── program-phase.repository.ts
│   │   ├── program-session.repository.ts
│   │   ├── subscription.repository.ts
│   │   ├── user.repository.ts
│   │   ├── user-program.repository.ts
│   │   └── workout-program.repository.ts
│   │
│   ├── services/             # Business logic layer
│   │   ├── chat.service.ts
│   │   ├── conversation-context.service.ts
│   │   ├── conversation-storage.service.ts
│   │   ├── program-phase.service.ts
│   │   ├── program-session.service.ts
│   │   ├── prompt-builder.service.ts
│   │   ├── user-program.service.ts
│   │   └── workout-program.service.ts
│   │
│   ├── clients/              # External service clients only
│   │   ├── twilio.ts
│   │   └── pinecone.ts
│   │
│   ├── db/                   # Database configuration
│   │   ├── config.ts
│   │   └── migrations/
│   │
│   ├── agents/               # AI agents
│   └── utils/                # Utilities
```

### Architectural Principles

1. **Repository Pattern**: All database access through repositories
2. **Service Layer**: Business logic and orchestration only
3. **Single Responsibility**: Each class has one clear purpose
4. **Dependency Direction**: Utils → Repositories → Services → Controllers/API

## Cleanup Tasks

### Phase 1: Remove Dead Code (Immediate)

1. **Delete Files**
   ```bash
   rm src/server/agents/workoutUpdateAgentt.ts
   rm src/server/clients/dbClient.ts
   ```

2. **Remove Unused Dependencies**
   ```bash
   npm uninstall class-variance-authority clsx tailwind-merge lucide-react redis openai
   ```

3. **Clean Up Imports**
   - Remove unused imports from all files
   - Update imports pointing to deleted dbClient.ts

### Phase 2: Extract Repositories (1-2 days)

1. **Extract Repository Classes** from service files:
   - `programPhase.service.ts` → Extract `ProgramPhaseRepository` to `program-phase.repository.ts`
   - `programSession.service.ts` → Extract `ProgramSessionRepository` to `program-session.repository.ts`
   - `userProgram.service.ts` → Extract `UserProgramRepository` to `user-program.repository.ts`
   - `workoutProgram.service.ts` → Extract `WorkoutProgramRepository` to `workout-program.repository.ts`

2. **Update Service Files** to import and use extracted repositories

3. **Create Missing Repositories**:
   - `subscription.repository.ts` for subscription-related queries
   - `user.repository.ts` for user-related queries

### Phase 3: Consolidate Database Access (2-3 days)

1. **Migrate DB Functions to Repositories**
   - Move functions from `/db/postgres/conversation-context.ts` to appropriate repositories
   - Move functions from `/db/postgres/subscriptions.ts` to `subscription.repository.ts`
   - Move functions from `/db/postgres/users.ts` to `user.repository.ts`

2. **Update Services** to use repositories instead of direct DB functions

3. **Standardize Repository Pattern**
   - Ensure all repositories extend BaseRepository
   - Implement consistent CRUD methods
   - Add proper typing for all methods

### Phase 4: Fix Naming and Organization (1 day)

1. **Rename Files** for consistency:
   - Use camelCase for all TypeScript files
   - Add `.service.ts` suffix to all service files
   - Add `.repository.ts` suffix to all repository files

2. **Reorganize Clients**:
   - Keep only external service clients in `/clients/`
   - Move vector client to appropriate location if it's internal

3. **Consolidate Types**:
   - Create `/server/types/` directory for shared interfaces
   - Remove duplicate interface definitions
   - Export types from repositories for reuse

### Phase 5: Implement Missing Features (Optional)

1. **Caching in ConversationContextService**
   - Implement Redis caching or remove placeholder methods
   - Add proper cache invalidation logic

2. **Error Handling**
   - Standardize error handling across services
   - Add proper logging

## Implementation Priority

### High Priority (Do First)
1. Delete dead code and unused dependencies
2. Fix duplicate database clients
3. Extract repositories from service files

### Medium Priority
1. Consolidate database access patterns
2. Fix naming inconsistencies
3. Reorganize directory structure

### Low Priority
1. Implement caching
2. Add comprehensive error handling
3. Add unit tests

## Expected Benefits

1. **Clarity**: Clear separation of concerns between data access and business logic
2. **Maintainability**: Easier to find and modify code
3. **Testability**: Repositories can be easily mocked for testing services
4. **Performance**: Single database connection pool
5. **Type Safety**: Consistent typing across the application

## Migration Strategy

1. **Branch Strategy**: Create feature branch `refactor/repository-cleanup`
2. **Incremental Changes**: Complete one phase before moving to the next
3. **Testing**: Manually test affected endpoints after each phase
4. **Code Review**: Review changes after each phase

## Checklist

- [ ] Delete `workoutUpdateAgentt.ts`
- [ ] Delete `dbClient.ts` 
- [ ] Remove unused npm dependencies
- [ ] Extract `ProgramPhaseRepository`
- [ ] Extract `ProgramSessionRepository`
- [ ] Extract `UserProgramRepository`
- [ ] Extract `WorkoutProgramRepository`
- [ ] Create `SubscriptionRepository`
- [ ] Create `UserRepository`
- [ ] Migrate DB functions to repositories
- [ ] Update all service imports
- [ ] Standardize file naming
- [ ] Consolidate type definitions
- [ ] Update import paths
- [ ] Test all affected endpoints

## Notes

- No changes to API contracts or database schema required
- All changes are internal refactoring
- Consider adding a linter rule to enforce import patterns
- Document the new architecture in CLAUDE.md after completion