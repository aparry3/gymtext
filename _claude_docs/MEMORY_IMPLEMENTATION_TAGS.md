# GymText Memory System - Tag-Based Implementation Plan

## Overview
This document provides an alternative implementation plan for the GymText memory system using a tag-based approach. Instead of a single structured text document per user, this approach stores individual memory entries with categorizing tags, offering more flexibility and better querying capabilities.

## Core Concept
Each memory is stored as an individual row with:
- **Content**: The actual memory text
- **Tags**: Array of categorizing tags (mix of enums and dynamic strings)
- **Expiration**: Optional expiration date for temporary memories
- **Metadata**: JSON field for additional structured data

## Phase 1A: Database and Core Models (Week 1-2)

### 1. Database Schema & Migration

#### Task 1.1: Create Migration
**Command**: `pnpm migrate:create`
**Enter name**: `create_user_memories_tagged`
**File Generated**: `migrations/[timestamp]_create_user_memories_tagged.ts`

```typescript
import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create user_memories table with tags
  await db.schema
    .createTable('user_memories')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('tags', sql`text[]`, (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz')
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create indexes for efficient querying
  await db.schema
    .createIndex('idx_user_memories_user_id')
    .on('user_memories')
    .column('user_id')
    .execute();

  // GIN index for array containment queries
  await sql`
    CREATE INDEX idx_user_memories_tags ON user_memories USING GIN(tags);
  `.execute(db);

  // Index for expiration queries
  await db.schema
    .createIndex('idx_user_memories_expires')
    .on('user_memories')
    .column('expires_at')
    .where('expires_at', 'is not', null)
    .execute();

  // Composite index for user + tags queries
  await sql`
    CREATE INDEX idx_user_memories_user_tags ON user_memories(user_id, tags);
  `.execute(db);

  // Create updated_at trigger
  await sql`
    CREATE OR REPLACE FUNCTION update_user_memories_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_user_memories_timestamp
      BEFORE UPDATE ON user_memories
      FOR EACH ROW
      EXECUTE FUNCTION update_user_memories_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS update_user_memories_timestamp ON user_memories`.execute(db);
  await sql`DROP FUNCTION IF EXISTS update_user_memories_updated_at()`.execute(db);
  await db.schema.dropTable('user_memories').execute();
}
```

### 2. Data Models

#### Task 2.1: Create Memory Tags Enum
**File**: `src/server/models/memoryTags.ts`
```typescript
// Core memory tag categories (enforced enums)
export enum MemoryTagCategory {
  // Content categories
  INJURY = 'injury',
  PREFERENCE = 'preference',
  COACHING_NOTE = 'coaching_note',
  PERFORMANCE = 'performance',
  WORKOUT = 'workout',
  EQUIPMENT = 'equipment',
  ENVIRONMENT = 'environment',
  GOAL = 'goal',
  PATTERN = 'pattern',
  LIMITATION = 'limitation',
  
  // Status modifiers
  ONGOING = 'ongoing',
  TEMPORARY = 'temporary',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived',
  
  // Priority levels
  HIGH_PRIORITY = 'high_priority',
  MEDIUM_PRIORITY = 'medium_priority',
  LOW_PRIORITY = 'low_priority',
  
  // Sentiment/Type
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  
  // Preference types
  LOVES = 'loves',
  LIKES = 'likes',
  DISLIKES = 'dislikes',
  HATES = 'hates'
}

// Tag validation and categorization
export type CoreTag = MemoryTagCategory;
export type DynamicTag = string; // Exercise names, muscle groups, locations, etc.
export type MemoryTags = string[]; // Mix of core and dynamic tags

// Tag categories for grouping
export const TAG_GROUPS = {
  CATEGORIES: [
    MemoryTagCategory.INJURY,
    MemoryTagCategory.PREFERENCE,
    MemoryTagCategory.COACHING_NOTE,
    MemoryTagCategory.PERFORMANCE,
    MemoryTagCategory.WORKOUT,
    MemoryTagCategory.EQUIPMENT,
    MemoryTagCategory.ENVIRONMENT,
    MemoryTagCategory.GOAL,
    MemoryTagCategory.PATTERN,
    MemoryTagCategory.LIMITATION
  ],
  STATUS: [
    MemoryTagCategory.ONGOING,
    MemoryTagCategory.TEMPORARY,
    MemoryTagCategory.RESOLVED,
    MemoryTagCategory.ARCHIVED
  ],
  PRIORITY: [
    MemoryTagCategory.HIGH_PRIORITY,
    MemoryTagCategory.MEDIUM_PRIORITY,
    MemoryTagCategory.LOW_PRIORITY
  ],
  SENTIMENT: [
    MemoryTagCategory.POSITIVE,
    MemoryTagCategory.NEGATIVE,
    MemoryTagCategory.NEUTRAL
  ],
  PREFERENCE: [
    MemoryTagCategory.LOVES,
    MemoryTagCategory.LIKES,
    MemoryTagCategory.DISLIKES,
    MemoryTagCategory.HATES
  ]
} as const;

// Helper to identify tag type
export function isCorTag(tag: string): tag is CoreTag {
  return Object.values(MemoryTagCategory).includes(tag as MemoryTagCategory);
}

// Common dynamic tags (for autocomplete/suggestions)
export const COMMON_DYNAMIC_TAGS = {
  MUSCLE_GROUPS: [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'core'
  ],
  EXERCISES: [
    'squat', 'deadlift', 'bench-press', 'overhead-press',
    'pull-up', 'push-up', 'row', 'curl', 'dip', 'plank'
  ],
  EQUIPMENT_TYPES: [
    'barbell', 'dumbbell', 'kettlebell', 'resistance-band',
    'cable', 'machine', 'bodyweight', 'trx', 'medicine-ball'
  ],
  CONTEXTS: [
    'home', 'gym', 'hotel', 'outdoor', 'travel', 'vacation'
  ]
} as const;
```

