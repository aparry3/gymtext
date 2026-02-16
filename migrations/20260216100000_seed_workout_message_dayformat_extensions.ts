import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Seed workout:message dayFormat extensions for TRAINING, REST, and ACTIVE_RECOVERY

  await db
    .insertInto('agent_extensions')
    .values([
      {
        agent_id: 'workout:message',
        extension_key: 'dayFormat:TRAINING',
        system_prompt: `You are formatting a TRAINING day message. Structure the message to motivate and prepare the athlete for their workout session. Include:
- A brief encouraging intro acknowledging it's a training day
- The workout exercises with clear sets/reps or time/distance
- Form cues or intensity guidance when relevant
- A brief closing that builds confidence

Keep the tone motivational but not over-the-top. Be clear and actionable.`,
        description: 'System prompt extension for formatting TRAINING day workout messages',
        metadata: {
          dayFormat: 'TRAINING',
          domain: 'workout:message',
        },
      },
      {
        agent_id: 'workout:message',
        extension_key: 'dayFormat:REST',
        system_prompt: `You are formatting a REST day message. Keep it brief and supportive. The message should:
- Acknowledge the rest day positively (recovery is part of training)
- Optionally mention light activity suggestions (walk, stretch, foam roll) if provided in the workout data
- Be encouraging about the upcoming training ahead
- Stay concise—rest day messages should be shorter than training day messages

Tone: calm, supportive, emphasizing recovery.`,
        description: 'System prompt extension for formatting REST day workout messages',
        metadata: {
          dayFormat: 'REST',
          domain: 'workout:message',
        },
      },
      {
        agent_id: 'workout:message',
        extension_key: 'dayFormat:ACTIVE_RECOVERY',
        system_prompt: `You are formatting an ACTIVE RECOVERY day message. These are lighter sessions focused on movement without intensity. Structure the message to:
- Explain it's an active recovery day (move, don't strain)
- List the prescribed activities (often low-intensity cardio, mobility, stretching)
- Emphasize easy effort—this is not a workout to push hard
- Keep it short and relaxed in tone

Tone: gentle, informative, focused on restoration.`,
        description: 'System prompt extension for formatting ACTIVE_RECOVERY day workout messages',
        metadata: {
          dayFormat: 'ACTIVE_RECOVERY',
          domain: 'workout:message',
        },
      },
    ])
    .onConflict((oc) =>
      oc.columns(['agent_id', 'extension_key']).doUpdateSet({
        system_prompt: (eb: any) => eb.ref('excluded.system_prompt'),
        description: (eb: any) => eb.ref('excluded.description'),
        metadata: (eb: any) => eb.ref('excluded.metadata'),
      })
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('agent_extensions')
    .where('agent_id', '=', 'workout:message')
    .where('extension_key', 'in', [
      'dayFormat:TRAINING',
      'dayFormat:REST',
      'dayFormat:ACTIVE_RECOVERY',
    ])
    .execute();
}
