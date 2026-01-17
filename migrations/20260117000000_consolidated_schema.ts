import { Kysely, sql } from 'kysely';

/**
 * Consolidated Schema Migration (IDEMPOTENT)
 *
 * This migration creates the complete GymText database schema from scratch.
 * It consolidates 51 individual migrations into a single file.
 *
 * IDEMPOTENT: This migration uses IF NOT EXISTS, CREATE OR REPLACE, and ON CONFLICT
 * so it can run safely on both:
 * - Fresh databases: Creates everything normally
 * - Existing databases: Skips existing objects, records migration as applied
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
  console.log('Starting consolidated schema migration (idempotent)...');

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
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(255) NOT NULL,
      phone_number varchar(20) NOT NULL UNIQUE,
      age integer,
      gender varchar(20),
      email varchar(255) UNIQUE,
      stripe_customer_id varchar(255) UNIQUE,
      preferred_send_hour integer NOT NULL DEFAULT 8,
      timezone varchar(50) NOT NULL DEFAULT 'America/New_York',
      referral_code varchar(8) UNIQUE,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT check_preferred_send_hour CHECK (preferred_send_hour >= 0 AND preferred_send_hour <= 23)
    )
  `.execute(db);

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `.execute(db);

  // 2. PROMPTS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS prompts (
      id text NOT NULL,
      role text NOT NULL,
      value text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, role, created_at)
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS prompts_id_role_created_idx ON prompts (id, role, created_at)`.execute(db);

  // 3. PAGE_VISITS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS page_visits (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      page varchar(100) NOT NULL,
      ip_address varchar(45),
      user_agent text,
      referrer text,
      source varchar(100),
      utm_source varchar(255),
      utm_medium varchar(255),
      utm_campaign varchar(255),
      utm_content varchar(255),
      utm_term varchar(255),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_page_visits_source ON page_visits (source)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits (created_at)`.execute(db);

  // 4. USER_AUTH_CODES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS user_auth_codes (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      phone_number text NOT NULL,
      code varchar(6) NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS user_auth_codes_phone_code_idx ON user_auth_codes (phone_number, code, expires_at)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS user_auth_codes_expires_at_idx ON user_auth_codes (expires_at)`.execute(db);

  // 5. UPLOADED_IMAGES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS uploaded_images (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      url text NOT NULL,
      filename varchar(255) NOT NULL,
      display_name varchar(255),
      content_type varchar(100) NOT NULL,
      size_bytes integer NOT NULL,
      category varchar(50) DEFAULT 'general',
      tags jsonb DEFAULT '[]'::jsonb,
      uploaded_by varchar(50),
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS uploaded_images_category_idx ON uploaded_images (category)`.execute(db);

  // ============================================
  // TIER 2: TABLES WITH FK TO USERS
  // ============================================
  console.log('Creating Tier 2 tables (→users)...');

  // 6. PROFILES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      profile text NOT NULL,
      structured jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_profiles_client_created ON profiles (client_id, created_at)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_profiles_client ON profiles (client_id)`.execute(db);

  // 7. PROFILE_UPDATES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS profile_updates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      patch jsonb NOT NULL,
      path text,
      source text NOT NULL,
      reason text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  // 8. SUBSCRIPTIONS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_subscription_id varchar(255) NOT NULL UNIQUE,
      status varchar(50) NOT NULL,
      plan_type varchar(50) NOT NULL,
      current_period_start timestamptz NOT NULL,
      current_period_end timestamptz NOT NULL,
      canceled_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `.execute(db);

  // 9. MESSAGES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id uuid,
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      direction varchar(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
      content text NOT NULL,
      phone_from varchar(20),
      phone_to varchar(20),
      provider_message_id varchar(100),
      provider varchar(20) NOT NULL DEFAULT 'twilio',
      delivery_status varchar(20) NOT NULL DEFAULT 'pending',
      delivery_error text,
      delivery_attempts integer NOT NULL DEFAULT 0,
      last_delivery_attempt_at timestamptz,
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  // 10. MICROCYCLES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS microcycles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      absolute_week integer NOT NULL DEFAULT 1,
      start_date timestamp NOT NULL,
      end_date timestamp NOT NULL,
      days text[],
      is_deload boolean NOT NULL DEFAULT false,
      is_active boolean DEFAULT true,
      description text,
      message text,
      structured jsonb,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_microcycles_updated_at') THEN
        CREATE TRIGGER update_microcycles_updated_at
        BEFORE UPDATE ON microcycles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_client_date ON microcycles (client_id, start_date)`.execute(db);

  // 11. WORKOUT_INSTANCES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS workout_instances (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      microcycle_id uuid REFERENCES microcycles(id) ON DELETE SET NULL,
      date date NOT NULL,
      session_type varchar(50) NOT NULL,
      goal text,
      description text,
      reasoning text,
      message text,
      details jsonb NOT NULL,
      structured jsonb,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workout_instances_updated_at') THEN
        CREATE TRIGGER update_workout_instances_updated_at
        BEFORE UPDATE ON workout_instances
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `.execute(db);

  // 12. USER_ONBOARDING TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS user_onboarding (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      signup_data jsonb,
      status text NOT NULL DEFAULT 'pending',
      current_step integer,
      started_at timestamptz,
      completed_at timestamptz,
      error_message text,
      program_messages_sent boolean DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding (client_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_user_onboarding_status ON user_onboarding (status)`.execute(db);

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_onboarding_updated_at') THEN
        CREATE TRIGGER update_user_onboarding_updated_at
        BEFORE UPDATE ON user_onboarding
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `.execute(db);

  // 13. SHORT_LINKS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS short_links (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      code varchar(5) NOT NULL UNIQUE,
      target_path text NOT NULL,
      client_id uuid REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_accessed_at timestamptz,
      access_count integer NOT NULL DEFAULT 0
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS short_links_code_idx ON short_links (code)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS short_links_user_id_idx ON short_links (client_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS short_links_expires_at_idx ON short_links (expires_at)`.execute(db);

  // 14. ADMIN_ACTIVITY_LOGS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_client_id uuid,
      target_client_id uuid NOT NULL,
      action text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      result text NOT NULL,
      error_message text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  // 15. REFERRALS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS referrals (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referee_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      credit_applied boolean NOT NULL DEFAULT false,
      credit_amount_cents integer DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      credited_at timestamptz
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals (referrer_id)`.execute(db);

  // 16. DAY_CONFIGS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS day_configs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date NOT NULL,
      scope_type varchar(20) NOT NULL DEFAULT 'global',
      scope_id uuid,
      config jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT day_configs_date_scope_unique UNIQUE (date, scope_type, scope_id)
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS day_configs_date_idx ON day_configs (date)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS day_configs_scope_idx ON day_configs (scope_type, scope_id)`.execute(db);

  // 17. MESSAGE_QUEUES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS message_queues (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      queue_name varchar(50) NOT NULL,
      sequence_number integer NOT NULL,
      message_content text,
      media_urls jsonb,
      status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
      message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
      retry_count integer NOT NULL DEFAULT 0,
      max_retries integer NOT NULL DEFAULT 3,
      timeout_minutes integer NOT NULL DEFAULT 10,
      error_message text,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      sent_at timestamptz,
      delivered_at timestamptz
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS message_queues_user_queue_sequence_idx ON message_queues (client_id, queue_name, sequence_number)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS message_queues_user_status_idx ON message_queues (client_id, status)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS message_queues_message_id_idx ON message_queues (message_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS message_queues_sent_at_status_idx ON message_queues (sent_at, status)`.execute(db);

  // ============================================
  // TIER 3: PROGRAM-RELATED TABLES
  // ============================================
  console.log('Creating Tier 3 tables (programs)...');

  // 18. PROGRAM_OWNERS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS program_owners (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      owner_type varchar(20) NOT NULL,
      display_name varchar(100) NOT NULL,
      bio text,
      avatar_url text,
      stripe_connect_account_id varchar(255),
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_program_owners_user_id ON program_owners (user_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_program_owners_type ON program_owners (owner_type)`.execute(db);

  // 19. PROGRAMS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS programs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid NOT NULL REFERENCES program_owners(id) ON DELETE CASCADE,
      name varchar(200) NOT NULL,
      description text,
      scheduling_mode varchar(20) NOT NULL DEFAULT 'rolling_start',
      cadence varchar(30) NOT NULL DEFAULT 'calendar_days',
      late_joiner_policy varchar(30) DEFAULT 'start_from_beginning',
      billing_model varchar(30) DEFAULT 'subscription',
      revenue_split_percent integer DEFAULT 70,
      is_active boolean NOT NULL DEFAULT true,
      is_public boolean NOT NULL DEFAULT false,
      published_version_id uuid,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_programs_owner_id ON programs (owner_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_programs_active_public ON programs (is_active, is_public)`.execute(db);

  // 20. PROGRAM_VERSIONS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS program_versions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      version_number integer NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'draft',
      template_markdown text,
      template_structured jsonb,
      generation_config jsonb,
      default_duration_weeks integer,
      difficulty_metadata jsonb,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      published_at timestamptz,
      archived_at timestamptz
    )
  `.execute(db);

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_program_versions_program_version ON program_versions (program_id, version_number)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_program_versions_program_id ON program_versions (program_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_program_versions_status ON program_versions (status)`.execute(db);

  // Add FK from programs.published_version_id to program_versions (idempotent)
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_programs_published_version'
      ) THEN
        ALTER TABLE programs ADD CONSTRAINT fk_programs_published_version
        FOREIGN KEY (published_version_id) REFERENCES program_versions(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_programs_published_version ON programs (published_version_id)`.execute(db);

  // 21. PROGRAM_FAMILIES TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS program_families (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid REFERENCES program_owners(id) ON DELETE SET NULL,
      family_type varchar(30) NOT NULL,
      name varchar(200) NOT NULL,
      slug varchar(200) NOT NULL,
      description text,
      visibility varchar(20) NOT NULL DEFAULT 'public',
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_program_families_owner_id ON program_families (owner_id)`.execute(db);
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_program_families_slug ON program_families (slug)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_program_families_type ON program_families (family_type)`.execute(db);

  // 22. PROGRAM_FAMILY_PROGRAMS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS program_family_programs (
      family_id uuid NOT NULL REFERENCES program_families(id) ON DELETE CASCADE,
      program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      sort_order integer NOT NULL DEFAULT 0,
      role varchar(20),
      pinned boolean NOT NULL DEFAULT false,
      PRIMARY KEY (family_id, program_id)
    )
  `.execute(db);

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_program_family_programs_sort ON program_family_programs (family_id, sort_order)`.execute(db);

  // 23. FITNESS_PLANS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS fitness_plans (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      legacy_client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id uuid REFERENCES users(id) ON DELETE CASCADE,
      program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
      program_version_id uuid REFERENCES program_versions(id) ON DELETE SET NULL,
      start_date date NOT NULL,
      description text,
      message text,
      structured jsonb,
      status varchar(20) DEFAULT 'active',
      personalization_snapshot jsonb,
      current_state jsonb,
      published_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fitness_plans_updated_at') THEN
        CREATE TRIGGER update_fitness_plans_updated_at
        BEFORE UPDATE ON fitness_plans
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_program_id ON fitness_plans (program_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_published_at ON fitness_plans (published_at)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_client_id ON fitness_plans (client_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_program_version_id ON fitness_plans (program_version_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_status ON fitness_plans (status)`.execute(db);

  // 24. PROGRAM_ENROLLMENTS TABLE
  await sql`
    CREATE TABLE IF NOT EXISTS program_enrollments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      program_version_id uuid REFERENCES program_versions(id) ON DELETE SET NULL,
      cohort_id varchar(100),
      cohort_start_date date,
      start_date date NOT NULL,
      current_week integer NOT NULL DEFAULT 1,
      status varchar(20) NOT NULL DEFAULT 'active',
      enrolled_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_client_program ON program_enrollments (client_id, program_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_client_id ON program_enrollments (client_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_program_id ON program_enrollments (program_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_status ON program_enrollments (status)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON program_enrollments (program_id, cohort_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_program_version_id ON program_enrollments (program_version_id)`.execute(db);

  // ============================================
  // SEED SYSTEM DATA
  // ============================================
  console.log('Seeding system data...');

  // Seed prompts (idempotent - ON CONFLICT DO NOTHING)
  console.log('Seeding prompts...');
  for (const prompt of PROMPTS_TO_SEED) {
    await sql`
      INSERT INTO prompts (id, role, value)
      VALUES (${prompt.id}, ${prompt.role}, ${prompt.value})
      ON CONFLICT (id, role, created_at) DO NOTHING
    `.execute(db);
  }

  // Seed AI program owner (idempotent)
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

  // Seed AI program (idempotent)
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

  // Seed AI program version (idempotent)
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

  // Update AI program to point to version (idempotent - only updates if not already set)
  await sql`
    UPDATE programs
    SET published_version_id = ${AI_VERSION_ID}::uuid
    WHERE id = ${AI_PROGRAM_ID}::uuid
      AND (published_version_id IS NULL OR published_version_id != ${AI_VERSION_ID}::uuid)
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
