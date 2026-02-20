# Database Models

This section documents the key database models in GymText.

## Model Organization

Models are defined in `packages/shared/src/server/models/`:

```
models/
├── user.ts              # User model
├── profile.ts            # Fitness profile model
├── fitnessPlan.ts        # Fitness plan model
├── workout.ts            # Workout model
├── microcycle.ts         # Microcycle (weekly) model
├── conversation.ts       # Messaging conversation
├── message.ts            # Individual message
├── program.ts            # Program model
├── programVersion.ts     # Program version
├── programFamily.ts      # Program family
├── programOwner.ts       # Program owner
├── programEnrollment.ts # User enrollment
├── agentDefinition.ts   # Agent definition
├── agentLog.ts           # Agent execution log
├── exercise.ts           # Exercise library
├── organization.ts       # Organization model
└── index.ts             # Re-exports
```

## Core Models

### User

```typescript
interface User {
  id: string;
  phone: string;           // E.164 format
  name: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### FitnessProfile

```typescript
interface FitnessProfile {
  id: string;
  userId: string;
  
  // Goals & Experience
  goal: string;            // e.g., "build muscle", "lose weight"
  experienceLevel: string; // "beginner", "intermediate", "advanced"
  
  // Physical
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: string | null;
  
  // Equipment & Limitations
  availableEquipment: string[];
  limitations: string[];
  
  // Preferences
  workoutDuration: number; // minutes
  daysPerWeek: number;
  preferredTime: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### FitnessPlan

```typescript
interface FitnessPlan {
  id: string;
  userId: string;
  
  name: string;
  goal: string;
  
  // Status
  status: 'active' | 'completed' | 'paused';
  
  // Dates
  startDate: Date;
  endDate: Date | null;
  
  // Progress
  progress: number;        // 0-100
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Mesocycle

```typescript
interface Mesocycle {
  id: string;
  fitnessPlanId: string;
  
  name: string;            // e.g., "Hypertrophy Block"
  phase: string;           // e.g., "building", "strength", "deload"
  weekCount: number;
  
  startWeek: number;
  endWeek: number;
  
  focus: string;
  description: string | null;
}
```

### Microcycle

```typescript
interface Microcycle {
  id: string;
  mesocycleId: string;
  
  weekNumber: number;
  
  // Pattern
  days: DayConfig[];      // Training days configuration
  
  // Status
  isDeload: boolean;
  focus: string;
}
```

### WorkoutInstance

```typescript
interface WorkoutInstance {
  id: string;
  microcycleId: string;
  userId: string;
  
  date: Date;
  
  // Content
  exercises: WorkoutExercise[];
  notes: string | null;
  
  // Status
  status: 'pending' | 'completed' | 'skipped';
  completedAt: Date | null;
  
  createdAt: Date;
}
```

### Conversation

```typescript
interface Conversation {
  id: string;
  userId: string;
  
  status: 'active' | 'archived';
  
  lastMessageAt: Date;
  createdAt: Date;
}
```

### Message

```typescript
interface Message {
  id: string;
  conversationId: string;
  userId: string;
  
  direction: 'inbound' | 'outbound';
  content: string;
  
  // Twilio
  externalSid: string | null;
  
  // Metadata
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
  
  createdAt: Date;
}
```

## Relationships

```
User 1───► FitnessProfile
User 1───► FitnessPlan 1───► Mesocycle 1───► Microcycle 1───► WorkoutInstance
User 1───► Conversation 1───► Message
User 1───► Subscription
```

## Type Generation

Database types are generated from the schema:

```bash
pnpm db:codegen
```

This creates TypeScript types in `packages/shared/src/server/models/_types/`.

## Related Documentation

- [Architecture Overview](../architecture/overview.md) - System architecture
- [Database Schema](../architecture/database.md) - Schema overview
- [API Structure](../architecture/api-structure.md) - API routes
