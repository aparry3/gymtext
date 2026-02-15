# Staging Cleanup Report
**Date:** February 15, 2026  
**Branch:** `chore/staging-cleanup`  
**Target:** `staging` → `main`

## Executive Summary

**⚠️ CRITICAL: Staging branch is NOT BUILD-READY**

All three Next.js applications (web, admin, programs) fail to build with a runtime error during the build process. This is a **blocking issue** that prevents any deployment or merge to main.

---

## Build Status

### ❌ Build Failures

**Error:** `TypeError: Cannot read properties of undefined (reading 'prototype')`

- **web**: ❌ Failed during page data collection
- **admin**: ❌ Failed during page data collection  
- **programs**: ❌ Failed during page data collection
- **@gymtext/shared**: ✅ TypeScript compiles successfully

### Error Details

The error occurs during Next.js's build-time page data collection phase. All three apps fail with the same error pattern:

```
TypeError: Cannot read properties of undefined (reading 'prototype')
    at module evaluation (.next/server/chunks/_2ebda52b._.js:6:1996371)
    at instantiateModule (.next/server/chunks/[turbopack]_runtime.js:715:9)
    ...
```

This manifests in multiple pages across all apps, suggesting a shared dependency or module initialization issue.

---

## Changes Since Main

### Commits on Staging (17 commits)
```
f95e63fb fixing extensions
2e70c219 fix dropdown
cafda5b3 upcoming week
b738d429 context templates
321a36ec entensions and evals
5d5fbdc6 Merge branch 'staging'
91901550 evals
15ea5b3a simplify context
371e7afe fixing modify and structured workout
5473beba updating modify call
2b5d1aeb update latency
9b980b6b remove hooks
4e2b7346 evals
22fd9bdf simplify context
4c95ce00 fixing modify and structured workout
1317b3cd updating modify call
dd772f7d update latency
6fffd891 remove hooks
```

### Major Architectural Changes

**Registry-Based Agent System**
- Replaced hardcoded prompts with dynamic agent registry
- New `agent_definitions` table with JSON config columns
- New `agent_extensions` table for modular agent behavior
- New `context_templates` table for reusable context blocks
- Removed `agent_hooks` columns
- New admin UI for agent configuration

### Database Migrations (8 new)

1. `20260210000000_drop_agent_hooks_columns.ts`
2. `20260211000000_optimize_modification_agents.ts`
3. `20260212000000_agent_eval_columns.ts`
4. `20260213000000_create_context_templates_agent_extensions.ts`
5. `20260213100000_add_default_extensions_to_agent_definitions.ts`
6. `20260214000000_drop_is_deload_from_microcycles.ts`
7. `20260214100000_add_workout_tags.ts`
8. `20260215000000_remove_training_meta_context.ts`
9. `20260216000000_expand_agent_extensions.ts` (most recent)

### Code Structure Changes

**New Components:**
- `apps/admin/src/components/admin/agents/AgentExtensionsPane.tsx` (951 lines)
- `apps/admin/src/components/admin/agents/SubAgentsBuilderSection.tsx` (509 lines)
- `apps/admin/src/components/admin/agents/ValidationRulesBuilderSection.tsx` (261 lines)
- `apps/admin/src/components/admin/registry/ContextTab.tsx` (186 lines)

**Removed Components:**
- Entire `/prompts` page and API routes
- `HooksSection.tsx`
- Legacy prompt editor components

**Modified Core Files:**
- `packages/shared/src/server/agents/runner/agentRunner.ts` (major refactor)
- `apps/admin/src/components/admin/agents/AgentEditorPane.tsx` (heavily modified)
- Admin sidebar navigation updated

---

## Testing Status

### ⏭️ Skipped (Build Failed)
- ✅ TypeScript compilation: **PASSED** (shared package)
- ❌ pnpm build: **FAILED** (all apps)
- ⏭️ pnpm lint: **SKIPPED** (build required)
- ⏭️ pnpm test: **SKIPPED** (build required)

---

## Root Cause Analysis (Preliminary)

### Likely Causes (in order of probability):

1. **Circular dependency** introduced in recent agent refactor
2. **Module initialization issue** in shared package during build-time imports
3. **Next.js Turbopack incompatibility** with new code structure
4. **Missing environment variable** at build time (though DB codegen succeeds)
5. **Runtime code** being evaluated at build time

### Evidence:
- Error occurs in Turbopack's module system (`.next/server/chunks/`)
- Same error pattern across all three apps
- TypeScript compiles without errors
- Error references `.prototype` access on undefined object

---

## Recommendations

### Immediate Actions Required

1. **Investigate Module Loading**
   - Check for circular imports in:
     - `packages/shared/src/server/agents/runner/agentRunner.ts`
     - New extension/registry files
     - Tool definitions
   - Review dynamic imports and lazy loading

2. **Verify Build Configuration**
   - Check `next.config.js` in all three apps
   - Verify Turbopack configuration
   - Test with webpack build mode if available

3. **Incremental Rollback Test**
   - Bisect commits to find the breaking change
   - Test building at commit `6fffd891` (remove hooks)
   - Compare with commit `f95e63fb` (current HEAD)

4. **Add Build Safeguards**
   - Add pre-commit hook that runs build check
   - Add CI/CD build validation for staging branch
   - Consider staged rollout of architectural changes

### Before Merging to Main

#### Critical Blockers
- [ ] **All three apps must build successfully**
- [ ] **All 8 migrations must be tested on staging environment**
- [ ] **Agent registry system must be manually tested**

#### High Priority
- [ ] Verify all existing agent functionality still works
- [ ] Test admin UI for agent configuration
- [ ] Verify context templates render correctly
- [ ] Check agent evals system
- [ ] Test extension system with real agents

#### Manual Testing Required
- [ ] Create/edit/delete agent definitions via admin UI
- [ ] Test agent extensions (tools, context, validation)
- [ ] Verify sub-agents configuration
- [ ] Test all existing SMS workflows still function
- [ ] Verify workout generation/modification agents work

#### Configuration & Environment
- [ ] Document any new environment variables needed
- [ ] Update deployment documentation for new migrations
- [ ] Verify `.env.local` has all required values
- [ ] Check Redis/Inngest compatibility with new agent system

#### Known Incomplete Features
- [ ] Extension UI reportedly has bugs (per task description)
- [ ] Agent evaluation system may need refinement
- [ ] Registry UI may need UX improvements

---

## Notes

- The `.env.local` file is present and DATABASE_URL is correctly configured
- The shared package's database codegen runs successfully
- This appears to be a Next.js/Turbopack-specific build issue, not a TypeScript or database issue
- The staging branch represents a significant architectural shift that will require careful QA

---

## Next Steps

1. **Debug the build error** - This is the top priority blocking issue
2. **Create minimal reproduction** if possible
3. **Consider reverting problematic commits** if a quick fix isn't found
4. **Engage with Next.js/Turbopack** community if it's a framework issue

---

**Author:** Engineering Agent (OpenClaw)  
**Status:** ⚠️ NOT READY FOR MAIN
