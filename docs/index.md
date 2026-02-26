# GymText Documentation

GymText is a personalized fitness coaching monorepo delivering workout plans via SMS. Three Next.js apps (web, admin, programs) share a `@gymtext/shared` package containing all server logic: services, repositories, agents, and connections.

These docs are the canonical codebase reference — designed for both human developers and AI context consumption.

## Sections

### [Agents](./agents/index.md)
Database-driven AI agent system: AgentRunner, 16 agent definitions, tool registry, context resolution, and prompt management.

- [System Overview](./agents/index.md) — How agents work, invocation flow, prompt management
- [Agent Catalog](./agents/catalog.md) — All 16 agents with details
- [Tool Registry](./agents/tools.md) — 5 chat tools with schemas and execution flow
- [Context System](./agents/context.md) — Context resolution and template engine

### [Architecture](./architecture/index.md)
System architecture: layered services, bootstrap phases, environment switching, and app structure.

- [Overview](./architecture/index.md) — High-level architecture with layer diagram
- [Layer Separation](./architecture/layers.md) — Routes → Orchestration → Domain → Agents → Repos → Connections
- [Service Factory](./architecture/service-factory.md) — 5-phase bootstrap, lazy injection, ServiceContainer
- [Environment Context](./architecture/environment-context.md) — Cookie-based env switching
- [App Structure](./architecture/apps.md) — Web app, admin app, programs portal, shared package
- [Utilities](./architecture/utilities.md) — Date, timezone, circuit breaker, formatters
- [Libraries](./architecture/libraries.md) — Key dependencies and versions

### [Scripts](./scripts/index.md)
All CLI commands: development, database management, seeding, agent management, testing.

- [Scripts Reference](./scripts/index.md) — Complete command reference

---

*12 files • Last updated: 2026-02-26*
