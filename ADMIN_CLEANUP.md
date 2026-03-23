# Admin App Cleanup — agent-runner Integration

## What Can Be Removed

Once agent-runner is the sole agent system (`USE_AGENT_RUNNER=true` permanently), these admin sections become unnecessary:

### Pages (~2,800 lines)
- **`agents/page.tsx`** (~1,111 lines) — Agent definition CRUD UI
  - agent-runner manages agents via code (defineAgent), not DB
  - Studio replaces this for visual agent management
- **`agent-logs/page.tsx`** (~1,705 lines) — Agent invocation log viewer
  - agent-runner has its own LogStore (ar_invocation_logs table)
  - Studio provides log viewing

### API Routes (~830 lines)
- **`api/agents/`** — Agent definition CRUD (~500 lines)
- **`api/formatters/`** — Formatter CRUD (~217 lines)
- **`api/tools/`** — Tool listing (~25 lines)
- **`api/models/`** — Model catalog (~14 lines)
- **`api/agent-logs/`** — Log API (~72 lines)

### Database Tables (can be dropped after migration)
- `agent_definitions` — agent configs stored in DB
- `agent_extensions` — agent formatters/extensions
- `agent_logs` — old invocation logs

### Services (in packages/shared)
- `services/domain/agents/agentDefinitionService.ts` — DB-based agent CRUD
- `services/domain/agents/agentLogService.ts` — old log storage
- `repositories/agentDefinitionRepository.ts`
- `repositories/agentLogRepository.ts`

### Old Agent Infrastructure (~2,318 lines)
- `agents/runner/` — SimpleAgentRunner
- `agents/models/` — LangChain model initialization
- `agents/tools/` — old ToolRegistry
- `agents/templateUtils/` — template engine
- `agents/toolExecutor.ts` — tool execution loop
- `agents/dossierParser.ts` — dossier parsing
- `agents/evals/` — old eval system
- `agents/utils.ts` — message building
- `agents/constants.ts` — old agent IDs

### Old Service Layer (~1,615 lines)
- `services/agents/` — all agent service wrappers
  - profile/, messaging/, modifications/, programs/
  - blog/, regeneration/, schemas/, prompts/, types/

## What Stays
- User management UI (users/)
- Messages UI (messages/)
- Programs UI (programs/)
- Exercise management (exercises/)
- The new agent-runner code (agent-runner/)

## Total Cleanup
- **~7,500+ lines** of code can be removed
- **3 DB tables** can be dropped
- Admin app becomes focused on **content and users**, not agent management

## Migration Steps
1. ✅ Build new system alongside old (all 5 V2 services)
2. ✅ Feature flag routing (all 5 Inngest functions)
3. ✅ Tests (24 passing)
4. 🔲 Deploy with USE_AGENT_RUNNER=true (needs Aaron)
5. 🔲 Validate all flows work
6. 🔲 Remove old code (~7,500+ lines)
7. 🔲 Drop old DB tables
8. 🔲 Remove admin pages/routes
