import { Kysely, sql } from 'kysely';

/**
 * Consolidated Schema Migration
 *
 * This migration creates the complete GymText database schema from scratch.
 * It consolidates 51 individual migrations into a single file.
 *
 * Tables are created in FK-dependency order:
 * - Tier 1 (no FKs): users, prompts, page_visits, user_auth_codes, uploaded_images
 * - Tier 2 (→users): profiles, profile_updates, subscriptions, messages, microcycles,
 *                    workout_instances, user_onboarding, short_links, admin_activity_logs,
 *                    referrals, day_configs, message_queues
 * - Tier 3 (programs): program_owners, programs, program_versions, program_families,
 *                      program_family_programs, fitness_plans, program_enrollments
 *
 * System data (prompts, AI owner/program/version) is seeded after table creation.
 */

// =============================================================================
// SYSTEM DATA CONSTANTS
// =============================================================================

const AI_OWNER_ID = '00000000-0000-0000-0000-000000000001';
const AI_PROGRAM_ID = '00000000-0000-0000-0000-000000000002';
const AI_VERSION_ID = '00000000-0000-0000-0000-000000000003';

// =============================================================================
// PROMPT DATA
// =============================================================================

const TRAINING_FORMAT = `A) TRAINING
- Allowed section headers (0-2, in this order if present):
  Workout:
  Conditioning:
- ALWAYS omit warmup and cooldown.
- Each item is a bullet starting with "- ".
- Use standard exercise formatting.
- Training: "- BB Bench Press: 4x8-10"
- Abbreviations: Barbell -> BB, Dumbbell -> DB, Overhead Press -> OHP, Romanian Deadlift -> RDL, Single-Leg -> SL
- Supersets use "SS1", "SS2".
- Circuits use "C1", "C2".`;

const ACTIVE_RECOVERY_FORMAT = `B) ACTIVE_RECOVERY (CRITICAL - NO HEADERS)
- DO NOT use any section headers ("Workout:", "Optional:", etc.).
- Output EXACTLY 1-2 bullet lines total.
- Bullets must be:
  - Simple
  - Non-prescriptive
  - Constraint-based (time + easy effort)

Required first bullet:
- Easy activity with duration and non-exhaustive examples.

Exact format:
- "- Easy activity: ~30m (walk, bike, jog, row, swim, etc.)"

Optional second bullet (if stretching or mobility is mentioned in source):
- Keep it supportive, not instructional.
- Do NOT list specific stretches.
- Do NOT imply requirement.

Allowed format:
- "- Stretching: 5-10m (let me know if you need stretches)"

Avoid for ACTIVE_RECOVERY:
- Section headers
- Checklists
- Multiple activity bullets
- Listing individual mobility movements
- Language implying obligation

ACTIVE_RECOVERY reads as permissive, not prescriptive.`;

const REST_FORMAT = `C) REST
- No section headers.
- Output at most 1 bullet line.
- Gentle, optional movement only.

Example:
- "- Optional easy walk: 5-15m"`;

const BEGINNER_MICROCYCLE_SNIPPET = `- Use **simple, everyday language only**.
  - Say **"building strength"** and **"building muscle/size"** instead of hypertrophy.
  - Say **"slowly getting stronger week to week"** instead of progressive overload.
- Keep weekly structure **simple and repetitive**.
  - Favor full-body, upper/lower, or very simple splits.
  - Avoid hybrid or multi-focus splits unless explicitly requested.
- Emphasize **learning movement patterns**, not chasing numbers.
- Prioritize **main compound lifts**:
  - Squat or leg press
  - Hinge (deadlift or hip hinge)
  - Push (bench / push-up / machine press)
  - Pull (row / lat pulldown)
- Limit total weekly exercise variety.
  - Avoid specialty bars, complex variations, unilateral overload, or stability-focused movements.
- Progress conservatively:
  - Small weight increases or 1 extra rep *only if all reps feel controlled*.
- Avoid phases, blocks, deload terminology, or conditioning zones.
- Cardio is described as **"easy cardio"** or **"short conditioning"**, not Zone 2 or intervals.`;

const BEGINNER_WORKOUT_SNIPPET = `- Write workouts like **a coach standing next to the lifter**.
- Focus on:
  - Sets
  - Reps
  - Rest time
  - How hard the set should feel
- Use effort cues such as:
  - "You should feel like you could do 1-3 more reps"
  - "Stop the set if your form breaks down"
- Avoid:
  - RIR / RPE
  - Tempo notation
  - Percentages of max
  - Advanced intensity techniques
- Structure each workout as:
  - 1 main lift
  - 1-2 supporting lifts
  - 1-2 simple accessories (optional)
- Include brief setup and form cues.
- Encourage confidence, consistency, and habit-building over optimization.`;

const INTERMEDIATE_MICROCYCLE_SNIPPET = `- Use **mostly plain language**, with light exposure to standard training terms.
  - "Muscle growth (hypertrophy)" may appear once, then simplified afterward.
- Allow more structure and variety while staying readable.
- Weekly split can include:
  - Upper / Lower
  - Push / Pull / Legs
  - Simple strength + muscle-building hybrids
- Clearly state the **purpose of each day**:
  - Strength-focused
  - Muscle-building
  - Conditioning or recovery
- Introduce basic progression strategies:
  - Adding reps within a range
  - Small load increases
- Manage fatigue without heavy theory.
  - Occasional lighter weeks are implied, not over-explained.
- Conditioning may reference effort levels, but avoid technical zones unless requested.`;

const INTERMEDIATE_WORKOUT_SNIPPET = `- Exercises can include:
  - Secondary variations
  - Targeted accessories (rear delts, hamstrings, calves, arms)
- Supersets and pairings are allowed when they improve efficiency.
- Effort guidance may include optional clarification:
  - "Finish with 1-2 reps left (RIR 1-2)"
- Tempo or pauses may be used sparingly and explained in plain terms.
- Structure workouts clearly:
  - Main lift
  - Secondary lift
  - Accessories that support the day's goal
- Offer simple autoregulation:
  - "If you feel strong today, add a set"
  - "If fatigue is high, reduce volume slightly"`;

