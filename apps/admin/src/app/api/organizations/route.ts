import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function GET() {
  try {
    const { services } = await getAdminContext();

    // Get all organizations with stats
    const organizations = await services.organization.listAllWithStats();

    // Calculate overall stats
    const stats = {
      totalOrganizations: organizations.length,
      activeOrganizations: organizations.filter(o => o.isActive).length,
      totalMembers: organizations.reduce((sum, o) => sum + o.memberCount, 0),
      totalPrograms: organizations.reduce((sum, o) => sum + o.programCount, 0),
      totalBlogPosts: organizations.reduce((sum, o) => sum + o.blogPostCount, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        organizations,
        stats,
      }
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching organizations'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, slug, description, logoUrl, wordmarkUrl, websiteUrl, organizationType, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'name is required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    const organization = await services.organization.create({
      name,
      slug,
      description,
      logoUrl,
      wordmarkUrl,
      websiteUrl,
      organizationType,
      isActive,
    });

    return NextResponse.json({
      success: true,
      data: organization
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating organization:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating organization'
      },
      { status: 500 }
    );
  }
}
