# GymText Memory System - Implementation Plan

## Overview
This document provides a detailed implementation plan for the GymText memory system as specified in MEMORY_REQUIREMENTS_V2.md. The plan follows a phased approach with granular technical tasks for each component.

## Phase 1A: Basic Implementation (Week 1-2)

### 1. Database Schema & Migration

#### Task 1.1: Create Kysely Migration File
**Command**: `pnpm migrate:create`
**Enter name**: `create_user_memories_table`
**File Generated**: `migrations/[timestamp]_create_user_memories_table.ts`

```typescript
import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create user_memories table
  await db.schema
    .createTable('user_memories')
    .addColumn('user_id', 'uuid', (col) => 
      col.primaryKey().references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('version', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index on updated_at for cleanup queries
  await db.schema
    .createIndex('idx_user_memories_updated')
    .on('user_memories')
    .column('updated_at')
    .execute();

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
  await db.schema.dropIndex('idx_user_memories_updated').execute();
  await db.schema.dropTable('user_memories').execute();
}
```

#### Task 1.2: Update Database Types
**Commands**: 
1. `pnpm migrate:up` - Apply the migration
2. `pnpm db:codegen` - Regenerate types

This will automatically update `src/server/models/_types/index.ts` with:
```typescript
export interface UserMemories {
  user_id: string;
  content: string;
  version: number;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}
```

### 2. Data Models

#### Task 2.1: Create Memory Model
**File**: `src/server/models/memory.ts`
```typescript
import { Selectable, Insertable, Updateable } from 'kysely';
import type { UserMemories } from './_types';

// Database types
export type Memory = Selectable<UserMemories>;
export type NewMemory = Insertable<UserMemories>;
export type MemoryUpdate = Updateable<UserMemories>;

// Business logic types
export interface MemoryContent {
  fitnessContext: FitnessContextSection;
  recentWorkouts: RecentWorkoutsSection;
  injuriesLimitations: InjuriesLimitationsSection;
  environmentEquipment: EnvironmentEquipmentSection;
  preferencesPatterns: PreferencesPatternsSection;
  coachingNotes: CoachingNotesSection;
}

export interface FitnessContextSection {
  currentProgram?: string;
  skillLevel?: string;
  goals?: string[];
}

export interface RecentWorkoutsSection {
  entries: WorkoutMemoryEntry[];
}

export interface WorkoutMemoryEntry {
  date: string; // ISO date string
  description: string;
  notes?: string;
}

export interface InjuriesLimitationsSection {
  ongoing: InjuryEntry[];
  temporary: TemporaryLimitation[];
}

export interface InjuryEntry {
  description: string;
  recommendations: string;
}

export interface TemporaryLimitation {
  description: string;
  until?: string; // ISO date string
  notedDate: string; // ISO date string
}

export interface EnvironmentEquipmentSection {
  default: EquipmentEntry;
  temporary?: TemporaryEnvironment[];
}

export interface EquipmentEntry {
  description: string;
  equipment: string[];
}

export interface TemporaryEnvironment {
  description: string;
  until: string; // ISO date string
  equipment?: string[];
}

export interface PreferencesPatternsSection {
  loves: string[];
  dislikes: string[];
  bestWorkoutTime?: string;
  respondsWellTo: string[];
  strugglesWith: string[];
}

export interface CoachingNotesSection {
  notes: string[];
}
```

#### Task 2.2: Define Memory Structure Constants
**File**: `src/server/models/memoryStructure.ts`
```typescript
// Memory section headers for parsing/formatting
export const MEMORY_SECTIONS = {
  FITNESS_CONTEXT: '=== FITNESS CONTEXT ===',
  RECENT_WORKOUTS: '=== RECENT WORKOUTS ===',
  INJURIES_LIMITATIONS: '=== INJURIES & LIMITATIONS ===',
  ENVIRONMENT_EQUIPMENT: '=== ENVIRONMENT & EQUIPMENT ===',
  PREFERENCES_PATTERNS: '=== PREFERENCES & PATTERNS ===',
  COACHING_NOTES: '=== COACHING NOTES ==='
} as const;

// Default memory template for new users
export const DEFAULT_MEMORY_TEMPLATE = `${MEMORY_SECTIONS.FITNESS_CONTEXT}
Current Program: [To be determined]
Skill Level: [From profile]
Goals: [From profile]

${MEMORY_SECTIONS.RECENT_WORKOUTS}
[No workouts recorded yet]

${MEMORY_SECTIONS.INJURIES_LIMITATIONS}
[No injuries or limitations noted]

${MEMORY_SECTIONS.ENVIRONMENT_EQUIPMENT}
Default: [From profile]

${MEMORY_SECTIONS.PREFERENCES_PATTERNS}
[To be discovered]

${MEMORY_SECTIONS.COACHING_NOTES}
[Initial consultation pending]`;

// Temporal marker patterns
export const TEMPORAL_PATTERNS = {
  UNTIL_DATE: /until (\d{4}-\d{2}-\d{2})/i,
  NOTED_DATE: /\(noted (\d{4}-\d{2}-\d{2})\)/i,
  FOR_DURATION: /for (\d+) (days?|weeks?|months?)/i
} as const;

// Memory size limits
export const MEMORY_LIMITS = {
  MAX_CONTENT_LENGTH: 5000,
  MAX_WORKOUT_ENTRIES: 10,
  MAX_NOTE_LENGTH: 500,
  WORKOUT_RETENTION_DAYS: 14
} as const;
```

### 3. Repository Layer

#### Task 3.1: Create Memory Repository
**File**: `src/server/repositories/memoryRepository.ts`
```typescript
import { db } from '@/server/connections/db';
import type { Memory, NewMemory, MemoryUpdate } from '@/server/models/memory';
import { sql } from 'kysely';

export class MemoryRepository {
  async findByUserId(userId: string): Promise<Memory | undefined> {
    return await db
      .selectFrom('user_memories')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();
  }

  async create(memory: NewMemory): Promise<Memory> {
    return await db
      .insertInto('user_memories')
      .values(memory)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(userId: string, updates: MemoryUpdate): Promise<Memory> {
    return await db
      .updateTable('user_memories')
      .set(updates)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateWithVersion(
    userId: string, 
    content: string, 
    currentVersion: number
  ): Promise<Memory | null> {
    // Optimistic locking - only update if version matches
    const result = await db
      .updateTable('user_memories')
      .set({
        content,
        version: sql`version + 1`,
        updated_at: sql`now()`
      })
      .where('user_id', '=', userId)
      .where('version', '=', currentVersion)
      .returningAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async delete(userId: string): Promise<void> {
    await db
      .deleteFrom('user_memories')
      .where('user_id', '=', userId)
      .execute();
  }

  async findAllForCleanup(limit: number = 100): Promise<Memory[]> {
    // Get memories that haven't been cleaned up in 24 hours
    return await db
      .selectFrom('user_memories')
      .selectAll()
      .where('updated_at', '<', sql`now() - interval '24 hours'`)
      .orderBy('updated_at', 'asc')
      .limit(limit)
      .execute();
  }

  async exists(userId: string): Promise<boolean> {
    const result = await db
      .selectFrom('user_memories')
      .select(sql`1`.as('exists'))
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    return result !== undefined;
  }
}
```

### 4. Service Layer