const ADVANCED_MICROCYCLE_SNIPPET = `- Assume full fluency with training concepts:
  - Hypertrophy, volume, intensity, RIR/RPE, deloads, conditioning zones
- Hybrid splits (e.g., Upper/Lower Strength + PPL Hypertrophy) are appropriate.
- Weekly structure should clearly separate:
  - Heavy strength exposures
  - Volume / hypertrophy accumulation
  - Recovery or lighter days
- Progression must be explicit:
  - Load targets
  - Rep goals
  - Top sets + back-offs
  - Double progression where appropriate
- Fatigue management is intentional:
  - Planned deloads
  - Anchor-aware adjustments (e.g., cycle class interference)
- Exercise selection may include:
  - Specialty bars
  - Tempo work
  - Unilateral loading
  - Stability or weak-point emphasis`;

const ADVANCED_WORKOUT_SNIPPET = `- Communicate with precision and intent.
- Include:
  - RIR or RPE targets
  - Rest times
  - Tempo prescriptions when relevant
- Advanced methods are acceptable when justified:
  - Top sets + back-offs
  - Clusters
  - Myo-reps
  - Intensity techniques
- Accessories may target:
  - Weak links
  - Stabilizers
  - Joint health / prehab
- Provide clear autoregulation paths:
  - Adjust volume or intensity based on readiness
  - Maintain movement patterns even on low-performance days
- Language should match an experienced lifter chasing specific performance outcomes.`;

const PROGRAM_PARSE_SYSTEM_PROMPT = `You are an expert fitness program analyst. Your task is to parse raw text extracted from fitness program documents (PDFs, spreadsheets, text files) and convert them into clean, structured markdown.

============================================================
# INPUT
============================================================
You will receive raw text that may include:
- Workout schedules and splits
- Exercise lists with sets, reps, and intensity guidelines
- Weekly or multi-week program structures
- Phase/mesocycle information (accumulation, intensification, deload, etc.)
- Notes on progression, rest periods, or exercise substitutions

The text may be poorly formatted, have OCR artifacts, or be structured as spreadsheet data.

============================================================
# OUTPUT REQUIREMENTS
============================================================
Convert the input into a well-structured markdown document with:

1. **Program Title** (H1)
   - Extract or infer a descriptive title

2. **Program Overview** (paragraph)
   - Duration (weeks)
   - Training frequency
   - Primary goals/focus
   - Target audience/experience level (if determinable)

3. **Phases/Mesocycles** (H2 for each phase)
   - Phase name and duration
   - Phase goals/focus
   - Weekly structure

4. **Weekly Training Schedule** (H3 for each week or week type)
   - Day-by-day breakdown
   - Session focus for each day

5. **Workouts** (H4 for each workout)
   - Exercise name
   - Sets x Reps (or time/duration)
   - Intensity guidance (RIR, RPE, % of max, or descriptive)
   - Rest periods (if specified)
   - Notes/cues (if provided)

============================================================
# FORMATTING RULES
============================================================

## Exercise Format
Use bullet lists for exercises:
\`\`\`
- **Exercise Name**: Sets x Reps @ Intensity
  - Rest: X min
  - Notes: Any specific cues
\`\`\`

## Supersets/Circuits
Group related exercises:
\`\`\`
**Superset A (3 rounds):**
- A1. Exercise 1: 3x10
- A2. Exercise 2: 3x12
\`\`\`

## Progression Notes
Include a "Progression" section if the source material specifies how to advance.

## Unknown/Unclear Information
- If information is unclear or missing, note it with "[Not specified]"
- If OCR artifacts make text unreadable, indicate "[Unreadable]"
- Make reasonable inferences where possible, noting them as "[Inferred: ...]"

============================================================
# CLEAN OUTPUT
============================================================
- Remove OCR artifacts and formatting errors
- Standardize exercise names to common conventions
- Convert abbreviations to full names where helpful (BB = Barbell, DB = Dumbbell, etc.)
- Ensure consistent formatting throughout
- No emojis
- Use proper markdown hierarchy

Return ONLY the formatted markdown document. Do not include explanations or commentary outside the document structure.`;

const PROGRAM_PARSE_USER_PROMPT = `Parse the following raw program text into a structured markdown document following the system instructions.

Raw program text to parse:`;

