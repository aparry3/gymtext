# Programs App

The **programs** app is the program owners portal for creating and managing fitness programs.

## Overview

| Property | Value |
|----------|-------|
| **Directory** | `apps/programs` |
| **URL** | programs.gymtext.com |
| **Port** | 3002 |
| **Framework** | Next.js 16 (App Router) |

## Purpose

The programs app allows **program owners** to:
- Create and manage fitness programs
- Define workout templates
- Manage program enrollments
- View program analytics

## Key Routes

### Public Routes

| Path | Description |
|------|-------------|
| `/login` | Program owner login |

### Protected Routes (Requires Auth)

| Path | Description |
|------|-------------|
| `/` | Dashboard |
| `/programs` | List my programs |
| `/programs/new` | Create new program |
| `/programs/[id]` | Program details |
| `/programs/[id]/edit` | Edit program |
| `/enrollments` | Manage enrollments |
| `/analytics` | Program analytics |

### API Routes

| Path | Method | Description |
|------|--------|-------------|
| `/api/programs` | GET/POST | List/create programs |
| `/api/programs/[id]` | GET/PATCH/DELETE | Program CRUD |
| `/api/enrollments` | GET/POST | List/create enrollments |
| `/api/analytics/*` | GET | Analytics data |

## Features

### Program Management

- Create fitness programs with templates
- Define workout structures
- Set program parameters (duration, goals)
- Version control programs

### Program Structure

Programs are organized as:

```
Program
├── Versions (program_versions)
│   ├── Family (program_family)
│   └── Workouts
└── Enrollments (program_enrollments)
    └── User Fitness Plans
```

### Enrollment Management

- Enroll users in programs
- Track user progress
- Manage program assignments

## Technical Details

### Authentication

Program owners use phone-based authentication similar to users:
- SMS verification codes
- Session cookies

### Program Data Model

```typescript
// Core tables
- program_owners    // Program creator accounts
- programs          // Fitness programs
- program_versions // Version history
- program_families // Program groupings
- program_enrollments // User enrollments
```

### Environment Variables

```bash
DATABASE_URL=...
SESSION_ENCRYPTION_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...
```

## Development

```bash
# Start development server
pnpm dev:programs

# Build for production
pnpm build:programs
```

## Related Documentation

- [Architecture Overview](../architecture/overview.md) - System architecture
- [Web App](./web.md) - Consumer app
- [Admin App](./admin.md) - Admin portal
- [Database Schema](../architecture/database.md) - Database design
