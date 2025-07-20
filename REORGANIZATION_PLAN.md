# Repository Reorganization Plan

## Current Issues
1. Mixed database and domain types in shared/types
2. Services and repositories are not organized by domain
3. No clear conversion layer between database entities and domain models
4. Generated types are mixed with hand-written types

## Proposed Structure

```
src/
├── modules/                    # Domain-driven modules
│   ├── user/
│   │   ├── domain/            # Domain models and interfaces
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   └── FitnessProfile.ts
│   │   │   └── interfaces/
│   │   │       ├── IUserRepository.ts
│   │   │       └── IUserService.ts
│   │   ├── infrastructure/    # Data layer implementation
│   │   │   ├── repositories/
│   │   │   │   └── UserRepository.ts
│   │   │   └── mappers/       # DB <-> Domain conversion
│   │   │       └── UserMapper.ts
│   │   ├── application/       # Business logic
│   │   │   └── services/
│   │   │       └── UserService.ts
│   │   └── api/              # API layer (DTOs, controllers)
│   │       ├── dtos/
│   │       │   ├── CreateUserDto.ts
│   │       │   └── UserResponseDto.ts
│   │       └── mappers/
│   │           └── UserDtoMapper.ts
│   │
│   ├── fitness/
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   ├── FitnessPlan.ts
│   │   │   │   ├── Mesocycle.ts
│   │   │   │   ├── Microcycle.ts
│   │   │   │   └── WorkoutInstance.ts
│   │   │   └── interfaces/
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   ├── application/
│   │   │   └── services/
│   │   └── api/
│   │       ├── dtos/
│   │       └── mappers/
│   │
│   ├── conversation/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── application/
│   │   └── api/
│   │
│   ├── workout/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── application/
│   │   └── api/
│   │
│   └── ai/
│       ├── domain/
│       ├── infrastructure/
│       ├── application/
│       └── api/
│
├── shared/
│   ├── database/
│   │   ├── generated/         # Keep generated.ts here
│   │   │   └── generated.ts
│   │   ├── client.ts
│   │   └── migrations/
│   ├── utils/
│   └── config/
│
└── app/                       # Next.js app directory (unchanged)
```

## Implementation Steps

1. **Create module directories** for each domain (user, fitness, conversation, workout, ai)
2. **Create domain models** that are independent of database schema
3. **Create mappers** to convert between:
   - Database entities (from generated.ts) → Domain models
   - Domain models → API DTOs
4. **Move repositories** to infrastructure layer within each module
5. **Move services** to application layer within each module
6. **Create interfaces** for repositories and services in domain layer
7. **Update imports** throughout the codebase

## Benefits

1. **Clear separation of concerns**: Each layer has a specific responsibility
2. **Domain-driven design**: Business logic is isolated from infrastructure
3. **Testability**: Easy to mock repositories and services
4. **Maintainability**: Changes to database schema don't affect domain logic
5. **Type safety**: Clear conversion between different type layers