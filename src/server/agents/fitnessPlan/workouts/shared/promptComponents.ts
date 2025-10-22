/**
 * Shared Workout Prompt Components
 *
 * This module contains static prompt sections used across all workout generation agents
 * (generate, substitute, replace). Extracting these shared components eliminates duplication
 * and ensures consistency across all workout operations.
 */

/**
 * Output format specification - used in all long-form prompts
 */
export const OUTPUT_FORMAT_SECTION = `
<Output Format>
Return a JSON object with exactly two fields:
{
  "description": "Long-form workout description...",
  "reasoning": "Detailed coaching rationale..."
}
</Output Format>
`.trim();

/**
 * Exercise naming rules - used in all long-form prompts
 */
export const EXERCISE_NAMING_RULES = `
**CRITICAL: Exercise Naming**
Every exercise MUST be specific and actionable:
- GOOD: "Band Pull-Aparts", "Cat-Cow Stretch", "BB Deadlifts", "Bulgarian Split Squats"
- BAD: "Shoulder mobility sequence", "Dynamic warmup", "Core work", "Leg exercises"
`.trim();

/**
 * Workout structure decision guidance - used in all long-form prompts
 */
export const STRUCTURE_DECISION_GUIDANCE = `
**CRITICAL - Workout Structure Design:**
- Use CRITICAL THINKING to determine the best structure for THIS user, THIS day
- Supersets are OPTIONAL - only use when strategically appropriate
- Consider: user's experience level, equipment, time, goals, fatigue, program phase
- Structure options: straight sets, supersets, circuits, pyramids, clusters, EMOM, AMRAP
- Default to SIMPLER structures for beginners or when learning new movements
- Use COMPLEX structures (supersets/circuits) when: time-constrained, experienced trainee, conditioning focus, antagonist pairing benefits

**DO NOT default to supersets just because they appear in examples. Think critically about what serves THIS user best.**
`.trim();

/**
 * Description guidelines builder
 * @param wordCount - Expected word count (e.g., "600-900" or "400-600")
 * @returns Description guidelines section
 */
export function buildDescriptionGuidelines(wordCount: string = "600-900"): string {
  return `
<Description Guidelines>
The "description" field should be a THOROUGH, DETAILED long-form workout plan (${wordCount} words).
This is NOT the SMS message - this is the comprehensive coaching document.

**Required Elements:**
- Opening paragraph: Workout overview, theme, and how it fits the program
- Complete structure with clearly labeled blocks (Warm-up, Main Work, Accessory, Cool-down)
- Every exercise with SPECIFIC names (e.g., "Band Pull-Aparts", "BB Back Squat", "DB RDL")
- Precise programming: sets, reps, rest periods, RPE/intensity for each exercise
- Workout structure explanation: WHY straight sets OR supersets OR circuits were chosen
- Tempo/technique cues for key exercises
- Modification options for injuries/limitations with explanations
- Total estimated duration with block-by-block breakdown

**Structure Documentation:**
For each block, explain the structure choice:
- "Main Block uses straight sets to prioritize strength with full recovery"
- "Accessory work uses supersets for time efficiency since intensity is lower"
- "Circuit format for conditioning emphasis"

${EXERCISE_NAMING_RULES}

**Thoroughness Check:**
Ask yourself: Could another coach read this and deliver the exact same workout? If not, add more detail.
</Description Guidelines>
`.trim();
}

/**
 * Reasoning guidelines builder
 * @param wordCount - Expected word count (e.g., "600-900" or "500-800")
 * @param includeOriginalReference - Whether to include guidance about referencing original workout
 * @returns Reasoning guidelines section
 */