#### Task 4.1: Create Memory Service
**File**: `src/server/services/memoryService.ts`
```typescript
import { MemoryRepository } from '@/server/repositories/memoryRepository';
import { UserRepository } from '@/server/repositories/userRepository';
import type { Memory, MemoryContent } from '@/server/models/memory';
import { DEFAULT_MEMORY_TEMPLATE, MEMORY_LIMITS } from '@/server/models/memoryStructure';
import { formatMemoryContent, parseMemoryContent } from '@/server/utils/memory/formatter';
import type { FitnessProfile } from '@/server/models/fitnessProfile';

export class MemoryService {
  private memoryRepo: MemoryRepository;
  private userRepo: UserRepository;
  private MAX_RETRY_ATTEMPTS = 3;

  constructor() {
    this.memoryRepo = new MemoryRepository();
    this.userRepo = new UserRepository();
  }

  async getMemory(userId: string): Promise<string> {
    const memory = await this.memoryRepo.findByUserId(userId);
    
    if (!memory) {
      // Initialize memory if it doesn't exist
      const user = await this.userRepo.findWithProfile(userId);
      if (user) {
        await this.initializeMemory(userId, user.fitnessProfile);
        const newMemory = await this.memoryRepo.findByUserId(userId);
        return newMemory?.content || DEFAULT_MEMORY_TEMPLATE;
      }
      return DEFAULT_MEMORY_TEMPLATE;
    }
    
    return memory.content;
  }

  async updateMemory(userId: string, content: string): Promise<void> {
    // Validate content size
    if (content.length > MEMORY_LIMITS.MAX_CONTENT_LENGTH) {
      throw new Error(`Memory content exceeds maximum length of ${MEMORY_LIMITS.MAX_CONTENT_LENGTH} characters`);
    }

    const existingMemory = await this.memoryRepo.findByUserId(userId);
    
    if (!existingMemory) {
      // Create new memory
      await this.memoryRepo.create({
        user_id: userId,
        content,
        version: 1
      });
      return;
    }

    // Update with optimistic locking
    let attempts = 0;
    let currentVersion = existingMemory.version;
    
    while (attempts < this.MAX_RETRY_ATTEMPTS) {
      const updated = await this.memoryRepo.updateWithVersion(
        userId,
        content,
        currentVersion
      );
      
      if (updated) {
        return; // Success
      }
      
      // Version conflict - retry with latest version
      attempts++;
      const latest = await this.memoryRepo.findByUserId(userId);
      if (!latest) {
        throw new Error('Memory disappeared during update');
      }
      currentVersion = latest.version;
      
      // Merge content if needed (for now, last write wins)
      // In future, implement proper merge strategy
    }
    
    throw new Error('Failed to update memory after multiple attempts');
  }

  async initializeMemory(userId: string, profile?: FitnessProfile | null): Promise<void> {
    // Build initial memory from user profile
    let content = DEFAULT_MEMORY_TEMPLATE;
    
    if (profile) {
      const sections: Partial<MemoryContent> = {
        fitnessContext: {
          skillLevel: profile.skillLevel || 'Beginner',
          goals: profile.fitnessGoals ? [profile.fitnessGoals] : []
        },
        environmentEquipment: {
          default: {
            description: profile.gymAccess || 'Home gym',
            equipment: profile.equipment ? profile.equipment.split(',').map(e => e.trim()) : []
          }
        },
        preferencesPatterns: {
          loves: [],
          dislikes: [],
          bestWorkoutTime: profile.preferredWorkoutTime || undefined,
          respondsWellTo: [],
          strugglesWith: []
        }
      };
      
      content = formatMemoryContent(sections as MemoryContent);
    }
    
    await this.memoryRepo.create({
      user_id: userId,
      content,
      version: 1
    });
  }

  async getStructuredMemory(userId: string): Promise<MemoryContent> {
    const content = await this.getMemory(userId);
    return parseMemoryContent(content);
  }

  async updateStructuredMemory(userId: string, memory: MemoryContent): Promise<void> {
    const content = formatMemoryContent(memory);
    await this.updateMemory(userId, content);
  }

  async memoryExists(userId: string): Promise<boolean> {
    return await this.memoryRepo.exists(userId);
  }
}
```

### 5. Memory Utilities

#### Task 5.1: Create Memory Formatter
**File**: `src/server/utils/memory/formatter.ts`
```typescript
import type { MemoryContent, WorkoutMemoryEntry, TemporaryLimitation, TemporaryEnvironment } from '@/server/models/memory';
import { MEMORY_SECTIONS, MEMORY_LIMITS } from '@/server/models/memoryStructure';
import { format, parseISO } from 'date-fns';

export function formatMemoryContent(memory: MemoryContent): string {
  const sections: string[] = [];
  
  // Fitness Context
  sections.push(MEMORY_SECTIONS.FITNESS_CONTEXT);
  if (memory.fitnessContext.currentProgram) {
    sections.push(`Current Program: ${memory.fitnessContext.currentProgram}`);
  }
  if (memory.fitnessContext.skillLevel) {
    sections.push(`Skill Level: ${memory.fitnessContext.skillLevel}`);
  }
  if (memory.fitnessContext.goals?.length) {
    sections.push(`Goals: ${memory.fitnessContext.goals.join(', ')}`);
  }
  
  // Recent Workouts
  sections.push('');
  sections.push(MEMORY_SECTIONS.RECENT_WORKOUTS);
  if (memory.recentWorkouts.entries.length > 0) {
    const recentEntries = memory.recentWorkouts.entries
      .slice(-MEMORY_LIMITS.MAX_WORKOUT_ENTRIES)
      .map(entry => formatWorkoutEntry(entry));
    sections.push(...recentEntries);
  } else {
    sections.push('[No workouts recorded yet]');
  }
  
  // Injuries & Limitations
  sections.push('');
  sections.push(MEMORY_SECTIONS.INJURIES_LIMITATIONS);
  if (memory.injuriesLimitations.ongoing.length > 0) {
    memory.injuriesLimitations.ongoing.forEach(injury => {
      sections.push(`- Ongoing: ${injury.description} - ${injury.recommendations}`);
    });
  }
  if (memory.injuriesLimitations.temporary.length > 0) {
    memory.injuriesLimitations.temporary.forEach(limitation => {
      sections.push(formatTemporalLimitation(limitation));
    });
  }
  if (memory.injuriesLimitations.ongoing.length === 0 && 
      memory.injuriesLimitations.temporary.length === 0) {
    sections.push('[No injuries or limitations noted]');
  }
  
  // Environment & Equipment
  sections.push('');
  sections.push(MEMORY_SECTIONS.ENVIRONMENT_EQUIPMENT);
  sections.push(`- Default: ${memory.environmentEquipment.default.description}`);
  if (memory.environmentEquipment.default.equipment.length > 0) {
    sections.push(`  Equipment: ${memory.environmentEquipment.default.equipment.join(', ')}`);
  }
  if (memory.environmentEquipment.temporary?.length) {
    memory.environmentEquipment.temporary.forEach(env => {
      sections.push(formatTemporalEnvironment(env));
    });
  }
  
  // Preferences & Patterns
  sections.push('');
  sections.push(MEMORY_SECTIONS.PREFERENCES_PATTERNS);
  if (memory.preferencesPatterns.loves.length > 0) {
    sections.push(`- Loves: ${memory.preferencesPatterns.loves.join(', ')}`);
  }
  if (memory.preferencesPatterns.dislikes.length > 0) {
    sections.push(`- Dislikes: ${memory.preferencesPatterns.dislikes.join(', ')}`);
  }
  if (memory.preferencesPatterns.bestWorkoutTime) {
    sections.push(`- Best workout time: ${memory.preferencesPatterns.bestWorkoutTime}`);
  }
  if (memory.preferencesPatterns.respondsWellTo.length > 0) {
    sections.push(`- Responds well to: ${memory.preferencesPatterns.respondsWellTo.join(', ')}`);
  }
  if (memory.preferencesPatterns.strugglesWith.length > 0) {
    sections.push(`- Struggles with: ${memory.preferencesPatterns.strugglesWith.join(', ')}`);
  }
  
  // Coaching Notes
  sections.push('');
  sections.push(MEMORY_SECTIONS.COACHING_NOTES);
  if (memory.coachingNotes.notes.length > 0) {
    memory.coachingNotes.notes.forEach(note => {
      sections.push(`- ${note}`);
    });
  } else {
    sections.push('[Initial consultation pending]');
  }
  
  return sections.join('\n');
}

function formatWorkoutEntry(entry: WorkoutMemoryEntry): string {
  const date = format(parseISO(entry.date), 'yyyy-MM-dd');
  let text = `- ${date}: ${entry.description}`;
  if (entry.notes) {
    text += `, ${entry.notes}`;
  }
  return text;
}

function formatTemporalLimitation(limitation: TemporaryLimitation): string {
  const notedDate = format(parseISO(limitation.notedDate), 'yyyy-MM-dd');
  let text = `- Temporary: ${limitation.description} (noted ${notedDate})`;
  if (limitation.until) {
    const untilDate = format(parseISO(limitation.until), 'yyyy-MM-dd');
    text += ` - avoid until ${untilDate}`;
  }
  return text;
}

function formatTemporalEnvironment(env: TemporaryEnvironment): string {
  const untilDate = format(parseISO(env.until), 'yyyy-MM-dd');
  let text = `- Temporary: ${env.description} until ${untilDate}`;
  if (env.equipment?.length) {
    text += ` - ${env.equipment.join(', ')}`;
  }
  return text;
}

export function formatSection(title: string, items: string[]): string {
  if (items.length === 0) {
    return `${title}\n[None]`;
  }
  return `${title}\n${items.map(item => `- ${item}`).join('\n')}`;
}
```