const NASM_SPLIT_ARCHITECTURE_TEMPLATE = `# NASM SPLIT ARCHITECTURE LOGIC

Select the split based strictly on the user's available days/week and goal.

## 3 DAYS / WEEK (The Efficiency Model)
- **Strategy A (Default): Full Body Split.**
  - *Logic:* High frequency (hit every muscle 3x/week). Superior for metabolic demand and general strength.
  - *Structure:* Day 1 (Full Body A), Day 3 (Full Body B), Day 5 (Full Body C).
- **Strategy B (Heavy Lifting Focus): Rotating Upper/Lower.**
  - *Logic:* Allows for Phase 4 (Max Strength) intensity without burnout.
  - *Structure:* Rotates weekly (Week 1: U/L/U, Week 2: L/U/L).
- **Strategy C (Advanced Aesthetics): Modified PPL.**
  - *Logic:* Only for Phase 3 advanced users who need massive intra-session volume. Warn about low frequency (1x/week).

## 4 DAYS / WEEK (The NASM "Sweet Spot")
- **Strategy A (Default): Upper/Lower Split.**
  - *Logic:* Optimal balance for Phases 3 & 4. Hits every muscle 2x/week. Built-in recovery days.
  - *Structure:* Mon (Upper), Tue (Lower), Thu (Upper), Fri (Lower).
- **Strategy B (Bodybuilding Focus): Synergistic/Body Part.**
  - *Logic:* For bringing up lagging parts or pure aesthetics.
  - *Structure:* Day 1 (Chest/Tri), Day 2 (Back/Bi), Day 4 (Legs), Day 5 (Shoulders/Abs).

## 5 DAYS / WEEK (Volume & Specialization)
- **Strategy A (Athletics/Strength): Hybrid Split (Upper/Lower + PPL OR PPL + Upper/Lower).**
  - *Logic:* Hits muscles ~1.5-2x/week. Ideal for DUP (Daily Undulating Periodization).
  - *Structure:* Days 1-2 (Strength/Power), Days 4-6 (Hypertrophy PPL).
- **Strategy B (Maximum Hypertrophy): The "Bro Split" (Classic Body Part).**
  - *Logic:* 1x frequency, max volume per session. Requires high intensity to justify 6 days rest per muscle.
  - *Structure:* Chest, Back, Legs, Shoulders, Arms (1 day each).

## 6 DAYS / WEEK (Advanced Frequency)
- **Strategy A (Default): Push-Pull-Legs (PPL).**
  - *Logic:* Functional synergy. Grouping muscles by movement pattern.
  - *Structure:* Push A, Pull A, Legs A, Push B, Pull B, Legs B, Rest.
- **Strategy B (High Density): The "Arnold" (Antagonist) Split.**
  - *Logic:* Pairs opposing muscles (Chest/Back) for supersets and metabolic demand.
  - *Structure:* Torso, Extremities (Arms/Delts), Legs.
- **Critical Constraint:** Day 7 MUST be active recovery or full rest. Monitor for CNS fatigue.`;

const PLAN_GENERATE_SYSTEM_PROMPT = `
You are an expert **Strength & Conditioning Periodization Architect**.

Your goal is to design a high-level **Training Blueprint** (Fitness Plan) for a user based on their specific profile, constraints, and goal hierarchy. You adhere strictly to NASM OPT™ Model principles regarding frequency and recovery.

You will receive the user's information in the following context tags:
- <ProgramVersion> - The split architecture guidance for this program
- <User> - Basic user information (name, gender)
- <UserProfile> - The user's fitness profile with goals, constraints, and preferences

============================================================
# SECTION 1 — FIRST PRINCIPLES PROGRAMMING LOGIC
============================================================

## 1. ANCHOR VS. HABIT DISCRIMINATION (CRITICAL)
- **True Fixed Anchors:** Look for "Fixed Anchors" or "External Obligations" in the profile (e.g., "Soccer Practice," "Yoga Class"). **Lock these in.**
- **Historical Habits:** If the profile says "Currently lifts 3x/week" or "Usually runs," these are **Baseline Data**, NOT Constraints.
  - *Action:* You are the Architect. You may completely restructure their split if it better serves their Primary Goal, unless the user explicitly said "I MUST keep my running schedule."

## 2. GOAL HIERARCHY & ARCHETYPE
- **Strength/Hypertrophy Focus:** 70-100% Lifting.
- **Endurance Focus:** 60%+ Cardio, 30-40% Lifting.
- **Hybrid (Concurrent):** ~50/50 split. *CRITICAL: Manage interference effect.* (e.g., Separate Heavy Legs and Sprinting by 24h).

============================================================
# SECTION 2 — VOLUME & ALLOCATION
============================================================

- **Session Consolidation (NO JUNK VOLUME):**
  - **Default Rule:** Plan for **ONE** high-quality session per day.
  - **Double Sessions:** Do **NOT** schedule double sessions unless the user is a competitive athlete or explicitly requested them.
- **Cardio Integration:**
  - If Goal = Weight Loss: Integrate cardio on off-days or post-lift.
  - If Goal = Performance: Periodize cardio to minimize interference.

============================================================
# SECTION 3 — OUTPUT FORMAT
============================================================

Output the plan as plain text (no JSON wrapper).

The plan MUST include these sections IN ORDER:

## PROGRAM ARCHITECTURE
- **Split Strategy:** (e.g., "4-Day Upper/Lower Split")
- **Rationale:** One sentence explaining why this NASM split fits their profile.
- **Primary Focus:** The main adaptation (Stabilization, Endurance, Hypertrophy, Strength, Power).

## WEEKLY SCHEDULE TEMPLATE
Define the "Chassis" of the week.
Format:
- **Day 1 (Monday):**
  - **Focus:** [e.g., Upper Body Strength]
  - **Activity Type:** [e.g., Resistance Training + Zone 2 Cardio]
*(Include brief rationale for the ordering, e.g., "Legs placed on Friday to allow weekend recovery")*

## SESSION GUIDELINES
- **Resistance Training Style:** (e.g., "3-5 sets, 6-12 reps, 2-0-2 tempo")
- **Cardio/Conditioning Protocol:** (e.g., "HIIT intervals on non-lifting days")
- **Anchor Integration:** How workouts interact with fixed classes.

## PROGRESSION STRATEGY
- **Method:** (e.g., Linear Load Increase, Volume Accumulation, or DUP)
- **Cadence:** (e.g., "Increase weight by 5% every 2 weeks")

## DELOAD PROTOCOL
- **Trigger:** (e.g., "Every 6th week" or "Performance plateau")
- **Implementation:** (e.g., "Reduce volume by 50%")

## KEY PRINCIPLES
- Specific notes for the workout generator regarding injuries, preferences, or equipment limitations.

============================================================
# RULES
============================================================

1. **Respect Time Constraints:** If the user has specific days for classes, strictly adhere to them.
2. **Use <ProgramVersion> Guidance:** Select the appropriate split from the <ProgramVersion> context based on available days.
3. **Abstract the Exercises:** Do not list specific exercises. List patterns/focus (e.g., "Squat Pattern").
4. **No JSON:** Plain text output only.
5. **Do Not Repeat Context:** Start immediately with "## PROGRAM ARCHITECTURE".
`;

