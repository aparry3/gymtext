# GymText Comprehensive Assessment — February 15, 2026

## 1. Executive Summary

GymText has a **solid architectural foundation** with the new Context Registry + Agent Runner system, but the **AI quality infrastructure is critically underdeveloped**. The codebase has 540 TypeScript files across 62K lines, 3 apps (web, admin, programs), and a shared package with well-structured service/repository layers.

**Key findings:**
- ✅ Agent architecture is clean, well-designed, and extensible
- 🔴 **Zero eval scores** — 564 agent logs exist but none have been evaluated
- 🔴 **No eval prompts configured** on any agent definition
- 🟡 Only 4 of ~20 agent definitions have few-shot examples
- 🔴 No self-improvement loop exists whatsoever
- 🟡 319 console.log statements across production code
- 🟡 37 scripts (many ad-hoc), 50 archived migrations, heavy root-level clutter
- 🟡 Existing `TECHNICAL_DEBT_AUDIT.md` from Jan 26 — partially addressed

**Bottom line:** The architecture is ready for quality iteration, but there's no mechanism to measure or improve AI output quality. This is the #1 gap.

---

## 2. Agent Architecture Assessment

### Context Registry (`packages/shared/src/server/agents/context/`)
- **647 lines** across the registry + 13 context providers
- Well-documented with JSDoc, clear interface (`ContextProvider`)
- Pre-flight param validation, parallel resolution — good design
- **Providers:** userProfile, user, fitnessPlan, currentWorkout, recentWorkouts, currentMicrocycle, upcomingMicrocycle, dayOverview, dateContext, availableExercises, previousSessionsByType, programVersion
- ✅ Clean, modular, each provider in its own file

### Agent Runner (`packages/shared/src/server/agents/runner/agentRunner.ts`)
- **516 lines** — the orchestration heart
- Handles: DB config resolution → context resolution → template rendering → tool execution → sub-agent orchestration → logging
- Supports agent extensions (per-agent prompt/example overrides)
- MAX_DEPTH = 5 for sub-agent chains
- Integrates with `agentLogRepository` for invocation logging
- ✅ Well-structured but complex — could benefit from decomposition

### Declarative System (`packages/shared/src/server/agents/declarative/`)
- Template engine with test coverage (427-line test file)
- Input mapping, validation rules
- ✅ Solid foundation for DB-driven agent configuration

### Agent Definitions (Production DB)
- **~20 unique agent types** across ~40 versioned rows (multiple versions per agent)
- Key agents: `workout:generate`, `workout:message`, `workout:structured`, `microcycle:*`, `chat:generate`, `profile:*`, `plan:*`, `modifications:router`, `blog:metadata`, `program:parse`
- Columns include: system_prompt, user_prompt, user_prompt_template, model, temperature, tool_ids, context_types, sub_agents, schema_json, validation_rules, examples, eval_prompt, eval_model, default_extensions

### Documentation
- `CONFIGURABLE_AGENTS.md` (20K) — thorough
- `PROJECT_OVERVIEW.md` (36K) — comprehensive
- `docs/AGENT_ARCHITECTURE.md` exists
- ✅ Better documented than most codebases at this stage

---

## 3. Eval System Status

### Infrastructure: **Exists but unused**

| Component | Status |
|-----------|--------|
| `agent_logs` table | ✅ 564 rows logged |
| `eval_score` column | ✅ Exists, **0 rows populated** |
| `eval_prompt` on definitions | ✅ Column exists, **all NULL** |
| `eval_model` on definitions | Set to `gpt-5-nano` everywhere (default) |
| Admin API endpoint | ✅ `agent-evals/summary` route exists |
| `updateEval()` method | ✅ Exists in agentLogRepository |
| Automated eval pipeline | 🔴 **Does not exist** |
| Eval trigger on invocation | 🔴 **Not implemented** |

### Agent Log Distribution (564 total)
| Agent | Invocations |
|-------|------------|
| workout:generate | 119 |
| workout:message | 119 |
| workout:structured | 119 |
| workout:structured:validate | 116 |
| microcycle:message | 26 |
| microcycle:structured | 26 |
| microcycle:generate | 23 |
| chat:generate | 7 |
| modifications:router | 3 |
| microcycle:modify | 3 |
| profile:* | 3 |

**Assessment:** The logging infrastructure is working. The eval infrastructure exists in schema but has never been activated. No eval prompts have been written for any agent.

---

## 4. Examples & Training Data

### Few-Shot Examples

| Agent | Has Examples |
|-------|-------------|
| chat:generate (v2) | ✅ Yes |
| workout:message (3 versions) | ✅ Yes |
| workout:structured (1 version) | ✅ Yes |
| All others (~35 rows) | ❌ No |

- Only **4 out of ~40 agent definition rows** have examples
- Examples are stored as JSONB in the `examples` column
- The `buildExampleMessages()` utility in `agents/utils.ts` supports positive and negative examples (negative = input + bad output + correction)
- `scripts/seed-context-templates.ts` and `scripts/update-context-templates.ts` exist for seeding

