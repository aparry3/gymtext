import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { EnrollmentFilters, EnrollmentSort, EnrollmentStatus } from '@/components/admin/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: programId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: EnrollmentFilters = {
      programId,
    };

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as EnrollmentStatus;
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Parse sorting
    let sort: EnrollmentSort | undefined;
    if (searchParams.get('sortField') && searchParams.get('sortDirection')) {
      sort = {
        field: searchParams.get('sortField') as EnrollmentSort['field'],
        direction: searchParams.get('sortDirection') as EnrollmentSort['direction']
      };
    }

    const { services } = await getAdminContext();

    // Verify program exists
    const program = await services.program.getById(programId);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Get enrollments for this program
    let enrollments = await services.enrollment.listByProgram(programId);

    // Enrich with client info
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const client = await services.user.getUserById(enrollment.clientId);
        return {
          ...enrollment,
          clientName: client?.name || 'Unknown',
          clientPhone: client?.phoneNumber || 'Unknown',
          programName: program.name,
        };
      })
    );

    // Apply filters
    let filteredEnrollments = enrichedEnrollments;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEnrollments = filteredEnrollments.filter(e =>
        e.clientName.toLowerCase().includes(searchLower) ||
        e.clientPhone.includes(filters.search!)
      );
    }

    if (filters.status) {
      filteredEnrollments = filteredEnrollments.filter(e => e.status === filters.status);
    }

    // Apply sorting
    if (sort) {
      filteredEnrollments.sort((a, b) => {
        let comparison = 0;
        switch (sort!.field) {
          case 'clientName':
            comparison = a.clientName.localeCompare(b.clientName);
            break;
          case 'startDate':
            comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            break;
          case 'enrolledAt':
            comparison = new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
            break;
          case 'currentWeek':
            comparison = a.currentWeek - b.currentWeek;
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sort!.direction === 'asc' ? comparison : -comparison;
      });
    }

    // Calculate stats
    const stats = {
      total: filteredEnrollments.length,
      byStatus: {
        active: filteredEnrollments.filter(e => e.status === 'active').length,
        paused: filteredEnrollments.filter(e => e.status === 'paused').length,
        completed: filteredEnrollments.filter(e => e.status === 'completed').length,
        cancelled: filteredEnrollments.filter(e => e.status === 'cancelled').length,
      },
    };

    // Apply pagination
    const total = filteredEnrollments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedEnrollments = filteredEnrollments.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        enrollments: paginatedEnrollments,
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
    console.error('Error fetching enrollments:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching enrollments'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: programId } = await params;
    const body = await request.json();

    const { clientId, startDate } = body;

    // Validate required fields
    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'clientId is required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // Verify program exists
    const program = await services.program.getById(programId);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Verify client exists
    const client = await services.user.getUserById(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active enrollment in this program
    const existingEnrollment = await services.enrollment.getActiveEnrollment(clientId);
    if (existingEnrollment && existingEnrollment.programId === programId) {
      return NextResponse.json(
        { success: false, message: 'User is already enrolled in this program' },
        { status: 400 }
      );
    }

    // Create enrollment with the program's published version (if any)
    const enrollment = await services.enrollment.enrollClient(
      clientId,
      programId,
      {
        startDate: startDate ? new Date(startDate) : undefined,
        programVersionId: program.publishedVersionId ?? undefined,
      }
    );

    return NextResponse.json({
      success: true,
      data: enrollment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating enrollment:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating enrollment'
      },
      { status: 500 }
    );
  }
}