#### Task 2.2: Create Memory Model
**File**: `src/server/models/memory.ts`
```typescript
import { Selectable, Insertable, Updateable } from 'kysely';
import type { UserMemories } from './_types';
import type { MemoryTags } from './memoryTags';

// Database types
export type Memory = Selectable<UserMemories>;
export type NewMemory = Insertable<UserMemories>;
export type MemoryUpdate = Updateable<UserMemories>;

// Extended memory type with parsed fields
export interface MemoryWithMetadata extends Memory {
  parsedMetadata?: MemoryMetadata;
  isExpired?: boolean;
  daysUntilExpiration?: number;
  primaryCategory?: string;
}

// Metadata structure for additional memory data
export interface MemoryMetadata {
  // Workout-related
  date?: string;
  exercises?: string[];
  sets?: string;
  reps?: string;
  weight?: number;
  duration?: number;
  
  // Injury/limitation related
  severity?: 'mild' | 'moderate' | 'severe';
  bodyPart?: string;
  notedDate?: string;
  recoveryPlan?: string;
  
  // Environment related
  location?: string;
  equipment?: string[];
  
  // Performance metrics
  pr?: boolean; // Personal record
  rpe?: number; // Rate of perceived exertion (1-10)
  mood?: string;
  
  // Source information
  source?: 'sms' | 'daily_message' | 'onboarding' | 'manual' | 'system';
  conversationId?: string;
}

// Memory query options
export interface MemoryQueryOptions {
  userId: string;
  tags?: string[];
  excludeTags?: string[];
  includeExpired?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'expires_at';
  orderDirection?: 'asc' | 'desc';
  searchContent?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Memory aggregation for context building
export interface MemoryContext {
  injuries: MemoryWithMetadata[];
  preferences: MemoryWithMetadata[];
  recentWorkouts: MemoryWithMetadata[];
  equipment: MemoryWithMetadata[];
  goals: MemoryWithMetadata[];
  patterns: MemoryWithMetadata[];
  coachingNotes: MemoryWithMetadata[];
  highPriority: MemoryWithMetadata[];
}

// Memory statistics
export interface MemoryStats {
  totalMemories: number;
  byCategory: Record<string, number>;
  expiringWithin7Days: number;
  recentlyAdded: number;
  mostCommonTags: Array<{ tag: string; count: number }>;
}
```

### 3. Repository Layer