#### Task 5.2: Create Memory Parser
**File**: `src/server/utils/memory/parser.ts`
```typescript
import type { MemoryContent, WorkoutMemoryEntry, InjuryEntry, TemporaryLimitation, TemporaryEnvironment } from '@/server/models/memory';
import { MEMORY_SECTIONS, TEMPORAL_PATTERNS } from '@/server/models/memoryStructure';
import { parse, addDays, addWeeks, addMonths } from 'date-fns';

export function parseMemoryContent(content: string): MemoryContent {
  const sections = extractSections(content);
  
  return {
    fitnessContext: parseFitnessContext(sections.fitnessContext),
    recentWorkouts: parseRecentWorkouts(sections.recentWorkouts),
    injuriesLimitations: parseInjuriesLimitations(sections.injuriesLimitations),
    environmentEquipment: parseEnvironmentEquipment(sections.environmentEquipment),
    preferencesPatterns: parsePreferencesPatterns(sections.preferencesPatterns),
    coachingNotes: parseCoachingNotes(sections.coachingNotes)
  };
}

function extractSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {
    fitnessContext: '',
    recentWorkouts: '',
    injuriesLimitations: '',
    environmentEquipment: '',
    preferencesPatterns: '',
    coachingNotes: ''
  };
  
  const lines = content.split('\n');
  let currentSection: keyof typeof sections | null = null;
  let sectionContent: string[] = [];
  
  for (const line of lines) {
    // Check if this is a section header
    if (line === MEMORY_SECTIONS.FITNESS_CONTEXT) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'fitnessContext';
      sectionContent = [];
    } else if (line === MEMORY_SECTIONS.RECENT_WORKOUTS) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'recentWorkouts';
      sectionContent = [];
    } else if (line === MEMORY_SECTIONS.INJURIES_LIMITATIONS) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'injuriesLimitations';
      sectionContent = [];
    } else if (line === MEMORY_SECTIONS.ENVIRONMENT_EQUIPMENT) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'environmentEquipment';
      sectionContent = [];
    } else if (line === MEMORY_SECTIONS.PREFERENCES_PATTERNS) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'preferencesPatterns';
      sectionContent = [];
    } else if (line === MEMORY_SECTIONS.COACHING_NOTES) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'coachingNotes';
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections[currentSection] = sectionContent.join('\n');
  }
  
  return sections;
}

function parseFitnessContext(section: string): MemoryContent['fitnessContext'] {
  const context: MemoryContent['fitnessContext'] = {};
  const lines = section.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('Current Program:')) {
      context.currentProgram = line.replace('Current Program:', '').trim();
    } else if (line.startsWith('Skill Level:')) {
      context.skillLevel = line.replace('Skill Level:', '').trim();
    } else if (line.startsWith('Goals:')) {
      const goals = line.replace('Goals:', '').trim();
      context.goals = goals.split(',').map(g => g.trim()).filter(g => g);
    }
  }
  
  return context;
}

function parseRecentWorkouts(section: string): MemoryContent['recentWorkouts'] {
  const entries: WorkoutMemoryEntry[] = [];
  const lines = section.split('\n').filter(line => line.trim().startsWith('-'));
  
  for (const line of lines) {
    const match = line.match(/^-\s*(\d{4}-\d{2}-\d{2}):\s*(.+)$/);
    if (match) {
      const [, date, rest] = match;
      const parts = rest.split(',').map(p => p.trim());
      entries.push({
        date,
        description: parts[0],
        notes: parts.slice(1).join(', ') || undefined
      });
    }
  }
  
  return { entries };
}

function parseInjuriesLimitations(section: string): MemoryContent['injuriesLimitations'] {
  const ongoing: InjuryEntry[] = [];
  const temporary: TemporaryLimitation[] = [];
  const lines = section.split('\n').filter(line => line.trim().startsWith('-'));
  
  for (const line of lines) {
    if (line.includes('Ongoing:')) {
      const content = line.replace(/^-\s*Ongoing:\s*/, '');
      const parts = content.split(' - ');
      if (parts.length >= 2) {
        ongoing.push({
          description: parts[0].trim(),
          recommendations: parts.slice(1).join(' - ').trim()
        });
      }
    } else if (line.includes('Temporary:')) {
      const content = line.replace(/^-\s*Temporary:\s*/, '');
      const temporal = parseTemporalMarker(content);
      temporary.push(temporal);
    }
  }
  
  return { ongoing, temporary };
}

function parseEnvironmentEquipment(section: string): MemoryContent['environmentEquipment'] {
  const result: MemoryContent['environmentEquipment'] = {
    default: { description: '', equipment: [] },
    temporary: []
  };
  
  const lines = section.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.startsWith('- Default:')) {
      result.default.description = line.replace('- Default:', '').trim();
      // Check next line for equipment
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('Equipment:')) {
        const equipmentLine = lines[i + 1].trim().replace('Equipment:', '').trim();
        result.default.equipment = equipmentLine.split(',').map(e => e.trim());
        i++;
      }
    } else if (line.startsWith('- Temporary:')) {
      const content = line.replace('- Temporary:', '').trim();
      const match = content.match(/(.+) until (\d{4}-\d{2}-\d{2})(.*)/);
      if (match) {
        const [, description, until, rest] = match;
        const equipment = rest ? rest.replace(' - ', '').split(',').map(e => e.trim()) : undefined;
        result.temporary = result.temporary || [];
        result.temporary.push({
          description: description.trim(),
          until,
          equipment
        });
      }
    }
    i++;
  }
  
  return result;
}

function parsePreferencesPatterns(section: string): MemoryContent['preferencesPatterns'] {
  const result: MemoryContent['preferencesPatterns'] = {
    loves: [],
    dislikes: [],
    respondsWellTo: [],
    strugglesWith: []
  };
  
  const lines = section.split('\n').filter(line => line.trim().startsWith('-'));
  
  for (const line of lines) {
    if (line.includes('Loves:')) {
      const items = line.replace(/^-\s*Loves:\s*/, '').split(',').map(i => i.trim());
      result.loves = items;
    } else if (line.includes('Dislikes:')) {
      const items = line.replace(/^-\s*Dislikes:\s*/, '').split(',').map(i => i.trim());
      result.dislikes = items;
    } else if (line.includes('Best workout time:')) {
      result.bestWorkoutTime = line.replace(/^-\s*Best workout time:\s*/, '').trim();
    } else if (line.includes('Responds well to:')) {
      const items = line.replace(/^-\s*Responds well to:\s*/, '').split(',').map(i => i.trim());
      result.respondsWellTo = items;
    } else if (line.includes('Struggles with:')) {
      const items = line.replace(/^-\s*Struggles with:\s*/, '').split(',').map(i => i.trim());
      result.strugglesWith = items;
    }
  }
  
  return result;
}

function parseCoachingNotes(section: string): MemoryContent['coachingNotes'] {
  const lines = section.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim());
  
  return { notes: lines };
}

export function parseTemporalMarker(text: string): TemporaryLimitation {
  const result: TemporaryLimitation = {
    description: text,
    notedDate: new Date().toISOString().split('T')[0]
  };
  
  // Check for "until" date
  const untilMatch = text.match(TEMPORAL_PATTERNS.UNTIL_DATE);
  if (untilMatch) {
    result.until = untilMatch[1];
    result.description = text.replace(untilMatch[0], '').trim();
  }
  
  // Check for "noted" date
  const notedMatch = text.match(TEMPORAL_PATTERNS.NOTED_DATE);
  if (notedMatch) {
    result.notedDate = notedMatch[1];
    result.description = text.replace(notedMatch[0], '').trim();
  }
  
  // Check for duration
  const durationMatch = text.match(TEMPORAL_PATTERNS.FOR_DURATION);
  if (durationMatch && !result.until) {
    const [, amount, unit] = durationMatch;
    const num = parseInt(amount);
    const today = new Date();
    
    if (unit.startsWith('day')) {
      result.until = addDays(today, num).toISOString().split('T')[0];
    } else if (unit.startsWith('week')) {
      result.until = addWeeks(today, num).toISOString().split('T')[0];
    } else if (unit.startsWith('month')) {
      result.until = addMonths(today, num).toISOString().split('T')[0];
    }
    
    result.description = text.replace(durationMatch[0], '').trim();
  }
  
  // Clean up description
  result.description = result.description.replace(/\s*-\s*$/, '').trim();
  
  return result;
}
```

### 6. Context Service Integration

#### Task 6.1: Update Context Service
**File**: `src/server/services/contextService.ts`
```typescript
// Add to imports
import { MemoryService } from './memoryService';

// Update ContextRetrievalOptions interface
export interface ContextRetrievalOptions {
  includeWorkoutHistory?: boolean;
  includeUserProfile?: boolean;
  includeMemory?: boolean; // NEW
  messageLimit?: number;
  skipCache?: boolean;
}

// Update ConversationContext interface  
export interface ConversationContext {
  conversationId: string;
  summary?: string;
  recentMessages: RecentMessage[];
  userProfile: UserContextProfile;
  userMemory?: string; // NEW
  metadata: ConversationMetadata;
}

// Update getContext method
export class ConversationContextService {
  private memoryService: MemoryService;
  
  constructor() {
    // ... existing constructor
    this.memoryService = new MemoryService();
  }
  
  async getContext(
    userId: string,
    options: ContextRetrievalOptions = {}
  ): Promise<ConversationContext> {
    // ... existing context building logic
    
    // Add memory if requested
    if (options.includeMemory) {
      try {
        context.userMemory = await this.memoryService.getMemory(userId);
      } catch (error) {
        console.error('Failed to retrieve user memory:', error);
        // Continue without memory on error
      }
    }
    
    return context;
  }
}
```

### 7. Agent Integration (Read-Only)

