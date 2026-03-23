# Comparison Eval Harness

Validates the new agent-runner system against the old agent system by running identical scenarios through both and comparing outputs using LLM-as-judge evals.

## Purpose

This eval harness supports **Phase 4: Testing + Cutover** of the agent-runner integration (see RFC). It helps Aaron validate that the new system works as well as (or better than) the old system before deleting ~7,500 lines of old code.

## What It Does

1. **Runs test scenarios** through both old and new systems in parallel
2. **Scores outputs** using existing eval rubrics (LLM-as-judge)
3. **Compares results** across dimensions: quality, speed, token usage
4. **Generates report** showing wins/losses/ties and detailed breakdowns

## Usage

### Prerequisites

1. **Database running** with test users created
2. **Environment variables** set (DATABASE_URL, API keys)
3. **agent-runner SDK linked** (for new system)

```bash
# From gymtext repo root
cd ~/Projects/gymtext-benji
source .env.local  # Load env vars
```

### Run Comparison

```bash
# From packages/shared
pnpm eval:compare

# With edge cases
pnpm eval:compare --edge-cases

# Custom output path
pnpm eval:compare --output ./reports/comparison-$(date +%Y%m%d).md
```

### Test Data Setup

The eval needs test users with various profiles:

```sql
-- Create test users for eval
INSERT INTO users (id, phone, created_at) VALUES
  ('test-user-beginner', '+15555550001', NOW()),
  ('test-user-intermediate', '+15555550002', NOW()),
  ('test-user-advanced', '+15555550003', NOW());

-- Add fitness profiles (or let onboarding create them)
-- See test-scenarios.ts for required user contexts
```

**Note:** The eval will create/update fitness contexts as needed. Test users should be isolated (not real production users).

## Test Scenarios

### Standard Scenarios (`TEST_SCENARIOS`)

- **Chat scenarios** (5): Simple questions, workout modifications, progress queries, form checks, scheduling
- **Daily workout scenarios** (3): Beginner, intermediate, advanced users
- **Onboarding scenarios** (3): Complete beginner, experienced lifter, user with limitations

### Edge Cases (`EDGE_CASE_SCENARIOS`)

- Empty context (new user)
- Off-topic questions (boundary testing)
- Very long messages (multi-part questions)

Add new scenarios to `test-scenarios.ts` as needed.

## Output Report

The report includes:

### Summary
- Total scenarios run
- Wins for each system (new vs old)
- Ties and failures
- Average scores (when evals available)
- Average score difference (new - old)

### Per-Scenario Details
- Description and type
- Old system: duration, score, errors
- New system: duration, score, tokens, model, errors
- Winner and notes (performance differences, quality differences)

### Example Summary

```
## Summary

- **Total Scenarios:** 11
- **New System Wins:** 7
- **Old System Wins:** 2
- **Ties:** 2
- **Both Failed:** 0

- **Average Score (Old):** 8.2/10
- **Average Score (New):** 8.7/10
- **Average Score Difference:** +0.5
```

## Eval Rubrics

The harness uses existing eval rubrics from `prompts/`:

- `eval-rubric-workout-format.md` — Daily workout formatting
- `eval-rubric-profile-update.md` — Profile generation quality
- `eval-rubric-plan-generate.md` — Plan generation quality
- `eval-rubric-week-generate.md` — Week/microcycle quality

Rubrics define:
- Dimensions to score (formatting, completeness, safety, etc.)
- Weights for each dimension (sum to 1.0)
- Scoring scale (0-10) with examples

See `packages/shared/src/server/agents/evals/` for eval implementation.

## Exit Codes

- `0` — Success: new system meets or exceeds old system
- `1` — Failure: some scenarios failed in both systems OR old system won more

## Extending

### Add New Scenarios

Edit `test-scenarios.ts`:

```typescript
export const TEST_SCENARIOS: TestScenario[] = [
  // ... existing scenarios
  {
    id: 'chat-nutrition-question',
    type: 'chat',
    description: 'User asks about nutrition',
    input: {
      userId: 'test-user-1',
      message: "Should I eat more protein?",
    },
    expectedDimensions: ['relevance', 'safety', 'actionability'],
  },
];
```

### Add New Rubrics

Create rubric in `prompts/eval-rubric-*.md`, then reference it:

```typescript
{
  id: 'onboarding-complete',
  type: 'onboarding',
  rubricPath: '../../../prompts/eval-rubric-onboarding.md',
  // ...
}
```

### Mock Services for Testing

To test the eval framework without a DB, create mock service implementations:

```typescript
const mockServices = {
  newChat: {
    async processMessage() {
      return { response: 'Mock response', usage: {}, model: 'mock' };
    },
  },
  // ... other mocks
};
```

## Implementation Notes

- **Parallel execution:** Old and new systems run in parallel (no bias from order)
- **LLM-as-judge:** Uses `gpt-5-nano` for eval scoring (cheap, fast, consistent)
- **Structured output:** Evals return dimension-level scores + reasoning
- **No manual scoring:** All quality assessment is LLM-based (per Aaron's direction)

## Files

- `comparison-eval.ts` — Core harness logic
- `test-scenarios.ts` — Test scenario definitions
- `run-comparison.ts` — CLI entry point
- `README.md` — This file

---

**Next steps after eval:**

1. Review comparison report
2. If new system wins/ties most scenarios → proceed to Phase 5 (cleanup)
3. If old system wins → investigate regressions, fix, re-eval
4. Once validated → delete old code (~7,500 lines)