#### Task 3.1: Create Memory Repository
**File**: `src/server/repositories/memoryRepository.ts`
```typescript
import { db } from '@/server/connections/db';
import type { Memory, NewMemory, MemoryUpdate, MemoryQueryOptions } from '@/server/models/memory';
import { sql } from 'kysely';

export class MemoryRepository {
  async findById(id: string): Promise<Memory | undefined> {
    return await db
      .selectFrom('user_memories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByUserId(
    userId: string,
    options?: Partial<MemoryQueryOptions>
  ): Promise<Memory[]> {
    let query = db
      .selectFrom('user_memories')
      .selectAll()
      .where('user_id', '=', userId);

    // Filter by tags (using PostgreSQL array operators)
    if (options?.tags && options.tags.length > 0) {
      query = query.where(
        sql`tags @> ${sql.array(options.tags)}::text[]`
      );
    }

    // Exclude specific tags
    if (options?.excludeTags && options.excludeTags.length > 0) {
      query = query.where(
        sql`NOT (tags && ${sql.array(options.excludeTags)}::text[])`
      );
    }

    // Filter expired items
    if (!options?.includeExpired) {
      query = query.where((eb) =>
        eb.or([
          eb('expires_at', 'is', null),
          eb('expires_at', '>', sql`now()`)
        ])
      );
    }

    // Search in content
    if (options?.searchContent) {
      query = query.where(
        'content', 'ilike', `%${options.searchContent}%`
      );
    }

    // Date range filter
    if (options?.dateRange) {
      query = query
        .where('created_at', '>=', options.dateRange.start)
        .where('created_at', '<=', options.dateRange.end);
    }

    // Ordering
    const orderBy = options?.orderBy || 'created_at';
    const orderDirection = options?.orderDirection || 'desc';
    query = query.orderBy(orderBy, orderDirection);

    // Pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findByTags(
    userId: string,
    tags: string[],
    matchAll: boolean = false
  ): Promise<Memory[]> {
    let query = db
      .selectFrom('user_memories')
      .selectAll()
      .where('user_id', '=', userId);

    if (matchAll) {
      // Must contain ALL specified tags
      query = query.where(
        sql`tags @> ${sql.array(tags)}::text[]`
      );
    } else {
      // Must contain ANY of the specified tags
      query = query.where(
        sql`tags && ${sql.array(tags)}::text[]`
      );
    }

    // Exclude expired by default
    query = query.where((eb) =>
      eb.or([
        eb('expires_at', 'is', null),
        eb('expires_at', '>', sql`now()`)
      ])
    );

    return await query
      .orderBy('created_at', 'desc')
      .execute();
  }

  async create(memory: NewMemory): Promise<Memory> {
    return await db
      .insertInto('user_memories')
      .values({
        ...memory,
        tags: sql`${sql.array(memory.tags)}::text[]`
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createBatch(memories: NewMemory[]): Promise<Memory[]> {
    if (memories.length === 0) return [];

    const values = memories.map(m => ({
      ...m,
      tags: sql`${sql.array(m.tags)}::text[]`
    }));

    return await db
      .insertInto('user_memories')
      .values(values)
      .returningAll()
      .execute();
  }

  async update(id: string, updates: MemoryUpdate): Promise<Memory> {
    const updateData = { ...updates };
    
    if (updates.tags) {
      updateData.tags = sql`${sql.array(updates.tags)}::text[]` as any;
    }

    return await db
      .updateTable('user_memories')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string): Promise<void> {
    await db
      .deleteFrom('user_memories')
      .where('id', '=', id)
      .execute();
  }

  async deleteExpired(): Promise<number> {
    const result = await db
      .deleteFrom('user_memories')
      .where('expires_at', '<', sql`now()`)
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }

  async findExpiringSoon(days: number = 7): Promise<Memory[]> {
    return await db
      .selectFrom('user_memories')
      .selectAll()
      .where('expires_at', 'is not', null)
      .where('expires_at', '>', sql`now()`)
      .where('expires_at', '<', sql`now() + interval '${days} days'`)
      .orderBy('expires_at', 'asc')
      .execute();
  }

  async getTagStatistics(userId: string): Promise<Array<{ tag: string; count: number }>> {
    const result = await sql<{ tag: string; count: string }>`
      SELECT 
        unnest(tags) as tag,
        COUNT(*) as count
      FROM user_memories
      WHERE user_id = ${userId}
        AND (expires_at IS NULL OR expires_at > now())
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `.execute(db);

    return result.rows.map(row => ({
      tag: row.tag,
      count: parseInt(row.count)
    }));
  }

  async addTags(id: string, newTags: string[]): Promise<Memory> {
    // Add tags without duplicates
    return await db
      .updateTable('user_memories')
      .set({
        tags: sql`array(SELECT DISTINCT unnest(tags || ${sql.array(newTags)}::text[]))`,
        updated_at: sql`now()`
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async removeTags(id: string, tagsToRemove: string[]): Promise<Memory> {
    // Remove specific tags
    return await db
      .updateTable('user_memories')
      .set({
        tags: sql`array(SELECT unnest(tags) EXCEPT SELECT unnest(${sql.array(tagsToRemove)}::text[]))`,
        updated_at: sql`now()`
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async archive(id: string): Promise<Memory> {
    // Add 'archived' tag and remove from active queries
    return await this.addTags(id, ['archived']);
  }
}
```

### 4. Service Layer

