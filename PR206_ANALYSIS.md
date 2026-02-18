# PR #206 Prompts Analysis: Generality & User Prompts

**Analysis Date:** February 18, 2026  
**Reviewer:** Shackleton (Research Agent)  
**Context:** Review of reverse-engineered prompts in `prompts/*.md` and example flows in `examples/`

---

## Executive Summary

### Key Findings

1. **Generality Concern: PARTIALLY VALID**
   - Prompts show **structural bias** toward the 3 examples (strength-focused, periodized training)
   - NOT overfitted to specific details, but **lacks diversity** in examples and scenarios
   - Would struggle with: pure endurance athletes, sport-specific training, rehab-focused programs, non-periodized approaches

2. **User Prompts: SHOULD EXIST**
   - Current design conflates system prompts (role/rules) with user prompts (data/task)
   - User prompts should contain: actual input data, optional format reminder, specific constraints for THIS run
   - Format reiteration in user prompts would help, especially for complex outputs

### Recommendations Priority

1. **HIGH:** Create explicit user prompt templates (format + data structure)
2. **HIGH:** Add 2-3 diverse examples to each system prompt (beyond the 3 current types)
3. **MEDIUM:** Abstract prompt language to be less strength/periodization-centric
4. **LOW:** Test with edge cases (pure cardio, rehab, unconventional training styles)

---

## Analysis 1: Generality Concern

### Question: Are the prompts too specific to the 3 examples?

**Answer: Somewhat, but not fatally so.**

### What the Prompts DO Well (Generality)

#### 1. **Abstract Principles Over Concrete Details**

The prompts define principles that COULD apply broadly:
- Profile Agent: "Adapt the structure — not all sections apply to all users"
- Plan Agent: "Match training age to complexity"
- Microcycle Agent: "Honor user context"

#### 2. **Explicit Adaptation Instructions**

Each prompt includes "Specialization by User Type" sections that acknowledge different use cases:
- Powerlifters
- Runners
- General Fitness

This shows awareness that the system needs to adapt.

#### 3. **Role-Based, Not Example-Based**

Prompts define the ROLE (profile specialist, program designer, etc.) rather than just showing examples. This is good prompt engineering.

---

### What the Prompts DON'T Do Well (Over-Specificity)

#### 1. **Strength/Periodization Bias in Language**

The prompts use language that assumes:
- Periodized training (accumulation/intensification/realization)
- Strength metrics as primary (1RM, RPE, percentages)
- Resistance training as the main modality

**Examples of biased language:**
- Plan Agent: "Accumulation → Intensification → Realization" (assumes block periodization)
- Microcycle Agent: "Show warm-up sets for main lifts" (assumes barbell lifts)
- Profile Agent: "Strength" section comes first in metrics (prioritizes it)

**What's missing:**
- Guidance for pure endurance athletes (cyclist, swimmer, triathlete)
- Non-periodized approaches (CrossFit, general fitness maintenance)
- Sport-specific training (soccer, basketball, martial arts)
- Rehab/return-to-training scenarios

#### 2. **Homogeneous Example Set**

The 3 examples are:
1. **General Fitness (Alex):** 4-day upper/lower split, muscle/strength/fat loss
2. **Runner (David):** 3-day supplemental strength for marathon
3. **Powerlifter (Chen):** 4-day meet prep, competition focus

**What they have in common:**
- All involve resistance training
- All use periodization
- All have weekly microcycles
- All use similar metrics (weight, reps, RPE)
- All follow a strength training paradigm

**What's NOT represented:**
- Pure endurance athletes (no lifting at all, just cardio programming)
- Team sport athletes (skill + conditioning + strength)
- Bodyweight-only training
- Unconventional modalities (kettlebells only, sandbags, strongman)
- Rehab-to-performance progression
- Non-structured "move more, feel better" approaches

#### 3. **Example Patterns That May Overfit**