export function buildReasoningGuidelines(
  wordCount: string = "600-900",
  includeOriginalReference: boolean = false
): string {
  const originalReferenceSection = includeOriginalReference ? `
**Reference Original Reasoning:**
- Acknowledge and reference the original workout's reasoning (if available)
- Explain how the replacement/substitution builds on or diverges from original intent
- Show continuity with the original coaching decisions where possible
` : '';

  return `
<Reasoning Guidelines>
The "reasoning" field should document ALL decision-making (${wordCount} words).
Be comprehensive - this is the coaching blueprint that explains every choice.
${originalReferenceSection}
**Workout Structure Decision:**
- WHY you chose this specific structure (straight sets vs supersets vs circuits vs other)
- How the structure serves the user's experience level
- Time/efficiency considerations
- Fatigue management strategy
- Example: "I chose straight sets for the main lifts because [user] is in a strength phase and needs full recovery between sets to maximize force production. Supersets would compromise the primary strength goal."

**Exercise Selection:**
- Why these SPECIFIC exercises (not just categories)
- How they align with today's theme and goals
- Connection to user's primary goals with explicit reasoning
- Why alternatives were rejected

**Progressive Overload:**
- How this workout builds on recent training history
- Volume/intensity decisions based on program phase
- Rep ranges and why they fit the current phase
- Rest periods and their strategic purpose

**User-Specific Adaptations:**
- Equipment available and how it shapes exercise selection
- Schedule/time constraints and workout duration decisions
- Previous injuries/limitations and accommodations made
- Experience level and complexity management
- Technique considerations for this user

**Program Integration:**
- How this workout advances the overall program
- Placement within the training strategy
- Balance with other training days
- Avoid overlap/interference with recent sessions

**Modifications & Safety:**
- Why specific modifications are pre-planned
- How alternatives maintain training stimulus
- Safety considerations for this user
- Regression/progression options

**Be thorough** - this reasoning will be referenced when users ask "why this exercise?" or "how does this help my goal?"
</Reasoning Guidelines>
`.trim();
}

/**
 * Three detailed workout examples from generate agent
 * These demonstrate different structure approaches (straight sets, strategic supersets, mixed)
 */
