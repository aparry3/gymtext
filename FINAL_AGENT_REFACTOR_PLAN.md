# Final Agent Architecture Refactor: "The Orchestrator with Experts"

## 1. Core Philosophy
We are moving away from a complex Triage-and-Route system to a flat **Orchestrator** model. The Orchestrator (Coordinator) is the main brain. It handles conversation, tracks progress, and decides when to call an **Expert Sub-Agent** (Modifications).

### The "Modifications" Problem
Currently, the Orchestrator tries to use raw tools (`modifyWorkout`, `modifyWeek`). This forces the prompt to know *too much* about tool parameters.
**Solution:** The Orchestrator should just say "I need to modify the workout based on user request X." It hands off to a specialized **Modifications Sub-Agent** (wrapped as a tool).

## 2. Architecture

### A. The Coordinator (Main Agent)
*   **Inputs:** User Message + Profile Update Summary + Context.
*   **Capabilities:**
    *   **Scribe:** (Already implemented) Tracks PRs/Injuries first.
    *   **Educator:** Answers questions natively.
    *   **Greeter:** Handles chitchat natively.
    *   **Manager:** Detects when a modification is needed.
*   **Tools:**
    *   `makeModification(instructions: string)`: A single tool that invokes the `ModificationsChain`.

### B. The Expert (Modifications Chain)
*   **Role:** The "Trainer" who knows the gritty details of the database.
*   **Inputs:** Instructions from Coordinator + Original User Context.
*   **Tools:** `modifyWorkout`, `modifyWeek`, `modifyPlan`.
*   **Logic:** 
    1.  Analyzes the request ("Swap squats").
    2.  Calls the specific DB tool (`modifyWorkout({ swap: 'squats' })`).
    3.  **Critically:** Returns the *result* (the new workout message) back to the Coordinator.

### C. The Response Flow
1.  **Coordinator:** "User wants to swap squats. I'll call `makeModification('User wants to swap squats for leg press')`."
2.  **Expert:** Executes swap. Generates: "Swapped Squats for Leg Press (3x10). Here is the updated workout: ..."
3.  **Coordinator:** Receives the Expert's output.
4.  **Coordinator:** Finalizes the reply: "I've logged your PR. [Expert Output]."

## 3. Implementation Plan

### Phase 1: Define the Expert Tool
*   Create `createModificationTool` (singular).
*   This tool wraps the `ModificationsAgent` (or Chain).
*   It takes a simple string `instruction` as input.
*   It executes the chain and returns the `messages` array (or joined string).

### Phase 2: Update Coordinator (Chat Agent)
*   Remove raw modification tools (`modifyWorkout`, etc.) from the Coordinator's bind list.
*   Inject ONLY the `makeModification` tool.
*   Update System Prompt: "If the user wants to change their workout, use the `makeModification` tool with clear instructions."

### Phase 3: Refine Response Handling
*   Ensure the Coordinator knows how to handle the tool output.
*   If `makeModification` returns a list of messages (e.g. [Week Update, New Workout]), the Coordinator should likely pass them through or append them.
*   *Refinement:* Ideally, the Coordinator just outputs the text, and if the Tool returns "System Messages" (like a full workout card), those are appended to the final response array.

## 4. Code Changes
1.  **`src/server/agents/conversation/chat/modifications/tool.ts`:** Create the wrapper tool.
2.  **`src/server/agents/conversation/chat/chain.ts`:** 
    *   Swap `modificationTools` (plural) for `modificationTool` (singular).
    *   Handle the output logic.
3.  **`src/server/agents/conversation/chat/prompts.ts`:** Update instructions.