#### Task 7.1: Update Chat Agent
**File**: `src/server/agents/chat/chain.ts`
```typescript
// Update the context retrieval to include memory
async ({ userId, message, conversation, messages }) => {
  // Get user context
  const userRepo = new UserRepository();
  const user = await userRepo.findWithProfile(userId);
  
  // Get conversation context with memory
  const contextService = new ConversationContextService();
  const context = await contextService.getContext(userId, {
    includeUserProfile: true,
    includeWorkoutHistory: true,
    includeMemory: true, // NEW
    messageLimit: 5
  });
  
  return { user, message, conversation, messages, context };
}
```

#### Task 7.2: Update Chat Prompts
**File**: `src/server/agents/chat/prompts.ts`
```typescript
export function chatPrompt(
  user: UserWithProfile,
  message: string,
  messages: Message[],
  context: ConversationContext
): string {
  const messageHistory = messages
    .map(msg => `${msg.direction === 'inbound' ? 'User' : 'Coach'}: ${msg.content}`)
    .join('\n');
  
  return `You are a professional fitness coach providing personalized advice via SMS.

${context.userMemory ? `USER MEMORY AND CONTEXT:
${context.userMemory}
` : ''}

USER PROFILE:
- Fitness Goals: ${user.fitnessProfile?.fitnessGoals || 'Not specified'}
- Skill Level: ${user.fitnessProfile?.skillLevel || 'Not specified'}
- Equipment: ${user.fitnessProfile?.equipment || 'Not specified'}

RECENT CONVERSATION:
${messageHistory}

USER MESSAGE: ${message}

Provide a helpful, personalized response that:
1. References relevant information from their memory/context when applicable
2. Addresses their question or concern directly
3. Is concise and appropriate for SMS (under 160 characters if possible)
4. Uses a supportive, professional tone

Response:`;
}
```

#### Task 7.3: Update Daily Message Agent
**File**: `src/server/agents/dailyMessage/chain.ts`
```typescript
import { MemoryService } from '@/server/services/memoryService';

export const dailyMessageAgent = {
  invoke: async ({ 
    user, 
    context 
  }: { 
    user: UserWithProfile, 
    context: { workout: WorkoutInstance } 
  }): Promise<{ user: UserWithProfile, context: { workout: WorkoutInstance }, value: string }> => {
    const fitnessProfileSubstring = await new FitnessProfileContext(user).getContext();
    
    // Get user memory
    const memoryService = new MemoryService();
    let userMemory = '';
    try {
      userMemory = await memoryService.getMemory(user.id);
    } catch (error) {
      console.error('Failed to retrieve memory for daily message:', error);
    }
    
    const dailyMessagePromptText = dailyMessagePrompt(
      user, 
      fitnessProfileSubstring, 
      context.workout,
      userMemory // Pass memory to prompt
    );
    const dailyMessageResp = await llm.invoke(dailyMessagePromptText);
    const dailyMessageContent = typeof dailyMessageResp.content === 'string'
      ? dailyMessageResp.content
      : String(dailyMessageResp.content);
    
    return { user, context, value: dailyMessageContent };
  }
}
```

#### Task 7.4: Update Daily Message Prompts
**File**: `src/server/agents/dailyMessage/prompts.ts`
```typescript
export function dailyMessagePrompt(
  user: UserWithProfile,
  profileContext: string,
  workout: WorkoutInstance,
  userMemory?: string
): string {
  const exerciseList = workout.exercises
    .map(e => `- ${e.name}: ${e.sets} sets x ${e.reps} reps`)
    .join('\n');
  
  return `You are a fitness coach sending a daily workout message via SMS.

${userMemory ? `USER MEMORY AND CONTEXT:
${userMemory}
` : ''}

USER PROFILE:
${profileContext}

TODAY'S WORKOUT:
Type: ${workout.type}
Focus: ${workout.muscleGroups?.join(', ') || 'Full body'}

Exercises:
${exerciseList}

Generate a motivating SMS message (max 160 characters) that:
1. References any relevant context from their memory (injuries, preferences, recent progress)
2. Highlights today's workout focus
3. Provides encouragement based on their patterns and preferences
4. Adjusts tone based on their coaching notes

Message:`;
}
```

## Phase 1B: Automatic Updates (Week 3-4)

### 8. Memory Update Extraction

#### Task 8.1: Create Memory Update Parser
**File**: `src/server/utils/memory/updateParser.ts`
```typescript
import type { MemoryUpdateInstruction, ParsedUpdate, UpdateOperation } from '@/server/models/memoryUpdate';
import { MEMORY_SECTIONS } from '@/server/models/memoryStructure';

export function extractMemoryUpdate(response: string): MemoryUpdateInstruction | null {
  // Look for memory update tags
  const updateMatch = response.match(/<memory_update>([\s\S]*?)<\/memory_update>/);
  
  if (!updateMatch) {
    return null;
  }
  
  const updateContent = updateMatch[1].trim();
  const instructions = parseUpdateInstructions(updateContent);
  
  if (instructions.length === 0) {
    return null;
  }
  
  return {
    instructions,
    timestamp: new Date().toISOString()
  };
}

export function parseUpdateInstructions(content: string): ParsedUpdate[] {
  const updates: ParsedUpdate[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const update = parseUpdateLine(line);
    if (update && validateUpdate(update)) {
      updates.push(update);
    }
  }
  
  return updates;
}

function parseUpdateLine(line: string): ParsedUpdate | null {
  // Parse lines like:
  // ADD to INJURIES & LIMITATIONS: ...
  // MODIFY in RECENT WORKOUTS: ...
  // REMOVE from COACHING NOTES: ...
  
  const patterns = [
    /^(ADD|MODIFY|REMOVE)\s+(?:to|in|from)\s+([A-Z &]+):\s*(.+)$/i,
    /^(ADD|MODIFY|REMOVE)\s+([A-Z &]+):\s*(.+)$/i
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const [, operation, section, content] = match;
      return {
        operation: operation.toUpperCase() as UpdateOperation,
        section: normalizeSection(section),
        content: content.trim(),
        originalLine: line
      };
    }
  }
  
  return null;
}

function normalizeSection(section: string): string {
  const sectionUpper = section.toUpperCase().trim();
  
  // Map common variations to standard sections
  const sectionMap: Record<string, string> = {
    'FITNESS CONTEXT': 'fitnessContext',
    'RECENT WORKOUTS': 'recentWorkouts',
    'INJURIES & LIMITATIONS': 'injuriesLimitations',
    'INJURIES AND LIMITATIONS': 'injuriesLimitations',
    'ENVIRONMENT & EQUIPMENT': 'environmentEquipment',
    'ENVIRONMENT AND EQUIPMENT': 'environmentEquipment',
    'PREFERENCES & PATTERNS': 'preferencesPatterns',
    'PREFERENCES AND PATTERNS': 'preferencesPatterns',
    'COACHING NOTES': 'coachingNotes'
  };
  
  return sectionMap[sectionUpper] || section;
}

export function validateUpdate(update: ParsedUpdate): boolean {
  // Validate operation
  if (!['ADD', 'MODIFY', 'REMOVE'].includes(update.operation)) {
    return false;
  }
  
  // Validate section
  const validSections = [
    'fitnessContext',
    'recentWorkouts',
    'injuriesLimitations',
    'environmentEquipment',
    'preferencesPatterns',
    'coachingNotes'
  ];
  
  if (!validSections.includes(update.section)) {
    return false;
  }
  
  // Validate content
  if (!update.content || update.content.length === 0) {
    return false;
  }
  
  return true;
}

export function formatUpdateForLogging(update: ParsedUpdate): string {
  return `[${update.operation}] ${update.section}: ${update.content.substring(0, 100)}${
    update.content.length > 100 ? '...' : ''
  }`;
}
```

#### Task 8.2: Define Update Types
**File**: `src/server/models/memoryUpdate.ts`
```typescript
export type UpdateOperation = 'ADD' | 'MODIFY' | 'REMOVE';

export interface MemoryUpdateInstruction {
  instructions: ParsedUpdate[];
  timestamp: string;
}

export interface ParsedUpdate {
  operation: UpdateOperation;
  section: string;
  content: string;
  originalLine: string;
}

export interface UpdateResult {
  success: boolean;
  updatedSections: string[];
  errors?: string[];
  finalContent?: string;
}

export interface UpdateContext {
  userId: string;
  source: 'chat' | 'daily_message' | 'manual';
  conversationId?: string;
  timestamp: Date;
}
```

### 9. Memory Update Service