export const WORKOUT_EXAMPLES = `
<Example Output Structures>

**EXAMPLE 1: Beginner Lower Body (Straight Sets Structure)**
{
  "description": "Today's Lower Body session is designed to build fundamental leg strength using straight sets. This approach prioritizes movement quality and full recovery between sets, which is crucial for beginners learning proper squat and hinge patterns.

Warm-up Block (12 min):
This extended warm-up prepares the hips, ankles, and posterior chain while teaching movement patterns we'll use in the main work.
- Bodyweight Squats: 2x10 (movement pattern practice)
- Glute Bridges: 2x15 (glute activation, hip extension prep)
- Leg Swings: 2x10 each direction (dynamic hip mobility)
- Walking Lunges: 2x10 steps (balance and unilateral prep)
- Goblet Squat: 2x8 with light KB (loaded squat pattern introduction)

Main Work Block (40 min):
Using straight sets structure to prioritize technique and strength development. Full rest allows maximum quality on each set.
- Goblet Squats: 4x8-10 at RPE 7, 2.5 min rest (primary leg strength builder, goblet position promotes upright torso)
- Romanian Deadlifts with DBs: 3x10-12 at RPE 6, 2 min rest (hip hinge pattern, hamstring/glute development)
- Bulgarian Split Squats: 3x8 each leg at RPE 6, 2 min rest between legs (unilateral stability and quad development)
- Leg Press: 3x12-15 at RPE 6, 90 sec rest (additional quad volume without stability demand)

Accessory Block (12 min):
Straight sets maintained here for consistency and to avoid complexity.
- Lying Hamstring Curls: 3x12-15 at RPE 6, 60 sec rest
- Calf Raises: 3x15-20 at RPE 6, 60 sec rest

Cool-down (6 min):
- Seated Forward Fold: 2 min (hamstring release)
- Figure-4 Stretch: 2 min each side (hip/glute mobility)
- Deep Breathing: 2 min

Total Duration: ~70 minutes

Modifications: If balance is challenging on Bulgarian Split Squats, substitute with standard reverse lunges holding the rack for support. This maintains the unilateral training effect while providing stability.",

  "reasoning": "Workout Structure Decision: I chose a straight sets approach throughout this workout because this user is a beginner (6 months training experience) who needs to focus on movement quality and technique development. Straight sets provide several critical benefits: (1) Full recovery between sets ensures each rep is performed with proper form, preventing fatigue-induced technique breakdown. (2) Simple structure reduces cognitive load, allowing the user to focus on movement execution rather than workout complexity. (3) Clear rest periods teach the user to manage their training pace. Supersets would be inappropriate here because they would compromise form quality and create unnecessary fatigue in a beginner who's still building work capacity.

Exercise Selection Rationale: The Goblet Squat leads the session because it's the most technical movement and benefits from being performed fresh. The front-loaded position naturally promotes an upright torso and teaches proper squat mechanics. I chose 4x8-10 because this rep range builds both strength and technique proficiency. Romanian Deadlifts follow to train the hip hinge pattern - a critical movement skill for injury prevention and posterior chain development. The DB version is more forgiving than barbell for beginners learning the hinge. Bulgarian Split Squats address unilateral stability and expose any left-right imbalances common in beginners. The Leg Press provides additional quad volume without the stability demands, allowing the user to safely accumulate volume while fatigued.

Progressive Overload Context: This is week 2 of a Foundation mesocycle focused on movement quality and base strength. The moderate load (RPE 6-7) and volume (sets of 8-12) align with building work capacity without overreaching. Recent training history shows the user completed similar patterns last week with good form, so we're maintaining the same structure while encouraging slight load increases (2.5-5 lbs per session).

User-Specific Adaptations: This user has access to a full gym but is still learning equipment. I avoided barbell squats and deadlifts because technique isn't solid enough yet - rushing into these would risk injury. The extended warm-up (12 min vs typical 8) reflects the need for thorough movement prep in a beginner. The 70-minute duration fits their schedule and available energy. No previous injuries to work around, but the unilateral work (Bulgarian Split Squats) will help prevent future imbalances.

Program Integration: This Lower Body day fits into a 4-day upper/lower split. The straight sets approach matches the program philosophy of building a solid strength foundation before introducing complexity. Next session (Upper) will also use straight sets for consistency. By week 4, we may introduce simple supersets in accessory work if the user demonstrates readiness."
}

**EXAMPLE 2: Intermediate Upper Push (Strategic Superset Structure)**
{
  "description": "Today's Upper Push workout targets pressing strength and shoulder development using strategic supersets to balance pushing with pulling movements. This approach maximizes training efficiency while maintaining shoulder health through antagonist pairing.

Warm-up Block (10 min):
Focused shoulder and thoracic spine preparation with emphasis on scapular control.
- Band Pull-Aparts: 3x15 (posterior shoulder activation)
- Scapular Wall Slides: 3x12 (scapular mobility and control)
- Cat-Cow: 2x10 (thoracic spine mobility)
- Arm Circles: 2x30 sec each direction (dynamic shoulder prep)

Main Block (40 min):
Superset structure used strategically for antagonist pairing and time efficiency.

Superset 1 (4 rounds, 2.5 min rest between rounds):
This pairing allows pressing recovery while training pulling, managing fatigue intelligently.
- BB Bench Press: 4x6-8 at RPE 8, tempo 3-1-1 (primary horizontal press for strength)
- Chest-Supported DB Row: 4x10-12 at RPE 7 (antagonist pulling, shoulder health)

Superset 2 (3 rounds, 2 min rest between rounds):
Secondary movements paired for efficiency since intensity is lower than main work.
- DB Incline Press: 3x10-12 at RPE 7, tempo 2-0-2 (upper chest emphasis)
- Cable Face Pulls: 3x15-20 at RPE 6 (rear delt and rotator cuff)

Accessory Block (18 min):
Straight sets here because isolation exercises need focused execution and short rests.
- Overhead Press: 3x8-10 at RPE 7, 2 min rest (vertical pressing)
- Lateral Raises: 3x12-15 at RPE 6, 60 sec rest (lateral delt isolation)
- Tricep Rope Pushdowns: 3x15-20 at RPE 6, 60 sec rest (tricep volume)

Cool-down (7 min):
- Pec Doorway Stretch: 2 min (anterior shoulder release)
- Cross-Body Shoulder Stretch: 2 min each side (posterior shoulder)
- Deep Breathing: 1 min

Total Duration: ~75 minutes

Structure Rationale: Main work uses supersets for antagonist pairing (bench/row, incline/face pulls), but accessory work uses straight sets. This is deliberate - the main lifts benefit from superset efficiency without compromising performance, while isolation work needs focused execution.

Modifications: If shoulder discomfort occurs on BB Bench, switch to DB Bench Press for more natural shoulder positioning. If overhead press aggravates shoulders, substitute with Landmine Press for a safer pressing angle.",

  "reasoning": "Workout Structure Decision: I used strategic supersets in the main block specifically for antagonist pairing benefits. Pairing BB Bench Press with Chest-Supported Rows serves multiple purposes: (1) Maintains shoulder health by balancing pushing/pulling within the session. (2) Allows adequate recovery for the bench press (2.5 min between rounds) while utilizing that time productively. (3) This user has 2+ years training experience and can handle the complexity. (4) Time-efficient given the user's 75-minute availability. I deliberately kept accessory work as straight sets because isolation exercises (lateral raises, tricep work) require focused execution and benefit from dedicated attention rather than being rushed in a superset format. This mixed approach optimizes both training effect and time management.

Exercise Selection Rationale: BB Bench Press anchors the session as the primary horizontal pressing movement. We're in week 3 of a Hypertrophy mesocycle, and the 4x6-8 scheme builds strength while accumulating moderate volume. The controlled tempo (3-1-1) increases time under tension. Chest-Supported Rows were chosen over other row variations because the chest support eliminates lower back fatigue, keeping focus on the pulling movement without system-wide fatigue. DB Incline Press targets upper chest, addressing a common development gap. The 10-12 rep range here emphasizes hypertrophy. Face Pulls with high reps (15-20) target rear delts and rotator cuff, critical for shoulder health given the pressing volume. Overhead Press provides vertical pressing to complement horizontal work. Lateral raises isolate lateral delts, which need dedicated volume since they're not heavily recruited in pressing. Triceps are trained last when pre-fatigued from pressing - this isolation ensures adequate volume without interfering with main work.

Progressive Overload Context: Recent workouts show consistent performance on bench (added 5 lbs last week), indicating readiness for continued progression. The RPE 8 on bench ensures we're pushing intensity while leaving a rep in reserve for safety. Volume has been building across the mesocycle (started at 3x6-8, now at 4x6-8), following planned progression. Next week we'll reduce intensity slightly (RPE 7) while adding a 5th set for volume accumulation.

User-Specific Adaptations: This user has a full commercial gym with excellent equipment access, allowing optimal exercise selection. The 75-minute duration fits their lunch break training window. No current injuries, but previous shoulder impingement history (resolved 1 year ago) means I'm prioritizing shoulder health through: (1) Balanced push/pull volume. (2) Face pulls for posterior shoulder strength. (3) Controlled tempos to avoid explosive movements that might stress the joint. (4) Pre-planned modification to DB bench if any discomfort arises.

Program Integration: This Upper Push day is part of a 5-day PPL split. The superset approach here differs from Lower day (which uses straight sets) because upper body recovers faster between antagonist exercises compared to lower body compound movements. The pushing volume (4 horizontal, 3 incline, 3 overhead = 10 total sets) balances with pulling volume in tomorrow's Pull day. This ensures weekly push/pull equilibrium for shoulder health."
}

**EXAMPLE 3: Advanced Full Body (Mixed Structure)**
{
  "description": "Today's Full Body session uses a mixed structure approach combining straight sets for main strength work with circuit-style conditioning to achieve multiple training adaptations in a time-efficient format. This workout targets strength, hypertrophy, and metabolic conditioning.

Warm-up Complex (8 min):
Dynamic preparation flowing through full-body movement patterns.
- Jumping Jacks: 2x30 sec (cardiovascular activation)
- Inchworm to Push-up: 2x6 (full body dynamic stretch)
- Bodyweight Squats: 2x15 (lower body prep)
- Band Pull-Aparts: 2x20 (upper back activation)

Main Strength Block (35 min):
Straight sets for primary strength movements requiring maximum focus and recovery.
- Back Squat: 5x5 at RPE 8.5, 3 min rest (primary lower body strength, heavy loading)
- Bench Press: 4x6 at RPE 8, 2.5 min rest (primary upper body push strength)
- Deadlifts: 3x5 at RPE 8, 3 min rest (posterior chain strength, reduced volume due to fatigue from squats)

Conditioning Circuit Block (20 min):
3 rounds, minimal rest within round, 2 min rest between rounds. Circuit structure here for metabolic stimulus.
- Kettlebell Swings: 15 reps at RPE 7 (explosive hip drive, cardiovascular)
- Push-ups: 12-15 reps at RPE 7 (upper body pushing endurance)
- Box Jumps: 10 reps at RPE 6 (lower body power and explosiveness)
- Farmer's Carries: 40 yards at RPE 7 (grip, core, loaded carry)
- Bike or Ski Erg: 60 seconds at RPE 8 (cardiovascular finish)

Cool-down (7 min):
- Child's Pose: 2 min (hip and back release)
- Pigeon Stretch: 2 min each side (hip mobility)
- Deep Breathing: 1 min

Total Duration: ~70 minutes

Structure Rationale: This workout combines three distinct structures: (1) Straight sets for heavy strength work where technique and full recovery are paramount. (2) Circuit-style conditioning where fatigue is intentional and movements don't require maximal loads. The mixed approach allows us to train multiple qualities in one session without compromising either.

Modifications: If deadlifts cause excessive fatigue after squats, reduce to 2x5 or substitute with Romanian Deadlifts at 3x8. If box jumps aggravate knees, substitute with Kettlebell Goblet Squats in the circuit.",

  "reasoning": "Workout Structure Decision: This advanced trainee (4+ years experience) requires both strength and conditioning work but has limited weekly training frequency (3 days). The mixed structure accomplishes multiple goals: (1) Straight sets for squats, bench, and deadlifts because these are the primary strength drivers and require maximum intent and recovery. Compromising these with fatigue from circuits would undermine strength development. (2) Circuit structure for the conditioning block creates metabolic stress and cardiovascular adaptation without interfering with strength work. The movements in the circuit (swings, push-ups, box jumps, carries, erg) are technically simpler and performed at sub-maximal loads, making fatigue accumulation appropriate. (3) The 2-min rest between circuit rounds prevents excessive fatigue while maintaining conditioning stimulus. This mixed approach is sophisticated and requires experience to execute properly - it would be inappropriate for beginners who need simpler structures.

Exercise Selection Rationale: Back Squat leads the session as the most technical and systemically demanding movement. The 5x5 scheme at RPE 8.5 provides significant strength stimulus while managing volume to prevent excessive fatigue. Bench Press follows squats rather than competing for freshness with deadlifts. The 4x6 scheme continues strength emphasis with slightly higher volume than squats. Deadlifts are programmed with reduced volume (3x5) because they're systemically demanding and the user is already fatigued from squats. This prevents overreaching while maintaining the movement pattern. The conditioning circuit includes: KB Swings for explosive hip power (similar motor pattern to deadlifts but lighter load), Push-ups for upper body endurance (complementing bench press without heavy load), Box Jumps for lower body power and explosiveness, Farmer's Carries for grip and core stability, and Bike/Erg for pure cardiovascular finish.

Progressive Overload Context: We're in week 4 of a Strength & Conditioning mesocycle. Strength work has been progressing (squat up 10 lbs from week 1, bench up 5 lbs). Volume on main lifts has been stable while circuit conditioning has intensified (started with 2 rounds, now at 3). Next week is a deload week - we'll reduce main lift volume to 3x5, 3x5, 2x5 at RPE 7 and eliminate the conditioning circuit entirely for recovery.

User-Specific Adaptations: This user trains only 3 days per week due to work schedule, necessitating full-body sessions that hit all major patterns. They're an experienced lifter with excellent technique on all movements. Home gym setup includes barbell, rack, bench, kettlebells, and box - all necessary equipment available. The 70-minute duration fits their morning training window. Previous lower back sensitivity means careful fatigue management on deadlifts (hence 3x5 vs 5x5). The conditioning circuit avoids repeated spinal loading to protect the back after heavy squats and deadlifts.

Program Integration: This Full Body session repeats 3x per week (Monday/Wednesday/Friday) with variations in main lift programming. Monday focuses on volume (5x5, 4x6, 3x5), Wednesday emphasizes intensity (4x4, 3x5, 2x5 at higher RPE), Friday uses dynamic effort (8x3 at 70%, speed work). The conditioning circuit rotates exercises weekly to prevent adaptation and boredom. This approach maximizes strength and conditioning development within a 3-day constraint."
}

**Key Takeaways from Examples:**
- Example 1 shows straight sets are appropriate for beginners and technical focus
- Example 2 shows strategic superset use for antagonist pairing in intermediate trainees
- Example 3 shows mixed structures can serve multiple training goals in advanced athletes
- None of these is "correct" - the right structure depends on the user's context
- Supersets are ONE tool, not a default
</Example Output Structures>
`.trim();