#### Task 4.1: Create Tagged Memory Service
**File**: `src/server/services/taggedMemoryService.ts`
```typescript
import { MemoryRepository } from '@/server/repositories/memoryRepository';
import { UserRepository } from '@/server/repositories/userRepository';
import type { Memory, MemoryWithMetadata, MemoryContext, NewMemory, MemoryQueryOptions } from '@/server/models/memory';
import { MemoryTagCategory, isCorTag, TAG_GROUPS } from '@/server/models/memoryTags';
import type { FitnessProfile } from '@/server/models/fitnessProfile';
import { addDays, differenceInDays, parseISO } from 'date-fns';

export class TaggedMemoryService {
  private memoryRepo: MemoryRepository;
  private userRepo: UserRepository;

  constructor() {
    this.memoryRepo = new MemoryRepository();
    this.userRepo = new UserRepository();
  }

  // Core memory operations
  async addMemory(
    userId: string,
    content: string,
    tags: string[],
    expiresAt?: Date | null,
    metadata?: Record<string, any>
  ): Promise<Memory> {
    // Validate and normalize tags
    const normalizedTags = this.normalizeTags(tags);
    
    // Auto-add priority based on certain tags
    if (normalizedTags.includes(MemoryTagCategory.INJURY) && 
        !this.hasAnyTag(normalizedTags, TAG_GROUPS.PRIORITY)) {
      normalizedTags.push(MemoryTagCategory.HIGH_PRIORITY);
    }

    return await this.memoryRepo.create({
      user_id: userId,
      content,
      tags: normalizedTags,
      expires_at: expiresAt,
      metadata: metadata || {}
    });
  }

  async getMemories(
    userId: string,
    options?: Partial<MemoryQueryOptions>
  ): Promise<MemoryWithMetadata[]> {
    const memories = await this.memoryRepo.findByUserId(userId, options);
    return this.enrichMemories(memories);
  }

  async getMemoryContext(userId: string): Promise<MemoryContext> {
    // Fetch all active memories
    const memories = await this.getMemories(userId, {
      includeExpired: false
    });

    // Categorize memories
    const context: MemoryContext = {
      injuries: memories.filter(m => m.tags.includes(MemoryTagCategory.INJURY)),
      preferences: memories.filter(m => m.tags.includes(MemoryTagCategory.PREFERENCE)),
      recentWorkouts: memories.filter(m => m.tags.includes(MemoryTagCategory.WORKOUT))
        .slice(0, 10), // Last 10 workouts
      equipment: memories.filter(m => m.tags.includes(MemoryTagCategory.EQUIPMENT)),
      goals: memories.filter(m => m.tags.includes(MemoryTagCategory.GOAL)),
      patterns: memories.filter(m => m.tags.includes(MemoryTagCategory.PATTERN)),
      coachingNotes: memories.filter(m => m.tags.includes(MemoryTagCategory.COACHING_NOTE)),
      highPriority: memories.filter(m => m.tags.includes(MemoryTagCategory.HIGH_PRIORITY))
    };

    return context;
  }

  async formatContextForLLM(userId: string): Promise<string> {
    const context = await this.getMemoryContext(userId);
    const sections: string[] = [];

    // High priority items first
    if (context.highPriority.length > 0) {
      sections.push('=== IMPORTANT NOTES ===');
      context.highPriority.forEach(m => {
        sections.push(`- ${m.content}${this.formatExpiration(m)}`);
      });
    }

    // Current injuries/limitations
    if (context.injuries.length > 0) {
      sections.push('\n=== INJURIES & LIMITATIONS ===');
      context.injuries.forEach(m => {
        const severity = m.parsedMetadata?.severity || '';
        const status = m.tags.includes(MemoryTagCategory.ONGOING) ? 'Ongoing' : 'Temporary';
        sections.push(`- ${status}: ${m.content}${severity ? ` (${severity})` : ''}${this.formatExpiration(m)}`);
      });
    }

    // Preferences
    const loves = context.preferences.filter(m => m.tags.includes(MemoryTagCategory.LOVES));
    const dislikes = context.preferences.filter(m => m.tags.includes(MemoryTagCategory.DISLIKES));
    
    if (loves.length > 0 || dislikes.length > 0) {
      sections.push('\n=== PREFERENCES ===');
      if (loves.length > 0) {
        sections.push(`Loves: ${loves.map(m => m.content).join(', ')}`);
      }
      if (dislikes.length > 0) {
        sections.push(`Dislikes: ${dislikes.map(m => m.content).join(', ')}`);
      }
    }

    // Recent workouts
    if (context.recentWorkouts.length > 0) {
      sections.push('\n=== RECENT WORKOUTS ===');
      context.recentWorkouts.forEach(m => {
        const date = m.parsedMetadata?.date || m.created_at.toISOString().split('T')[0];
        sections.push(`- ${date}: ${m.content}`);
      });
    }

    // Equipment/Environment
    if (context.equipment.length > 0) {
      sections.push('\n=== EQUIPMENT & ENVIRONMENT ===');
      context.equipment.forEach(m => {
        const location = m.parsedMetadata?.location || '';
        sections.push(`- ${m.content}${location ? ` (${location})` : ''}${this.formatExpiration(m)}`);
      });
    }

    // Goals
    if (context.goals.length > 0) {
      sections.push('\n=== GOALS ===');
      context.goals.forEach(m => {
        sections.push(`- ${m.content}`);
      });
    }

    // Patterns
    if (context.patterns.length > 0) {
      sections.push('\n=== PATTERNS & OBSERVATIONS ===');
      context.patterns.forEach(m => {
        sections.push(`- ${m.content}`);
      });
    }

    // Coaching notes
    if (context.coachingNotes.length > 0) {
      sections.push('\n=== COACHING NOTES ===');
      context.coachingNotes.forEach(m => {
        sections.push(`- ${m.content}`);
      });
    }

    return sections.join('\n');
  }

  // Memory initialization from profile
  async initializeFromProfile(userId: string, profile: FitnessProfile): Promise<void> {
    const memories: NewMemory[] = [];

    // Add fitness goals
    if (profile.fitnessGoals) {
      memories.push({
        user_id: userId,
        content: profile.fitnessGoals,
        tags: [MemoryTagCategory.GOAL],
        metadata: { source: 'onboarding' }
      });
    }

    // Add skill level
    if (profile.skillLevel) {
      memories.push({
        user_id: userId,
        content: `Skill level: ${profile.skillLevel}`,
        tags: [MemoryTagCategory.COACHING_NOTE],
        metadata: { source: 'onboarding' }
      });
    }

    // Add equipment
    if (profile.equipment) {
      const equipmentList = profile.equipment.split(',').map(e => e.trim());
      memories.push({
        user_id: userId,
        content: `Available equipment: ${profile.equipment}`,
        tags: [MemoryTagCategory.EQUIPMENT, ...equipmentList],
        metadata: { 
          source: 'onboarding',
          equipment: equipmentList
        }
      });
    }

    // Add gym access
    if (profile.gymAccess) {
      memories.push({
        user_id: userId,
        content: `Gym access: ${profile.gymAccess}`,
        tags: [MemoryTagCategory.ENVIRONMENT, profile.gymAccess.toLowerCase()],
        metadata: { source: 'onboarding' }
      });
    }

    // Add workout time preference
    if (profile.preferredWorkoutTime) {
      memories.push({
        user_id: userId,
        content: `Preferred workout time: ${profile.preferredWorkoutTime}`,
        tags: [MemoryTagCategory.PREFERENCE, MemoryTagCategory.PATTERN],
        metadata: { source: 'onboarding' }
      });
    }

    if (memories.length > 0) {
      await this.memoryRepo.createBatch(memories);
    }
  }

  // Tag management
  async updateTags(memoryId: string, tags: string[]): Promise<Memory> {
    const normalizedTags = this.normalizeTags(tags);
    return await this.memoryRepo.update(memoryId, { tags: normalizedTags });
  }

  async addTags(memoryId: string, newTags: string[]): Promise<Memory> {
    const normalizedTags = this.normalizeTags(newTags);
    return await this.memoryRepo.addTags(memoryId, normalizedTags);
  }

  async removeTags(memoryId: string, tagsToRemove: string[]): Promise<Memory> {
    return await this.memoryRepo.removeTags(memoryId, tagsToRemove);
  }

  // Expiration management
  async setExpiration(memoryId: string, expiresAt: Date | null): Promise<Memory> {
    return await this.memoryRepo.update(memoryId, { expires_at: expiresAt });
  }

  async getExpiringMemories(userId: string, days: number = 7): Promise<MemoryWithMetadata[]> {
    const memories = await this.memoryRepo.findExpiringSoon(days);
    const userMemories = memories.filter(m => m.user_id === userId);
    return this.enrichMemories(userMemories);
  }

  async cleanExpiredMemories(): Promise<number> {
    return await this.memoryRepo.deleteExpired();
  }

  // Archive old memories
  async archiveMemory(memoryId: string): Promise<Memory> {
    return await this.memoryRepo.archive(memoryId);
  }

  async archiveOldWorkouts(userId: string, daysToKeep: number = 14): Promise<void> {
    const cutoffDate = addDays(new Date(), -daysToKeep);
    
    const oldWorkouts = await this.memoryRepo.findByUserId(userId, {
      tags: [MemoryTagCategory.WORKOUT],
      dateRange: {
        start: new Date('2020-01-01'), // Far past
        end: cutoffDate
      }
    });

    for (const workout of oldWorkouts) {
      await this.archiveMemory(workout.id);
    }
  }

  // Helper methods
  private normalizeTags(tags: string[]): string[] {
    return [...new Set(tags.map(tag => tag.toLowerCase().trim()))];
  }

  private hasAnyTag(tags: string[], checkTags: readonly string[]): boolean {
    return tags.some(tag => checkTags.includes(tag));
  }

  private enrichMemories(memories: Memory[]): MemoryWithMetadata[] {
    const now = new Date();
    
    return memories.map(memory => {
      const enriched: MemoryWithMetadata = {
        ...memory,
        parsedMetadata: memory.metadata as any,
        isExpired: memory.expires_at ? new Date(memory.expires_at) < now : false,
        primaryCategory: this.getPrimaryCategory(memory.tags)
      };

      if (memory.expires_at && !enriched.isExpired) {
        enriched.daysUntilExpiration = differenceInDays(
          new Date(memory.expires_at),
          now
        );
      }

      return enriched;
    });
  }

  private getPrimaryCategory(tags: string[]): string | undefined {
    // Find the first category tag
    return tags.find(tag => TAG_GROUPS.CATEGORIES.includes(tag as any));
  }

  private formatExpiration(memory: MemoryWithMetadata): string {
    if (!memory.expires_at) return '';
    
    if (memory.isExpired) {
      return ' [EXPIRED]';
    }
    
    if (memory.daysUntilExpiration !== undefined) {
      if (memory.daysUntilExpiration <= 3) {
        return ` [expires in ${memory.daysUntilExpiration} days]`;
      }
      return ` [until ${memory.expires_at.toString().split('T')[0]}]`;
    }
    
    return '';
  }

  // Statistics
  async getMemoryStats(userId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
  }> {
    const memories = await this.memoryRepo.findByUserId(userId);
    const tagStats = await this.memoryRepo.getTagStatistics(userId);
    
    const byCategory: Record<string, number> = {};
    for (const category of TAG_GROUPS.CATEGORIES) {
      byCategory[category] = memories.filter(m => m.tags.includes(category)).length;
    }

    return {
      total: memories.length,
      byCategory,
      topTags: tagStats
    };
  }
}
```

