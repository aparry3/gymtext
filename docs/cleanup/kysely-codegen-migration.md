# Kysely Codegen Migration Plan

## Overview

Replace manually written database types with generated Kysely types using `kysely-codegen`. This will ensure type safety and reduce maintenance overhead by automatically generating TypeScript interfaces from the PostgreSQL database schema.

## Current State

- Manual type definitions in `src/shared/types/`
- Potential type drift between database schema and TypeScript types
- Manual maintenance required for schema changes

## Target State

- Auto-generated types using `kysely-codegen`
- Types generated to `src/shared/types/generated/`
- Integrated with build process and development workflow
- Uses camelCase plugin for consistent naming

## Implementation Plan

### 1. Install Dependencies
```bash
pnpm add -D kysely-codegen
```

### 2. Configuration Setup
- Create `kysely-codegen.config.ts` or configure in `package.json`
- Configure camelCase plugin to match existing naming conventions
- Set output directory to `src/shared/types/generated/`

### 3. Script Integration
Add codegen scripts to `package.json`:
```json
{
  "scripts": {
    "db:codegen": "kysely-codegen",
    "predev": "pnpm db:codegen",
    "prebuild": "pnpm db:codegen",
    "premigrate": "pnpm db:codegen"
  }
}
```

### 4. Type Migration
- Update imports from manual types to generated types
- Remove manual type definitions that are now generated
- Update database client initialization to use generated types

### 5. Development Workflow
- Types regenerate automatically before dev server starts
- Types regenerate before builds
- Types regenerate after migrations run

## Files to Modify

### New Files
- `kysely-codegen.config.ts` - Configuration file
- `src/shared/types/generated/` - Generated types directory

### Modified Files
- `package.json` - Add scripts and dependencies
- `src/server/core/database/client.ts` - Update type imports
- All repository files - Update type imports
- All service files using database types - Update imports

## Benefits

1. **Type Safety**: Guaranteed alignment between database schema and TypeScript types
2. **Maintenance**: Automatic updates when schema changes
3. **Consistency**: camelCase plugin ensures consistent naming
4. **Developer Experience**: No manual type maintenance required
5. **CI/CD**: Types automatically generated in build process

## Migration Steps

1. Install `kysely-codegen`
2. Create configuration file
3. Add package.json scripts
4. Generate initial types
5. Update imports across codebase
6. Remove manual type definitions
7. Test all database operations
8. Update documentation

## Considerations

- Ensure generated types directory is gitignored if types are generated at build time
- Consider committing generated types for better IDE support
- Update CI/CD pipeline to run codegen
- Verify camelCase plugin works with existing naming conventions