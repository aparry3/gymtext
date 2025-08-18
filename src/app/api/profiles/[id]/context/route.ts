import { NextRequest, NextResponse } from 'next/server';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { AIContextService } from '@/server/services/aiContextService';

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    // For now, we'll use the profile ID directly
    // TODO: Add proper authentication

    const db = postgresDb;
    const profileRepo = new FitnessProfileRepository(db);
    const contextService = new AIContextService();

    // Get profile
    const profile = await profileRepo.getProfile(id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Build AI context
    const aiContext = contextService.buildAIContext(profile);

    return NextResponse.json({
      context: aiContext,
      profile: {
        version: profile.version,
        primaryGoal: profile.primaryGoal,
        experienceLevel: profile.experienceLevel,
        constraints: profile.constraints,
      },
    });
  } catch (error) {
    console.error('Error fetching profile context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile context' },
      { status: 500 }
    );
  }
}