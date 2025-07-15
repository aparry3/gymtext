# Directory Cleanup Implementation Breakdown

## Overview

This document provides a detailed, step-by-step implementation guide for reorganizing the GymText codebase according to the directory reorganization plan. Each phase includes specific file operations, code changes, and testing requirements.

## File Naming Convention

**All files should follow camelCase naming convention:**
- ✅ `userRepository.ts` (not `user.repository.ts`)
- ✅ `conversationService.ts` (not `conversation.service.ts`)
- ✅ `fitnessOutlineAgent.ts` (not `fitness-outline.agent.ts`)
- ✅ `chatService.ts` (not `chat.service.ts`)

This applies to all files being moved, renamed, or created during the reorganization process.

## Pre-Implementation Checklist

- [ ] Ensure all tests pass: `pnpm test` (if tests exist)
- [ ] Run linting: `pnpm lint`

## Phase 1: Create New Directory Structure

### 1.1 Create Directory Structure

```bash
# Create new shared directories
mkdir -p src/shared/types
mkdir -p src/shared/schemas
mkdir -p src/shared/constants
mkdir -p src/shared/enums

# Create new server core directories
mkdir -p src/server/core/database
mkdir -p src/server/core/clients
mkdir -p src/server/core/config

# Create new server data directories
mkdir -p src/server/data/repositories
mkdir -p src/server/data/models

# Create new server services directories
mkdir -p src/server/services/domain
mkdir -p src/server/services/integrations
mkdir -p src/server/services/ai
mkdir -p src/server/services/infrastructure
```

### 1.2 Verification

- [ ] All directories created successfully
- [ ] No existing files overwritten

## Phase 2: Consolidate Types and Schemas

### 2.1 Move and Consolidate Types

#### 2.1.1 Create `src/shared/types/database.ts`

**Source:** `src/shared/types/schema.ts`

**Action:** Move file content to new location

```bash
# Move the file
mv src/shared/types/schema.ts src/shared/types/database.ts
```

**Code Changes:** None required

#### 2.1.2 Create `src/shared/types/conversation.ts`

**Source:** `src/shared/types/conversation-context.ts`

**Action:** Move file content to new location

```bash
# Move the file
mv src/shared/types/conversation-context.ts src/shared/types/conversation.ts
```

**Code Changes:** None required

#### 2.1.3 Create `src/shared/types/user.ts`

**Source:** Extract from `src/server/db/postgres/users.ts`

**Action:** Create new file with user-related types

```typescript
// src/shared/types/user.ts
export interface User {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FitnessProfile {
  id: string;
  user_id: string;
  fitness_goals: string;
  skill_level: string;
  exercise_frequency: string;
  gender: string;
  age: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
  info: string[];
}

export interface CreateUserData {
  name: string;
  phone_number: string;
  email?: string | null;
  stripe_customer_id?: string | null;
}

export interface CreateFitnessProfileData {
  user_id: string;
  fitness_goals: string;
  skill_level: string;
  exercise_frequency: string;
  gender: string;
  age: number;
}
```

#### 2.1.4 Create `src/shared/types/workout.ts`

**Source:** `src/server/types/weeklyWorkout.ts`

**Action:** Move file content to new location

```bash
# Move the file
mv src/server/types/weeklyWorkout.ts src/shared/types/workout.ts
```

#### 2.1.5 Create `src/shared/types/ai.ts`

**Source:** `src/server/types/updateContext.ts`

**Action:** Move file content to new location

```bash
# Move the file
mv src/server/types/updateContext.ts src/shared/types/ai.ts
```

#### 2.1.6 Create `src/shared/types/api.ts`

**Action:** Create new file for API types

```typescript
// src/shared/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SMSWebhookPayload {
  MessageSid: string;
  Body: string;
  From: string;
  To: string;
  [key: string]: any;
}
```

#### 2.1.7 Create `src/shared/types/common.ts`

**Action:** Create new file for common types

```typescript
// src/shared/types/common.ts
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

export interface SoftDelete {
  deleted_at: Date | null;
}

export interface Metadata {
  [key: string]: any;
}
```

#### 2.1.8 Create `src/shared/types/index.ts`

**Action:** Create barrel export file

```typescript
// src/shared/types/index.ts
export * from './database';
export * from './conversation';
export * from './user';
export * from './workout';
export * from './ai';
export * from './api';
export * from './common';
```

