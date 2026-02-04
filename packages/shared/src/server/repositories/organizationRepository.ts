import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  OrganizationModel,
  OrganizationMemberModel,
  type Organization,
  type NewOrganization,
  type OrganizationUpdate,
  type OrganizationMember,
  type NewOrganizationMember,
  type OrganizationMemberWithOwner,
  type OrganizationWithStats,
  type OrganizationRole,
} from '@/server/models/organization';
import { sql } from 'kysely';

/**
 * Repository for organization database operations
 */
export class OrganizationRepository extends BaseRepository {
  // =========================================================================
  // Organization CRUD
  // =========================================================================

  /**
   * Create a new organization
   */
  async create(data: NewOrganization): Promise<Organization> {
    const result = await this.db
      .insertInto('organizations')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return OrganizationModel.fromDB(result);
  }

  /**
   * Find an organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    const result = await this.db
      .selectFrom('organizations')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? OrganizationModel.fromDB(result) : null;
  }

  /**
   * Find an organization by slug
   */
  async findBySlug(slug: string): Promise<Organization | null> {
    const result = await this.db
      .selectFrom('organizations')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    return result ? OrganizationModel.fromDB(result) : null;
  }

  /**
   * List all active organizations
   */
  async listActive(): Promise<Organization[]> {
    const results = await this.db
      .selectFrom('organizations')
      .selectAll()
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .execute();

    return results.map(OrganizationModel.fromDB);
  }

  /**
   * List all organizations (including inactive)
   */
  async listAll(): Promise<Organization[]> {
    const results = await this.db
      .selectFrom('organizations')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(OrganizationModel.fromDB);
  }

  /**
   * List all organizations with stats (member count, program count, blog post count)
   */
  async listAllWithStats(): Promise<OrganizationWithStats[]> {
    const results = await this.db
      .selectFrom('organizations as o')
      .leftJoin('organizationMembers as om', 'om.organizationId', 'o.id')
      .leftJoin('programs as p', 'p.organizationId', 'o.id')
      .leftJoin('blogPosts as bp', 'bp.organizationId', 'o.id')
      .select([
        'o.id',
        'o.name',
        'o.slug',
        'o.description',
        'o.logoUrl',
        'o.wordmarkUrl',
        'o.websiteUrl',
        'o.organizationType',
        'o.isActive',
        'o.createdAt',
        'o.updatedAt',
        sql<number>`count(distinct om.id)::int`.as('memberCount'),
        sql<number>`count(distinct p.id)::int`.as('programCount'),
        sql<number>`count(distinct bp.id)::int`.as('blogPostCount'),
      ])
      .groupBy('o.id')
      .orderBy('o.createdAt', 'desc')
      .execute();

    return results.map(row => ({
      ...OrganizationModel.fromDB(row),
      memberCount: row.memberCount,
      programCount: row.programCount,
      blogPostCount: row.blogPostCount,
    }));
  }

  /**
   * Update an organization
   */
  async update(id: string, data: OrganizationUpdate): Promise<Organization | null> {
    const result = await this.db
      .updateTable('organizations')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? OrganizationModel.fromDB(result) : null;
  }

  /**
   * Delete an organization
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('organizations')
      .where('id', '=', id)
      .executeTakeFirst();

    return (result.numDeletedRows ?? 0) > 0;
  }

  /**
   * Check if a slug is unique (optionally excluding a specific organization ID)
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .selectFrom('organizations')
      .select('id')
      .where('slug', '=', slug);

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const result = await query.executeTakeFirst();
    return !result;
  }

  // =========================================================================
  // Organization Members
  // =========================================================================

  /**
   * Add a member to an organization
   */
  async addMember(data: NewOrganizationMember): Promise<OrganizationMember> {
    const result = await this.db
      .insertInto('organizationMembers')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return OrganizationMemberModel.fromDB(result);
  }

  /**
   * Get a specific membership
   */
  async getMember(organizationId: string, programOwnerId: string): Promise<OrganizationMember | null> {
    const result = await this.db
      .selectFrom('organizationMembers')
      .selectAll()
      .where('organizationId', '=', organizationId)
      .where('programOwnerId', '=', programOwnerId)
      .executeTakeFirst();

    return result ? OrganizationMemberModel.fromDB(result) : null;
  }

  /**
   * List all members of an organization with owner details
   */
  async listMembers(organizationId: string): Promise<OrganizationMemberWithOwner[]> {
    const results = await this.db
      .selectFrom('organizationMembers as om')
      .innerJoin('programOwners as po', 'po.id', 'om.programOwnerId')
      .select([
        'om.id',
        'om.organizationId',
        'om.programOwnerId',
        'om.role',
        'om.joinedAt',
        'po.id as ownerId',
        'po.displayName as ownerDisplayName',
        'po.avatarUrl as ownerAvatarUrl',
        'po.ownerType as ownerOwnerType',
      ])
      .where('om.organizationId', '=', organizationId)
      .orderBy('om.joinedAt', 'asc')
      .execute();

    return results.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      programOwnerId: row.programOwnerId,
      role: row.role as OrganizationRole,
      joinedAt: new Date(row.joinedAt as unknown as string | number | Date),
      owner: {
        id: row.ownerId,
        displayName: row.ownerDisplayName,
        avatarUrl: row.ownerAvatarUrl,
        ownerType: row.ownerOwnerType,
      },
    }));
  }

  /**
   * List all organizations a program owner belongs to
   */
  async listOrganizationsForOwner(programOwnerId: string): Promise<(Organization & { role: OrganizationRole })[]> {
    const results = await this.db
      .selectFrom('organizationMembers as om')
      .innerJoin('organizations as o', 'o.id', 'om.organizationId')
      .select([
        'o.id',
        'o.name',
        'o.slug',
        'o.description',
        'o.logoUrl',
        'o.wordmarkUrl',
        'o.websiteUrl',
        'o.organizationType',
        'o.isActive',
        'o.createdAt',
        'o.updatedAt',
        'om.role',
      ])
      .where('om.programOwnerId', '=', programOwnerId)
      .where('o.isActive', '=', true)
      .orderBy('o.name', 'asc')
      .execute();

    return results.map(row => ({
      ...OrganizationModel.fromDB(row),
      role: row.role as OrganizationRole,
    }));
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(organizationId: string, programOwnerId: string, role: OrganizationRole): Promise<OrganizationMember | null> {
    const result = await this.db
      .updateTable('organizationMembers')
      .set({ role })
      .where('organizationId', '=', organizationId)
      .where('programOwnerId', '=', programOwnerId)
      .returningAll()
      .executeTakeFirst();

    return result ? OrganizationMemberModel.fromDB(result) : null;
  }

  /**
   * Remove a member from an organization
   */
  async removeMember(organizationId: string, programOwnerId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('organizationMembers')
      .where('organizationId', '=', organizationId)
      .where('programOwnerId', '=', programOwnerId)
      .executeTakeFirst();

    return (result.numDeletedRows ?? 0) > 0;
  }

  /**
   * Count admins in an organization (for preventing removal of last admin)
   */
  async countAdmins(organizationId: string): Promise<number> {
    const result = await this.db
      .selectFrom('organizationMembers')
      .select(sql<number>`count(*)::int`.as('count'))
      .where('organizationId', '=', organizationId)
      .where('role', '=', 'admin')
      .executeTakeFirst();

    return result?.count ?? 0;
  }
}