const PLAN_GENERATE_USER_PROMPT = `
Design a comprehensive fitness blueprint for this user.

## Instructions
1. Review the **<ProgramVersion>** context for the split architecture guidance.
2. Analyze the user's profile in the <UserProfile> context to identify **Available Days per Week**.
3. Select the appropriate **Split Architecture** from <ProgramVersion> based on available days.
   - *Example:* If they have 4 days, prioritize Upper/Lower unless they are purely focused on aesthetics (then use Body Part).
4. Identify **Fixed Anchors** (classes/obligations) vs **Historical Habits**. Lock in Anchors; optimize Habits.
5. Construct a **Weekly Schedule Template**.
   - Prioritize **Single Sessions**.
6. Ensure the progression model is sustainable.
`.trim();

const PLAN_MODIFY_SYSTEM_PROMPT = `
You are an expert **Strength & Conditioning Periodization Architect** specializing in **Adaptive Program Design**.

Your goal is to modify an existing Training Blueprint (Fitness Plan) based on user feedback while maintaining the **structural integrity and periodization logic** of the program. You adhere strictly to NASM OPT™ Model principles regarding frequency and recovery.

You will receive the following context:
- <ProgramVersion> - The split architecture guidance for this program
- <User> - Basic user information (name, gender)
- <UserProfile> - The user's fitness profile with goals, constraints, and preferences
- <FitnessPlan> - The complete fitness plan as it currently exists

The user's change request will be provided as the message.

You must output a JSON object with: \`description\`, \`wasModified\`, \`modifications\`.

============================================================
# SECTION 1 — MODIFICATION PRIMITIVES
============================================================

Choose the correct tactic based on the User Request:

### A. RESTRUCTURE (Frequency/Split Changes)
*User: "Change from 5 days to 6 days" or "Switch to push/pull/legs"*
- **Action:** Redesign the WEEKLY SCHEDULE TEMPLATE using the **Split Architecture** from the <ProgramVersion> context.
- **Considerations:**
  - Maintain appropriate rest (48-72h for same muscle).
  - Preserve any existing **True Fixed Anchors** (obligations like "Soccer Practice").

### B. ANCHOR (Fixed Schedule Changes)
*User: "Add yoga on Monday/Friday mornings" or "Remove my Tuesday class"*
- **Action:** Add or remove the fixed commitment in the WEEKLY SCHEDULE TEMPLATE.
- **Logic:** Distinguish between **True Anchors** (must keep) and **Habits** (can change).
- **Integration:** Ensure the surrounding training days account for the anchor:
  - If adding a yoga class, reduce mobility work from adjacent sessions.
  - If adding a sport/cardio anchor, manage fatigue for nearby lifting days.

### C. REFOCUS (Goal/Balance Changes)
*User: "More cardio" or "Focus more on strength" or "Add conditioning"*
- **Action:** Adjust the balance of session types and update SESSION GUIDELINES.
- **Updates:**
  - **Strength/Hypertrophy:** 70-100% Lifting.
  - **Endurance:** 60%+ Cardio, 30-40% Lifting.
  - **Hybrid:** ~50/50 split (Manage interference effect).
  - Update PROGRAM ARCHITECTURE to reflect new primary focus.

### D. CONSTRAIN (Equipment/Time/Limitation Changes)
*User: "I joined a new gym" or "Only have 45 min per session" or "Injured my shoulder"*
- **Action:** Update KEY PRINCIPLES and potentially SESSION GUIDELINES.
- **Scope:** May require adjusting exercise patterns or session structure (Session Consolidation) to accommodate.

============================================================
# SECTION 2 — OUTPUT FORMAT (STRICT JSON)
============================================================

You MUST output this JSON structure:

\`\`\`json
{
  "description": "Full updated plan text...",
  "wasModified": boolean,
  "modifications": "Concise summary of changes made."
}
\`\`\`

### THE DESCRIPTION FORMAT
The \`description\` field must contain the COMPLETE plan in plain text with these sections IN ORDER:

## PROGRAM ARCHITECTURE
- **Split Strategy:** (e.g., "4-Day Upper/Lower Split")
- **Rationale:** One sentence explaining why this NASM split fits their profile.
- **Primary Focus:** The main adaptation (Stabilization, Endurance, Hypertrophy, Strength, Power).

## WEEKLY SCHEDULE TEMPLATE
Define the "Chassis" of the week.
Format:
- **Day 1 (Monday):**
  - **Focus:** [e.g., Upper Body Strength]
  - **Activity Type:** [e.g., Resistance Training + Zone 2 Cardio]
*(Include brief rationale for the ordering)*

## SESSION GUIDELINES
- **Resistance Training Style:** (e.g., "3-5 sets, 6-12 reps, 2-0-2 tempo")
- **Cardio/Conditioning Protocol:** (e.g., "HIIT intervals on non-lifting days")
- **Anchor Integration:** How workouts interact with fixed classes.

## PROGRESSION STRATEGY
- **Method:** (e.g., Linear Load Increase, Volume Accumulation, or DUP)
- **Cadence:** (e.g., "Increase weight by 5% every 2 weeks")

## DELOAD PROTOCOL
- **Trigger:** (e.g., "Every 6th week" or "Performance plateau")
- **Implementation:** (e.g., "Reduce volume by 50%")

## KEY PRINCIPLES
- Specific notes for the workout generator regarding injuries, preferences, or equipment limitations.

============================================================
# SECTION 3 — RULES
============================================================

1. **Preserve What Works:** Only change sections directly affected by the request.
2. **Respect Anchors:** Never remove or move True Fixed Anchors unless explicitly requested.
3. **Use <ProgramVersion> Guidance:** When restructuring, reference the split options from the <ProgramVersion> context.
4. **No Exercises:** Do not list specific exercises. Use patterns/focus (e.g., "Squat Pattern").
5. **wasModified Logic:**
   - Set to \`true\` if ANY change was made to the plan.
   - Set to \`false\` if the current plan already satisfies the request.
6. **modifications Summary:** Briefly explain what changed (e.g., "Restructured to 4-day Upper/Lower split, added yoga anchors on Monday/Friday AM").
`;

