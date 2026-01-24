import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { normalizeForSearch, normalizeForLex } from '@gymtext/shared/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { repos } = await getAdminContext();

    const exercise = await repos.exercise.findById(id);
    if (!exercise) {
      return NextResponse.json(
        { success: false, message: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Get movement data if present
    let movementSlug: string | null = null;
    let movementName: string | null = null;
    if (exercise.movementId) {
      const movement = await repos.movement.findById(exercise.movementId);
      if (movement) {
        movementSlug = movement.slug;
        movementName = movement.name;
      }
    }

    // Get aliases for the exercise
    const aliases = await repos.exerciseAlias.findByExerciseId(id);

    // Get all movements for the edit dropdown
    const allMovements = await repos.movement.findAll();

    // Format response
    const exerciseWithAliases = {
      id: exercise.id,
      name: exercise.name,
      slug: exercise.slug,
      type: exercise.type,
      mechanics: exercise.mechanics,
      equipment: exercise.equipment,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      trainingGroups: exercise.trainingGroups,
      movementPatterns: exercise.movementPatterns,
      modality: exercise.modality,
      intensity: exercise.intensity,
      shortDescription: exercise.shortDescription,
      instructions: exercise.instructions,
      cues: exercise.cues,
      popularity: Number(exercise.popularity) || 0,
      isActive: exercise.isActive,
      aliasCount: aliases.length,
      movementId: exercise.movementId,
      movementSlug,
      movementName,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      aliases: aliases.map(a => ({
        id: a.id,
        alias: a.alias,
        aliasNormalized: a.aliasNormalized,
        source: a.source,
        confidenceScore: a.confidenceScore ? parseFloat(a.confidenceScore) : null,
        isDefault: a.isDefault,
        createdAt: a.createdAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        exercise: exerciseWithAliases,
        movements: allMovements.map(m => ({ slug: m.slug, name: m.name })),
      }
    });

  } catch (error) {
    console.error('Error fetching exercise:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching exercise'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      slug,
      type,
      mechanics,
      trainingGroups,
      movementPatterns,
      equipment,
      primaryMuscles,
      secondaryMuscles,
      modality,
      intensity,
      shortDescription,
      instructions,
      cues,
      isActive,
      // Action-based updates
      action,
      // Alias management
      newAlias,
      deleteAliasId,
      // Movement assignment
      movementSlug,
      // Default alias
      setDefaultAlias,
    } = body;

    const { repos } = await getAdminContext();

    // Verify exercise exists
    const existing = await repos.exercise.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Handle alias deletion
    if (deleteAliasId) {
      const alias = await repos.exerciseAlias.findById(deleteAliasId);
      if (!alias) {
        return NextResponse.json(
          { success: false, message: 'Alias not found' },
          { status: 404 }
        );
      }
      if (alias.exerciseId !== id) {
        return NextResponse.json(
          { success: false, message: 'Alias does not belong to this exercise' },
          { status: 400 }
        );
      }
      await repos.exerciseAlias.delete(deleteAliasId);
      return NextResponse.json({ success: true, message: 'Alias deleted' });
    }

    // Handle new alias creation
    if (newAlias) {
      const normalizedAlias = normalizeForSearch(newAlias.alias);

      // Check if normalized alias already exists
      const existingAlias = await repos.exerciseAlias.findByNormalizedAlias(normalizedAlias);
      if (existingAlias) {
        return NextResponse.json(
          { success: false, message: 'This alias already exists for an exercise' },
          { status: 409 }
        );
      }

      const alias = await repos.exerciseAlias.create({
        exerciseId: id,
        alias: newAlias.alias,
        aliasNormalized: normalizedAlias,
        aliasLex: normalizeForLex(newAlias.alias),
        source: newAlias.source || 'manual',
        confidenceScore: newAlias.confidenceScore?.toString() || '1.00',
      });

      return NextResponse.json({ success: true, data: alias }, { status: 201 });
    }

    // Handle setting default alias
    if (setDefaultAlias) {
      const alias = await repos.exerciseAlias.findById(setDefaultAlias);
      if (!alias) {
        return NextResponse.json(
          { success: false, message: 'Alias not found' },
          { status: 404 }
        );
      }
      if (alias.exerciseId !== id) {
        return NextResponse.json(
          { success: false, message: 'Alias does not belong to this exercise' },
          { status: 400 }
        );
      }

      // Set this alias as default (clears previous default)
      await repos.exerciseAlias.setDefault(id, setDefaultAlias);

      // Update exercise name and slug to match the alias
      const newSlug = alias.alias
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      await repos.exercise.update(id, { name: alias.alias, slug: newSlug });

      const updated = await repos.exercise.findById(id);
      return NextResponse.json({ success: true, data: updated });
    }

    // Handle action-based updates
    if (action === 'deactivate') {
      await repos.exercise.deactivate(id);
      const updated = await repos.exercise.findById(id);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'activate') {
      const updated = await repos.exercise.update(id, { isActive: true });
      return NextResponse.json({ success: true, data: updated });
    }

    // If name is being changed, check for duplicates
    if (name && name !== existing.name) {
      const nameExists = await repos.exercise.findByName(name);
      if (nameExists) {
        return NextResponse.json(
          { success: false, message: 'An exercise with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Handle movement assignment by slug
    if (movementSlug !== undefined) {
      if (movementSlug === null || movementSlug === '') {
        // Clear movement
        await repos.exercise.update(id, { movementId: null });
      } else {
        const movement = await repos.movement.findBySlug(movementSlug);
        if (!movement) {
          return NextResponse.json(
            { success: false, message: `Movement not found: ${movementSlug}` },
            { status: 400 }
          );
        }
        await repos.exercise.update(id, { movementId: movement.id });
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (type !== undefined) updates.type = type;
    if (mechanics !== undefined) updates.mechanics = mechanics;
    if (trainingGroups !== undefined) updates.trainingGroups = trainingGroups;
    if (movementPatterns !== undefined) updates.movementPatterns = movementPatterns;
    if (equipment !== undefined) updates.equipment = equipment;
    if (primaryMuscles !== undefined) updates.primaryMuscles = primaryMuscles;
    if (secondaryMuscles !== undefined) updates.secondaryMuscles = secondaryMuscles;
    if (modality !== undefined) updates.modality = modality;
    if (intensity !== undefined) updates.intensity = intensity;
    if (shortDescription !== undefined) updates.shortDescription = shortDescription;
    if (instructions !== undefined) updates.instructions = instructions;
    if (cues !== undefined) updates.cues = cues;
    if (isActive !== undefined) updates.isActive = isActive;

    if (Object.keys(updates).length === 0) {
      // If movementSlug was handled above, we already updated - return success
      if (movementSlug !== undefined) {
        const updated = await repos.exercise.findById(id);
        return NextResponse.json({ success: true, data: updated });
      }
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const exercise = await repos.exercise.update(id, updates);

    return NextResponse.json({
      success: true,
      data: exercise
    });

  } catch (error) {
    console.error('Error updating exercise:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating exercise'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { repos } = await getAdminContext();

    // Verify exercise exists
    const existing = await repos.exercise.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Soft delete (deactivate)
    await repos.exercise.deactivate(id);

    return NextResponse.json({
      success: true,
      message: 'Exercise deactivated'
    });

  } catch (error) {
    console.error('Error deleting exercise:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred deleting exercise'
      },
      { status: 500 }
    );
  }
}