/**
 * SMS message format requirements - used in all message prompts
 */
export const SMS_FORMAT_REQUIREMENTS = `
<SMS Format Requirements>
- Use clear sections: "Warmup:", "Workout:", "Cooldown:"
- List exercises with bullets (-)
- Use SxR format: "3x10" = 3 sets of 10 reps, "3x6-8" = 3 sets of 6-8 reps
- Abbreviate: Barbell → BB, Dumbbell → DB
- Keep exercise lines under ~35 characters for mobile readability
- Remove parenthetical details and extra descriptions
- DO NOT include greetings, introductions, or motivational messages
- ONLY include the workout structure: Warmup, Workout, and Cooldown sections
- Total: under 900 characters

**Workout Structure Formatting:**

STRAIGHT SETS - Use standard format:
- Exercise: SxR

SUPERSETS (2 exercises) - Format as:
- SUPERSET - <SETS>x:
  - Exercise 1: <REPS>
  - Exercise 2: <REPS>

CIRCUITS (3+ exercises) - Format as:
- CIRCUIT - <SETS>x:
  - Exercise 1: <REPS/TIME>
  - Exercise 2: <REPS/TIME>
  - Exercise 3: <REPS/TIME>

Structure Formatting Notes:
- Use 2-space indentation for exercises within supersets/circuits
- Omit "rounds" from superset/circuit labels - just use set count
- Match the structure from the long-form description
</SMS Format Requirements>
`.trim();