### 2.2 Update Type Imports

#### 2.2.1 Update imports in `src/server/db/postgres/users.ts`

**Before:**
```typescript
import { db } from './db';
```

**After:**
```typescript
import { db } from './db';
import { User, FitnessProfile, UserWithProfile, CreateUserData, CreateFitnessProfileData } from '@/shared/types/user';
```

**Remove:** All type definitions from this file (they're now in shared/types/user.ts)

#### 2.2.2 Update imports in repository files

**Files to update:**
- `src/server/repositories/conversation.repository.ts`
- `src/server/repositories/message.repository.ts`
- `src/server/repositories/base.repository.ts`

**Before:**
```typescript
import { Database } from '@/shared/types/schema';
```

**After:**
```typescript
import { Database } from '@/shared/types/database';
```

#### 2.2.3 Update imports in service files

**Files to update:**
- `src/server/services/conversationStorage.ts`
- `src/server/services/conversation-context.ts`
- `src/server/services/chat.ts`

**Before:**
```typescript
import { Database } from '@/shared/types/schema';
import { ConversationContext } from '@/shared/types/conversation-context';
```

**After:**
```typescript
import { Database } from '@/shared/types/database';
import { ConversationContext } from '@/shared/types/conversation';
```

### 2.3 Create Shared Schemas

#### 2.3.1 Create `src/shared/schemas/user.ts`

```typescript
// src/shared/schemas/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().nullable(),
  stripe_customer_id: z.string().optional().nullable(),
});

export const createFitnessProfileSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  fitness_goals: z.string().min(1, 'Fitness goals are required'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
  exercise_frequency: z.string().min(1, 'Exercise frequency is required'),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().int().min(13).max(100),
});

export const updateUserSchema = createUserSchema.partial();
export const updateFitnessProfileSchema = createFitnessProfileSchema.partial().omit({ user_id: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateFitnessProfileInput = z.infer<typeof createFitnessProfileSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateFitnessProfileInput = z.infer<typeof updateFitnessProfileSchema>;
```

#### 2.3.2 Create `src/shared/schemas/api.ts`

```typescript
// src/shared/schemas/api.ts
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const smsWebhookSchema = z.object({
  MessageSid: z.string(),
  Body: z.string(),
  From: z.string(),
  To: z.string(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SMSWebhookInput = z.infer<typeof smsWebhookSchema>;
```

#### 2.3.3 Create `src/shared/schemas/index.ts`

```typescript
// src/shared/schemas/index.ts
export * from './user';
export * from './api';
```

### 2.4 Testing Phase 2

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Fix any import errors
- [ ] Run linting: `pnpm lint`
- [ ] Test application startup: `pnpm dev`

## Phase 3: Reorganize Database Layer

### 3.1 Consolidate Database Connections

#### 3.1.1 Create `src/server/core/database/postgres.ts`

**Sources:** 
- `src/server/clients/dbClient.ts`
- `src/server/db/postgres/db.ts`

**Action:** Create consolidated database connection

```typescript
// src/server/core/database/postgres.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '@/shared/types/database';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Maximum number of clients in the pool
});

// Create and export the database instance
export const postgresDb = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

// Export pool for direct access if needed
export { pool };
```

#### 3.1.2 Create `src/server/core/database/vector.ts`

**Source:** `src/server/clients/vectorClient.ts`

**Action:** Move file content to new location

```typescript
// src/server/core/database/vector.ts
import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

export const vectorIndex = pinecone.index(process.env.PINECONE_INDEX!);

export async function remember(userId: string, id: string, vector: number[], metadata: RecordMetadata) {
  await vectorIndex.namespace(userId).upsert([{ id, values: vector, metadata: {...metadata, timestamp: new Date().toISOString()} }]);
}

export async function recall(userId: string, vector: number[], topK = 5) {
  const response = await vectorIndex.namespace(userId).query({ vector, topK, includeValues: false, includeMetadata: true });
  return response.matches;
}
```

#### 3.1.3 Create `src/server/core/database/index.ts`

```typescript
// src/server/core/database/index.ts
export * from './postgres';
export * from './vector';
```

### 3.2 Update Database Imports

#### 3.2.1 Update `src/server/db/postgres/users.ts`

**Before:**
```typescript
import { db } from './db';
```

**After:**
```typescript
import { postgresDb as db } from '@/server/core/database/postgres';
```

#### 3.2.2 Update `src/server/db/postgres/subscriptions.ts`

**Before:**
```typescript
import { db } from './db';
```

**After:**
```typescript
import { postgresDb as db } from '@/server/core/database/postgres';
```

#### 3.2.3 Update `src/server/db/postgres/conversation-context.ts`

**Before:**
```typescript
import { db } from './db';
```

**After:**
```typescript
import { postgresDb as db } from '@/server/core/database/postgres';
```

#### 3.2.4 Update all repository files

**Files to update:**
- `src/server/repositories/base.repository.ts`
- `src/server/repositories/conversation.repository.ts`
- `src/server/repositories/message.repository.ts`

**Before:**
```typescript
import { Database } from '@/shared/types/schema';
```

**After:**
```typescript
import { Database } from '@/shared/types/database';
```

### 3.3 Create Data Repositories

#### 3.3.1 Create `src/server/data/repositories/userRepository.ts`

**Source:** Functions from `src/server/db/postgres/users.ts`

```typescript
// src/server/data/repositories/userRepository.ts
import { BaseRepository } from './base.repository';
import { User, FitnessProfile, UserWithProfile, CreateUserData, CreateFitnessProfileData } from '@/shared/types/user';
import { UsersTable, FitnessProfilesTable } from '@/shared/types/database';
import { Insertable, Selectable, Updateable } from 'kysely';

export type UserRecord = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export type FitnessProfileRecord = Selectable<FitnessProfilesTable>;
export type NewFitnessProfile = Insertable<FitnessProfilesTable>;
export type FitnessProfileUpdate = Updateable<FitnessProfilesTable>;

export class UserRepository extends BaseRepository {
  async create(userData: CreateUserData): Promise<User> {
    return await this.db
      .insertInto('users')
      .values({
        name: userData.name,
        phone_number: userData.phone_number,
        email: userData.email || null,
        stripe_customer_id: userData.stripe_customer_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('phone_number', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst();
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('stripe_customer_id', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst();
  }

  async update(id: string, userData: Partial<CreateUserData>): Promise<User> {
    return await this.db
      .updateTable('users')
      .set({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createFitnessProfile(profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    return await this.db
      .insertInto('fitness_profiles')
      .values({
        user_id: profileData.user_id,
        fitness_goals: profileData.fitness_goals,
        skill_level: profileData.skill_level,
        exercise_frequency: profileData.exercise_frequency,
        gender: profileData.gender,
        age: profileData.age,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findWithProfile(userId: string): Promise<UserWithProfile | null> {
    const user = await this.findById(userId);
    
    if (!user) {
      return null;
    }

    const profile = await this.db
      .selectFrom('fitness_profiles')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst();

    return {
      ...user,
      profile: profile || null,
      info: []
    };
  }
}
```

#### 3.3.2 Move existing repositories

**Action:** Move existing repository files to new location

```bash
# Move base repository
mv src/server/repositories/base.repository.ts src/server/data/repositories/baseRepository.ts

# Move conversation repository
mv src/server/repositories/conversation.repository.ts src/server/data/repositories/conversationRepository.ts

# Move message repository
mv src/server/repositories/message.repository.ts src/server/data/repositories/messageRepository.ts
```

#### 3.3.3 Update base repository

**File:** `src/server/data/repositories/baseRepository.ts`

**Before:**
```typescript
import { Database } from '@/shared/types/schema';
```

**After:**
```typescript
import { Database } from '@/shared/types/database';
```

#### 3.3.4 Create `src/server/data/repositories/index.ts`

```typescript
// src/server/data/repositories/index.ts
export * from './baseRepository';
export * from './userRepository';
export * from './conversationRepository';
export * from './messageRepository';
```

### 3.4 Update Repository Imports

#### 3.4.1 Update service files

**Files to update:**
- `src/server/services/conversationStorage.ts`

**Before:**
```typescript
import { ConversationRepository, Conversation } from '../repositories/conversation.repository';
import { MessageRepository, Message } from '../repositories/message.repository';
```

**After:**
```typescript
import { ConversationRepository, Conversation } from '../data/repositories/conversationRepository';
import { MessageRepository, Message } from '../data/repositories/messageRepository';
```

### 3.5 Testing Phase 3

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Fix any import errors
- [ ] Run linting: `pnpm lint`
- [ ] Test database connectivity: `pnpm dev`

## Phase 4: Reorganize External Clients

### 4.1 Move External Clients

#### 4.1.1 Move Twilio client

```bash
# Move Twilio client
mv src/server/clients/twilio.ts src/server/core/clients/twilio.ts
```

#### 4.1.2 Create `src/server/core/clients/index.ts`

```typescript
// src/server/core/clients/index.ts
export * from './twilio';
```

### 4.2 Update Client Imports

#### 4.2.1 Update agent files

**Files to update:**
- `src/server/agents/fitnessOutlineAgent.ts`

**Before:**
```typescript
import { twilioClient } from '../clients/twilio';
```

**After:**
```typescript
import { twilioClient } from '../core/clients/twilio';
```

### 4.3 Remove Old Client Files

```bash
# Remove old client files (after confirming all imports are updated)
rm src/server/clients/dbClient.ts
rm src/server/clients/vectorClient.ts
rmdir src/server/clients
```

### 4.4 Testing Phase 4

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Fix any import errors
- [ ] Test SMS functionality: `pnpm sms:test`

## Phase 5: Reorganize Services

### 5.1 Move AI Services

#### 5.1.1 Move chat service

```bash
# Move chat service
mv src/server/services/chat.ts src/server/services/ai/chatService.ts
```

#### 5.1.2 Move conversation context service

```bash
# Move conversation context service
mv src/server/services/conversation-context.ts src/server/services/ai/contextService.ts
```

#### 5.1.3 Move prompt builder service

```bash
# Move prompt builder service
mv src/server/services/prompt-builder.ts src/server/services/ai/promptService.ts
```

#### 5.1.4 Move memory service

```bash
# Move memory service
mv src/server/db/vector/memoryTools.ts src/server/services/ai/memoryService.ts
```

**Update imports in memory service:**

**Before:**
```typescript
import { recall as vectorRecall, remember as vectorRemember } from '../../clients/vectorClient';
```

**After:**
```typescript
import { recall as vectorRecall, remember as vectorRemember } from '../../core/database/vector';
```

### 5.2 Move Infrastructure Services

#### 5.2.1 Move conversation storage service

```bash
# Move conversation storage service
mv src/server/services/conversationStorage.ts src/server/services/infrastructure/conversationStorageService.ts
```

### 5.3 Update Service Imports

#### 5.3.1 Update chat service imports

**File:** `src/server/services/ai/chatService.ts`

**Before:**
```typescript
import { ConversationContextService } from './conversation-context';
import { PromptBuilder } from './prompt-builder';
```

**After:**
```typescript
import { ConversationContextService } from './contextService';
import { PromptBuilder } from './promptService';
```

#### 5.3.2 Update API route imports

**File:** `src/app/api/sms/route.ts`

**Before:**
```typescript
import { generateChatResponse } from '@/server/services/chat';
```

**After:**
```typescript
import { generateChatResponse } from '@/server/services/ai/chatService';
```

### 5.4 Create Service Index Files

#### 5.4.1 Create `src/server/services/ai/index.ts`

```typescript
// src/server/services/ai/index.ts
export * from './chatService';
export * from './contextService';
export * from './promptService';
export * from './memoryService';
```

#### 5.4.2 Create `src/server/services/infrastructure/index.ts`

```typescript
// src/server/services/infrastructure/index.ts
export * from './conversationStorageService';
```

#### 5.4.3 Create `src/server/services/index.ts`

```typescript
// src/server/services/index.ts
export * from './ai';
export * from './infrastructure';
```

### 5.5 Testing Phase 5

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Fix any import errors
- [ ] Test chat functionality
- [ ] Test SMS workflow

## Phase 6: Clean Up Agents

### 6.1 Rename Agent Files

```bash
# Rename agent files for consistency (keep current camelCase)
# No changes needed - files already follow camelCase:
# - fitnessOutlineAgent.ts
# - workoutGeneratorAgent.ts
# - workoutUpdateAgentt.ts (fix typo to workoutUpdateAgent.ts)
```

### 6.2 Update Agent Imports

#### 6.2.1 Update API route imports

**File:** `src/app/api/agent/route.ts`

**Before:**
```typescript
import { onboardUser } from '@/server/agents/fitnessOutlineAgent';
```

**After:**
```typescript
import { onboardUser } from '@/server/agents/fitnessOutlineAgent';
```

### 6.3 Create Agent Index File

```typescript
// src/server/agents/index.ts
export * from './fitnessOutlineAgent';
export * from './workoutGeneratorAgent';
export * from './workoutUpdateAgent';
```

### 6.4 Testing Phase 6

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Fix any import errors
- [ ] Test agent functionality

## Phase 7: Clean Up Old Files and Directories

### 7.1 Remove Old Database Files

```bash
# Remove old database files
rm src/server/db/postgres/db.ts
rm src/server/db/postgres/users.ts
rm src/server/db/postgres/subscriptions.ts
rm src/server/db/postgres/conversation-context.ts
rmdir src/server/db/postgres

# Remove old vector directory
rmdir src/server/db/vector
rmdir src/server/db
```

### 7.2 Remove Old Type Files

```bash
# Remove old server types directory
rm -rf src/server/types
```

### 7.3 Remove Old Service Files

```bash
# Remove old service files (if any remain)
# Only remove if confirmed empty
ls src/server/services/
# If empty, remove directory
```

### 7.4 Testing Phase 7

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Fix any remaining import errors
- [ ] Full application test: `pnpm dev`

## Phase 8: Final Cleanup and Testing

### 8.1 Update Shared Utils

#### 8.1.1 Organize shared utils

**File:** `src/shared/utils.ts`

**Action:** Move content to organized files

```typescript
// src/shared/utils/dateUtils.ts
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function getDatesUntilSaturday(startDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate.getDay() !== 6) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  dates.push(new Date(currentDate));

  return dates;
}
```

```typescript
// src/shared/utils/index.ts
export * from './dateUtils';
```

### 8.2 Create Barrel Exports

#### 8.2.1 Update `src/shared/index.ts`

```typescript
// src/shared/index.ts
export * from './types';
export * from './schemas';
export * from './utils';
```

#### 8.2.2 Create `src/server/index.ts`

```typescript
// src/server/index.ts
export * from './core';
export * from './data';
export * from './services';
export * from './agents';
export * from './utils';
```

### 8.3 Final Testing

- [ ] Run TypeScript compilation: `pnpm build`
- [ ] Run linting: `pnpm lint`
- [ ] Test all major workflows:
  - [ ] User signup flow
  - [ ] SMS messaging
  - [ ] Workout generation
  - [ ] Database operations
  - [ ] Agent functionality

### 8.4 Performance Testing

- [ ] Test application startup time
- [ ] Test database connection performance
- [ ] Test API response times
- [ ] Memory usage check

## Post-Implementation

### Documentation Updates

- [ ] Update README.md with new directory structure
- [ ] Update CLAUDE.md with new import paths
- [ ] Update any developer documentation

### Code Review

- [ ] Review all import statements for consistency
- [ ] Review error handling
- [ ] Review type safety
- [ ] Review barrel exports

### Commit Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "refactor: reorganize directory structure for better separation of concerns

- Consolidate types and schemas in shared directory
- Separate database connections from data access logic
- Organize services by domain and concern
- Create consistent repository pattern
- Clean up agent file naming
- Improve import organization and barrel exports"
```

### Create Pull Request

- [ ] Push feature branch: `git push origin feature/directory-reorganization`
- [ ] Create pull request with detailed description
- [ ] Request team review
- [ ] Run CI/CD pipeline
- [ ] Merge after approval

## Rollback Plan

If issues arise during implementation:

1. **Immediate rollback:** `git checkout backup/pre-reorganization`
2. **Partial rollback:** Use git to revert specific commits
3. **Fix forward:** Address specific issues and continue

## Success Criteria

- [ ] All TypeScript compilation passes
- [ ] All linting passes
- [ ] Application starts successfully
- [ ] All major workflows function correctly
- [ ] No performance regressions
- [ ] Clean and organized directory structure
- [ ] Consistent import patterns
- [ ] Team approval on pull request

## Notes

- Each phase should be tested before moving to the next
- Import updates may require multiple iterations
- Consider using IDE refactoring tools for import updates
- Monitor application performance throughout the process
- Document any issues encountered for future reference