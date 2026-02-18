# GymText Agent Prompts

This directory contains the prompt specifications for GymText's simplified agent system.

## System Overview

GymText uses a four-agent pipeline to transform user information into daily workout messages:

```
Profile → Plan → Microcycle → Workout Messages
```

Each agent is a specialist that takes specific input and produces specific output, which feeds into the next agent.

## Agent Flow

### 1. Profile Agent (`01-profile-agent.md`)

**Input:** User information (intake conversations, progress updates, goal changes, metrics)

**Output:** Structured fitness profile

**Sections:**
- IDENTITY (name, age, experience)
- GOALS (primary, secondary, events)
- TRAINING CONTEXT (schedule, equipment, constraints, preferences)
- METRICS (strength, endurance, body composition)
- LOG (reverse chronological progress log)

**Key Behavior:**
- Maintains [ACTIVE] and [RESOLVED] constraints
- Documents everything with dates
- Adapts structure to user type (powerlifter, runner, general fitness)

---

### 2. Plan Agent (`02-plan-agent.md`)

**Input:** 
- Fitness profile (from Profile Agent)
- Optional: program request/constraints

**Output:** Comprehensive periodized training program

**Sections:**
- Header (program name, user, goal)
- Program Philosophy (WHY this program for this user)
- Phase 1, 2, 3... (weekly patterns, progression strategies)
- Phase Cycling (how phases connect)
- Modification History (program changes over time)

**Key Behavior:**
- Explains exercise selection with rationale (especially for injury prevention)
- Uses appropriate loading schemes (%, RPE, or both)
- Structures phases logically (Accumulation → Intensification → Realization)
- Specializes by user type (powerlifter, runner, general fitness)

---

### 3. Microcycle Agent (`03-microcycle-agent.md`)

**Input:**
- Fitness profile (current metrics, constraints)
- Training plan (program philosophy, current phase, weekly pattern)
- Week context (which week of phase, special circumstances)

**Output:** Specific, executable workouts for one week

**Sections:**
- Header (week date, program, phase, user)
- Schedule (training days with times/locations)
- Week Overview (context and special considerations)
- Workout details for each day (warm-up, exercises with actual sets/reps/weights, cool down, notes)
- Weekly Summary (key performances, progress, decisions for next week)

**Key Behavior:**
- Prescribes ACTUAL weights and reps (no placeholders)
- Shows warm-up sets for main lifts
- Includes detailed exercise notes (form cues, comparisons to previous week)
- Provides realistic time estimates
- Documents what actually happened (cut sets, RPE misses, form breakdown)

---

### 4. Workout Message Agent (`04-workout-message-agent.md`)

**Input:** Microcycle with full workout details

**Output:** Concise, text-message-style daily instructions

**Format:**
```
## Monday, February 16

\```
Upper Strength 💪

Warm-Up:
- Band pull-apart: 2x15
- Empty bar bench: x10

Workout:
- BB bench press: 4x5 @ 155 lb
- BB row: 4x6 @ 155 lb
- Overhead press: 3x8 @ 90 lb

Notes: Week 3 — push to RPE 8 on compounds. Last hard week before deload.
\```
```

**Key Behavior:**
- Compresses detailed microcycle info into brief, actionable messages
- Uses coach-like tone: direct, clear, supportive
- Minimal emoji use (0-1 per message)
- Rest day messages are simple and supportive
- Sunday/final rest day invites feedback

---

## Prompt Type: System vs User

All four prompts are **system prompts**. They define the agent's role, capabilities, input expectations, output format, and behavior rules.

**User prompts** (not included here) would be the actual requests:
- Profile Agent user prompt: "Create a profile for a 28-year-old intermediate lifter who wants to build muscle and run a 5K..."
- Plan Agent user prompt: "Design a 4-day upper/lower program for Alex based on his profile..."
- Microcycle Agent user prompt: "Generate week 3 of the accumulation phase for Alex..."
- Workout Message Agent user prompt: "Convert this microcycle into daily text messages..."

## Design Principles

### 1. Single Responsibility
Each agent does ONE thing well:
- Profile: maintain user state
- Plan: design programs
- Microcycle: create specific workouts
- Messages: format for delivery

### 2. Clear Input/Output Contracts
Each agent expects specific input and produces specific output. The output of one agent is designed to feed cleanly into the next.

### 3. Domain Expertise
Each prompt includes:
- Role definition
- Expected input/output formats
- Detailed instructions and rules
- Examples and patterns
- Anti-patterns (what NOT to do)

### 4. Adaptability
The system handles different user types (powerlifter, runner, general fitness) by:
- Profile Agent: adapts structure to capture relevant metrics
- Plan Agent: applies sport-specific periodization and exercise selection
- Microcycle Agent: honors context (e.g., runners' mileage, powerlifters' meet prep)
- Message Agent: uses appropriate tone and details for the user type

### 5. Progressive Detail
Information flows from general → specific:
- Profile: long-term user state
- Plan: multi-phase program design
- Microcycle: weekly workout specifics
- Messages: daily actionable instructions

## Example Flow

**Input:** "I'm a 42-year-old runner training for a marathon. I lift 3x/week to prevent injuries."

**Profile Agent** → Creates profile with running metrics, IT band history, lifting-serves-running philosophy

**Plan Agent** → Designs "Marathon Supplemental Strength" with 3-day pattern (Mon: Hip & Posterior, Wed: Single-Leg & Pull, Fri: Light Upper), phases tied to running training state

**Microcycle Agent** → Generates week 7 workouts with specific exercises, weights, and notes like "Peak mileage week — hold weights steady, protect Saturday's long run"

**Workout Message Agent** → Creates daily text messages: "Hip & Posterior Chain (after easy run) • Warm-Up: Foam roll IT band... • Workout: RDL 3x8 @ 135 lb..."

---

## Usage Notes

### For Developers

When implementing these agents:
1. Load the appropriate prompt as the system message
2. Provide the required input (profile, plan, etc.) in the user message
3. Expect structured output matching the format in the prompt
4. Pass output to the next agent in the chain

### For Prompt Engineers

When modifying these prompts:
1. Maintain the input/output contract (don't break the chain)
2. Add examples to clarify behavior
3. Use anti-patterns to show what NOT to do
4. Test with all three user types (powerlifter, runner, general fitness)
5. Ensure instructions are specific and actionable

### For QA

When testing:
1. Verify each agent produces output in the expected format
2. Confirm information flows correctly from one agent to the next
3. Test with different user types and scenarios
4. Check that constraints and preferences are honored throughout the chain
5. Validate that dates, weights, and metrics are tracked consistently

---

## Reverse Engineering Source

These prompts were reverse-engineered from three complete example flows in `/examples/`:
- **General Fitness** (Alex Martinez): 4-day upper/lower split, muscle building + fat loss + 5K goal
- **Runner** (David): 3-day injury prevention program for marathon training
- **Powerlifter** (Chen): 4-day meet prep for 900 lb total

Each example includes:
- Fitness profile
- Training plan
- Week 7 microcycle
- Daily workout messages

The patterns, structure, and level of detail in these prompts mirror those examples.

---

## Future Enhancements

Potential additions to this system:
- **Feedback Agent**: Processes user feedback and updates profile/plan
- **Progression Agent**: Analyzes trends and adjusts weights/volume
- **Adaptation Agent**: Handles injuries, equipment changes, schedule shifts
- **Check-In Agent**: Generates weekly summary and asks targeted questions

These would extend the core 4-agent pipeline while maintaining the single-responsibility principle.