## Phase 1B: LLM Integration and Updates (Week 3-4)

### 5. Memory Update Extraction

#### Task 5.1: Create Memory Update Parser
**File**: `src/server/utils/memory/taggedUpdateParser.ts`
```typescript
import { MemoryTagCategory } from '@/server/models/memoryTags';
import { addDays, addWeeks, addMonths } from 'date-fns';

export interface ParsedMemoryUpdate {
  operation: 'ADD' | 'UPDATE' | 'REMOVE' | 'ARCHIVE';
  content: string;
  tags: string[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
  targetId?: string; // For UPDATE/REMOVE operations
}

export function extractMemoryUpdates(llmResponse: string): ParsedMemoryUpdate[] {
  const updates: ParsedMemoryUpdate[] = [];
  
  // Look for memory update blocks
  const updateMatch = llmResponse.match(/<memory_updates?>([\s\S]*?)<\/memory_updates?>/);
  if (!updateMatch) return updates;
  
  const updateContent = updateMatch[1].trim();
  const lines = updateContent.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const parsed = parseUpdateLine(line);
    if (parsed) {
      updates.push(parsed);
    }
  }
  
  return updates;
}

function parseUpdateLine(line: string): ParsedMemoryUpdate | null {
  // Pattern: OPERATION: content [tags: tag1, tag2] [expires: date/duration]
  const match = line.match(/^(ADD|UPDATE|REMOVE|ARCHIVE):\s*(.+)$/i);
  if (!match) return null;
  
  const [, operation, rest] = match;
  let content = rest;
  const tags: string[] = [];
  let expiresAt: Date | undefined;
  const metadata: Record<string, any> = {};
  
  // Extract tags
  const tagsMatch = content.match(/\[tags?:\s*([^\]]+)\]/i);
  if (tagsMatch) {
    const tagList = tagsMatch[1].split(',').map(t => t.trim().toLowerCase());
    tags.push(...tagList);
    content = content.replace(tagsMatch[0], '').trim();
  }
  
  // Extract expiration
  const expiresMatch = content.match(/\[expires?:\s*([^\]]+)\]/i);
  if (expiresMatch) {
    expiresAt = parseExpiration(expiresMatch[1]);
    content = content.replace(expiresMatch[0], '').trim();
  }
  
  // Extract metadata fields
  const metadataMatches = content.matchAll(/\[(\w+):\s*([^\]]+)\]/gi);
  for (const metaMatch of metadataMatches) {
    const [fullMatch, key, value] = metaMatch;
    metadata[key.toLowerCase()] = value;
    content = content.replace(fullMatch, '').trim();
  }
  
  // Auto-detect tags from content
  const autoTags = detectTagsFromContent(content);
  tags.push(...autoTags);
  
  // Add source metadata
  metadata.source = 'llm_extraction';
  
  return {
    operation: operation.toUpperCase() as ParsedMemoryUpdate['operation'],
    content: content.trim(),
    tags: [...new Set(tags)], // Remove duplicates
    expiresAt,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
  };
}

function detectTagsFromContent(content: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Detect injury/pain keywords
  if (/\b(pain|sore|hurt|injury|strain|sprain|ache)\b/.test(lowerContent)) {
    tags.push(MemoryTagCategory.INJURY);
    
    if (/\b(severe|sharp|acute|intense)\b/.test(lowerContent)) {
      tags.push(MemoryTagCategory.HIGH_PRIORITY);
    }
  }
  
  // Detect preferences
  if (/\b(love|enjoy|prefer|favorite)\b/.test(lowerContent)) {
    tags.push(MemoryTagCategory.PREFERENCE, MemoryTagCategory.LOVES);
  }
  if (/\b(hate|dislike|avoid|don't like)\b/.test(lowerContent)) {
    tags.push(MemoryTagCategory.PREFERENCE, MemoryTagCategory.DISLIKES);
  }
  
  // Detect workout completion
  if (/\b(completed|finished|did|performed)\b.*\b(workout|exercise|session)\b/.test(lowerContent)) {
    tags.push(MemoryTagCategory.WORKOUT);
  }
  
  // Detect equipment mentions
  if (/\b(dumbbell|barbell|kettlebell|band|machine|cable)\b/.test(lowerContent)) {
    tags.push(MemoryTagCategory.EQUIPMENT);
  }
  
  // Detect environment/location
  if (/\b(gym|home|hotel|outdoor|park|travel)\b/.test(lowerContent)) {
    tags.push(MemoryTagCategory.ENVIRONMENT);
  }
  
  // Detect body parts for injuries
  const bodyParts = ['shoulder', 'back', 'knee', 'ankle', 'wrist', 'elbow', 'hip', 'neck'];
  for (const part of bodyParts) {
    if (lowerContent.includes(part)) {
      tags.push(part);
    }
  }
  
  // Detect exercises
  const exercises = ['squat', 'deadlift', 'bench', 'press', 'curl', 'row', 'pullup', 'pushup'];
  for (const exercise of exercises) {
    if (lowerContent.includes(exercise)) {
      tags.push(exercise);
    }
  }
  
  return tags;
}

function parseExpiration(text: string): Date | undefined {
  const now = new Date();
  
  // Check for specific date (YYYY-MM-DD)
  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) {
    return new Date(dateMatch[0]);
  }
  
  // Check for duration
  const durationMatch = text.match(/(\d+)\s*(days?|weeks?|months?)/i);
  if (durationMatch) {
    const [, amount, unit] = durationMatch;
    const num = parseInt(amount);
    
    if (unit.startsWith('day')) {
      return addDays(now, num);
    } else if (unit.startsWith('week')) {
      return addWeeks(now, num);
    } else if (unit.startsWith('month')) {
      return addMonths(now, num);
    }
  }
  
  return undefined;
}

// Format memory updates for LLM prompts
export function formatMemoryUpdateInstructions(): string {
  return `
