# Refined Plan: Flatter Agent Architecture

## 1. The Core Problems
(Same as before: Race conditions, Split Brain, Limited Context, Weak Tracking).

## 2. The Solution: "The Debounced Coordinator"

### A. The Funnel (Ingestion & Debounce)
*Unchanged.*
1.  **Webhook:** Store -> Queue -> Return 200.
2.  **Inngest:** Debounce (10s).
3.  **Batching:** Fetch `getPendingMessages` -> Aggregated Prompt.

### B. The Brain (Chat Coordinator)
A flatter, simpler Coordinator. Instead of a complex Triage-then-Route tree, we merge roles.

**1. The "Scribe" (Profile Update):**
*   **Always runs first.**
*   Extracts constraints, preferences, *and* progress (PRs, injuries).
*   Returns: `updatedProfile` and `updateSummary` (e.g., "Logged new bench PR").

**2. The Coordinator (Main Agent):**
*   **Input:** Aggregated User Message + `updateSummary` + Context.
*   **Capabilities:**
    *   **Modifications (Tool):** Can call `modifyWorkout`, `modifyPlan`, etc. directly (or via a specialized chain if complex).
    *   **Education (Internal Knowledge):** Can answer "What is a Roman Chair?" directly using its own training (or a lightweight RAG tool).
    *   **Chitchat/Greeting:** Handles "Thanks", "Hi", "Good morning" natively.
*   **Logic:**
    *   If `updateSummary` exists: Start response with acknowledgement ("Nice work on the 315 deadlift!").
    *   If User asks for change: Call Modification Tool.
    *   If User asks question: Answer it.
    *   If User says "Thanks": Reply "You're welcome".

### Why Flatter?
*   **Tracker is just the Scribe:** We don't need a separate "Tracker Agent". The Profile Agent acts as the Scribe, and the Coordinator just verbalizes the result ("I logged that for you").
*   **Greeter is the Coordinator:** No need to route to a "Greeter Agent". LLMs are naturally good at saying hello.
*   **Questions:** Unless we need deep RAG, the Coordinator (Gemini/GPT-4) can answer general fitness questions natively.

## 3. Implementation Plan

### Phase 1: Infrastructure (The Funnel)
1.  **Refactor `MessageService`:**
    *   Add `getPendingMessages(userId)`.
    *   Simplify `ingestMessage` (Store -> Queue).
2.  **Refactor Inngest:**
    *   Add `debounce: { period: '10s', key: 'userId' }`.
    *   Logic to fetch pending messages.

### Phase 2: The Coordinator (Chat Agent)
1.  **Profile Agent (The Scribe):**
    *   Update `prompts.ts` to track Progress/PRs.
    *   Ensure it returns a clear `updateSummary`.
2.  **Chat Agent (The Coordinator):**
    *   **Remove Triage Step:** We don't need to classify intents into buckets if we just give the agent tools.
    *   **Prompt Update:** "You are a fitness coach. You have tools to modify workouts. You have a summary of recent profile updates. Answer the user, acknowledge updates, and use tools if requested."
    *   **Tools:** Inject `ModificationTools`.
    *   **Direct Response:** Agent generates the final text directly.

## 4. Verification
- [ ] **Burst Test:** 3 messages -> 1 Inngest job.
- [ ] **Capabilities:**
    - "Change my workout" -> Calls Tool.
    - "I ran 5 miles" -> Profile Update -> Coordinator says "Logged it."
    - "Hi" -> Coordinator says "Hi".
