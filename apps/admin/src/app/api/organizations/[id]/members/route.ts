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

    const { programOwnerId, role, actorOwnerId } = body;

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

    const { services } = await getAdminContext();

    // For admin portal, we allow adding members without authorization check
    // In the programs portal, actorOwnerId would be required and checked
    // For now, use a simplified approach - admin portal has full access
    const member = await services.organization.addMember(
      id,
      programOwnerId,
      memberRole,
      actorOwnerId || programOwnerId // If no actor specified, use the member being added (for bootstrap)
    );

    // If member is null and no actorOwnerId, try direct add (bootstrap scenario)
    if (!member && !actorOwnerId) {
      // Check if this is the first member (bootstrap scenario)
      const existingMembers = await services.organization.listMembers(id);
      if (existingMembers.length === 0) {
        // Direct add for first member - use repository directly
        const { repos } = await getAdminContext();
        const newMember = await repos.organization.addMember({
          organizationId: id,
          programOwnerId,
          role: memberRole,
        });
        return NextResponse.json({
          success: true,
          data: newMember
        }, { status: 201 });
      }
    }

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Unable to add member. Check authorization or if member already exists.' },
        { status: 400 }
      );
    }

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

    const { programOwnerId, role, actorOwnerId } = body;

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

    const { services } = await getAdminContext();

    // For admin portal, we allow role updates without authorization check
    // In a real scenario, actorOwnerId would be verified
    const member = await services.organization.updateMemberRole(
      id,
      programOwnerId,
      role,
      actorOwnerId || programOwnerId
    );

    // If authorization fails, try direct update for admin portal
    if (!member && !actorOwnerId) {
      const { repos } = await getAdminContext();
      const updatedMember = await repos.organization.updateMemberRole(id, programOwnerId, role);
      if (updatedMember) {
        return NextResponse.json({
          success: true,
          data: updatedMember
        });
      }
    }

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Unable to update member role. Cannot demote the last admin.' },
        { status: 400 }
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
    const actorOwnerId = searchParams.get('actorOwnerId');

    if (!programOwnerId) {
      return NextResponse.json(
        { success: false, message: 'programOwnerId query parameter is required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // For admin portal, allow removal without authorization check
    const removed = await services.organization.removeMember(
      id,
      programOwnerId,
      actorOwnerId || programOwnerId
    );

    // If authorization fails, try direct removal for admin portal
    if (!removed && !actorOwnerId) {
      const { repos } = await getAdminContext();
      // Check if this is the last admin
      const adminCount = await repos.organization.countAdmins(id);
      const membership = await repos.organization.getMember(id, programOwnerId);
      if (membership?.role === 'admin' && adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Cannot remove the last admin from an organization' },
          { status: 400 }
        );
      }
      const directRemoved = await repos.organization.removeMember(id, programOwnerId);
      if (directRemoved) {
        return NextResponse.json({
          success: true,
          message: 'Member removed'
        });
      }
    }

    if (!removed) {
      return NextResponse.json(
        { success: false, message: 'Unable to remove member. Cannot remove the last admin.' },
        { status: 400 }
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