#### Task 9.1: Create Memory Update Service
**File**: `src/server/services/memoryUpdateService.ts`
```typescript
import { MemoryService } from './memoryService';
import type { MemoryContent } from '@/server/models/memory';
import type { MemoryUpdateInstruction, ParsedUpdate, UpdateResult, UpdateContext } from '@/server/models/memoryUpdate';
import { parseMemoryContent, formatMemoryContent } from '@/server/utils/memory';
import { MEMORY_LIMITS } from '@/server/models/memoryStructure';

export class MemoryUpdateService {
  private memoryService: MemoryService;
  
  constructor() {
    this.memoryService = new MemoryService();
  }
  
  async applyUpdate(
    userId: string,
    update: MemoryUpdateInstruction,
    context: UpdateContext
  ): Promise<UpdateResult> {
    try {
      // Get current memory
      const currentContent = await this.memoryService.getMemory(userId);
      const currentMemory = parseMemoryContent(currentContent);
      
      // Apply updates
      const updatedMemory = this.mergeUpdates(currentMemory, update.instructions);
      
      // Format and save
      const newContent = formatMemoryContent(updatedMemory);
      
      // Validate size
      if (newContent.length > MEMORY_LIMITS.MAX_CONTENT_LENGTH) {
        return {
          success: false,
          updatedSections: [],
          errors: [`Memory content exceeds maximum length of ${MEMORY_LIMITS.MAX_CONTENT_LENGTH}`]
        };
      }
      
      await this.memoryService.updateMemory(userId, newContent);
      
      // Log the update
      console.log(`Memory updated for user ${userId} from ${context.source}`, {
        sections: update.instructions.map(i => i.section),
        timestamp: context.timestamp
      });
      
      return {
        success: true,
        updatedSections: [...new Set(update.instructions.map(i => i.section))],
        finalContent: newContent
      };
    } catch (error) {
      console.error('Failed to apply memory update:', error);
      return {
        success: false,
        updatedSections: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  mergeUpdates(current: MemoryContent, updates: ParsedUpdate[]): MemoryContent {
    // Clone current memory to avoid mutations
    const updated = JSON.parse(JSON.stringify(current)) as MemoryContent;
    
    // Process updates in order
    for (const update of updates) {
      this.applySingleUpdate(updated, update);
    }
    
    // Trim old workouts if needed
    if (updated.recentWorkouts.entries.length > MEMORY_LIMITS.MAX_WORKOUT_ENTRIES) {
      updated.recentWorkouts.entries = updated.recentWorkouts.entries
        .slice(-MEMORY_LIMITS.MAX_WORKOUT_ENTRIES);
    }
    
    return updated;
  }
  
  private applySingleUpdate(memory: MemoryContent, update: ParsedUpdate): void {
    switch (update.section) {
      case 'fitnessContext':
        this.updateFitnessContext(memory.fitnessContext, update);
        break;
      case 'recentWorkouts':
        this.updateRecentWorkouts(memory.recentWorkouts, update);
        break;
      case 'injuriesLimitations':
        this.updateInjuriesLimitations(memory.injuriesLimitations, update);
        break;
      case 'environmentEquipment':
        this.updateEnvironmentEquipment(memory.environmentEquipment, update);
        break;
      case 'preferencesPatterns':
        this.updatePreferencesPatterns(memory.preferencesPatterns, update);
        break;
      case 'coachingNotes':
        this.updateCoachingNotes(memory.coachingNotes, update);
        break;
    }
  }
  
  private updateFitnessContext(
    context: MemoryContent['fitnessContext'],
    update: ParsedUpdate
  ): void {
    if (update.operation === 'MODIFY' || update.operation === 'ADD') {
      // Parse the content for specific fields
      if (update.content.includes('Current Program:')) {
        context.currentProgram = update.content.replace(/.*Current Program:\s*/, '').trim();
      } else if (update.content.includes('Skill Level:')) {
        context.skillLevel = update.content.replace(/.*Skill Level:\s*/, '').trim();
      } else if (update.content.includes('Goals:')) {
        const goals = update.content.replace(/.*Goals:\s*/, '').trim();
        context.goals = goals.split(',').map(g => g.trim());
      }
    }
  }
  
  private updateRecentWorkouts(
    workouts: MemoryContent['recentWorkouts'],
    update: ParsedUpdate
  ): void {
    if (update.operation === 'ADD') {
      // Parse workout entry format: "2025-01-07: Description"
      const match = update.content.match(/^(\d{4}-\d{2}-\d{2}):\s*(.+)$/);
      if (match) {
        workouts.entries.push({
          date: match[1],
          description: match[2]
        });
      }
    } else if (update.operation === 'MODIFY') {
      // Find and modify existing entry
      const dateMatch = update.content.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const entry = workouts.entries.find(e => e.date === dateMatch[1]);
        if (entry) {
          const descMatch = update.content.match(/:\s*(.+)$/);
          if (descMatch) {
            entry.description = descMatch[1];
          }
        }
      }
    }
  }
  
  private updateInjuriesLimitations(
    injuries: MemoryContent['injuriesLimitations'],
    update: ParsedUpdate
  ): void {
    if (update.operation === 'ADD') {
      if (update.content.includes('Ongoing:')) {
        const content = update.content.replace('Ongoing:', '').trim();
        const parts = content.split(' - ');
        injuries.ongoing.push({
          description: parts[0].trim(),
          recommendations: parts[1]?.trim() || ''
        });
      } else if (update.content.includes('Temporary:')) {
        const content = update.content.replace('Temporary:', '').trim();
        // Parse temporal marker
        const untilMatch = content.match(/until (\d{4}-\d{2}-\d{2})/);
        injuries.temporary.push({
          description: content.replace(/until \d{4}-\d{2}-\d{2}/, '').trim(),
          until: untilMatch ? untilMatch[1] : undefined,
          notedDate: new Date().toISOString().split('T')[0]
        });
      }
    } else if (update.operation === 'REMOVE') {
      // Remove matching entries
      injuries.ongoing = injuries.ongoing.filter(
        i => !i.description.includes(update.content)
      );
      injuries.temporary = injuries.temporary.filter(
        i => !i.description.includes(update.content)
      );
    }
  }
  
  private updateEnvironmentEquipment(
    environment: MemoryContent['environmentEquipment'],
    update: ParsedUpdate
  ): void {
    if (update.operation === 'ADD' && update.content.includes('Temporary:')) {
      const content = update.content.replace('Temporary:', '').trim();
      const untilMatch = content.match(/until (\d{4}-\d{2}-\d{2})/);
      if (untilMatch) {
        environment.temporary = environment.temporary || [];
        environment.temporary.push({
          description: content.replace(/until \d{4}-\d{2}-\d{2}.*/, '').trim(),
          until: untilMatch[1]
        });
      }
    } else if (update.operation === 'MODIFY' && update.content.includes('Default:')) {
      environment.default.description = update.content.replace('Default:', '').trim();
    }
  }
  
  private updatePreferencesPatterns(
    preferences: MemoryContent['preferencesPatterns'],
    update: ParsedUpdate
  ): void {
    if (update.operation === 'ADD') {
      if (update.content.includes('Loves:')) {
        const items = update.content.replace('Loves:', '').trim().split(',');
        preferences.loves.push(...items.map(i => i.trim()));
      } else if (update.content.includes('Dislikes:')) {
        const items = update.content.replace('Dislikes:', '').trim().split(',');
        preferences.dislikes.push(...items.map(i => i.trim()));
      }
    }
  }
  
  private updateCoachingNotes(
    notes: MemoryContent['coachingNotes'],
    update: ParsedUpdate
  ): void {
    if (update.operation === 'ADD') {
      notes.notes.push(update.content);
    } else if (update.operation === 'REMOVE') {
      notes.notes = notes.notes.filter(n => !n.includes(update.content));
    }
  }
}
```

### 10. LLM Prompt Updates

#### Task 10.1: Create Memory Update Prompt Templates
**File**: `src/server/agents/prompts/memoryUpdatePrompts.ts`
```typescript
export const MEMORY_UPDATE_INSTRUCTIONS = `
After generating your response, analyze if any new information should be added to the user's memory.
If updates are needed, provide them in the following format:

<memory_update>
OPERATION to/in/from SECTION: content
</memory_update>

Operations:
- ADD: Add new information
- MODIFY: Change existing information
- REMOVE: Delete outdated information

Sections:
- FITNESS CONTEXT: Program, skill level, goals
- RECENT WORKOUTS: Workout completions with dates
- INJURIES & LIMITATIONS: Ongoing or temporary issues
- ENVIRONMENT & EQUIPMENT: Gym access, equipment changes
- PREFERENCES & PATTERNS: Likes, dislikes, patterns
- COACHING NOTES: Important observations
`;

export const MEMORY_UPDATE_EXAMPLES = `
Example updates:

<memory_update>
ADD to INJURIES & LIMITATIONS: Temporary: Shoulder soreness from bench press (noted 2025-01-07) - reduce volume until 2025-01-14
ADD to RECENT WORKOUTS: 2025-01-07: Leg day - squats 3x5 @ 225lbs, felt strong
MODIFY in FITNESS CONTEXT: Current Program: Upper/Lower Split Week 4 of 6
ADD to ENVIRONMENT & EQUIPMENT: Temporary: Hotel gym in NYC until 2025-01-15 - limited equipment
ADD to PREFERENCES & PATTERNS: Loves: Morning workouts, compound movements
ADD to COACHING NOTES: Responds well to specific rep targets and progressive overload
REMOVE from INJURIES & LIMITATIONS: knee bruising
</memory_update>
`;

export const MEMORY_UPDATE_FORMAT = `
Memory Update Rules:
1. Only update when new, relevant information is shared
2. Be specific with dates and durations
3. Keep entries concise and factual
4. Use "until YYYY-MM-DD" for temporary conditions
5. Don't duplicate existing information
6. Remove outdated temporary conditions
`;

export function appendMemoryUpdateInstructions(basePrompt: string): string {
  return `${basePrompt}

