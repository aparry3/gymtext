import { Kysely, sql } from 'kysely';

/**
 * Agent Config Columns Migration
 *
 * Adds extended configuration columns to agent_definitions for the declarative
 * agent architecture: tools, context, sub-agents, hooks, schemas, validation, templates.
 *
 * NOTE: This migration was already applied to the database. This file is recreated
 * for documentation and reproducibility.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding agent config columns...');

  // Add new columns
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS tool_ids TEXT[]`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS context_types TEXT[]`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS sub_agents JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS hooks JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS tool_hooks JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS schema_json JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS validation_rules JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS user_prompt_template TEXT`.execute(db);

  // Seed extended config for each agent
  console.log('Seeding extended agent configs...');

  // chat:generate - tools + context + tool hooks
  await sql`
    UPDATE agent_definitions SET
      tool_ids = ARRAY['update_profile', 'make_modification', 'get_workout'],
      context_types = ARRAY['dateContext', 'currentWorkout'],
      tool_hooks = '{"make_modification": {"preHook": {"hook": "sendMessage", "source": "args.message"}}}'::jsonb
    WHERE agent_id = 'chat:generate' AND is_active = true
  `.execute(db);

  // modifications:router - tools
  await sql`
    UPDATE agent_definitions SET
      tool_ids = ARRAY['modify_workout', 'modify_week', 'modify_plan']
    WHERE agent_id = 'modifications:router' AND is_active = true
  `.execute(db);

  // profile:fitness - schema + sub-agents
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["updatedProfile","wasUpdated","updateSummary"],"properties":{"updatedProfile":{"type":"string","description":"The complete updated Markdown profile document"},"wasUpdated":{"type":"boolean","description":"Whether any changes were made to the profile"},"updateSummary":{"type":"string","description":"Brief summary of changes made. Empty string if nothing was updated."}},"additionalProperties":false}'::jsonb,
      sub_agents = '[{"batch":0,"key":"structured","agentId":"profile:structured","condition":[{"field":"wasUpdated","check":"truthy"}],"inputMapping":{"dossierText":"$result.updatedProfile","currentDate":"$now"}}]'::jsonb
    WHERE agent_id = 'profile:fitness' AND is_active = true
  `.execute(db);

  // profile:structured - schema + template
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["goals","experienceLevel","preferences","injuries","constraints","equipmentAccess"],"properties":{"goals":{"type":"array","items":{"type":"string"},"description":"User''s stated fitness goals"},"experienceLevel":{"type":["string","null"],"enum":["beginner","intermediate","advanced",null],"description":"User''s experience level or null"},"preferences":{"type":"array","items":{"type":"string"},"description":"Exercise likes/dislikes, scheduling preferences"},"injuries":{"type":"array","items":{"type":"string"},"description":"Permanent physical limitations or chronic injuries"},"constraints":{"type":"array","items":{"type":"object","required":["value","start","end"],"properties":{"value":{"type":"string"},"start":{"type":["string","null"]},"end":{"type":["string","null"]}}},"description":"Temporary constraints with optional start/end dates"},"equipmentAccess":{"type":"array","items":{"type":"string"},"description":"Equipment access and limitations"}},"additionalProperties":false}'::jsonb,
      user_prompt_template = '## CURRENT DATE
{{currentDate}}

## PROFILE TO PARSE

{{dossierText}}

## YOUR TASK
Parse this profile into the structured format. Extract all relevant information following the rules above.'
    WHERE agent_id = 'profile:structured' AND is_active = true
  `.execute(db);

  // profile:user - schema
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["timezone","preferredSendHour","name","hasUpdates","updateSummary"],"properties":{"timezone":{"type":["string","null"],"description":"IANA timezone string or null"},"preferredSendHour":{"type":["integer","null"],"minimum":0,"maximum":23,"description":"Preferred send hour (0-23) or null"},"name":{"type":["string","null"],"description":"User name or null"},"hasUpdates":{"type":"boolean","description":"Whether any fields were updated"},"updateSummary":{"type":"string","description":"Summary of updates"}},"additionalProperties":false}'::jsonb
    WHERE agent_id = 'profile:user' AND is_active = true
  `.execute(db);

  // workout:generate - context + sub-agents
  await sql`
    UPDATE agent_definitions SET
      context_types = ARRAY['userProfile', 'experienceLevel', 'dayOverview', 'trainingMeta'],
      sub_agents = '[{"batch":0,"key":"message","agentId":"workout:message"},{"batch":0,"key":"structure","agentId":"workout:structured"}]'::jsonb
    WHERE agent_id = 'workout:generate' AND is_active = true
  `.execute(db);

  // workout:structured - schema + sub-agents + validation
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["title"],"properties":{"title":{"type":"string","description":"Concise workout name, 2-4 words max"},"description":{"type":"string","default":""},"focus":{"type":"string","default":"","description":"Brief focus area, 1-3 words"},"intensityLevel":{"type":"string","enum":["Low","Moderate","High","Severe"],"default":"Moderate"},"estimatedDurationMin":{"type":"number","default":-1},"quote":{"type":"object","default":{"text":"","author":""},"properties":{"text":{"type":"string","default":""},"author":{"type":"string","default":""}}},"sections":{"type":"array","default":[],"items":{"type":"object","required":["title"],"properties":{"title":{"type":"string"},"overview":{"type":"string","default":""},"exercises":{"type":"array","default":[],"items":{"type":"object","required":["name"],"properties":{"name":{"type":"string"},"type":{"type":"string","enum":["Strength","Cardio","Plyometric","Mobility","Rest","Other"],"default":"Strength"},"sets":{"type":"string","default":""},"reps":{"type":"string","default":""},"rest":{"type":"string","default":""},"tempo":{"type":"string","default":""},"duration":{"type":"string","default":""},"distance":{"type":"string","default":""},"notes":{"type":"string","default":""},"tags":{"type":"array","items":{"type":"string"},"default":[]},"supersetId":{"type":"string","default":""},"intensity":{"type":"object","default":{"type":"Other","value":"","description":""},"properties":{"type":{"type":"string","enum":["RPE","RIR","Percentage","Zone","HeartRate","Pace","Other"],"default":"Other"},"value":{"type":"string","default":""},"description":{"type":"string","default":""}}}}}}}}}},"additionalProperties":false}'::jsonb,
      sub_agents = '[{"batch":0,"key":"validation","agentId":"workout:structured:validate","inputMapping":{"input":"$parentInput","output":"$result"}}]'::jsonb,
      validation_rules = '[{"field":"validation.isValid","check":"equals","expected":true,"error":"Workout structure failed validation"}]'::jsonb
    WHERE agent_id = 'workout:structured' AND is_active = true
  `.execute(db);

  // workout:structured:validate - schema + template
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["isValid","errors"],"properties":{"isValid":{"type":"boolean","description":"Whether the structured workout is valid and complete"},"errors":{"type":"array","items":{"type":"string"},"description":"List of validation errors if invalid"}},"additionalProperties":false}'::jsonb,
      user_prompt_template = 'Validate the following workout structure against the generation input.

## GENERATION INPUT
{{input}}

## STRUCTURED OUTPUT
{{output}}'
    WHERE agent_id = 'workout:structured:validate' AND is_active = true
  `.execute(db);

  // workout:modify - context + schema + sub-agents
  await sql`
    UPDATE agent_definitions SET
      context_types = ARRAY['userProfile', 'currentWorkout'],
      schema_json = '{"type":"object","required":["overview","wasModified","modifications"],"properties":{"overview":{"type":"string","description":"Full workout text after modifications (or original if unchanged)"},"wasModified":{"type":"boolean","description":"Whether the workout was actually modified"},"modifications":{"type":"string","default":"","description":"Explanation of what changed and why"}},"additionalProperties":false}'::jsonb,
      sub_agents = '[{"batch":0,"key":"message","agentId":"workout:message","inputMapping":{"message":"$result.overview"}},{"batch":0,"key":"structure","agentId":"workout:structured","inputMapping":{"message":"$result.overview"}}]'::jsonb
    WHERE agent_id = 'workout:modify' AND is_active = true
  `.execute(db);

  // microcycle:generate - context + schema + sub-agents
  await sql`
    UPDATE agent_definitions SET
      context_types = ARRAY['fitnessPlan', 'userProfile', 'experienceLevel', 'trainingMeta'],
      schema_json = '{"type":"object","required":["overview","isDeload","days"],"properties":{"overview":{"type":"string","description":"Comprehensive weekly overview"},"isDeload":{"type":"boolean","default":false,"description":"Whether this is a deload week"},"days":{"type":"array","minItems":7,"maxItems":7,"items":{"type":"string"},"description":"Exactly 7 day overview strings"}},"additionalProperties":false}'::jsonb,
      sub_agents = '[{"batch":0,"key":"message","agentId":"microcycle:message","inputMapping":{"overview":"$result.overview","days":"$result.days","isDeload":"$result.isDeload"}},{"batch":0,"key":"structure","agentId":"microcycle:structured","inputMapping":{"overview":"$result.overview","days":"$result.days","absoluteWeek":"$extras.absoluteWeek","isDeload":"$result.isDeload"}}]'::jsonb
    WHERE agent_id = 'microcycle:generate' AND is_active = true
  `.execute(db);

  // microcycle:structured - schema
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["days"],"properties":{"overview":{"type":"string","default":""},"isDeload":{"type":"boolean","default":false},"weekNumber":{"type":"number","default":-1},"phase":{"type":"string","default":""},"days":{"type":"array","minItems":7,"maxItems":7,"items":{"type":"object","required":["day"],"properties":{"day":{"type":"string","enum":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},"focus":{"type":"string","default":""},"activityType":{"type":"string","enum":["TRAINING","ACTIVE_RECOVERY","REST"],"default":"TRAINING"},"notes":{"type":"string","default":""}}}}},"additionalProperties":false}'::jsonb
    WHERE agent_id = 'microcycle:structured' AND is_active = true
  `.execute(db);

  // microcycle:modify - context + schema + sub-agents
  await sql`
    UPDATE agent_definitions SET
      context_types = ARRAY['user', 'userProfile', 'currentMicrocycle', 'dateContext'],
      schema_json = '{"type":"object","required":["overview","isDeload","days","wasModified","modifications"],"properties":{"overview":{"type":"string"},"isDeload":{"type":"boolean","default":false},"days":{"type":"array","minItems":7,"maxItems":7,"items":{"type":"string"}},"wasModified":{"type":"boolean","description":"Whether the microcycle was actually modified"},"modifications":{"type":"string","default":"","description":"Explanation of what changed and why"}},"additionalProperties":false}'::jsonb,
      sub_agents = '[{"batch":0,"key":"message","agentId":"microcycle:message","inputMapping":{"overview":"$result.overview","days":"$result.days","isDeload":"$result.isDeload"}},{"batch":0,"key":"structure","agentId":"microcycle:structured","inputMapping":{"overview":"$result.overview","days":"$result.days","absoluteWeek":"$extras.absoluteWeek","isDeload":"$result.isDeload"}}]'::jsonb
    WHERE agent_id = 'microcycle:modify' AND is_active = true
  `.execute(db);

  // plan:generate - context + sub-agents
  await sql`
    UPDATE agent_definitions SET
      context_types = ARRAY['programVersion', 'user', 'userProfile'],
      sub_agents = '[{"batch":0,"key":"message","agentId":"plan:message","inputMapping":{"userName":"$user.name","userProfile":"$user.profile","overview":"$result"}},{"batch":0,"key":"structure","agentId":"plan:structured","inputMapping":{"message":"$result"}}]'::jsonb
    WHERE agent_id = 'plan:generate' AND is_active = true
  `.execute(db);

  // plan:structured - schema + template
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["name"],"properties":{"name":{"type":"string","description":"e.g. ''Strength + Lean Build Phase''"},"type":{"type":"string","default":""},"frequencyPerWeek":{"type":"number","default":-1},"durationWeeks":{"type":"number","default":-1},"coreStrategy":{"type":"string","default":""},"progressionStrategy":{"type":"array","items":{"type":"string"},"default":[]},"adjustmentStrategy":{"type":"string","default":""},"conditioning":{"type":"array","items":{"type":"string"},"default":[]},"scheduleTemplate":{"type":"array","default":[],"items":{"type":"object","required":["day"],"properties":{"day":{"type":"string"},"focus":{"type":"string","default":""},"rationale":{"type":"string","default":""}}}}},"additionalProperties":false}'::jsonb,
      user_prompt_template = 'Parse the following fitness plan into structured format:

{{message}}'
    WHERE agent_id = 'plan:structured' AND is_active = true
  `.execute(db);

  // plan:message - template
  await sql`
    UPDATE agent_definitions SET
      user_prompt_template = 'Generate a short, friendly onboarding SMS for the client below based on their new fitness plan.

<User>
Name: {{userName}}
</User>

<User Profile>
{{userProfile}}
</User Profile>

<Fitness Plan>
{{overview}}
</Fitness Plan>

Guidelines:
- This message is sent right after the trainer finishes creating the plan.
- It should sound natural and personal, as if the coach is texting the client directly.
- Focus on what the plan does and how it''s structured.
- Translate complex language into clear, human terms.
- Limit to 1 or 2 messages total (each under 160 characters).
- Do not greet or include the client''s name.
- Use first-person tone.
- Avoid em dashes and long sentences.
- Output only the message text (no JSON wrapper).'
    WHERE agent_id = 'plan:message' AND is_active = true
  `.execute(db);

  // plan:modify - context + schema + sub-agents
  await sql`
    UPDATE agent_definitions SET
      context_types = ARRAY['programVersion', 'user', 'userProfile', 'fitnessPlan'],
      schema_json = '{"type":"object","required":["description","wasModified","modifications"],"properties":{"description":{"type":"string","description":"The updated structured text plan"},"wasModified":{"type":"boolean","description":"Whether the plan was actually modified"},"modifications":{"type":"string","default":"","description":"Explanation of what changed and why"}},"additionalProperties":false}'::jsonb,
      sub_agents = '[{"batch":0,"key":"structure","agentId":"plan:structured","inputMapping":{"message":"$result"}}]'::jsonb
    WHERE agent_id = 'plan:modify' AND is_active = true
  `.execute(db);

  // messaging:plan-summary - schema
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["messages"],"properties":{"messages":{"type":"array","items":{"type":"string"},"description":"Array of SMS messages (each under 160 chars)"}},"additionalProperties":false}'::jsonb
    WHERE agent_id = 'messaging:plan-summary' AND is_active = true
  `.execute(db);

  // blog:metadata - schema
  await sql`
    UPDATE agent_definitions SET
      schema_json = '{"type":"object","required":["title","description","tags","metaTitle","metaDescription"],"properties":{"title":{"type":"string","description":"Engaging blog post title"},"description":{"type":"string","description":"Brief description for listings"},"tags":{"type":"array","items":{"type":"string"},"description":"Relevant topic tags"},"metaTitle":{"type":"string","description":"SEO title (max 70 chars)"},"metaDescription":{"type":"string","description":"SEO description (max 160 chars)"}},"additionalProperties":false}'::jsonb
    WHERE agent_id = 'blog:metadata' AND is_active = true
  `.execute(db);

  console.log('Agent config columns migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back agent config columns...');

  // Clear extended config data
  await sql`
    UPDATE agent_definitions SET
      tool_ids = NULL,
      context_types = NULL,
      sub_agents = NULL,
      hooks = NULL,
      tool_hooks = NULL,
      schema_json = NULL,
      validation_rules = NULL,
      user_prompt_template = NULL
  `.execute(db);

  // Drop columns
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS tool_ids`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS context_types`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS sub_agents`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS hooks`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS tool_hooks`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS schema_json`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS validation_rules`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS user_prompt_template`.execute(db);

  console.log('Agent config columns rollback complete!');
}
