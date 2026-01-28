import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { ProgramOwnerFilters, ProgramOwnerSort, OwnerType } from '@/components/admin/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from search params
    const filters: ProgramOwnerFilters = {};

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    if (searchParams.get('ownerType')) {
      filters.ownerType = searchParams.get('ownerType') as OwnerType;
    }

    if (searchParams.get('isActive') !== null) {
      filters.isActive = searchParams.get('isActive') === 'true';
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Parse sorting
    let sort: ProgramOwnerSort | undefined;
    if (searchParams.get('sortField') && searchParams.get('sortDirection')) {
      sort = {
        field: searchParams.get('sortField') as ProgramOwnerSort['field'],
        direction: searchParams.get('sortDirection') as ProgramOwnerSort['direction']
      };
    }

    const { services } = await getAdminContext();

    // Get all program owners
    let owners = await services.programOwner.listAll();

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      owners = owners.filter(o =>
        o.displayName.toLowerCase().includes(searchLower) ||
        (o.bio?.toLowerCase().includes(searchLower))
      );
    }

    if (filters.ownerType) {
      owners = owners.filter(o => o.ownerType === filters.ownerType);
    }

    if (filters.isActive !== undefined) {
      owners = owners.filter(o => o.isActive === filters.isActive);
    }

    // Get stats for each owner (program count, enrollment count)
    const ownersWithStats = await Promise.all(
      owners.map(async (owner) => {
        const programs = await services.program.getByOwnerId(owner.id);
        const programCount = programs.length;

        // Count enrollments across all programs
        let enrollmentCount = 0;
        for (const program of programs) {
          enrollmentCount += await services.enrollment.countActiveEnrollments(program.id);
        }

        return {
          ...owner,
          programCount,
          enrollmentCount,
        };
      })
    );

    // Apply sorting
    if (sort) {
      ownersWithStats.sort((a, b) => {
        let comparison = 0;
        switch (sort!.field) {
          case 'displayName':
            comparison = a.displayName.localeCompare(b.displayName);
            break;
          case 'ownerType':
            comparison = a.ownerType.localeCompare(b.ownerType);
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'programCount':
            comparison = a.programCount - b.programCount;
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
      totalOwners: ownersWithStats.length,
      byType: {
        ai: ownersWithStats.filter(o => o.ownerType === 'ai').length,
        coach: ownersWithStats.filter(o => o.ownerType === 'coach').length,
        trainer: ownersWithStats.filter(o => o.ownerType === 'trainer').length,
        influencer: ownersWithStats.filter(o => o.ownerType === 'influencer').length,
      },
      activeOwners: ownersWithStats.filter(o => o.isActive).length,
      totalPrograms: ownersWithStats.reduce((sum, o) => sum + o.programCount, 0),
      totalEnrollments: ownersWithStats.reduce((sum, o) => sum + o.enrollmentCount, 0),
    };

    // Apply pagination
    const total = ownersWithStats.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedOwners = ownersWithStats.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        owners: paginatedOwners,
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
    console.error('Error fetching program owners:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching program owners'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { displayName, ownerType, bio, avatarUrl, userId, phone, isActive } = body;

    // Validate required fields
    if (!displayName || !ownerType) {
      return NextResponse.json(
        { success: false, message: 'displayName and ownerType are required' },
        { status: 400 }
      );
    }

    // Validate ownerType
    const validTypes: OwnerType[] = ['coach', 'trainer', 'influencer'];
    if (!validTypes.includes(ownerType)) {
      return NextResponse.json(
        { success: false, message: 'ownerType must be coach, trainer, or influencer' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    const owner = await services.programOwner.create({
      displayName,
      ownerType,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      userId: userId || null,
      phone: phone || null,
      isActive: isActive ?? true,
    });

    return NextResponse.json({
      success: true,
      data: owner
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating program owner:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating program owner'
      },
      { status: 500 }
    );
  }
}
