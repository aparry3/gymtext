import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { parseDossierResponse } from '@/server/agents/dossierParser';
import { formatForAI } from '@/shared/utils/date';

/**
 * POST /api/users/regenerate
 *
 * Bulk regeneration for all active users with profiles.
 * Processes sequentially to avoid overloading LLM APIs.
 */
export async function POST() {
  const startTime = Date.now();

  try {
    const { services } = await getAdminContext();
    const { user: userService, markdown: markdownService, agentRunner, training: trainingService } = services;

    // Get all user IDs with profiles via user service
    const userIds = await userService.getUserIdsWithProfiles();

    const total = userIds.length;
    const results: {
      success: string[];
      skipped: string[];
      failed: { userId: string; error: string }[];
    } = { success: [], skipped: [], failed: [] };

    console.log(`[REGENERATE_ALL] Starting bulk regeneration for ${total} users`);

    // Process sequentially to avoid overloading LLM APIs
    for (const userId of userIds) {
      try {
        const user = await userService.getUser(userId);

        if (!user) {
          results.skipped.push(userId);
          continue;
        }

        console.log(`[REGENERATE_ALL] Processing user ${userId} (${user.name || user.phoneNumber})`);

        // Profile
        const existingProfile = await markdownService.getProfile(userId) ?? '';
        const currentDate = formatForAI(new Date(), user.timezone);

        const profileResult = await agentRunner.invoke('profile:update', {
          input: existingProfile || 'Regenerate profile from existing data.',
          context: existingProfile ? [`<Profile>${existingProfile}</Profile>`] : [],
          params: { user, currentDate },
        });

        const { dossierContent: updatedProfile } = parseDossierResponse(profileResult.response);
        if (updatedProfile) {
          const detailsPromise = agentRunner.invoke('profile:details', {
            input: updatedProfile,
            params: { user },
          })
            .then((r) => JSON.parse(r.response) as Record<string, unknown>)
            .catch(() => undefined);

          const [, profileDetails] = await Promise.all([
            markdownService.updateProfile(userId, updatedProfile),
            detailsPromise,
          ]);

          if (profileDetails) {
            await markdownService.updateProfileDetails(userId, profileDetails);
          }
        }

        // Plan
        const existingPlan = await markdownService.getPlan(userId);
        if (existingPlan) {
          const profileDossier = await markdownService.getProfile(userId);
          const context: string[] = [];
          if (profileDossier) context.push(`<Profile>${profileDossier}</Profile>`);
          const planContent = existingPlan.content || existingPlan.description || '';
          if (planContent) context.push(`<Plan>${planContent}</Plan>`);

          const planResult = await agentRunner.invoke('plan:modify', {
            input: 'Reformat this plan to match the current dossier structure. Preserve all training decisions, modifications, and periodization.',
            context,
            params: { user },
          });

          const { dossierContent: updatedPlan } = parseDossierResponse(planResult.response);
          if (updatedPlan) {
            const detailsResult = await agentRunner.invoke('plan:details', {
              input: updatedPlan,
              context,
              params: { user },
            })
              .then((r) => JSON.parse(r.response) as Record<string, unknown>)
              .catch(() => undefined);

            await markdownService.createPlan(
              userId,
              updatedPlan,
              existingPlan.startDate || new Date(),
              { details: detailsResult }
            );
          }
        }

        // Week
        const timezone = user.timezone || 'America/New_York';
        await trainingService.prepareMicrocycleForDate(userId, new Date(), timezone);

        results.success.push(userId);
        console.log(`[REGENERATE_ALL] Completed user ${userId}`);
      } catch (error) {
        console.error(`[REGENERATE_ALL] Failed for user ${userId}:`, error);
        results.failed.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const executionTimeMs = Date.now() - startTime;

    console.log(`[REGENERATE_ALL] Bulk regeneration complete: ${results.success.length}/${total} succeeded, ${results.failed.length} failed, ${results.skipped.length} skipped`);

    return NextResponse.json({
      success: true,
      data: {
        total,
        success: results.success.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
        errors: results.failed,
      },
      executionTimeMs,
    });
  } catch (error) {
    console.error('[REGENERATE_ALL] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
