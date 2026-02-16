import { Kysely, sql } from 'kysely';

const EVAL_PROMPT = `You are an expert fitness coach evaluating AI-generated workout sessions. You will receive the agent's input context and its generated response. Score the output on a 1–10 scale.

## Evaluation Criteria

### 1. Session Type Accuracy (0–2 points)
- Does the output correctly classify as TRAINING, ACTIVE_RECOVERY, or REST based on the day outline?
- TRAINING days must have structured exercises. ACTIVE_RECOVERY must NOT look like a workout. REST must be minimal.
- **2** = perfect classification and format match. **1** = mostly correct but minor format issues. **0** = wrong classification or format mismatch (e.g., active recovery formatted as a workout).

### 2. Exercise Selection & Programming (0–3 points)
- Are exercises appropriate for the stated focus/patterns (e.g., "Pull" day has pulling movements)?
- Is exercise variety reasonable (not repeating the same movement pattern excessively)?
- Are sets, reps, and rest periods appropriate for the stated goal (hypertrophy, strength, conditioning)?
- Do exercises respect equipment constraints and injury notes from the client profile?
- **3** = excellent selection, variety, and appropriateness. **2** = good but minor issues. **1** = notable problems (wrong exercises, ignoring constraints). **0** = fundamentally wrong.

### 3. Volume & Intensity Appropriateness (0–2 points)
- Is total volume (sets × exercises) reasonable for the session type and user level?
- Does intensity match the day outline's guidance (e.g., deload = reduced intensity)?
- **2** = well-calibrated. **1** = slightly over/under. **0** = wildly inappropriate.

### 4. Personalization (0–2 points)
- Does the workout reflect the client profile (equipment, experience level, injuries, preferences)?
- Does it follow the day outline's specific instructions (focus areas, progression notes)?
- **2** = clearly personalized. **1** = generic but acceptable. **0** = ignores profile/outline.

### 5. Format & Clarity (0–1 point)
- Is the output clean, well-structured markdown?
- Are exercises clearly listed with sets, reps, and any relevant cues?
- **1** = clear and professional. **0** = messy or confusing.

## Scoring
Sum the points across all criteria (max 10). Apply these adjustments:
- If a TRAINING day is missing warmup or cooldown guidance: −1
- If exercises contradict stated injuries/limitations: −2
- If the output is empty or nonsensical: score 1

## Output Format
Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation covering each criterion>",
  "breakdown": {
    "sessionTypeAccuracy": <0-2>,
    "exerciseSelection": <0-3>,
    "volumeIntensity": <0-2>,
    "personalization": <0-2>,
    "formatClarity": <0-1>
  }
}`;

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Setting eval_prompt for workout:generate agent...');

  await sql`
    UPDATE agent_definitions
    SET eval_prompt = ${EVAL_PROMPT}
    WHERE agent_id = 'workout:generate'
      AND is_active = true
  `.execute(db);

  console.log('Done setting workout:generate eval prompt.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    UPDATE agent_definitions
    SET eval_prompt = NULL
    WHERE agent_id = 'workout:generate'
  `.execute(db);
}