// All prompts to seed
const PROMPTS_TO_SEED = [
  // Day format prompts
  { id: 'workout:message:format:training', role: 'context', value: TRAINING_FORMAT },
  { id: 'workout:message:format:active_recovery', role: 'context', value: ACTIVE_RECOVERY_FORMAT },
  { id: 'workout:message:format:rest', role: 'context', value: REST_FORMAT },
  // Experience level - microcycle
  { id: 'microcycle:generate:experience:beginner', role: 'context', value: BEGINNER_MICROCYCLE_SNIPPET },
  { id: 'microcycle:generate:experience:intermediate', role: 'context', value: INTERMEDIATE_MICROCYCLE_SNIPPET },
  { id: 'microcycle:generate:experience:advanced', role: 'context', value: ADVANCED_MICROCYCLE_SNIPPET },
  // Experience level - workout
  { id: 'workout:generate:experience:beginner', role: 'context', value: BEGINNER_WORKOUT_SNIPPET },
  { id: 'workout:generate:experience:intermediate', role: 'context', value: INTERMEDIATE_WORKOUT_SNIPPET },
  { id: 'workout:generate:experience:advanced', role: 'context', value: ADVANCED_WORKOUT_SNIPPET },
  // Program parse
  { id: 'program:parse', role: 'system', value: PROGRAM_PARSE_SYSTEM_PROMPT },
  { id: 'program:parse', role: 'user', value: PROGRAM_PARSE_USER_PROMPT },
  // Plan generate
  { id: 'plan:generate', role: 'system', value: PLAN_GENERATE_SYSTEM_PROMPT },
  { id: 'plan:generate', role: 'user', value: PLAN_GENERATE_USER_PROMPT },
  // Plan modify
  { id: 'plan:modify', role: 'system', value: PLAN_MODIFY_SYSTEM_PROMPT },
];

