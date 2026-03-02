import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { parseDossierResponse } from '@/server/agents/dossierParser';
import { formatForAI } from '@/shared/utils/date';

type Step = 'profile' | 'plan' | 'week';
const ALL_STEPS: Step[] = ['profile', 'plan', 'week'];

/**
 * POST /api/users/[id]/regenerate
 *
 * Regenerates profile/plan/week for a single user using the dossier pipeline.
 * Body: { steps?: Step[] } — defaults to all steps.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    let body: { steps?: Step[] } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    const steps = body.steps ?? ALL_STEPS;
    const { services } = await getAdminContext();
    const { user: userService, markdown: markdownService, agentRunner, training: trainingService } = services;

    const user = await userService.getUser(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const results: Record<string, { regenerated: boolean; planId?: string; wasCreated?: boolean; error?: string }> = {};

    // Step 1: Profile
    if (steps.includes('profile')) {
      try {
        console.log(`[REGENERATE] Starting profile regeneration for user ${userId}`);
        const existingProfile = await markdownService.getProfile(userId) ?? '';
        const currentDate = formatForAI(new Date(), user.timezone);

        const profileResult = await agentRunner.invoke('profile:update', {
          input: existingProfile || 'Regenerate profile from existing data.',
          context: existingProfile ? [`<Profile>${existingProfile}</Profile>`] : [],
          params: { user, currentDate },
        });

        const { dossierContent: updatedProfile } = parseDossierResponse(profileResult.response);

        if (updatedProfile) {
          // Extract details in parallel with save
          const detailsPromise = agentRunner.invoke('profile:details', {
            input: updatedProfile,
            params: { user },
          })
            .then((r) => JSON.parse(r.response) as Record<string, unknown>)
            .catch((error) => {
              console.error('[REGENERATE] Failed to generate profile details:', error);
              return undefined;
            });

          const [, profileDetails] = await Promise.all([
            markdownService.updateProfile(userId, updatedProfile),
            detailsPromise,
          ]);

          if (profileDetails) {
            await markdownService.updateProfileDetails(userId, profileDetails);
          }

          results.profile = { regenerated: true };
          console.log(`[REGENERATE] Profile regenerated for user ${userId}`);
        } else {
          results.profile = { regenerated: false, error: 'No content returned from agent' };
        }
      } catch (error) {
        console.error(`[REGENERATE] Profile error for user ${userId}:`, error);
        results.profile = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // Step 2: Plan
    if (steps.includes('plan')) {
      try {
        console.log(`[REGENERATE] Starting plan regeneration for user ${userId}`);
        const existingPlan = await markdownService.getPlan(userId);
        const profileDossier = await markdownService.getProfile(userId);

        if (!existingPlan) {
          results.plan = { regenerated: false, error: 'No existing plan found' };
        } else {
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
              .catch((error) => {
                console.error('[REGENERATE] Failed to generate plan details:', error);
                return undefined;
              });

            const savedPlan = await markdownService.createPlan(
              userId,
              updatedPlan,
              existingPlan.startDate || new Date(),
              { details: detailsResult }
            );

            results.plan = { regenerated: true, planId: savedPlan.id };
            console.log(`[REGENERATE] Plan regenerated for user ${userId}: ${savedPlan.id}`);
          } else {
            results.plan = { regenerated: false, error: 'No content returned from agent' };
          }
        }
      } catch (error) {
        console.error(`[REGENERATE] Plan error for user ${userId}:`, error);
        results.plan = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // Step 3: Week
    if (steps.includes('week')) {
      try {
        console.log(`[REGENERATE] Starting week regeneration for user ${userId}`);
        const timezone = user.timezone || 'America/New_York';
        const weekResult = await trainingService.prepareMicrocycleForDate(userId, new Date(), timezone);
        results.week = { regenerated: true, wasCreated: weekResult.wasCreated };
        console.log(`[REGENERATE] Week regenerated for user ${userId} (wasCreated: ${weekResult.wasCreated})`);
      } catch (error) {
        console.error(`[REGENERATE] Week error for user ${userId}:`, error);
        results.week = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: results,
      executionTimeMs,
    });
  } catch (error) {
    console.error('[REGENERATE] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
