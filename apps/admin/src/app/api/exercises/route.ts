import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { ExerciseFilters, ExerciseSort } from '@/components/admin/types';
import { normalizeForSearch, normalizeForLex } from '@gymtext/shared/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from search params
    const filters: ExerciseFilters = {};

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    if (searchParams.get('type')) {
      filters.type = searchParams.get('type')!;
    }

    if (searchParams.get('mechanics')) {
      filters.mechanics = searchParams.get('mechanics')!;
    }

    if (searchParams.get('trainingGroup')) {
      filters.trainingGroup = searchParams.get('trainingGroup')!;
    }

    if (searchParams.get('muscle')) {
      filters.muscle = searchParams.get('muscle')!;
    }

    if (searchParams.get('movement')) {
      filters.movement = searchParams.get('movement')!;
    }

    if (searchParams.get('isActive') !== null && searchParams.get('isActive') !== '') {
      filters.isActive = searchParams.get('isActive') === 'true';
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Parse sorting
    let sort: ExerciseSort | undefined;
    if (searchParams.get('sortField') && searchParams.get('sortDirection')) {
      sort = {
        field: searchParams.get('sortField') as ExerciseSort['field'],
        direction: searchParams.get('sortDirection') as ExerciseSort['direction']
      };
    }

    const { repos, services } = await getAdminContext();

    // If search is present, use the resolution service for multi-tier matching
    if (filters.search) {
      const searchResults = await services.exerciseResolution.search(filters.search, {
        limit: parseInt(searchParams.get('pageSize') || '20', 10),
      });

      // Get alias counts and movement data for matched exercises
      const matchedIds = searchResults.map(r => r.exercise.id);
      const aliasCounts = new Map<string, number>();
      const movementMap = new Map<string, { slug: string; name: string }>();
      if (matchedIds.length > 0) {
        const aliasCountResults = await repos.db
          .selectFrom('exerciseAliases')
          .select(['exerciseId'])
          .select((eb) => eb.fn.countAll<number>().as('count'))
          .where('exerciseId', 'in', matchedIds)
          .groupBy('exerciseId')
          .execute();
        for (const row of aliasCountResults) {
          aliasCounts.set(row.exerciseId, Number(row.count));
        }

        // Get movement data for matched exercises
        const movementResults = await repos.db
          .selectFrom('exercises')
          .innerJoin('movements', 'movements.id', 'exercises.movementId')
          .select(['exercises.id', 'movements.slug', 'movements.name'])
          .where('exercises.id', 'in', matchedIds)
          .execute();
        for (const row of movementResults) {
          movementMap.set(row.id, { slug: row.slug, name: row.name });
        }
      }

      const exercisesWithMatch = searchResults.map(r => {
        const movement = movementMap.get(r.exercise.id);
        return {
          id: r.exercise.id,
          name: r.exercise.name,
          slug: r.exercise.slug,
          type: r.exercise.type,
          mechanics: r.exercise.mechanics,
          equipment: r.exercise.equipment,
          primaryMuscles: r.exercise.primaryMuscles,
          secondaryMuscles: r.exercise.secondaryMuscles,
          trainingGroups: r.exercise.trainingGroups,
          popularity: Number(r.exercise.popularity) || 0,
          isActive: r.exercise.isActive,
          aliasCount: aliasCounts.get(r.exercise.id) || 0,
          movementSlug: movement?.slug,
          movementName: movement?.name,
          createdAt: r.exercise.createdAt,
          updatedAt: r.exercise.updatedAt,
          matchMethod: r.method,
          matchConfidence: r.confidence,
          matchedOn: r.matchedOn,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          exercises: exercisesWithMatch,
          pagination: {
            page: 1,
            limit: exercisesWithMatch.length,
            total: exercisesWithMatch.length,
            totalPages: 1,
          },
          stats: {
            total: exercisesWithMatch.length,
            byType: {},
            active: exercisesWithMatch.filter(e => e.isActive).length,
          },
        }
      });
    }

    // Fetch all movements for filter dropdown
    const allMovements = await repos.movement.findAll();
    const movementsList = allMovements.map(m => ({ slug: m.slug, name: m.name }));

    // No search term: standard listing with filters
    let exercises = await repos.db
      .selectFrom('exercises')
      .leftJoin('movements', 'movements.id', 'exercises.movementId')
      .selectAll('exercises')
      .select(['movements.slug as movementSlug', 'movements.name as movementName'])
      .orderBy('exercises.popularity', 'desc')
      .orderBy('exercises.name', 'asc')
      .execute();

    if (filters.type) {
      exercises = exercises.filter(e => e.type === filters.type);
    }

    if (filters.mechanics) {
      exercises = exercises.filter(e => e.mechanics === filters.mechanics);
    }

    if (filters.trainingGroup) {
      exercises = exercises.filter(e =>
        e.trainingGroups?.includes(filters.trainingGroup!)
      );
    }

    if (filters.muscle) {
      exercises = exercises.filter(e =>
        e.primaryMuscles?.includes(filters.muscle!) ||
        e.secondaryMuscles?.includes(filters.muscle!)
      );
    }

    if (filters.movement) {
      exercises = exercises.filter(e =>
        (e as typeof exercises[0] & { movementSlug: string | null }).movementSlug === filters.movement
      );
    }

    if (filters.isActive !== undefined) {
      exercises = exercises.filter(e => e.isActive === filters.isActive);
    }

    // Get alias counts for each exercise
    const exerciseIds = exercises.map(e => e.id);
    const aliasCounts = new Map<string, number>();

    if (exerciseIds.length > 0) {
      const aliasCountResults = await repos.db
        .selectFrom('exerciseAliases')
        .select(['exerciseId'])
        .select((eb) => eb.fn.countAll<number>().as('count'))
        .where('exerciseId', 'in', exerciseIds)
        .groupBy('exerciseId')
        .execute();

      for (const row of aliasCountResults) {
        aliasCounts.set(row.exerciseId, Number(row.count));
      }
    }

    // Enrich exercises with alias count and movement data
    const exercisesWithStats = exercises.map(e => {
      const ex = e as typeof e & { movementSlug: string | null; movementName: string | null };
      return {
        id: e.id,
        name: e.name,
        slug: e.slug,
        type: e.type,
        mechanics: e.mechanics,
        equipment: e.equipment,
        primaryMuscles: e.primaryMuscles,
        secondaryMuscles: e.secondaryMuscles,
        trainingGroups: e.trainingGroups,
        popularity: Number(e.popularity) || 0,
        isActive: e.isActive,
        aliasCount: aliasCounts.get(e.id) || 0,
        movementSlug: ex.movementSlug || undefined,
        movementName: ex.movementName || undefined,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      };
    });

    // Apply sorting
    if (sort) {
      exercisesWithStats.sort((a, b) => {
        let comparison = 0;
        switch (sort!.field) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'type':
            comparison = a.type.localeCompare(b.type);
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'popularity':
            comparison = a.popularity - b.popularity;
            break;
        }
        return sort!.direction === 'asc' ? comparison : -comparison;
      });
    }

    // Calculate stats (before pagination)
    const byType: Record<string, number> = {};
    let activeCount = 0;

    for (const e of exercisesWithStats) {
      byType[e.type] = (byType[e.type] || 0) + 1;
      if (e.isActive) activeCount++;
    }

    const stats = {
      total: exercisesWithStats.length,
      byType,
      active: activeCount,
    };

    // Apply pagination
    const total = exercisesWithStats.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedExercises = exercisesWithStats.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        exercises: paginatedExercises,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages,
        },
        stats,
        movements: movementsList,
      }
    });

  } catch (error) {
    console.error('Error fetching exercises:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching exercises'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      isActive
    } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { success: false, message: 'name and type are required' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const exerciseSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { repos } = await getAdminContext();

    // Check if exercise with same name already exists
    const existing = await repos.exercise.findByName(name);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An exercise with this name already exists' },
        { status: 409 }
      );
    }

    // Create the exercise
    const exercise = await repos.exercise.create({
      name,
      slug: exerciseSlug,
      type,
      mechanics: mechanics || null,
      trainingGroups: trainingGroups || [],
      movementPatterns: movementPatterns || [],
      equipment: equipment || [],
      primaryMuscles: primaryMuscles || [],
      secondaryMuscles: secondaryMuscles || [],
      modality: modality || null,
      intensity: intensity || null,
      shortDescription: shortDescription || '',
      instructions: instructions || '',
      cues: cues || [],
      isActive: isActive ?? true,
    });

    // Create initial alias (normalized name)
    const normalizedAlias = normalizeForSearch(name);
    await repos.exerciseAlias.create({
      exerciseId: exercise.id,
      alias: name,
      aliasNormalized: normalizedAlias,
      aliasLex: normalizeForLex(name),
      source: 'manual',
      confidenceScore: '1.00',
    });

    return NextResponse.json({
      success: true,
      data: exercise
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating exercise:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating exercise'
      },
      { status: 500 }
    );
  }
}