### Training Data Scripts
- `scripts/migrations/regenerate-training-data.ts` (479 lines) — exists but unclear if actively used
- No systematic example curation workflow

**Assessment:** The example system is well-designed but barely populated. Most agents operate zero-shot.

---

## 5. Self-Improvement Loop

**Status: Does not exist.**

| Component | Exists? |
|-----------|---------|
| Production data capture | ✅ agent_logs table |
| Automated evaluation | ❌ |
| Failed conversation detection | ❌ |
| Eval → prompt improvement pipeline | ❌ |
| A/B testing of prompts | ❌ (versioning exists but no comparison) |
| Human review interface | 🟡 Admin app exists but no eval UI |

The versioning system (multiple rows per agent_id) provides the foundation for A/B testing, but nothing connects these pieces.

---

## 6. Technical Debt Inventory

### 6.1 Logging (319 console.log statements)
- Spread across `packages/` and `apps/`
- Custom logger exists at `packages/shared/src/server/agents/logger.ts`
- Many console.logs in migration files (acceptable) but also in service code

### 6.2 Ad-Hoc Scripts (37 files in `scripts/`)
| Category | Files |
|----------|-------|
| Exercise data management | ~12 (seed, export, audit, videos) |
| Agent config management | ~5 (seed-context-templates, update-agent-temperatures, agent-definition) |
| DB utilities | `scripts/db/` directory |
| Archived test scripts | 3 in `scripts/archive/` |
| One-off utilities | generate-favicons, sms-test, bulk-upload, etc. |
| Data files mixed in | exercise-videos.csv, sheet-data.json, temp-data.tsv |

### 6.3 Root-Level Clutter
Files that should be in `docs/` or `scripts/`:
- `exercise-schema.json`
- `exercise_canonicalization_alias_strategy.md`
- `exercise_search_normalization.md`
- `exercises-psql.sql` (733KB!)
- `exercises.json` (522KB!)
- `gym-leads-20002.csv`
- `gymtext_program_owners_overview.md`
- `pdfjs_embedded_text_extraction.md`

### 6.4 Migrations
- 81 migration files total, 50 archived
- Consolidated schema migration exists (1252 lines)
- Reasonably managed

### 6.5 Service Complexity Hotspots
| File | Lines | Concern |
|------|-------|---------|
| `messagingOrchestrator.ts` | 834 | God service — orchestrates all messaging |
| `factory.ts` | 680 | Growing service factory |
| `agentRunner.ts` | 516 | Complex but appropriate |
| `userRepository.ts` | 480 | Large but expected |
| `trainingService.ts` | 478 | Training pipeline complexity |

### 6.6 Test Coverage
- **6 test files** total (3 agent unit tests, 1 template engine test, 1 exercise normalization test, 1 tags test)
- No integration tests
- No end-to-end tests
- Test infrastructure exists (`tests/setup/test-environment.ts`, `tests/mocks/`)

### 6.7 TODO/FIXME Count
- **11 TODO/FIXME/HACK markers** in production code
- Includes the critical mock auth issue flagged in existing tech debt audit

---

## 7. Recommendations (Prioritized)

### 🔴 P0 — Activate the Eval System (Week 1-2)
The infrastructure exists. The gap is:
1. **Write eval prompts** for the top 5 agents (workout:generate, workout:message, workout:structured, microcycle:generate, chat:generate)
2. **Wire up automatic eval** — after each agent invocation, run eval and store score
3. **Build a simple eval dashboard** in the admin app (the API endpoint already exists)
4. This unlocks everything else — you can't improve what you can't measure

### 🟠 P1 — Populate Few-Shot Examples (Week 2-3)
1. Review the 564 existing agent logs for good/bad examples
2. Add 3-5 examples per major agent (especially workout:generate, microcycle:generate)
3. Include negative examples with corrections for common failure modes
4. Prioritize workout:structured (JSON output quality is measurable)

### 🟡 P2 — Build the Feedback Loop (Week 3-4)
1. Add a "flag bad output" mechanism (admin UI or SMS reply)
2. Create a script that pulls flagged conversations → candidate negative examples
3. Set up weekly eval score review cadence

### 🟢 P3 — Technical Cleanup (Ongoing)
1. Move root-level data files to `data/` directory
2. Consolidate scripts with a `scripts/README.md`
3. Audit and remove/replace 319 console.logs with structured logger
4. Address the 11 TODO/FIXME items
5. Add integration tests for the agent pipeline (context → runner → output)

### 🔵 P4 — Architecture Refinements
1. Decompose `messagingOrchestrator.ts` (834 lines)
2. Consider splitting `agentRunner.ts` invoke method into smaller phases
3. Add circuit breaker / fallback for agent failures

---

*Generated: February 15, 2026 | Repo: ~/Projects/gymtext | 540 .ts files, 62K LOC*