Research shows **1 example = overfitting risk** ([source: Prompting Weekly](https://promptingweekly.substack.com/p/few-shot-examples-done-properly)). While the prompts have 3 user types, they're documented as "reverse-engineered from 3 complete example flows" — meaning the prompts were built FROM the examples, not tested AGAINST diverse cases.

**Risk:** The prompts may produce great output for "strength athlete variants" but struggle with anything outside that paradigm.

---

### Specific Over-Specificity Concerns by Prompt

#### **Profile Agent:**

- **METRICS section ordering** assumes strength comes first
  - For a cyclist: endurance metrics should be primary, strength secondary
  - For a rehab client: injury status and movement quality might be primary
  
- **GOALS structure** assumes performance/body composition
  - For a chronic pain patient: goal might be "walk 30min without knee pain"
  - For a busy parent: goal might be "sustain 3x/week habit for 6 months"

- **LOG entries** assume progress = more weight/faster times
  - For a rehab client: progress might be "pain-free squat to parallel"

**Generalization fix:**
- Add examples for non-strength-focused users (endurance, rehab, general movement)
- Clarify that METRICS section should be **reordered** based on user priority

---

#### **Plan Agent:**

- **Program Philosophy** examples all reference periodization
  - What about a maintenance program? ("Alex wants to stay fit while starting a new job — 2x/week full-body to maintain, not progress")
  - What about a deload-focused recovery program?

- **Phase structure** assumes multi-phase programs
  - Some users need a single-phase steady-state program
  - Some need a "repeat this week forever" approach

- **Progression Strategy** assumes linear/block progression
  - What about autoregulated progression?
  - What about no progression (pure maintenance)?

- **Exercise Selection** is very strength-focused
  - Runners: "includes glute/hip/core work with injury prevention rationale" — good!
  - But what about a cyclist? Swimmer? Triathlete?

**Generalization fix:**
- Add example for non-periodized program (maintenance, habit-building)
- Add example for pure cardio program (runner who doesn't lift)
- Clarify that phases are OPTIONAL, not required

---

#### **Microcycle Agent:**

- **Warm-Up sets** assume barbell lifts
  - For a bodyweight-only program, warm-ups might be movement prep, not load ramp-up

- **Progression Logic** assumes weight/reps/volume progression
  - For a runner: progression might be pace, mileage, or effort level
  - For a rehab client: progression might be pain-free ROM

- **Notes** emphasize form, RPE, equipment
  - For a runner: notes might emphasize perceived effort, HR zones, fueling
  - For a yoga/mobility program: notes might emphasize breath, sensation, range

**Generalization fix:**
- Add example for cardio-only microcycle (running week with no lifting)
- Add example for bodyweight-only week
- Clarify that "workout" can mean run, bike, swim, not just gym session

---

#### **Workout Message Agent:**

- **Emoji usage** is gym-focused (💪, 🦵, 🔥)
  - For a runner: might want 🏃, 🚴, 🏊
  - For a general fitness user: might want more variety

- **Exercise notation** assumes sets × reps @ weight
  - For runners: might be "8 mi @ 7:30/mi pace, 4 mi tempo @ 7:00/mi"
  - For swimmers: might be "10 × 100m @ 1:30, rest 20s"

- **Notes section** emphasizes RPE, rest, load
  - For runners: might emphasize pacing, HR, fueling
  - For general fitness: might emphasize enjoyment, habit, feel

**Generalization fix:**
- Add example for runner-focused messages (cardio notation)
- Add example for bodyweight-only messages
- Clarify that exercise notation adapts to modality

---

### Research-Backed Context: Few-Shot Examples & Generalization

From **Prompting Weekly** ([source](https://promptingweekly.substack.com/p/few-shot-examples-done-properly)):
> "I find that giving LLMs one example makes them overfit a bit to the specifics of the example, and can sometimes be worse than zero-shot. **2 is a good rule-of-thumb minimum** for few-shot examples."

**Current state:** 3 examples (good!) but they're too homogeneous (bad!)

**Better approach:** 3-5 examples spanning diverse use cases:
1. Strength athlete (current: powerlifter ✅)
2. Endurance athlete (current: runner with supplemental lifting ⚠️ — not pure endurance)
3. General fitness (current: muscle building ✅)
4. **MISSING:** Pure cardio athlete (cyclist, swimmer, runner with no lifting)
5. **MISSING:** Rehab/return-to-training client
6. **MISSING:** Non-periodized maintenance program

---

### Verdict: Generality Concern

**PARTIALLY VALID**

The prompts are NOT narrowly overfitted to Alex/David/Chen specifically, but they ARE structurally biased toward:
- Resistance training as primary modality
- Periodized programming
- Performance/strength/body composition goals
- Weekly microcycle structure

**Impact:**
- ✅ Would work well for: strength athletes, hybrid athletes (running + lifting), muscle-building clients
- ⚠️ Would struggle with: pure endurance athletes, rehab clients, non-periodized approaches, bodyweight-only programs

**Priority:** **HIGH** — needs diverse examples and abstracted language

---

## Analysis 2: User Prompts Question

### Question: Do we need user prompts? What should they contain?

**Answer: YES. User prompts should exist and contain the actual input data.**

---

### Current Approach: System Prompts Contain Everything

Right now, the system prompts define:
1. **Role** (e.g., "You are a fitness profile specialist")
2. **Input expectations** (e.g., "You receive information about a user through...")
3. **Output format** (e.g., "Create a structured profile with these sections...")
4. **Instructions** (e.g., "Be specific", "Track constraints actively")
5. **Examples** (e.g., "Powerlifter: Include weight class...")

**What's MISSING:** The actual data/task for THIS specific run.

---

### Research: System vs. User Prompts

From **PromptHub** ([source](https://www.prompthub.us/blog/the-difference-between-system-messages-and-user-messages-in-prompt-engineering)):
> "**System Messages:** Use these to set the foundational context and other high-level information like a persona guidelines, and boundaries for the LLM to follow. They establish the role, tone, and constraints that persist throughout the conversation.  
> **User Messages ('prompts'):** These drive the immediate interaction, and should be much more low-level. They should focus on specifics."

From **Nebuly** ([source](https://www.nebuly.com/blog/llm-system-prompt-vs-user-prompt)):
> "A **system prompt** is an instruction provided by the developers of an AI model. It sets the context, tone, and boundaries for the AI's responses.  
> **User prompts** represent the actual queries or requests from end users."

---

### What User Prompts Should Contain

#### **1. Profile Agent User Prompt**

**Purpose:** Provide raw user data for profile creation/update

**Should contain:**
- User information (intake conversation, metrics, constraints)
- Optional: specific update request (e.g., "Update Alex's profile with new knee constraint")
- Optional: format reminder (especially for structured output)

**Example:**
```
Create a fitness profile for the following user:

Name: Alex Martinez
Age: 28
Experience: 2 years consistent lifting
Goals: Build muscle, lose 10 lbs body fat, run a 5K under 25 minutes
Schedule: Mon/Wed/Fri/Sat, 45-60 min sessions
Equipment: Home gym (barbell, DBs 5-50lb, rack, bench, bands), LA Fitness on weekends
Constraints: Knee discomfort with barbell squats (since Feb 16)
Current metrics: Bench 145x5, Deadlift 225x5, Bodyweight 176 lb

Use the standard profile format with IDENTITY, GOALS, TRAINING CONTEXT, METRICS, and LOG sections.
```

**Key elements:**
- ✅ Actual data for THIS user
- ✅ Format reminder ("use the standard profile format")
- ✅ Specific task ("create a fitness profile")

---

#### **2. Plan Agent User Prompt**

**Purpose:** Request program design based on profile

**Should contain:**
- The user's profile (full or summary)
- Specific program request/constraints (if any)
- Optional: format reminder for program structure

**Example:**
```
Design a training program for Alex Martinez based on the following profile:

[Full profile text or key details]

Program requirements:
- 4 days/week (Mon/Wed/Fri/Sat)
- Upper/lower split
- Primary goal: muscle building + strength
- Secondary goal: 5K running (race in March)
- Constraint: No barbell squats (use goblet/front squat)

Use the standard program format with Program Philosophy, Phase structure, and Progression Strategy.
```

**Key elements:**
- ✅ Profile data
- ✅ Specific program constraints
- ✅ Format reminder

---

#### **3. Microcycle Agent User Prompt**

**Purpose:** Generate specific workouts for a given week

**Should contain:**
- User profile (current metrics, constraints)
- Training plan (current phase, weekly pattern)
- Week context (week number, special circumstances)
- Optional: format reminder for microcycle structure

**Example:**
```
Generate a microcycle for Week 3 of Alex Martinez's Accumulation Phase.

Profile summary:
- Current: Bench 155x5, Goblet squat 50x8, RDL 215x6
- Constraint: No barbell squats (knee discomfort)
- Schedule: Mon (home), Wed (home), Fri (home), Sat (LA Fitness)

Program context:
- Phase: Accumulation, Week 3 of 4
- Weekly pattern: Mon Upper Strength, Wed Lower Strength, Fri Upper Hypertrophy, Sat Lower Hypertrophy
- Week 3 goal: Push compounds to top of RPE range, last hard week before deload

Use the standard microcycle format with Schedule, Week Overview, daily Workouts (warm-up, main, cool down, notes), and Weekly Summary.
```

**Key elements:**
- ✅ Current metrics for weight prescription
- ✅ Week context for progression logic
- ✅ Format reminder (especially important for complex output)

---

#### **4. Workout Message Agent User Prompt**

**Purpose:** Convert microcycle to daily text messages

**Should contain:**
- The full microcycle (or week of workouts)
- Optional: user preferences for message style
- Optional: format reminder for message structure

**Example:**
```
Convert the following microcycle into daily workout text messages for Alex Martinez.

[Full microcycle text]

Message preferences:
- Concise, coach-like tone
- Minimal emoji (0-1 per message)
- Include week context in Monday's message

Use the standard message format: Session title, warm-up (brief), workout (sets×reps@weight), notes (1-2 sentences).
```

**Key elements:**
- ✅ Full microcycle data
- ✅ User/style preferences
- ✅ Format reminder

---

### Should We Reiterate Format in User Prompts?

**YES, especially for complex outputs.**

**Research context:**

From **Claude Prompting Best Practices** ([source](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)):
> "Claude 4.x models respond well to clear, explicit instructions. **Being specific about your desired output can help enhance results.**"

From **PromptLayer** ([source](https://blog.promptlayer.com/system-prompt-vs-user-prompt-a-comprehensive-guide-for-ai-prompts/)):
> "It's important to note that different models may respond to system prompts in unique ways. For example, **Anthropic's Claude places more emphasis on user messages than system prompts**."

**Implication:** For Claude (which GymText likely uses), **user prompts have more weight** than system prompts. Reiterating format in the user prompt reinforces the structure.

---

### Format Reiteration Strategy

**Light touch:** Remind the agent of the output structure without repeating the full format spec.

**Examples:**

✅ **Good (light reminder):**
```
Use the standard profile format with IDENTITY, goals, TRAINING CONTEXT, METRICS, and LOG sections.
```

✅ **Good (specific constraint):**
```
Use the standard microcycle format. Include actual weights and reps (no placeholders).
```

❌ **Bad (too heavy, duplicates system prompt):**
```
Create a structured profile with these sections:

### IDENTITY
- Name
- Age
- Gender
- Experience level (Novice/Intermediate/Advanced) with context

### GOALS
- Primary goal(s) with specifics
...
[full format spec repeated]
```

**Recommendation:** Brief format reminder in user prompts, not full spec duplication.

---

### What User Prompts Should NOT Contain

❌ **Role definition** — that's in the system prompt  
❌ **General instructions** — that's in the system prompt  
❌ **Examples of good/bad output** — that's in the system prompt  
❌ **Tone/style guidelines** — that's in the system prompt

✅ **What they SHOULD contain:**
- Actual input data for THIS run
- Specific task for THIS run
- Optional: format reminder (light touch)
- Optional: special constraints for THIS run

---

### Verdict: User Prompts Question

**YES, user prompts should exist.**

**What they should contain:**
1. **Actual input data** (user info, profile, plan, microcycle)
2. **Specific task** (e.g., "Create a profile", "Generate week 3")
3. **Optional: Format reminder** (light touch, e.g., "Use standard profile format")
4. **Optional: Run-specific constraints** (e.g., "This week is a deload")

**Would format reiteration help?**  
**YES** — especially for complex outputs (microcycle, plan). Keep it brief (1-2 sentences).

**Priority:** **HIGH** — this is a structural improvement to the agent system

---

## Recommendations

### 1. **Create Explicit User Prompt Templates** [HIGH PRIORITY]

**Action:** Define user prompt templates for each agent.

**Deliverable:** 4 new files:
- `prompts/01-profile-agent-USER-PROMPT.md`
- `prompts/02-plan-agent-USER-PROMPT.md`
- `prompts/03-microcycle-agent-USER-PROMPT.md`
- `prompts/04-workout-message-agent-USER-PROMPT.md`

**Each template should include:**
- Input data structure (what to pass in)
- Format reminder (light touch)
- Examples of well-formed user prompts

**Example structure:**
```markdown
# Profile Agent User Prompt Template

## Structure

[Task description]

[User data]

[Format reminder]

## Example

Create a fitness profile for the following user:

[User info here]

Use the standard profile format with IDENTITY, GOALS, TRAINING CONTEXT, METRICS, and LOG sections.
```

---

### 2. **Add Diverse Examples to System Prompts** [HIGH PRIORITY]

**Action:** Expand the 3 current examples to include 5-6 diverse use cases.

**Current examples:**
1. General Fitness (Alex) — strength + muscle + fat loss
2. Runner (David) — marathon + supplemental strength
3. Powerlifter (Chen) — meet prep

**Add:**
4. **Pure Endurance Athlete** — cyclist training for century ride (100 mi), no lifting
5. **Rehab Client** — returning to training after knee surgery, movement quality focus
6. **Non-Periodized Maintenance** — busy professional, 2x/week full-body, sustain habit

**Where to add:**
- Update `prompts/README.md` "Reverse Engineering Source" section
- Add "Example Adaptations" subsections to each agent prompt
- Create new example flows in `examples/` folder

**Expected outcome:** Prompts can handle a wider range of users without overfitting to strength training paradigm.

---

### 3. **Abstract Prompt Language** [MEDIUM PRIORITY]

**Action:** Revise prompts to use modality-agnostic language where possible.

**Examples of changes:**

**Profile Agent:**
- ❌ "Strength (for strength-focused users)"
- ✅ "Primary Performance Metrics (adapt to user's primary modality)"

**Plan Agent:**
- ❌ "Accumulation → Intensification → Realization"
- ✅ "Accumulation → Intensification → Realization (for periodized programs) OR steady-state maintenance OR progressive overload (for non-periodized)"

**Microcycle Agent:**
- ❌ "Show warm-up sets for main lifts"
- ✅ "Include warm-up appropriate to the session (load ramp-up for strength, movement prep for cardio, ROM work for mobility)"

**Workout Message Agent:**
- ❌ "Exercise notation: sets × reps @ weight"
- ✅ "Exercise notation: adapt to modality (sets×reps@weight for strength, distance@pace for running, time@effort for cardio)"

**Expected outcome:** Prompts read as universally applicable, not strength-training-specific.

---

### 4. **Test with Edge Cases** [LOW PRIORITY]

**Action:** Test the prompts with deliberately non-standard use cases.

**Edge cases to test:**
- Pure cardio athlete (runner who doesn't lift)
- Bodyweight-only program (no gym access)
- Rehab program (injury recovery, not performance)
- Non-periodized program (same workouts weekly, no progression)
- Sport-specific program (soccer, basketball, martial arts)

**How to test:**
1. Create a profile for the edge case
2. Run it through the agent chain
3. Evaluate output quality
4. Identify where prompts failed to generalize
5. Update prompts accordingly

**Expected outcome:** Identify and fix blind spots before production use.

---

## Conclusion

### Generality Concern: Valid but Fixable

The prompts are structurally sound but show bias toward strength training / periodized programming. This is a **design artifact** from reverse-engineering 3 similar examples, not a fatal flaw. **Fix:** Add diverse examples and abstract the language.

### User Prompts: Should Exist

User prompts are currently missing. They should contain:
1. Actual input data
2. Specific task
3. Optional format reminder (light touch)

**Fix:** Create user prompt templates for each agent.

### Priority Actions

1. **HIGH:** Create user prompt templates
2. **HIGH:** Add 2-3 diverse examples to system prompts
3. **MEDIUM:** Abstract prompt language to be modality-agnostic
4. **LOW:** Test with edge cases and iterate

---

## Supporting Research

### Key Sources

1. **Few-Shot Examples and Overfitting**  
   [Prompting Weekly](https://promptingweekly.substack.com/p/few-shot-examples-done-properly) — "Giving LLMs one example makes them overfit... 2 is a good rule-of-thumb minimum"

2. **System vs. User Prompts**  
   [PromptHub](https://www.prompthub.us/blog/the-difference-between-system-messages-and-user-messages-in-prompt-engineering) — System = role/guidelines, User = specific task/data

3. **Claude Prompt Engineering**  
   [Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) — "Claude 4.x models respond well to clear, explicit instructions"

4. **Claude Emphasis on User Messages**  
   [PromptLayer](https://blog.promptlayer.com/system-prompt-vs-user-prompt-a-comprehensive-guide-for-ai-prompts/) — "Anthropic's Claude places more emphasis on user messages than system prompts"

---

**End of Analysis**