${MEMORY_UPDATE_INSTRUCTIONS}

${MEMORY_UPDATE_EXAMPLES}

${MEMORY_UPDATE_FORMAT}`;
}
```

#### Task 10.2: Update Agent Prompts with Memory Instructions
**File**: `src/server/agents/chat/prompts.ts`
```typescript
import { appendMemoryUpdateInstructions } from '../prompts/memoryUpdatePrompts';

export function chatPromptWithMemoryUpdate(
  user: UserWithProfile,
  message: string,
  messages: Message[],
  context: ConversationContext
): string {
  const basePrompt = chatPrompt(user, message, messages, context);
  return appendMemoryUpdateInstructions(basePrompt);
}
```

### 11. Agent Chain Updates

#### Task 11.1: Update Chat Chain with Memory Updates
**File**: `src/server/agents/chat/chain.ts`
```typescript
import { extractMemoryUpdate } from '@/server/utils/memory/updateParser';
import { MemoryUpdateService } from '@/server/services/memoryUpdateService';

// Update the final step in the chain
async ({ user, message, conversation, messages, context }) => {
  // Generate response using chat prompt with memory updates
  const prompt = chatPromptWithMemoryUpdate(user, message, messages, context);
  const response = await llm.invoke(prompt);
  
  const responseContent = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);
  
  // Extract the actual message (before memory update tags)
  const messageContent = responseContent.split('<memory_update>')[0].trim();
  
  // Store assistant message
  const messageRepo = new MessageRepository();
  await messageRepo.create({
    conversationId: conversation.id,
    userId: user.id,
    direction: 'outbound',
    content: messageContent,
    phoneFrom: 'system_phone',
    phoneTo: 'user_phone'
  });
  
  // Extract and apply memory updates
  const memoryUpdate = extractMemoryUpdate(responseContent);
  if (memoryUpdate) {
    const updateService = new MemoryUpdateService();
    const updateResult = await updateService.applyUpdate(
      user.id,
      memoryUpdate,
      {
        userId: user.id,
        source: 'chat',
        conversationId: conversation.id,
        timestamp: new Date()
      }
    );
    
    if (!updateResult.success) {
      console.error('Failed to apply memory updates:', updateResult.errors);
    } else {
      console.log(`Memory updated for user ${user.id}:`, updateResult.updatedSections);
    }
  }
  
  return {
    conversationId: conversation.id,
    response: messageContent,
    context
  };
}
```

#### Task 11.2: Update Daily Message Chain
**File**: `src/server/agents/dailyMessage/chain.ts`
```typescript
import { extractMemoryUpdate } from '@/server/utils/memory/updateParser';
import { MemoryUpdateService } from '@/server/services/memoryUpdateService';

export const dailyMessageAgent = {
  invoke: async ({ 
    user, 
    context 
  }: { 
    user: UserWithProfile, 
    context: { workout: WorkoutInstance } 
  }): Promise<{ user: UserWithProfile, context: { workout: WorkoutInstance }, value: string }> => {
    const fitnessProfileSubstring = await new FitnessProfileContext(user).getContext();
    
    // Get user memory
    const memoryService = new MemoryService();
    let userMemory = '';
    try {
      userMemory = await memoryService.getMemory(user.id);
    } catch (error) {
      console.error('Failed to retrieve memory for daily message:', error);
    }
    
    // Generate message with memory update instructions
    const dailyMessagePromptText = dailyMessagePromptWithMemoryUpdate(
      user, 
      fitnessProfileSubstring, 
      context.workout,
      userMemory
    );
    const dailyMessageResp = await llm.invoke(dailyMessagePromptText);
    const responseContent = typeof dailyMessageResp.content === 'string'
      ? dailyMessageResp.content
      : String(dailyMessageResp.content);
    
    // Extract the actual message
    const messageContent = responseContent.split('<memory_update>')[0].trim();
    
    // Apply memory updates if present
    const memoryUpdate = extractMemoryUpdate(responseContent);
    if (memoryUpdate) {
      const updateService = new MemoryUpdateService();
      const updateResult = await updateService.applyUpdate(
        user.id,
        memoryUpdate,
        {
          userId: user.id,
          source: 'daily_message',
          timestamp: new Date()
        }
      );
      
      if (updateResult.success) {
        console.log(`Daily message memory updated:`, updateResult.updatedSections);
      }
    }
    
    return { user, context, value: messageContent };
  }
}
```

### 12. Conflict Resolution

#### Task 12.1: Implement Optimistic Locking
**Already implemented in Task 4.1** - The MemoryService includes:
- Version checking in `updateMemory` method
- Retry logic with `MAX_RETRY_ATTEMPTS = 3`
- `updateWithVersion` in repository for atomic updates

Additional conflict resolution utilities:
**File**: `src/server/utils/memory/conflictResolver.ts`
```typescript
import type { MemoryContent } from '@/server/models/memory';

export class MemoryConflictResolver {
  /**
   * Merge two memory versions when a conflict occurs
   * Currently implements "last write wins" with smart merging for lists
   */
  mergeMemories(
    base: MemoryContent,
    current: MemoryContent,
    incoming: MemoryContent
  ): MemoryContent {
    return {
      fitnessContext: incoming.fitnessContext, // Last write wins for context
      
      recentWorkouts: {
        // Merge workout entries, keeping unique by date
        entries: this.mergeWorkoutEntries(
          current.recentWorkouts.entries,
          incoming.recentWorkouts.entries
        )
      },
      
      injuriesLimitations: {
        // Merge injuries, avoiding duplicates
        ongoing: this.mergeUniqueItems(
          current.injuriesLimitations.ongoing,
          incoming.injuriesLimitations.ongoing,
          (item) => item.description
        ),
        temporary: this.mergeUniqueItems(
          current.injuriesLimitations.temporary,
          incoming.injuriesLimitations.temporary,
          (item) => item.description
        )
      },
      
      environmentEquipment: {
        default: incoming.environmentEquipment.default, // Last write wins
        temporary: this.mergeUniqueItems(
          current.environmentEquipment.temporary || [],
          incoming.environmentEquipment.temporary || [],
          (item) => item.description
        )
      },
      
      preferencesPatterns: {
        // Merge all preference lists
        loves: [...new Set([...current.preferencesPatterns.loves, ...incoming.preferencesPatterns.loves])],
        dislikes: [...new Set([...current.preferencesPatterns.dislikes, ...incoming.preferencesPatterns.dislikes])],
        bestWorkoutTime: incoming.preferencesPatterns.bestWorkoutTime || current.preferencesPatterns.bestWorkoutTime,
        respondsWellTo: [...new Set([...current.preferencesPatterns.respondsWellTo, ...incoming.preferencesPatterns.respondsWellTo])],
        strugglesWith: [...new Set([...current.preferencesPatterns.strugglesWith, ...incoming.preferencesPatterns.strugglesWith])]
      },
      
      coachingNotes: {
        // Merge notes, keeping unique
        notes: [...new Set([...current.coachingNotes.notes, ...incoming.coachingNotes.notes])]
      }
    };
  }
  
  private mergeWorkoutEntries(
    current: MemoryContent['recentWorkouts']['entries'],
    incoming: MemoryContent['recentWorkouts']['entries']
  ): MemoryContent['recentWorkouts']['entries'] {
    const merged = new Map<string, MemoryContent['recentWorkouts']['entries'][0]>();
    
    // Add current entries
    current.forEach(entry => merged.set(entry.date, entry));
    
    // Override with incoming entries for same date
    incoming.forEach(entry => merged.set(entry.date, entry));
    
    // Sort by date and limit
    return Array.from(merged.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10); // Keep last 10
  }
  
  private mergeUniqueItems<T>(
    current: T[],
    incoming: T[],
    keyExtractor: (item: T) => string
  ): T[] {
    const seen = new Map<string, T>();
    
    // Add current items
    current.forEach(item => seen.set(keyExtractor(item), item));
    
    // Override or add incoming items
    incoming.forEach(item => seen.set(keyExtractor(item), item));
    
    return Array.from(seen.values());
  }
}
```

## Phase 1C: Time Management (Week 5)

### 13. Temporal Marker Support