When you need to update the user's memory, provide updates in this format:

<memory_updates>
ADD: content [tags: tag1, tag2] [expires: duration/date]
UPDATE: content [tags: tag1, tag2] 
REMOVE: content description
ARCHIVE: content description
</memory_updates>

Examples:
ADD: Shoulder soreness from bench press [tags: injury, shoulder, temporary] [expires: 1 week]
ADD: Loves morning workouts [tags: preference, pattern]
ADD: Completed leg day - squats 3x5 @ 225lbs [tags: workout, legs, squat] [date: 2025-01-07]
UPDATE: Knee recovery progressing well [tags: injury, knee, resolved]
REMOVE: Hotel gym access (back home now)
ARCHIVE: Old injury from 6 months ago

Tags to use:
- Categories: injury, preference, workout, equipment, environment, goal, pattern, coaching_note
- Status: ongoing, temporary, resolved
- Priority: high_priority, medium_priority, low_priority
- Preferences: loves, likes, dislikes, hates
- Add specific tags: body parts, exercises, equipment names, locations
`;
}
```

### 6. Memory Update Service

#### Task 6.1: Create Memory Update Service
**File**: `src/server/services/memoryUpdateService.ts`
```typescript
import { TaggedMemoryService } from './taggedMemoryService';
import { MemoryRepository } from '@/server/repositories/memoryRepository';
import type { ParsedMemoryUpdate } from '@/server/utils/memory/taggedUpdateParser';
import { extractMemoryUpdates } from '@/server/utils/memory/taggedUpdateParser';

export class MemoryUpdateService {
  private memoryService: TaggedMemoryService;
  private memoryRepo: MemoryRepository;

  constructor() {
    this.memoryService = new TaggedMemoryService();
    this.memoryRepo = new MemoryRepository();
  }

  async processLLMResponse(
    userId: string,
    llmResponse: string,
    context?: {
      conversationId?: string;
      source?: string;
    }
  ): Promise<{
    success: boolean;
    processed: number;
    errors: string[];
  }> {
    const updates = extractMemoryUpdates(llmResponse);
    const errors: string[] = [];
    let processed = 0;

    for (const update of updates) {
      try {
        await this.applyUpdate(userId, update, context);
        processed++;
      } catch (error) {
        errors.push(`Failed to process ${update.operation}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      processed,
      errors
    };
  }

  private async applyUpdate(
    userId: string,
    update: ParsedMemoryUpdate,
    context?: {
      conversationId?: string;
      source?: string;
    }
  ): Promise<void> {
    const metadata = {
      ...update.metadata,
      conversationId: context?.conversationId,
      source: context?.source || 'chat'
    };

    switch (update.operation) {
      case 'ADD':
        await this.memoryService.addMemory(
          userId,
          update.content,
          update.tags,
          update.expiresAt,
          metadata
        );
        break;

      case 'UPDATE':
        // Find matching memory to update
        const toUpdate = await this.findMatchingMemory(userId, update.content);
        if (toUpdate) {
          await this.memoryRepo.update(toUpdate.id, {
            content: update.content,
            tags: update.tags.length > 0 ? update.tags : toUpdate.tags,
            expires_at: update.expiresAt,
            metadata: { ...toUpdate.metadata, ...metadata }
          });
        } else {
          // If no match found, add as new
          await this.memoryService.addMemory(
            userId,
            update.content,
            update.tags,
            update.expiresAt,
            metadata
          );
        }
        break;

      case 'REMOVE':
        const toRemove = await this.findMatchingMemory(userId, update.content);
        if (toRemove) {
          await this.memoryRepo.delete(toRemove.id);
        }
        break;

      case 'ARCHIVE':
        const toArchive = await this.findMatchingMemory(userId, update.content);
        if (toArchive) {
          await this.memoryService.archiveMemory(toArchive.id);
        }
        break;
    }
  }

  private async findMatchingMemory(
    userId: string,
    searchText: string
  ): Promise<any | null> {
    // Search for memories with similar content
    const memories = await this.memoryRepo.findByUserId(userId, {
      searchContent: searchText.substring(0, 50), // Use first 50 chars for search
      limit: 1
    });

    return memories[0] || null;
  }
}
```

### 7. Agent Integration

#### Task 7.1: Update Chat Agent
**File**: `src/server/agents/chat/chain.ts` (modifications)
```typescript
import { TaggedMemoryService } from '@/server/services/taggedMemoryService';
import { MemoryUpdateService } from '@/server/services/memoryUpdateService';