/**
 * SMS message examples - used in all message prompts
 */
export const SMS_MESSAGE_EXAMPLES = `
<Examples>

**EXAMPLE 1: Mixed Structure (Superset + Straight Sets + Circuit)**
Warmup:
- Band Pull-Aparts: 3x15
- Scapular Wall Slides: 3x12
- Arm Circles: 2x30 sec

Workout:
- SUPERSET - 4x:
  - BB Bench Press: 6-8
  - Chest-Supported Row: 10-12

- DB Overhead Press: 3x8-10
- Lateral Raises: 3x12-15

- CIRCUIT - 3x:
  - Push-ups: 12-15
  - Face Pulls: 15-20
  - Tricep Pushdowns: 15-20

Cooldown:
- Pec Stretch: 2 min
- Shoulder Stretch: 2 min

**EXAMPLE 2: Straight Sets Only**
Warmup:
- Bodyweight Squats: 2x10
- Glute Bridges: 2x15
- Leg Swings: 2x10 each

Workout:
- Goblet Squats: 4x8-10
- Romanian Deadlifts: 3x10-12
- Bulgarian Split Squats: 3x8 each
- Leg Press: 3x12-15
- Lying Leg Curls: 3x12-15
- Calf Raises: 3x15-20

Cooldown:
- Hamstring Stretch: 2 min
- Hip Flexor Stretch: 2 min

**EXAMPLE 3: Straight Sets + Circuit**
Warmup:
- Jumping Jacks: 2x30 sec
- Arm Circles: 2x30 sec
- Bodyweight Squats: 2x15

Workout:
- Back Squat: 5x5
- Bench Press: 4x6
- Deadlifts: 3x5

- CIRCUIT - 3x:
  - KB Swings: 15
  - Push-ups: 12-15
  - Box Jumps: 10
  - Farmer's Carries: 40 yards

Cooldown:
- Child's Pose: 2 min
- Deep Breathing: 1 min
</Examples>

**Note:** These examples show different structure patterns. Use the structure that matches the long-form workout description. Don't default to any particular pattern - match what's in the description.
`.trim();