#### Task 13.1: Create Temporal Parser
**File**: `src/server/utils/memory/temporalParser.ts`
```typescript
import { parse, addDays, addWeeks, addMonths, isAfter, parseISO } from 'date-fns';
import { TEMPORAL_PATTERNS } from '@/server/models/memoryStructure';

export function parseUntilDate(text: string): Date | null {
  // Match "until YYYY-MM-DD"
  const match = text.match(TEMPORAL_PATTERNS.UNTIL_DATE);
  if (match) {
    try {
      return parseISO(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export function parseDuration(text: string): Date | null {
  // Match "for X days/weeks/months"
  const match = text.match(TEMPORAL_PATTERNS.FOR_DURATION);
  if (match) {
    const [, amount, unit] = match;
    const num = parseInt(amount);
    const now = new Date();
    
    if (unit.startsWith('day')) {
      return addDays(now, num);
    } else if (unit.startsWith('week')) {
      return addWeeks(now, num);
    } else if (unit.startsWith('month')) {
      return addMonths(now, num);
    }
  }
  return null;
}

export function formatTemporalMarker(date: Date): string {
  return `until ${date.toISOString().split('T')[0]}`;
}

export function isExpired(text: string, currentDate: Date = new Date()): boolean {
  const untilDate = parseUntilDate(text);
  if (untilDate) {
    return isAfter(currentDate, untilDate);
  }
  return false;
}

export function extractTemporalInfo(text: string): {
  content: string;
  until?: string;
  notedDate?: string;
} {
  let content = text;
  let until: string | undefined;
  let notedDate: string | undefined;
  
  // Extract "until" date
  const untilMatch = text.match(TEMPORAL_PATTERNS.UNTIL_DATE);
  if (untilMatch) {
    until = untilMatch[1];
    content = content.replace(untilMatch[0], '').trim();
  }
  
  // Extract "noted" date
  const notedMatch = text.match(TEMPORAL_PATTERNS.NOTED_DATE);
  if (notedMatch) {
    notedDate = notedMatch[1];
    content = content.replace(notedMatch[0], '').trim();
  }
  
  // Extract duration and convert to date
  if (!until) {
    const durationDate = parseDuration(text);
    if (durationDate) {
      until = durationDate.toISOString().split('T')[0];
      const durationMatch = text.match(TEMPORAL_PATTERNS.FOR_DURATION);
      if (durationMatch) {
        content = content.replace(durationMatch[0], '').trim();
      }
    }
  }
  
  // Clean up content
  content = content
    .replace(/^-\s*/, '')
    .replace(/\s*-\s*$/, '')
    .replace(/^Temporary:\s*/i, '')
    .trim();
  
  return { content, until, notedDate };
}

export function filterExpiredItems<T extends { until?: string }>(
  items: T[],
  currentDate: Date = new Date()
): T[] {
  return items.filter(item => {
    if (!item.until) return true; // No expiration
    try {
      const untilDate = parseISO(item.until);
      return !isAfter(currentDate, untilDate);
    } catch {
      return true; // Keep if can't parse date
    }
  });
}
```

### 14. Memory Cleanup Service

#### Task 14.1: Create Cleanup Service
**File**: `src/server/services/memoryCleanupService.ts`
```typescript
import { MemoryService } from './memoryService';
import { MemoryRepository } from '@/server/repositories/memoryRepository';
import type { MemoryContent } from '@/server/models/memory';
import { parseMemoryContent, formatMemoryContent } from '@/server/utils/memory';
import { filterExpiredItems, isExpired } from '@/server/utils/memory/temporalParser';
import { isAfter, parseISO, subDays } from 'date-fns';
import { MEMORY_LIMITS } from '@/server/models/memoryStructure';

export class MemoryCleanupService {
  private memoryService: MemoryService;
  private memoryRepo: MemoryRepository;
  
  constructor() {
    this.memoryService = new MemoryService();
    this.memoryRepo = new MemoryRepository();
  }
  
  async cleanExpiredContent(userId: string): Promise<void> {
    try {
      const content = await this.memoryService.getMemory(userId);
      const memory = parseMemoryContent(content);
      const currentDate = new Date();
      
      // Clean expired temporary limitations
      memory.injuriesLimitations.temporary = filterExpiredItems(
        memory.injuriesLimitations.temporary,
        currentDate
      );
      
      // Clean expired temporary environments
      memory.environmentEquipment.temporary = filterExpiredItems(
        memory.environmentEquipment.temporary || [],
        currentDate
      );
      
      // Clean old workout entries (keep last 14 days)
      const cutoffDate = subDays(currentDate, MEMORY_LIMITS.WORKOUT_RETENTION_DAYS);
      memory.recentWorkouts.entries = memory.recentWorkouts.entries.filter(entry => {
        try {
          const entryDate = parseISO(entry.date);
          return isAfter(entryDate, cutoffDate);
        } catch {
          return false; // Remove if date is invalid
        }
      });
      
      // Archive important expired items to coaching notes if needed
      const archivedNotes = this.archiveImportantItems(memory, currentDate);
      if (archivedNotes.length > 0) {
        memory.coachingNotes.notes.push(...archivedNotes);
      }
      
      // Save cleaned memory
      const cleanedContent = formatMemoryContent(memory);
      await this.memoryService.updateMemory(userId, cleanedContent);
      
      console.log(`Cleaned expired content for user ${userId}`);
    } catch (error) {
      console.error(`Failed to clean memory for user ${userId}:`, error);
    }
  }
  
  async cleanAllExpiredContent(): Promise<void> {
    console.log('Starting batch memory cleanup job');
    const startTime = Date.now();
    
    try {
      // Get memories that need cleanup (not updated in last 24 hours)
      const memories = await this.memoryRepo.findAllForCleanup(100);
      
      console.log(`Processing ${memories.length} memories for cleanup`);
      
      // Process in parallel with concurrency limit
      const batchSize = 10;
      for (let i = 0; i < memories.length; i += batchSize) {
        const batch = memories.slice(i, i + batchSize);
        await Promise.all(
          batch.map(memory => this.cleanExpiredContent(memory.user_id))
        );
      }
      
      const duration = Date.now() - startTime;
      console.log(`Memory cleanup completed in ${duration}ms`);
    } catch (error) {
      console.error('Memory cleanup job failed:', error);
      throw error;
    }
  }
  
  private archiveImportantItems(
    memory: MemoryContent,
    currentDate: Date
  ): string[] {
    const archived: string[] = [];
    
    // Archive significant injuries that expired
    memory.injuriesLimitations.temporary.forEach(limitation => {
      if (limitation.until && isExpired(limitation.until, currentDate)) {
        // Check if this was a significant injury (lasted > 7 days)
        try {
          const notedDate = parseISO(limitation.notedDate);
          const untilDate = parseISO(limitation.until);
          const daysDiff = Math.floor((untilDate.getTime() - notedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 7) {
            archived.push(
              `Recovered from: ${limitation.description} (${limitation.notedDate} to ${limitation.until})`
            );
          }
        } catch {
          // Skip if dates are invalid
        }
      }
    });
    
    return archived;
  }
  
  removeExpiredEntries(content: string, currentDate: Date = new Date()): string {
    // Parse and clean the content
    const memory = parseMemoryContent(content);
    
    // Apply cleanup
    memory.injuriesLimitations.temporary = filterExpiredItems(
      memory.injuriesLimitations.temporary,
      currentDate
    );
    
    memory.environmentEquipment.temporary = filterExpiredItems(
      memory.environmentEquipment.temporary || [],
      currentDate
    );
    
    // Return formatted content
    return formatMemoryContent(memory);
  }
}
```

### 15. Scheduled Jobs

#### Task 15.1: Create Cleanup Job
**File**: `src/server/jobs/memoryCleanupJob.ts`
```typescript
import { MemoryCleanupService } from '@/server/services/memoryCleanupService';
import type { Job } from './types';

export const memoryCleanupJob: Job = {
  name: 'memory-cleanup',
  schedule: '0 0 * * *', // Daily at midnight UTC
  
  async execute(): Promise<void> {
    console.log('[MemoryCleanupJob] Starting daily memory cleanup');
    const startTime = Date.now();
    
    const cleanupService = new MemoryCleanupService();
    
    try {
      await cleanupService.cleanAllExpiredContent();
      
      const duration = Date.now() - startTime;
      console.log(`[MemoryCleanupJob] Completed successfully in ${duration}ms`);
      
      // Track metrics if monitoring is set up
      if (global.metrics) {
        global.metrics.recordJobExecution('memory-cleanup', duration, 'success');
      }
    } catch (error) {
      console.error('[MemoryCleanupJob] Failed:', error);
      
      // Track failure metrics
      if (global.metrics) {
        global.metrics.recordJobExecution('memory-cleanup', Date.now() - startTime, 'failure');
      }
      
      // Re-throw to trigger alerting
      throw error;
    }
  },
  
  // Job configuration
  config: {
    maxRetries: 3,
    retryDelayMs: 60000, // 1 minute
    timeout: 300000, // 5 minutes
    enabled: process.env.ENABLE_MEMORY_CLEANUP !== 'false'
  }
};
```