// In the chain, add memory context
async ({ userId, message, conversation, messages }) => {
  // ... existing code ...
  
  // Get memory context
  const memoryService = new TaggedMemoryService();
  const memoryContext = await memoryService.formatContextForLLM(userId);
  
  return { user, message, conversation, messages, context, memoryContext };
}

// In the response generation step
async ({ user, message, conversation, messages, context, memoryContext }) => {
  // Generate response with memory context and update instructions
  const prompt = chatPromptWithMemory(user, message, messages, context, memoryContext);
  const response = await llm.invoke(prompt);
  
  const responseContent = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);
  
  // Extract the actual message
  const messageContent = responseContent.split('<memory_update')[0].trim();
  
  // Store assistant message
  // ... existing code ...
  
  // Process memory updates
  const updateService = new MemoryUpdateService();
  const updateResult = await updateService.processLLMResponse(
    user.id,
    responseContent,
    {
      conversationId: conversation.id,
      source: 'chat'
    }
  );
  
  if (!updateResult.success) {
    console.error('Memory update errors:', updateResult.errors);
  } else if (updateResult.processed > 0) {
    console.log(`Processed ${updateResult.processed} memory updates`);
  }
  
  return {
    conversationId: conversation.id,
    response: messageContent,
    context
  };
}
```

## Phase 1C: Cleanup and Maintenance (Week 5)

### 8. Scheduled Jobs

#### Task 8.1: Create Cleanup Job
**File**: `src/server/jobs/memoryCleanupJob.ts`
```typescript
import { TaggedMemoryService } from '@/server/services/taggedMemoryService';
import { MemoryRepository } from '@/server/repositories/memoryRepository';
import type { Job } from './types';

