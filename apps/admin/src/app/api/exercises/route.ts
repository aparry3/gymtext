import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { ExerciseFilters, ExerciseSort } from '@/components/admin/types';
import { normalizeExerciseName, normalizeForLex } from '@gymtext/shared/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from search params
    const filters: ExerciseFilters = {};

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    if (searchParams.get('category')) {
      filters.category = searchParams.get('category')!;
    }

    if (searchParams.get('level')) {
      filters.level = searchParams.get('level')!;
    }

    if (searchParams.get('equipment')) {
      filters.equipment = searchParams.get('equipment')!;
    }

    if (searchParams.get('muscle')) {
      filters.muscle = searchParams.get('muscle')!;
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

      // Get alias counts for matched exercises
      const matchedIds = searchResults.map(r => r.exercise.id);
      const aliasCounts = new Map<string, number>();
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
      }

      const exercisesWithMatch = searchResults.map(r => ({
        id: r.exercise.id,
        name: r.exercise.name,
        category: r.exercise.category,
        level: r.exercise.level,
        equipment: r.exercise.equipment,
        primaryMuscles: r.exercise.primaryMuscles,
        secondaryMuscles: r.exercise.secondaryMuscles,
        force: r.exercise.force,
        mechanic: r.exercise.mechanic,
        isActive: r.exercise.isActive,
        aliasCount: aliasCounts.get(r.exercise.id) || 0,
        createdAt: r.exercise.createdAt,
        updatedAt: r.exercise.updatedAt,
        matchMethod: r.method,
        matchConfidence: r.confidence,
        matchedOn: r.matchedOn,
      }));

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
            byCategory: {},
            byLevel: {},
            active: exercisesWithMatch.filter(e => e.isActive).length,
          },
        }
      });
    }

    // No search term: standard listing with filters
    let exercises = await repos.db
      .selectFrom('exercises')
      .selectAll()
      .orderBy('popularity', 'desc')
      .orderBy('name', 'asc')
      .execute();

    if (filters.category) {
      exercises = exercises.filter(e => e.category === filters.category);
    }

    if (filters.level) {
      exercises = exercises.filter(e => e.level === filters.level);
    }

    if (filters.equipment) {
      exercises = exercises.filter(e => e.equipment === filters.equipment);
    }

    if (filters.muscle) {
      exercises = exercises.filter(e =>
        e.primaryMuscles?.includes(filters.muscle!) ||
        e.secondaryMuscles?.includes(filters.muscle!)
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

    // Enrich exercises with alias count
    const exercisesWithStats = exercises.map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      level: e.level,
      equipment: e.equipment,
      primaryMuscles: e.primaryMuscles,
      secondaryMuscles: e.secondaryMuscles,
      force: e.force,
      mechanic: e.mechanic,
      isActive: e.isActive,
      popularity: Number(e.popularity) || 0,
      aliasCount: aliasCounts.get(e.id) || 0,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    // Apply sorting
    if (sort) {
      exercisesWithStats.sort((a, b) => {
        let comparison = 0;
        switch (sort!.field) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'category':
            comparison = a.category.localeCompare(b.category);
            break;
          case 'level':
            comparison = a.level.localeCompare(b.level);
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
    const byCategory: Record<string, number> = {};
    const byLevel: Record<string, number> = {};
    let activeCount = 0;

    for (const e of exercisesWithStats) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      byLevel[e.level] = (byLevel[e.level] || 0) + 1;
      if (e.isActive) activeCount++;
    }

    const stats = {
      total: exercisesWithStats.length,
      byCategory,
      byLevel,
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
      category,
      level,
      equipment,
      primaryMuscles,
      secondaryMuscles,
      force,
      mechanic,
      description,
      instructions,
      tips,
      isActive
    } = body;

    // Validate required fields
    if (!name || !category || !level) {
      return NextResponse.json(
        { success: false, message: 'name, category, and level are required' },
        { status: 400 }
      );
    }

    // Validate level
    const validLevels = ['beginner', 'intermediate', 'expert'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, message: 'level must be beginner, intermediate, or expert' },
        { status: 400 }
      );
    }

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
      category,
      level,
      equipment: equipment || null,
      primaryMuscles: primaryMuscles || null,
      secondaryMuscles: secondaryMuscles || null,
      force: force || null,
      mechanic: mechanic || null,
      description: description || null,
      instructions: instructions || null,
      tips: tips || null,
      isActive: isActive ?? true,
    });

    // Create initial alias (normalized name)
    const normalizedAlias = normalizeExerciseName(name);
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
