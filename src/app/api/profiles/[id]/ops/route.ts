import { NextRequest, NextResponse } from 'next/server';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { ProfileUpdateOp, FitnessProfile } from '@/server/models/fitnessProfile';
import { z } from 'zod';

// Request validation schemas
const PatchRequestSchema = z.object({
  patch: z.record(z.any()),
  source: z.string().optional().default('api'),
  metadata: z.string().optional(),
});

const OpRequestSchema = z.object({
  op: z.object({
    kind: z.enum(['add_constraint', 'update_constraint', 'resolve_constraint', 'set', 'remove']),
    constraint: z.object({
      type: z.enum(['injury', 'equipment', 'schedule', 'mobility', 'preference', 'other']),
      label: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe']).optional(),
      modifications: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional(),
    id: z.string().optional(),
    path: z.string().optional(),
    value: z.any().optional(),
    endDate: z.string().optional(),
  }),
  source: z.string().optional().default('api'),
  metadata: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // For now, we'll use the profile ID directly
    // TODO: Add proper authentication

    const body = await request.json();
    const db = postgresDb;
    const updateService = new ProfileUpdateService(db);

    // Determine operation type
    if ('patch' in body) {
      // Merge patch operation
      const validated = PatchRequestSchema.parse(body);
      const updatedProfile = await updateService.applyPatch(
        id,
        validated.patch as Partial<FitnessProfile>,
        validated.source,
        validated.metadata
      );

      return NextResponse.json({
        success: true,
        operation: 'patch',
        applied: validated.patch,
        profile: updatedProfile,
      });
    } else if ('op' in body) {
      // Domain operation
      const validated = OpRequestSchema.parse(body);
      const updatedProfile = await updateService.applyOp(
        id,
        validated.op as ProfileUpdateOp,
        validated.source,
        validated.metadata
      );

      return NextResponse.json({
        success: true,
        operation: validated.op.kind,
        profile: updatedProfile,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid request: must include either "patch" or "op"' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error applying profile operation:', error);
    return NextResponse.json(
      { error: 'Failed to apply profile operation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // For now, we'll use the profile ID directly
    // TODO: Add proper authentication

    // Return available operations documentation
    return NextResponse.json({
      availableOperations: {
        patch: {
          description: 'Apply a merge patch to update profile fields',
          example: {
            patch: {
              primaryGoal: 'muscle gain',
              availability: { daysPerWeek: 4 },
            },
          },
        },
        ops: {
          add_constraint: {
            description: 'Add a new constraint (injury, limitation, etc.)',
            example: {
              op: {
                kind: 'add_constraint',
                constraint: {
                  type: 'injury',
                  label: 'Lower back pain',
                  severity: 'moderate',
                  modifications: 'Avoid heavy deadlifts, use belt for squats',
                },
              },
            },
          },
          resolve_constraint: {
            description: 'Mark a constraint as resolved',
            example: {
              op: {
                kind: 'resolve_constraint',
                id: 'constraint_id',
                endDate: '2024-01-01',
              },
            },
          },
          set: {
            description: 'Set a specific field value using JSON path',
            example: {
              op: {
                kind: 'set',
                path: '/metrics/bodyweight/value',
                value: 185,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching operations info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operations info' },
      { status: 500 }
    );
  }
}