// =============================================================================
// MIGRATION UP
// =============================================================================

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Starting consolidated schema migration...');

  // ============================================
  // EXTENSIONS AND FUNCTIONS
  // ============================================
  console.log('Creating extensions and functions...');

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // ============================================
  // TIER 1: TABLES WITH NO FOREIGN KEYS
  // ============================================
  console.log('Creating Tier 1 tables (no FKs)...');

  // 1. USERS TABLE
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('phone_number', 'varchar(20)', (col) => col.notNull().unique())
    .addColumn('age', 'integer')
    .addColumn('gender', 'varchar(20)')
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('stripe_customer_id', 'varchar(255)', (col) => col.unique())
    .addColumn('preferred_send_hour', 'integer', (col) => col.defaultTo(8).notNull())
    .addColumn('timezone', 'varchar(50)', (col) => col.defaultTo('America/New_York').notNull())
    .addColumn('referral_code', 'varchar(8)', (col) => col.unique())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await sql`
    ALTER TABLE users
    ADD CONSTRAINT check_preferred_send_hour
    CHECK (preferred_send_hour >= 0 AND preferred_send_hour <= 23)
  `.execute(db);

  await sql`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // 2. PROMPTS TABLE
  await db.schema
    .createTable('prompts')
    .addColumn('id', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint('prompts_pkey', ['id', 'role', 'created_at'])
    .execute();

  await db.schema
    .createIndex('prompts_id_role_created_idx')
    .on('prompts')
    .columns(['id', 'role', 'created_at'])
    .execute();

  // 3. PAGE_VISITS TABLE
  await db.schema
    .createTable('page_visits')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('page', 'varchar(100)', (col) => col.notNull())
    .addColumn('ip_address', 'varchar(45)')
    .addColumn('user_agent', 'text')
    .addColumn('referrer', 'text')
    .addColumn('source', 'varchar(100)')
    .addColumn('utm_source', 'varchar(255)')
    .addColumn('utm_medium', 'varchar(255)')
    .addColumn('utm_campaign', 'varchar(255)')
    .addColumn('utm_content', 'varchar(255)')
    .addColumn('utm_term', 'varchar(255)')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('idx_page_visits_source').on('page_visits').column('source').execute();
  await db.schema.createIndex('idx_page_visits_created_at').on('page_visits').column('created_at').execute();

  // 4. USER_AUTH_CODES TABLE
  await db.schema
    .createTable('user_auth_codes')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('phone_number', 'text', (col) => col.notNull())
    .addColumn('code', 'varchar(6)', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('user_auth_codes_phone_code_idx')
    .on('user_auth_codes')
    .columns(['phone_number', 'code', 'expires_at'])
    .execute();

  await db.schema
    .createIndex('user_auth_codes_expires_at_idx')
    .on('user_auth_codes')
    .column('expires_at')
    .execute();

  // 5. UPLOADED_IMAGES TABLE
  await db.schema
    .createTable('uploaded_images')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('filename', 'varchar(255)', (col) => col.notNull())
    .addColumn('display_name', 'varchar(255)')
    .addColumn('content_type', 'varchar(100)', (col) => col.notNull())
    .addColumn('size_bytes', 'integer', (col) => col.notNull())
    .addColumn('category', 'varchar(50)', (col) => col.defaultTo('general'))
    .addColumn('tags', 'jsonb', (col) => col.defaultTo(sql`'[]'::jsonb`))
    .addColumn('uploaded_by', 'varchar(50)')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema.createIndex('uploaded_images_category_idx').on('uploaded_images').column('category').execute();

  // ============================================
  // TIER 2: TABLES WITH FK TO USERS
  // ============================================
  console.log('Creating Tier 2 tables (→users)...');

  // 6. PROFILES TABLE
  await db.schema
    .createTable('profiles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('profile', 'text', (col) => col.notNull())
    .addColumn('structured', 'jsonb')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema.createIndex('idx_profiles_client_created').on('profiles').columns(['client_id', 'created_at']).execute();
  await db.schema.createIndex('idx_profiles_client').on('profiles').column('client_id').execute();

  // 7. PROFILE_UPDATES TABLE
  await db.schema
    .createTable('profile_updates')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('patch', 'jsonb', (col) => col.notNull())
    .addColumn('path', 'text')
    .addColumn('source', 'text', (col) => col.notNull())
    .addColumn('reason', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 8. SUBSCRIPTIONS TABLE
  await db.schema
    .createTable('subscriptions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('stripe_subscription_id', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('status', 'varchar(50)', (col) => col.notNull())
    .addColumn('plan_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('current_period_start', 'timestamptz', (col) => col.notNull())
    .addColumn('current_period_end', 'timestamptz', (col) => col.notNull())
    .addColumn('canceled_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await sql`
    CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // 9. MESSAGES TABLE
  await db.schema
    .createTable('messages')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('conversation_id', 'uuid')
    .addColumn('client_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('direction', 'varchar(10)', (col) => col.notNull().check(sql`direction IN ('inbound', 'outbound')`))
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('phone_from', 'varchar(20)')
    .addColumn('phone_to', 'varchar(20)')
    .addColumn('provider_message_id', 'varchar(100)')
    .addColumn('provider', 'varchar(20)', (col) => col.notNull().defaultTo('twilio'))
    .addColumn('delivery_status', 'varchar(20)', (col) => col.notNull().defaultTo('pending'))
    .addColumn('delivery_error', 'text')
    .addColumn('delivery_attempts', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('last_delivery_attempt_at', 'timestamptz')
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 10. MICROCYCLES TABLE
  await db.schema
    .createTable('microcycles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('absolute_week', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('start_date', 'timestamp', (col) => col.notNull())
    .addColumn('end_date', 'timestamp', (col) => col.notNull())
    .addColumn('days', sql`text[]`)
    .addColumn('is_deload', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('description', 'text')
    .addColumn('message', 'text')
    .addColumn('structured', 'jsonb')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await sql`
    CREATE TRIGGER update_microcycles_updated_at
    BEFORE UPDATE ON microcycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createIndex('idx_microcycles_client_date')
    .on('microcycles')
    .columns(['client_id', 'start_date'])
    .execute();

  // 11. WORKOUT_INSTANCES TABLE
  await db.schema
    .createTable('workout_instances')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('microcycle_id', 'uuid', (col) => col.references('microcycles.id').onDelete('set null'))
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('session_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('goal', 'text')
    .addColumn('description', 'text')
    .addColumn('reasoning', 'text')
    .addColumn('message', 'text')
    .addColumn('details', 'jsonb', (col) => col.notNull())
    .addColumn('structured', 'jsonb')
    .addColumn('completed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await sql`
    CREATE TRIGGER update_workout_instances_updated_at
    BEFORE UPDATE ON workout_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // 12. USER_ONBOARDING TABLE
  await db.schema
    .createTable('user_onboarding')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.unique().notNull().references('users.id').onDelete('cascade'))
    .addColumn('signup_data', 'jsonb')
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('pending'))
    .addColumn('current_step', 'integer')
    .addColumn('started_at', 'timestamptz')
    .addColumn('completed_at', 'timestamptz')
    .addColumn('error_message', 'text')
    .addColumn('program_messages_sent', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema.createIndex('idx_user_onboarding_user_id').on('user_onboarding').column('client_id').execute();
  await db.schema.createIndex('idx_user_onboarding_status').on('user_onboarding').column('status').execute();

  await sql`
    CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // 13. SHORT_LINKS TABLE
  await db.schema
    .createTable('short_links')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('code', 'varchar(5)', (col) => col.notNull().unique())
    .addColumn('target_path', 'text', (col) => col.notNull())
    .addColumn('client_id', 'uuid', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('expires_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('last_accessed_at', 'timestamptz')
    .addColumn('access_count', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema.createIndex('short_links_code_idx').on('short_links').column('code').execute();
  await db.schema.createIndex('short_links_user_id_idx').on('short_links').column('client_id').execute();
  await db.schema.createIndex('short_links_expires_at_idx').on('short_links').column('expires_at').execute();

  // 14. ADMIN_ACTIVITY_LOGS TABLE
  await db.schema
    .createTable('admin_activity_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('actor_client_id', 'uuid')
    .addColumn('target_client_id', 'uuid', (col) => col.notNull())
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('payload', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('result', 'text', (col) => col.notNull())
    .addColumn('error_message', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 15. REFERRALS TABLE
  await db.schema
    .createTable('referrals')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('referrer_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('referee_id', 'uuid', (col) => col.notNull().unique().references('users.id').onDelete('cascade'))
    .addColumn('credit_applied', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('credit_amount_cents', 'integer', (col) => col.defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('credited_at', 'timestamptz')
    .execute();

  await db.schema.createIndex('referrals_referrer_id_idx').on('referrals').column('referrer_id').execute();

  // 16. DAY_CONFIGS TABLE
  await db.schema
    .createTable('day_configs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('scope_type', 'varchar(20)', (col) => col.notNull().defaultTo('global'))
    .addColumn('scope_id', 'uuid')
    .addColumn('config', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('day_configs_date_scope_unique', ['date', 'scope_type', 'scope_id'])
    .execute();

  await db.schema.createIndex('day_configs_date_idx').on('day_configs').column('date').execute();
  await db.schema.createIndex('day_configs_scope_idx').on('day_configs').columns(['scope_type', 'scope_id']).execute();

  // 17. MESSAGE_QUEUES TABLE
  await db.schema
    .createTable('message_queues')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('queue_name', 'varchar(50)', (col) => col.notNull())
    .addColumn('sequence_number', 'integer', (col) => col.notNull())
    .addColumn('message_content', 'text')
    .addColumn('media_urls', 'jsonb')
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('pending').check(sql`status IN ('pending', 'sent', 'delivered', 'failed')`)
    )
    .addColumn('message_id', 'uuid', (col) => col.references('messages.id').onDelete('set null'))
    .addColumn('retry_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('max_retries', 'integer', (col) => col.notNull().defaultTo(3))
    .addColumn('timeout_minutes', 'integer', (col) => col.notNull().defaultTo(10))
    .addColumn('error_message', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('sent_at', 'timestamptz')
    .addColumn('delivered_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('message_queues_user_queue_sequence_idx')
    .on('message_queues')
    .columns(['client_id', 'queue_name', 'sequence_number'])
    .execute();

  await db.schema
    .createIndex('message_queues_user_status_idx')
    .on('message_queues')
    .columns(['client_id', 'status'])
    .execute();

  await db.schema.createIndex('message_queues_message_id_idx').on('message_queues').column('message_id').execute();

  await db.schema
    .createIndex('message_queues_sent_at_status_idx')
    .on('message_queues')
    .columns(['sent_at', 'status'])
    .execute();

  // ============================================
  // TIER 3: PROGRAM-RELATED TABLES
  // ============================================
  console.log('Creating Tier 3 tables (programs)...');

  // 18. PROGRAM_OWNERS TABLE
  await db.schema
    .createTable('program_owners')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('owner_type', 'varchar(20)', (col) => col.notNull())
    .addColumn('display_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('bio', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('stripe_connect_account_id', 'varchar(255)')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema.createIndex('idx_program_owners_user_id').on('program_owners').column('user_id').execute();
  await db.schema.createIndex('idx_program_owners_type').on('program_owners').column('owner_type').execute();

  // 19. PROGRAMS TABLE
  await db.schema
    .createTable('programs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_id', 'uuid', (col) => col.notNull().references('program_owners.id').onDelete('cascade'))
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('scheduling_mode', 'varchar(20)', (col) => col.notNull().defaultTo('rolling_start'))
    .addColumn('cadence', 'varchar(30)', (col) => col.notNull().defaultTo('calendar_days'))
    .addColumn('late_joiner_policy', 'varchar(30)', (col) => col.defaultTo('start_from_beginning'))
    .addColumn('billing_model', 'varchar(30)', (col) => col.defaultTo('subscription'))
    .addColumn('revenue_split_percent', 'integer', (col) => col.defaultTo(70))
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('published_version_id', 'uuid') // FK added after program_versions created
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema.createIndex('idx_programs_owner_id').on('programs').column('owner_id').execute();
  await db.schema.createIndex('idx_programs_active_public').on('programs').columns(['is_active', 'is_public']).execute();

  // 20. PROGRAM_VERSIONS TABLE
  await db.schema
    .createTable('program_versions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('version_number', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('draft'))
    .addColumn('template_markdown', 'text')
    .addColumn('template_structured', 'jsonb')
    .addColumn('generation_config', 'jsonb')
    .addColumn('default_duration_weeks', 'integer')
    .addColumn('difficulty_metadata', 'jsonb')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('published_at', 'timestamptz')
    .addColumn('archived_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('idx_program_versions_program_version')
    .on('program_versions')
    .columns(['program_id', 'version_number'])
    .unique()
    .execute();

  await db.schema.createIndex('idx_program_versions_program_id').on('program_versions').column('program_id').execute();
  await db.schema.createIndex('idx_program_versions_status').on('program_versions').column('status').execute();

  // Add FK from programs.published_version_id to program_versions
  await sql`ALTER TABLE programs ADD CONSTRAINT fk_programs_published_version FOREIGN KEY (published_version_id) REFERENCES program_versions(id) ON DELETE SET NULL`.execute(db);
  await db.schema.createIndex('idx_programs_published_version').on('programs').column('published_version_id').execute();

  // 21. PROGRAM_FAMILIES TABLE
  await db.schema
    .createTable('program_families')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_id', 'uuid', (col) => col.references('program_owners.id').onDelete('set null'))
    .addColumn('family_type', 'varchar(30)', (col) => col.notNull())
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .addColumn('slug', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('visibility', 'varchar(20)', (col) => col.notNull().defaultTo('public'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema.createIndex('idx_program_families_owner_id').on('program_families').column('owner_id').execute();
  await db.schema.createIndex('idx_program_families_slug').on('program_families').column('slug').unique().execute();
  await db.schema.createIndex('idx_program_families_type').on('program_families').column('family_type').execute();

  // 22. PROGRAM_FAMILY_PROGRAMS TABLE
  await db.schema
    .createTable('program_family_programs')
    .addColumn('family_id', 'uuid', (col) => col.notNull().references('program_families.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('role', 'varchar(20)')
    .addColumn('pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  await sql`
    ALTER TABLE program_family_programs
    ADD CONSTRAINT pk_program_family_programs
    PRIMARY KEY (family_id, program_id)
  `.execute(db);

  await db.schema
    .createIndex('idx_program_family_programs_sort')
    .on('program_family_programs')
    .columns(['family_id', 'sort_order'])
    .unique()
    .execute();

  // 23. FITNESS_PLANS TABLE
  await db.schema
    .createTable('fitness_plans')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('legacy_client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('client_id', 'uuid', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.references('programs.id').onDelete('cascade'))
    .addColumn('program_version_id', 'uuid', (col) => col.references('program_versions.id').onDelete('set null'))
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('message', 'text')
    .addColumn('structured', 'jsonb')
    .addColumn('status', 'varchar(20)', (col) => col.defaultTo('active'))
    .addColumn('personalization_snapshot', 'jsonb')
    .addColumn('current_state', 'jsonb')
    .addColumn('published_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await sql`
    CREATE TRIGGER update_fitness_plans_updated_at
    BEFORE UPDATE ON fitness_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema.createIndex('idx_fitness_plans_program_id').on('fitness_plans').column('program_id').execute();
  await db.schema.createIndex('idx_fitness_plans_published_at').on('fitness_plans').column('published_at').execute();
  await db.schema.createIndex('idx_fitness_plans_client_id').on('fitness_plans').column('client_id').execute();
  await db.schema.createIndex('idx_fitness_plans_program_version_id').on('fitness_plans').column('program_version_id').execute();
  await db.schema.createIndex('idx_fitness_plans_status').on('fitness_plans').column('status').execute();

  // 24. PROGRAM_ENROLLMENTS TABLE
  await db.schema
    .createTable('program_enrollments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('program_version_id', 'uuid', (col) => col.references('program_versions.id').onDelete('set null'))
    .addColumn('cohort_id', 'varchar(100)')
    .addColumn('cohort_start_date', 'date')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('current_week', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('active'))
    .addColumn('enrolled_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_enrollments_client_program')
    .on('program_enrollments')
    .columns(['client_id', 'program_id'])
    .unique()
    .execute();

  await db.schema.createIndex('idx_enrollments_client_id').on('program_enrollments').column('client_id').execute();
  await db.schema.createIndex('idx_enrollments_program_id').on('program_enrollments').column('program_id').execute();
  await db.schema.createIndex('idx_enrollments_status').on('program_enrollments').column('status').execute();
  await db.schema.createIndex('idx_enrollments_cohort').on('program_enrollments').columns(['program_id', 'cohort_id']).execute();
  await db.schema.createIndex('idx_enrollments_program_version_id').on('program_enrollments').column('program_version_id').execute();

  // ============================================
  // SEED SYSTEM DATA
  // ============================================
  console.log('Seeding system data...');

  // Seed prompts
  console.log('Seeding prompts...');
  for (const prompt of PROMPTS_TO_SEED) {
    await sql`
      INSERT INTO prompts (id, role, value)
      VALUES (${prompt.id}, ${prompt.role}, ${prompt.value})
    `.execute(db);
  }

  // Seed AI program owner
  console.log('Seeding AI program owner...');
  await sql`
    INSERT INTO program_owners (id, user_id, owner_type, display_name, bio, is_active)
    VALUES (
      ${AI_OWNER_ID}::uuid,
      NULL,
      'ai',
      'GymText AI',
      'Your personal AI fitness coach. Creates customized workout plans based on your goals, experience, and schedule.',
      true
    )
    ON CONFLICT (id) DO NOTHING
  `.execute(db);

  // Seed AI program
  console.log('Seeding AI program...');
  await sql`
    INSERT INTO programs (id, owner_id, name, description, scheduling_mode, cadence, late_joiner_policy, billing_model, is_active, is_public)
    VALUES (
      ${AI_PROGRAM_ID}::uuid,
      ${AI_OWNER_ID}::uuid,
      'AI Personal Training',
      'Personalized fitness plans generated by AI based on your unique profile, goals, and preferences.',
      'rolling_start',
      'calendar_days',
      'start_from_beginning',
      'subscription',
      true,
      true
    )
    ON CONFLICT (id) DO NOTHING
  `.execute(db);

  // Seed AI program version
  console.log('Seeding AI program version...');
  await sql`
    INSERT INTO program_versions (id, program_id, version_number, status, template_markdown, generation_config, published_at)
    VALUES (
      ${AI_VERSION_ID}::uuid,
      ${AI_PROGRAM_ID}::uuid,
      1,
      'published',
      ${NASM_SPLIT_ARCHITECTURE_TEMPLATE},
      ${JSON.stringify({
        promptIds: ['generate-fitness-plan', 'generate-microcycle', 'generate-daily-workout'],
        context: {
          emphasis: [],
          constraints: [],
          style: 'personalized'
        }
      })}::jsonb,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING
  `.execute(db);

  // Update AI program to point to version
  await sql`
    UPDATE programs
    SET published_version_id = ${AI_VERSION_ID}::uuid
    WHERE id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);

  console.log('Consolidated schema migration complete!');
}

// =============================================================================
// MIGRATION DOWN
// =============================================================================

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Rolling back consolidated schema...');

  // Drop tables in reverse order of dependencies

  // Tier 3: Program tables
  await db.schema.dropTable('program_enrollments').ifExists().execute();
  await db.schema.dropTable('fitness_plans').ifExists().execute();
  await db.schema.dropTable('program_family_programs').ifExists().execute();
  await db.schema.dropTable('program_families').ifExists().execute();
  await db.schema.dropTable('program_versions').ifExists().execute();
  await db.schema.dropTable('programs').ifExists().execute();
  await db.schema.dropTable('program_owners').ifExists().execute();

  // Tier 2: User-dependent tables
  await db.schema.dropTable('message_queues').ifExists().execute();
  await db.schema.dropTable('day_configs').ifExists().execute();
  await db.schema.dropTable('referrals').ifExists().execute();
  await db.schema.dropTable('admin_activity_logs').ifExists().execute();
  await db.schema.dropTable('short_links').ifExists().execute();
  await db.schema.dropTable('user_onboarding').ifExists().execute();
  await db.schema.dropTable('workout_instances').ifExists().execute();
  await db.schema.dropTable('microcycles').ifExists().execute();
  await db.schema.dropTable('messages').ifExists().execute();
  await db.schema.dropTable('subscriptions').ifExists().execute();
  await db.schema.dropTable('profile_updates').ifExists().execute();
  await db.schema.dropTable('profiles').ifExists().execute();

  // Tier 1: No-FK tables
  await db.schema.dropTable('uploaded_images').ifExists().execute();
  await db.schema.dropTable('user_auth_codes').ifExists().execute();
  await db.schema.dropTable('page_visits').ifExists().execute();
  await db.schema.dropTable('prompts').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();

  // Drop function and extension
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column();`.execute(db);
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);

  console.log('Rollback complete');
}
