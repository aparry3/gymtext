# Migration Guide: Repository Reorganization

This guide will help you migrate existing code to use the new modular structure.

## Overview of Changes

1. **Generated types moved**: `src/shared/types/generated.ts` → `src/shared/database/generated/generated.ts`
2. **Domain models created**: Each module now has its own domain models independent of database schema
3. **Clear separation of layers**: Domain, Infrastructure, Application, and API layers
4. **Type conversion**: Mappers handle conversion between database entities and domain models

## Migration Steps

### 1. Update Generated Types Import

**Before:**
```typescript
import { Users, FitnessProfiles } from '@/shared/types/generated';
```

**After:**
```typescript
import { Users, FitnessProfiles } from '@/shared/database/generated/generated';
```

### 2. Use Domain Models Instead of Database Types

**Before:**
```typescript
import { User } from '@/shared/types/user';
import { UserRepository } from '@/server/data/repositories/userRepository';

const userRepo = new UserRepository(db);
const user = await userRepo.findById(userId);
```

**After:**
```typescript
import { User, UserRepository, UserService } from '@/modules/user';

// Use repository directly (infrastructure layer)
const userRepo = new UserRepository(db);
const user = await userRepo.findById(userId);

// Or use service (application layer)
const userService = new UserService(userRepo);
const user = await userService.getUserById(userId);
```

### 3. Update Service Imports

**Before:**
```typescript
import { FitnessPlanService } from '@/server/services/fitness/FitnessPlanService';
```

**After:**
```typescript
import { FitnessPlanService } from '@/modules/fitness';
```

### 4. Use DTOs for API Responses

**Before:**
```typescript
// Returning domain models directly
return res.json(user);
```

**After:**
```typescript
import { UserDtoMapper } from '@/modules/user';

// Convert to DTO before returning
const userDto = UserDtoMapper.toUserResponse(user);
return res.json(userDto);
```

## Module Structure

Each module follows this structure:
```
modules/
└── [module-name]/
    ├── domain/           # Business entities and interfaces
    │   ├── models/       # Domain models
    │   └── interfaces/   # Repository and service interfaces
    ├── infrastructure/   # Data access implementation
    │   ├── repositories/ # Database operations
    │   └── mappers/      # DB ↔ Domain conversion
    ├── application/      # Business logic
    │   └── services/     # Service implementations
    └── api/              # External interface
        ├── dtos/         # Data transfer objects
        └── mappers/      # Domain ↔ DTO conversion
```

## Example: Complete User Registration Flow

```typescript
// API Controller
import { UserService, UserRepository, UserDtoMapper, CreateUserRequestDto } from '@/modules/user';
import { db } from '@/shared/database/client';

export async function registerUser(req: Request, res: Response) {
  const dto: CreateUserRequestDto = req.body;
  
  // Convert DTO to domain input
  const input = UserDtoMapper.fromCreateUserRequest(dto);
  
  // Create repository and service
  const userRepo = new UserRepository(db);
  const userService = new UserService(userRepo);
  
  // Execute business logic
  const user = await userService.registerUser(input);
  
  // Convert to response DTO
  const responseDto = UserDtoMapper.toUserResponse(user);
  
  return res.json(responseDto);
}
```

## Benefits of the New Structure

1. **Type Safety**: Clear boundaries between database types and domain models
2. **Testability**: Easy to mock repositories and services
3. **Maintainability**: Changes to database schema don't affect domain logic
4. **Scalability**: Easy to add new modules following the same pattern
5. **Clean Architecture**: Clear separation of concerns

## Next Steps

1. Gradually migrate existing code module by module
2. Update tests to use the new structure
3. Remove old type definitions once migration is complete
4. Consider using dependency injection for better testability