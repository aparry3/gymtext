import { NextResponse } from 'next/server';
import { userService } from '@/server/services';
import type { UserFilters, UserSort } from '@/components/admin/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from search params
    const filters: UserFilters & { page?: number; pageSize?: number; sort?: UserSort } = {};
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }
    
    if (searchParams.get('hasEmail') !== null) {
      filters.hasEmail = searchParams.get('hasEmail') === 'true';
    }
    
    if (searchParams.get('hasProfile') !== null) {
      filters.hasProfile = searchParams.get('hasProfile') === 'true';
    }
    
    if (searchParams.get('gender')) {
      filters.gender = searchParams.get('gender')!;
    }
    
    if (searchParams.get('timezone')) {
      filters.timezone = searchParams.get('timezone')!;
    }
    
    if (searchParams.get('createdAfter')) {
      filters.createdAfter = searchParams.get('createdAfter')!;
    }
    
    if (searchParams.get('createdBefore')) {
      filters.createdBefore = searchParams.get('createdBefore')!;
    }

    // Parse pagination
    if (searchParams.get('page')) {
      filters.page = parseInt(searchParams.get('page')!, 10);
    }
    
    if (searchParams.get('pageSize')) {
      filters.pageSize = parseInt(searchParams.get('pageSize')!, 10);
    }

    // Parse sorting
    if (searchParams.get('sortField') && searchParams.get('sortDirection')) {
      filters.sort = {
        field: searchParams.get('sortField') as UserSort['field'],
        direction: searchParams.get('sortDirection') as UserSort['direction']
      };
    }

    const result = await userService.listUsersForAdmin(filters);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching users'
      }, 
      { status: 500 }
    );
  }
}