export const taggedMemoryCleanupJob: Job = {
  name: 'tagged-memory-cleanup',
  schedule: '0 0 * * *', // Daily at midnight UTC
  
  async execute(): Promise<void> {
    console.log('[TaggedMemoryCleanup] Starting daily cleanup');
    const startTime = Date.now();
    
    const memoryService = new TaggedMemoryService();
    const memoryRepo = new MemoryRepository();
    
    try {
      // Remove expired memories
      const deletedCount = await memoryService.cleanExpiredMemories();
      console.log(`[TaggedMemoryCleanup] Deleted ${deletedCount} expired memories`);
      
      // Archive old workouts for all users
      const users = await db
        .selectFrom('users')
        .select('id')
        .execute();
      
      for (const user of users) {
        await memoryService.archiveOldWorkouts(user.id, 14);
      }
      
      const duration = Date.now() - startTime;
      console.log(`[TaggedMemoryCleanup] Completed in ${duration}ms`);
      
    } catch (error) {
      console.error('[TaggedMemoryCleanup] Failed:', error);
      throw error;
    }
  },
  
  config: {
    maxRetries: 3,
    retryDelayMs: 60000,
    timeout: 300000,
    enabled: process.env.ENABLE_MEMORY_CLEANUP !== 'false'
  }
};
```

## Phase 2: Testing (Week 6)

### 9. Unit Tests

#### Task 9.1: Repository Tests
**File**: `src/server/repositories/__tests__/taggedMemoryRepository.test.ts`
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '../memoryRepository';
import { MemoryTagCategory } from '@/server/models/memoryTags';

describe('MemoryRepository', () => {
  let repo: MemoryRepository;
  
  beforeEach(() => {
    repo = new MemoryRepository();
  });
  
  describe('tag queries', () => {
    it('should find memories by single tag', async () => {
      const userId = 'test-user';
      const memory = await repo.create({
        user_id: userId,
        content: 'Test injury',
        tags: [MemoryTagCategory.INJURY, 'shoulder']
      });
      
      const found = await repo.findByTags(userId, [MemoryTagCategory.INJURY]);
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(memory.id);
    });
    
    it('should find memories with all specified tags', async () => {
      const userId = 'test-user';
      await repo.create({
        user_id: userId,
        content: 'Shoulder injury',
        tags: [MemoryTagCategory.INJURY, 'shoulder', MemoryTagCategory.HIGH_PRIORITY]
      });
      
      await repo.create({
        user_id: userId,
        content: 'Knee injury',
        tags: [MemoryTagCategory.INJURY, 'knee']
      });
      
      const found = await repo.findByTags(
        userId,
        [MemoryTagCategory.INJURY, MemoryTagCategory.HIGH_PRIORITY],
        true // matchAll
      );
      
      expect(found).toHaveLength(1);
      expect(found[0].content).toContain('Shoulder');
    });
  });
  
  describe('expiration', () => {
    it('should not return expired memories by default', async () => {
      const userId = 'test-user';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      await repo.create({
        user_id: userId,
        content: 'Expired memory',
        tags: ['test'],
        expires_at: yesterday
      });
      
      const found = await repo.findByUserId(userId);
      expect(found).toHaveLength(0);
    });
    
    it('should delete expired memories', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      await repo.create({
        user_id: 'test',
        content: 'Expired',
        tags: ['test'],
        expires_at: yesterday
      });
      
      const deleted = await repo.deleteExpired();
      expect(deleted).toBe(1);
    });
  });
});
```

## Migration Strategy from String-Based to Tag-Based

### Migration Script
**File**: `scripts/migrate-memories-to-tags.ts`
```typescript
import { parseMemoryContent } from '@/server/utils/memory/parser';
import { TaggedMemoryService } from '@/server/services/taggedMemoryService';
import { MemoryTagCategory } from '@/server/models/memoryTags';

async function migrateStringMemoryToTags(
  userId: string,
  stringContent: string
): Promise<void> {
  const parsed = parseMemoryContent(stringContent);
  const memoryService = new TaggedMemoryService();
  
  // Migrate fitness context
  if (parsed.fitnessContext.currentProgram) {
    await memoryService.addMemory(
      userId,
      `Current Program: ${parsed.fitnessContext.currentProgram}`,
      [MemoryTagCategory.COACHING_NOTE],
      null,
      { source: 'migration' }
    );
  }
  
  // Migrate injuries
  for (const injury of parsed.injuriesLimitations.ongoing) {
    await memoryService.addMemory(
      userId,
      `${injury.description} - ${injury.recommendations}`,
      [MemoryTagCategory.INJURY, MemoryTagCategory.ONGOING, MemoryTagCategory.HIGH_PRIORITY],
      null,
      { source: 'migration' }
    );
  }
  
  for (const limitation of parsed.injuriesLimitations.temporary) {
    const expiresAt = limitation.until ? new Date(limitation.until) : null;
    await memoryService.addMemory(
      userId,
      limitation.description,
      [MemoryTagCategory.INJURY, MemoryTagCategory.TEMPORARY],
      expiresAt,
      { 
        source: 'migration',
        notedDate: limitation.notedDate
      }
    );
  }
  
  // Migrate preferences
  for (const love of parsed.preferencesPatterns.loves) {
    await memoryService.addMemory(
      userId,
      love,
      [MemoryTagCategory.PREFERENCE, MemoryTagCategory.LOVES],
      null,
      { source: 'migration' }
    );
  }
  
  // ... continue for other sections
}
```

## Advantages Summary

### Tag-Based Benefits
1. **Flexible Querying**: Find memories by any combination of tags
2. **Granular Updates**: Update individual memories without affecting others
3. **Better Performance**: Database indexes on tags for fast queries
4. **Analytics Ready**: Easy to generate insights from tag patterns
5. **Concurrent Safe**: Multiple processes can add memories simultaneously
6. **Easier Testing**: Each memory is isolated and testable
7. **Progressive Enhancement**: Can add new tag types without schema changes

### Trade-offs
- More complex initial setup
- Multiple rows to aggregate for full context
- Need to maintain tag consistency
- Slightly more complex LLM prompt formatting

---

**Document Version**: 1.0  
**Created**: 2025-01-07  
**Status**: Alternative Implementation Plan