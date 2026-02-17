# Migration Strategy - Old System to New

This document defines how we transition existing users from the legacy JSON-heavy architecture to the new Markdown-first architecture without disrupting their training.

## The "Plan-Boundary" Cutover

The safest way to migrate a user is at the end of their current training plan.

1. **Detection:** When a user's current legacy plan is within 7 days of ending.
2. **Dossier Conversion:** 
   - A one-time script reads the user's legacy `profile` JSON.
   - It appends the last 30 days of training history.
   - It formats this into the new canonical Markdown Dossier format.
   - It saves to the new `user_dossiers` table.
3. **Plan Generation:** 
   - The user is flagged for the new "Fitness Plan Agent".
   - Instead of a legacy plan, the system generates a new Markdown-first Training Plan.
4. **Execution:** All subsequent weekly and daily tasks are handled by the new agent system.

## In-Flight Emergency Migration

If we need to migrate a user mid-plan:

1. **Plan Conversion:** Use a dedicated sub-agent to convert the current legacy JSON plan into the new Markdown Training Plan format.
2. **History Sync:** Import the current microcycle's workout history into the Dossier.
3. **Cutover:** Update the `users.active_system` flag to `markdown-v1`.

## Database Coexistence

During the 12-week migration window, the database will support both systems:

- **Legacy Tables:** `profiles`, `structured_plans`, `microcycles`
- **New Tables:** `user_dossiers`, `training_plans`, `workouts`

A middleware layer in the application will determine which table to query based on the user's migration status.

## Success Metrics for Migration

- **Zero Data Loss:** All historical PRs and maxes must be preserved in the Dossier history.
- **Delivery Continuity:** Users should receive their morning SMS at the same time, regardless of the underlying system.
- **Latency Improvement:** Users on the new system should see 50%+ faster responses in chat.
- **Cost Reduction:** Monitor token usage per migrated user to confirm 40%+ savings.
