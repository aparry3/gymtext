import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { OrganizationRole } from '@gymtext/shared/server';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const members = await services.organization.listMembers(id);

    return NextResponse.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('Error fetching organization members:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching members'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { programOwnerId, role } = body;

    // Validate required fields
    if (!programOwnerId) {
      return NextResponse.json(
        { success: false, message: 'programOwnerId is required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: OrganizationRole[] = ['admin', 'editor', 'viewer'];
    const memberRole: OrganizationRole = role || 'editor';
    if (!validRoles.includes(memberRole)) {
      return NextResponse.json(
        { success: false, message: 'role must be admin, editor, or viewer' },
        { status: 400 }
      );
    }

    const { repos } = await getAdminContext();

    // Admin portal is a trusted context - bypass service-layer authorization
    // and use repository directly. The admin middleware already verified access.

    // Check if member already exists
    const existing = await repos.organization.getMember(id, programOwnerId);
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing
      });
    }

    // Add the new member
    const member = await repos.organization.addMember({
      organizationId: id,
      programOwnerId,
      role: memberRole,
    });

    return NextResponse.json({
      success: true,
      data: member
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding organization member:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred adding member'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { programOwnerId, role } = body;

    // Validate required fields
    if (!programOwnerId || !role) {
      return NextResponse.json(
        { success: false, message: 'programOwnerId and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: OrganizationRole[] = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'role must be admin, editor, or viewer' },
        { status: 400 }
      );
    }

    const { repos } = await getAdminContext();

    // Admin portal is a trusted context - bypass service-layer authorization

    // Protect against demoting the last admin
    const membership = await repos.organization.getMember(id, programOwnerId);
    if (membership?.role === 'admin' && role !== 'admin') {
      const adminCount = await repos.organization.countAdmins(id);
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Cannot demote the last admin' },
          { status: 400 }
        );
      }
    }

    const member = await repos.organization.updateMemberRole(id, programOwnerId, role);

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member
    });

  } catch (error) {
    console.error('Error updating member role:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating member role'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const programOwnerId = searchParams.get('programOwnerId');

    if (!programOwnerId) {
      return NextResponse.json(
        { success: false, message: 'programOwnerId query parameter is required' },
        { status: 400 }
      );
    }

    const { repos } = await getAdminContext();

    // Admin portal is a trusted context - bypass service-layer authorization

    // Protect against removing the last admin
    const membership = await repos.organization.getMember(id, programOwnerId);
    if (membership?.role === 'admin') {
      const adminCount = await repos.organization.countAdmins(id);
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Cannot remove the last admin from an organization' },
          { status: 400 }
        );
      }
    }

    const removed = await repos.organization.removeMember(id, programOwnerId);

    if (!removed) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed'
    });

  } catch (error) {
    console.error('Error removing organization member:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred removing member'
      },
      { status: 500 }
    );
  }
}