#### Task 15.2: Job Scheduler Integration
**File**: `src/server/jobs/scheduler.ts`
```typescript
import cron from 'node-cron';
import { memoryCleanupJob } from './memoryCleanupJob';
import type { Job } from './types';

class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  
  registerJob(job: Job): void {
    if (!job.config.enabled) {
      console.log(`Job ${job.name} is disabled`);
      return;
    }
    
    // Validate cron expression
    if (!cron.validate(job.schedule)) {
      throw new Error(`Invalid cron expression for job ${job.name}: ${job.schedule}`);
    }
    
    // Create scheduled task
    const task = cron.schedule(
      job.schedule,
      async () => {
        console.log(`[Scheduler] Running job: ${job.name}`);
        
        try {
          // Apply timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Job timeout')), job.config.timeout);
          });
          
          await Promise.race([job.execute(), timeoutPromise]);
        } catch (error) {
          console.error(`[Scheduler] Job ${job.name} failed:`, error);
          
          // Implement retry logic if configured
          if (job.config.maxRetries > 0) {
            this.scheduleRetry(job, 1);
          }
        }
      },
      {
        scheduled: false, // Don't start automatically
        timezone: 'UTC'
      }
    );
    
    this.jobs.set(job.name, task);
    console.log(`[Scheduler] Registered job: ${job.name} with schedule: ${job.schedule}`);
  }
  
  private scheduleRetry(job: Job, attempt: number): void {
    if (attempt > job.config.maxRetries) {
      console.error(`[Scheduler] Job ${job.name} failed after ${attempt - 1} retries`);
      return;
    }
    
    setTimeout(async () => {
      console.log(`[Scheduler] Retrying job ${job.name} (attempt ${attempt}/${job.config.maxRetries})`);
      
      try {
        await job.execute();
      } catch (error) {
        this.scheduleRetry(job, attempt + 1);
      }
    }, job.config.retryDelayMs);
  }
  
  start(): void {
    this.jobs.forEach((task, name) => {
      task.start();
      console.log(`[Scheduler] Started job: ${name}`);
    });
  }
  
  stop(): void {
    this.jobs.forEach((task, name) => {
      task.stop();
      console.log(`[Scheduler] Stopped job: ${name}`);
    });
  }
}

// Initialize scheduler
const scheduler = new JobScheduler();

// Register jobs
scheduler.registerJob(memoryCleanupJob);
// Add other jobs here as needed

// Export for use in app initialization
export default scheduler;

// Job type definition
export interface Job {
  name: string;
  schedule: string; // Cron expression
  execute: () => Promise<void>;
  config: {
    maxRetries: number;
    retryDelayMs: number;
    timeout: number;
    enabled: boolean;
  };
}
```

### 16. Date-Aware Memory Formatting

#### Task 16.1: Update Memory Formatter
**Already implemented in Task 5.1** - The formatter includes:
- `formatTemporalLimitation` for temporary items with dates
- `formatTemporalEnvironment` for temporary environments
- Consistent date formatting using `date-fns`

Additional date-aware utilities:
**File**: `src/server/utils/memory/dateFormatter.ts`
```typescript
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

export function formatMemoryDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  const days = differenceInDays(dateObj, today);
  
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 0 && days <= 7) return `in ${days} days`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
  
  return formatMemoryDate(dateObj);
}

export function highlightExpiringItems(text: string, daysThreshold: number = 3): string {
  const lines = text.split('\n');
  const today = new Date();
  const threshold = addDays(today, daysThreshold);
  
  return lines.map(line => {
    const untilMatch = line.match(/until (\d{4}-\d{2}-\d{2})/);
    if (untilMatch) {
      try {
        const untilDate = parseISO(untilMatch[1]);
        const days = differenceInDays(untilDate, today);
        
        if (days <= daysThreshold && days >= 0) {
          // Add expiring soon indicator
          return `${line} [EXPIRING SOON]`;
        } else if (days < 0) {
          // Mark as expired
          return `${line} [EXPIRED]`;
        }
      } catch {
        // Ignore invalid dates
      }
    }
    return line;
  }).join('\n');
}

export function formatDurationFromNow(startDate: string, endDate?: string): string {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : new Date();
  const days = Math.abs(differenceInDays(end, start));
  
  if (days === 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  
  return `${Math.floor(days / 365)} years`;
}
```

## Phase 2: Testing & Refinement (Week 6)

### 17. Unit Tests

#### Task 17.1: Repository Tests
**File**: `src/server/repositories/__tests__/memoryRepository.test.ts`
- Test CRUD operations
- Test version conflicts
- Test error handling

#### Task 17.2: Service Tests
**File**: `src/server/services/__tests__/memoryService.test.ts`
- Test memory initialization
- Test updates and formatting
- Test error scenarios

#### Task 17.3: Parser Tests
**File**: `src/server/utils/memory/__tests__/parser.test.ts`
- Test content parsing
- Test temporal marker extraction
- Test malformed content handling

#### Task 17.4: Update Service Tests
**File**: `src/server/services/__tests__/memoryUpdateService.test.ts`
- Test update application
- Test conflict resolution
- Test validation

### 18. Integration Tests

#### Task 18.1: Agent Integration Tests
**File**: `src/server/agents/__tests__/memoryIntegration.test.ts`
- Test memory inclusion in prompts
- Test update extraction
- Test end-to-end flow

#### Task 18.2: Cleanup Job Tests
**File**: `src/server/jobs/__tests__/memoryCleanupJob.test.ts`
- Test expiration logic
- Test batch processing
- Test error recovery

### 19. Performance Testing

#### Task 19.1: Load Testing
- Test memory retrieval performance
- Test concurrent updates
- Test cleanup job performance

#### Task 19.2: Memory Size Testing
- Test with various memory sizes
- Validate character limits
- Test compression if needed

## Phase 3: Deployment & Monitoring (Week 7-8)

### 20. Deployment Preparation

#### Task 20.1: Migration Scripts
- Production migration scripts
- Rollback procedures
- Data validation scripts

#### Task 20.2: Feature Flags
**File**: `src/server/config/features.ts`
- Add memory system feature flags
- Gradual rollout configuration

### 21. Monitoring & Observability

#### Task 21.1: Metrics Collection
**File**: `src/server/monitoring/memoryMetrics.ts`
- Track memory usage per user
- Track update frequency
- Track cleanup performance

#### Task 21.2: Logging
- Add detailed logging for memory operations
- Log update failures
- Log cleanup results

### 22. Admin Tools

#### Task 22.1: Memory Viewer
**File**: `src/app/admin/memory/page.tsx`
- UI for viewing user memories
- Search and filter capabilities
- Manual edit functionality

#### Task 22.2: Memory Analytics
**File**: `src/app/admin/analytics/memory/page.tsx`
- Usage statistics
- Update patterns
- Error tracking

## Technical Dependencies

### Required NPM Packages
- None (uses existing dependencies)

### Database Requirements
- PostgreSQL with TEXT field support
- Kysely ORM (already in use)

### External Services
- None for Phase 1 (string-based approach)

## Implementation Checklist

### Phase 1A Checklist
- [ ] Database migration created and tested
- [ ] Memory model and types defined
- [ ] Repository implemented with tests
- [ ] Basic service layer complete
- [ ] Memory formatter and parser utilities
- [ ] Context service integration
- [ ] Agent read-only integration

### Phase 1B Checklist
- [ ] Update parser implemented
- [ ] Update service with conflict resolution
- [ ] LLM prompts updated with instructions
- [ ] Agent chains handle updates
- [ ] Update extraction tested

### Phase 1C Checklist
- [ ] Temporal marker parsing
- [ ] Cleanup service implemented
- [ ] Scheduled job configured
- [ ] Date-aware formatting
- [ ] Expiration logic tested

### Testing Checklist
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] Performance tests
- [ ] Manual testing scenarios

### Deployment Checklist
- [ ] Migration scripts ready
- [ ] Feature flags configured
- [ ] Monitoring in place
- [ ] Rollback plan documented
- [ ] Admin tools deployed

## Risk Matrix

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Memory corruption | High | Low | Version control, backups |
| Performance degradation | Medium | Medium | Size limits, monitoring |
| Update conflicts | Low | High | Optimistic locking |
| Temporal parsing errors | Medium | Medium | Comprehensive testing |
| LLM update extraction failures | Low | High | Fallback to manual |

## Success Criteria

### Technical Success
- Memory retrieval < 50ms
- Update success rate > 95%
- No data loss incidents
- Cleanup job reliability > 99%

### Product Success
- 60% of daily messages reference memory
- User engagement increases by 15%
- Support tickets decrease by 20%
- Positive user feedback on personalization

## Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1-2 | 1A: Basic | Database, models, read-only integration |
| 3-4 | 1B: Updates | Automatic updates, LLM extraction |
| 5 | 1C: Time | Temporal support, cleanup jobs |
| 6 | Testing | Comprehensive test coverage |
| 7-8 | Deploy | Gradual rollout with monitoring |

---

**Document Version**: 1.0  
**Created**: 2025-01-06  
**Status**: Ready for Implementation