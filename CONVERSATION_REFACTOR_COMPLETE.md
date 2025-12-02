# Conversation Flow Refactor - Complete

## Summary of Changes

We have successfully refactored the conversation flow to address race conditions, simplify the agent architecture, and improve context handling.

### 1. Infrastructure: The "Funnel" & Debouncing
- **Inngest Debounce:** Added `debounce: { period: '10s', key: 'userId' }` to `processMessageFunction`. This prevents rapid-fire messages from triggering parallel processing jobs.
- **Batch Processing:** Updated `processMessageFunction` to ignore the single event payload and instead fetch **all pending messages** using `messageService.getPendingMessages(userId)`.
- **Message Service:**
    - Added `getPendingMessages`: Retrieves all inbound messages since the last outbound message.
    - Simplified `ingestMessage`: Now strictly stores the message, queues the job, and returns. Removed the "Reply Agent" fast-path entirely.

### 2. Architecture: The "Coordinator"
- **Flattened Agent:** Removed the complex Triage -> Sub-Agent routing tree.
- **Coordinator Role:** The `ChatAgent` now acts as a single "Coordinator" that:
    1.  **Scribe Phase:** Runs `ProfileAgent` first to extract facts, injuries, and PRs into the user's Markdown profile.
    2.  **Coach Phase:** Receives the aggregated user message + the "Profile Update Summary" (e.g., "Logged 225 bench PR").
    3.  **Action:** Uses `bindTools` to access `modificationTools` directly. It can call tools or answer questions/greet natively.

### 3. Profile Tracking
- **Progress Section:** Added a `# PROGRESS & RECORDS` section to the Profile Agent's system prompt to specifically track PRs and milestones.
- **Acknowledgement:** The Coordinator is explicitly prompted to acknowledge the `updateSummary` in its final response (e.g., "Nice work on the PR!").

### 4. Code Cleanup
- Removed `src/server/agents/conversation/reply/`.
- Fixed all ESLint and TypeScript errors in the new chain.
- Verified build success (`pnpm build:local`).

## Next Steps
- Monitor production logs for `[Inngest] Processing batch` to verify batching works as expected.
- Observe user profiles to ensure PRs and injuries are being correctly logged in the new `# PROGRESS & RECORDS` section.
