import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';
import type { UserServiceInstance } from '../domain/user/userService';
import type { ProgramRepository } from '@/server/repositories/programRepository';
import type { ProgramEnrollmentRepository } from '@/server/repositories/programEnrollmentRepository';
import type { MessagingOrchestratorInstance } from './messagingOrchestrator';
import { buildCoachLink } from '@/server/utils/coachLink';

export type CoachLinkSource = 'welcome' | 'intent' | 'milestone' | 'churn';

export interface SendCoachLinkResult {
  sent: boolean;
  reason?:
    | 'not_enrolled'
    | 'not_enabled'
    | 'no_url'
    | 'cooldown'
    | 'send_failed'
    | 'user_not_found';
  link?: string;
}

export interface CoachSchedulingServiceInstance {
  sendCoachLink(userId: string, source: CoachLinkSource): Promise<SendCoachLinkResult>;
}

export interface CoachSchedulingServiceDeps {
  user: UserServiceInstance;
  programRepository: ProgramRepository;
  enrollmentRepository: ProgramEnrollmentRepository;
  messagingOrchestrator: MessagingOrchestratorInstance;
  db: Kysely<DB>;
}

const COACH_LINK_MESSAGE_TYPE = 'coach_link';

/**
 * Cooldown windows (in days) per source.
 * Layered triggers funnel through this single helper, so cooldowns live here.
 */
const COOLDOWN_DAYS: Record<CoachLinkSource, number> = {
  welcome: 0, // welcome is gated by the caller (once-per-enrollment), no cooldown needed
  intent: 7,
  milestone: 0, // gated by caller (once per milestone)
  churn: 30,
};

/**
 * CoachSchedulingService
 *
 * Single entry point for all "send the coach calendar link" flows.
 * Layers (welcome / intent / milestone / churn) all funnel through `sendCoachLink`.
 */
export function createCoachSchedulingService(
  deps: CoachSchedulingServiceDeps,
): CoachSchedulingServiceInstance {
  const { user: userService, programRepository, enrollmentRepository, messagingOrchestrator, db } = deps;

  async function wasSentRecently(clientId: string, days: number): Promise<boolean> {
    if (days <= 0) return false;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const row = await db
      .selectFrom('messages')
      .select('id')
      .where('clientId', '=', clientId)
      .where('messageType', '=', COACH_LINK_MESSAGE_TYPE)
      .where('createdAt', '>=', cutoff)
      .limit(1)
      .executeTakeFirst();
    return !!row;
  }

  return {
    async sendCoachLink(userId, source): Promise<SendCoachLinkResult> {
      const user = await userService.getUser(userId);
      if (!user) return { sent: false, reason: 'user_not_found' };

      const enrollment = await enrollmentRepository.findActiveByClientId(userId);
      if (!enrollment) return { sent: false, reason: 'not_enrolled' };

      const program = await programRepository.findById(enrollment.programId);
      if (!program) return { sent: false, reason: 'not_enrolled' };

      if (!program.schedulingEnabled) return { sent: false, reason: 'not_enabled' };
      if (!program.schedulingUrl) return { sent: false, reason: 'no_url' };

      const cooldownDays = COOLDOWN_DAYS[source];
      if (await wasSentRecently(userId, cooldownDays)) {
        return { sent: false, reason: 'cooldown' };
      }

      const link = buildCoachLink(
        { id: user.id, name: user.name, email: user.email ?? null },
        { schedulingEnabled: program.schedulingEnabled, schedulingUrl: program.schedulingUrl },
      );
      if (!link) return { sent: false, reason: 'no_url' };

      const intro = source === 'welcome'
        ? `Heads up — ${program.name} includes time with your coach. Grab a slot whenever you're ready:`
        : `Want to hop on a quick call with your coach? Grab a time here:`;

      const note = program.schedulingNotes ? `\n\n${program.schedulingNotes}` : '';
      const content = `${intro}\n${link}${note}`;

      const result = await messagingOrchestrator.sendImmediate(
        user,
        content,
        undefined,
        undefined,
        COACH_LINK_MESSAGE_TYPE,
      );

      if (!result.success) {
        return { sent: false, reason: 'send_failed', link };
      }
      return { sent: true, link };
    },
  };
}
