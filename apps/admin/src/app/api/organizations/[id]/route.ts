import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const organization = await services.organization.getById(id);
    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get members with owner details
    const members = await services.organization.listMembers(id);

    // Get content counts
    const allOrgsWithStats = await services.organization.listAllWithStats();
    const orgWithStats = allOrgsWithStats.find(o => o.id === id);

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          ...organization,
          memberCount: orgWithStats?.memberCount ?? members.length,
          programCount: orgWithStats?.programCount ?? 0,
          blogPostCount: orgWithStats?.blogPostCount ?? 0,
        },
        members,
      }
    });

  } catch (error) {
    console.error('Error fetching organization:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching organization'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, slug, description, logoUrl, wordmarkUrl, websiteUrl, isActive } = body;

    const { services } = await getAdminContext();

    const organization = await services.organization.update(id, {
      name,
      slug,
      description,
      logoUrl,
      wordmarkUrl,
      websiteUrl,
      isActive,
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization
    });

  } catch (error) {
    console.error('Error updating organization:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating organization'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const deleted = await services.organization.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Organization not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Organization deleted'
    });

  } catch (error) {
    console.error('Error deleting organization:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred deleting organization'
      },
      { status: 500 }
    );
  }
}
