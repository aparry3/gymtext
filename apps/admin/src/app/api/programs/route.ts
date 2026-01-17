import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { ProgramFilters, ProgramSort, SchedulingMode, ProgramCadence } from '@/components/admin/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from search params
    const filters: ProgramFilters = {};

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    if (searchParams.get('ownerId')) {
      filters.ownerId = searchParams.get('ownerId')!;
    }

    if (searchParams.get('schedulingMode')) {
      filters.schedulingMode = searchParams.get('schedulingMode') as SchedulingMode;
    }

    if (searchParams.get('isActive') !== null && searchParams.get('isActive') !== '') {
      filters.isActive = searchParams.get('isActive') === 'true';
    }

    if (searchParams.get('isPublic') !== null && searchParams.get('isPublic') !== '') {
      filters.isPublic = searchParams.get('isPublic') === 'true';
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Parse sorting
    let sort: ProgramSort | undefined;
    if (searchParams.get('sortField') && searchParams.get('sortDirection')) {
      sort = {
        field: searchParams.get('sortField') as ProgramSort['field'],
        direction: searchParams.get('sortDirection') as ProgramSort['direction']
      };
    }

    const { services } = await getAdminContext();

    // Get all programs
    let programs = await services.program.listAll();

    // Get all owners for denormalization
    const owners = await services.programOwner.listAll();
    const ownerMap = new Map(owners.map(o => [o.id, o]));

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      programs = programs.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description?.toLowerCase().includes(searchLower))
      );
    }

    if (filters.ownerId) {
      programs = programs.filter(p => p.ownerId === filters.ownerId);
    }

    if (filters.schedulingMode) {
      programs = programs.filter(p => p.schedulingMode === filters.schedulingMode);
    }

    if (filters.isActive !== undefined) {
      programs = programs.filter(p => p.isActive === filters.isActive);
    }

    if (filters.isPublic !== undefined) {
      programs = programs.filter(p => p.isPublic === filters.isPublic);
    }

    // Enrich programs with stats
    const programsWithStats = await Promise.all(
      programs.map(async (program) => {
        const owner = ownerMap.get(program.ownerId);
        const enrollmentCount = await services.enrollment.countActiveEnrollments(program.id);
        const versionCount = await services.programVersion.countByProgramId(program.id);

        return {
          ...program,
          ownerName: owner?.displayName || 'Unknown',
          ownerType: owner?.ownerType || 'coach',
          enrollmentCount,
          versionCount,
        };
      })
    );

    // Apply sorting
    if (sort) {
      programsWithStats.sort((a, b) => {
        let comparison = 0;
        switch (sort!.field) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'ownerName':
            comparison = a.ownerName.localeCompare(b.ownerName);
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'enrollmentCount':
            comparison = a.enrollmentCount - b.enrollmentCount;
            break;
        }
        return sort!.direction === 'asc' ? comparison : -comparison;
      });
    }

    // Calculate stats
    const stats = {
      totalPrograms: programsWithStats.length,
      bySchedulingMode: {
        rolling_start: programsWithStats.filter(p => p.schedulingMode === 'rolling_start').length,
        cohort: programsWithStats.filter(p => p.schedulingMode === 'cohort').length,
      },
      activePrograms: programsWithStats.filter(p => p.isActive).length,
      publicPrograms: programsWithStats.filter(p => p.isPublic).length,
      totalEnrollments: programsWithStats.reduce((sum, p) => sum + p.enrollmentCount, 0),
    };

    // Apply pagination
    const total = programsWithStats.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedPrograms = programsWithStats.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        programs: paginatedPrograms,
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
    console.error('Error fetching programs:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching programs'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, ownerId, description, schedulingMode, cadence, isActive, isPublic } = body;

    // Validate required fields
    if (!name || !ownerId || !schedulingMode || !cadence) {
      return NextResponse.json(
        { success: false, message: 'name, ownerId, schedulingMode, and cadence are required' },
        { status: 400 }
      );
    }

    // Validate schedulingMode
    const validModes: SchedulingMode[] = ['rolling_start', 'cohort'];
    if (!validModes.includes(schedulingMode)) {
      return NextResponse.json(
        { success: false, message: 'schedulingMode must be rolling_start or cohort' },
        { status: 400 }
      );
    }

    // Validate cadence
    const validCadences: ProgramCadence[] = ['calendar_days', 'training_days_only'];
    if (!validCadences.includes(cadence)) {
      return NextResponse.json(
        { success: false, message: 'cadence must be calendar_days or training_days_only' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // Verify owner exists
    const owner = await services.programOwner.getById(ownerId);
    if (!owner) {
      return NextResponse.json(
        { success: false, message: 'Program owner not found' },
        { status: 404 }
      );
    }

    const program = await services.program.create({
      name,
      ownerId,
      description: description || null,
      schedulingMode,
      cadence,
      isActive: isActive ?? true,
      isPublic: isPublic ?? false,
    });

    return NextResponse.json({
      success: true,
      data: program
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating program:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating program'
      },
      { status: 500 }
    );
  }
}
