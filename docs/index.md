# GymText Documentation

Welcome to the GymText documentation. This comprehensive guide covers everything you need to understand, develop, and maintain the GymText platform.

## Quick Links

- **[Architecture Overview](./architecture/overview.md)** - System architecture and design
- **[Agent System](./agents/index.md)** - Database-driven AI agent system
- **[Apps](./apps/web.md)** - Web, Admin, and Programs applications
- **[Development](./development/getting-started.md)** - Getting started guide
- **[API Reference](./architecture/api-structure.md)** - API routes and structure
- **[Database Models](./models/index.md)** - Database schema and models

## What is GymText?

GymText is a personalized fitness coaching application that delivers workout plans via SMS. Users interact with an AI-powered coach through text messages, receiving customized fitness plans, daily workouts, and intelligent coaching conversations.

The platform uses AI agents to:
- Generate personalized fitness plans based on user profiles
- Create daily workouts tailored to individual goals
- Have natural coaching conversations via SMS
- Handle program modifications and adjustments

## Documentation Structure

### For New Developers

1. Start with **[Getting Started](./development/getting-started.md)**
2. Understand the **[Architecture](./architecture/overview.md)**
3. Learn about the **[Agent System](./agents/index.md)**
4. Explore the **[Database Models](./models/index.md)**

### For Reference

- **[Environment Variables](./reference/environment-variables.md)** - All required env vars
- **[Scripts](./scripts/index.md)** - Available development scripts
- **[Tools](./tools/index.md)** - Development tools
- **[Troubleshooting](./reference/troubleshooting.md)** - Common issues and solutions

## Project Overview

GymText is a monorepo with two Next.js applications:

| App | Purpose | URL |
|-----|---------|-----|
| **web** | Consumer-facing app | gymtext.com |
| **admin** | Admin portal | admin.gymtext.com |
| **programs** | Program owners portal | programs.gymtext.com |

The monorepo also includes:
- **packages/shared** - Shared server logic, agents, models
- **scripts** - Database migrations, seeding, and utility scripts
- **migrations** - Database migration files
