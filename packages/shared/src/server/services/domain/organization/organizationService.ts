import type { RepositoryContainer } from '../../../repositories/factory';
import type {
  Organization,
  NewOrganization,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberWithOwner,
  OrganizationWithStats,
  OrganizationRole,
} from '../../../models/organization';
import { OrganizationModel } from '../../../models/organization';

/**
 * Organization Service Instance Interface
 */
export interface OrganizationServiceInstance {
  // Organization CRUD
  create(data: CreateOrganizationInput): Promise<Organization>;
  getById(id: string): Promise<Organization | null>;
  getBySlug(slug: string): Promise<Organization | null>;
  listAll(): Promise<Organization[]>;
  listAllWithStats(): Promise<OrganizationWithStats[]>;
  listActive(): Promise<Organization[]>;
  update(id: string, data: UpdateOrganizationInput): Promise<Organization | null>;
  delete(id: string): Promise<boolean>;

  // Member management (requires authorization)
  listMembers(organizationId: string): Promise<OrganizationMemberWithOwner[]>;
  addMember(organizationId: string, programOwnerId: string, role: OrganizationRole, actorOwnerId: string): Promise<OrganizationMember | null>;
  updateMemberRole(organizationId: string, programOwnerId: string, role: OrganizationRole, actorOwnerId: string): Promise<OrganizationMember | null>;
  removeMember(organizationId: string, programOwnerId: string, actorOwnerId: string): Promise<boolean>;

  // Member queries
  getMemberRole(organizationId: string, programOwnerId: string): Promise<OrganizationRole | null>;
  listOrganizationsForOwner(programOwnerId: string): Promise<(Organization & { role: OrganizationRole })[]>;
  canManageMembers(organizationId: string, programOwnerId: string): Promise<boolean>;
  canCreateContent(organizationId: string, programOwnerId: string): Promise<boolean>;
}

/**
 * Input for creating an organization
 */
export interface CreateOrganizationInput {
  name: string;
  slug?: string; // Auto-generated if not provided
  description?: string;
  logoUrl?: string;
  wordmarkUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

/**
 * Input for updating an organization
 */
export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  wordmarkUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
}

/**
 * Create an OrganizationService instance
 */
export function createOrganizationService(repos: RepositoryContainer): OrganizationServiceInstance {
  /**
   * Generate a unique slug, appending numbers if needed
   */
  async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (!(await repos.organization.isSlugUnique(slug, excludeId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Check if an actor can manage members in an organization
   * Returns true if the actor is an admin of the organization
   */
  async function checkCanManageMembers(organizationId: string, actorOwnerId: string): Promise<boolean> {
    const membership = await repos.organization.getMember(organizationId, actorOwnerId);
    return membership !== null && membership.role === 'admin';
  }

  return {
    // =========================================================================
    // Organization CRUD
    // =========================================================================

    async create(data: CreateOrganizationInput): Promise<Organization> {
      // Generate slug if not provided
      const baseSlug = data.slug || OrganizationModel.generateSlug(data.name);
      const slug = await generateUniqueSlug(baseSlug);

      const newOrg: NewOrganization = {
        name: data.name,
        slug,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        wordmarkUrl: data.wordmarkUrl || null,
        websiteUrl: data.websiteUrl || null,
        isActive: data.isActive ?? true,
      };

      return repos.organization.create(newOrg);
    },

    async getById(id: string): Promise<Organization | null> {
      return repos.organization.findById(id);
    },

    async getBySlug(slug: string): Promise<Organization | null> {
      return repos.organization.findBySlug(slug);
    },

    async listAll(): Promise<Organization[]> {
      return repos.organization.listAll();
    },

    async listAllWithStats(): Promise<OrganizationWithStats[]> {
      return repos.organization.listAllWithStats();
    },

    async listActive(): Promise<Organization[]> {
      return repos.organization.listActive();
    },

    async update(id: string, data: UpdateOrganizationInput): Promise<Organization | null> {
      const updateData: OrganizationUpdate = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.slug !== undefined) {
        // Validate and ensure uniqueness
        const baseSlug = OrganizationModel.generateSlug(data.slug);
        updateData.slug = await generateUniqueSlug(baseSlug, id);
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      if (data.logoUrl !== undefined) {
        updateData.logoUrl = data.logoUrl;
      }

      if (data.wordmarkUrl !== undefined) {
        updateData.wordmarkUrl = data.wordmarkUrl;
      }

      if (data.websiteUrl !== undefined) {
        updateData.websiteUrl = data.websiteUrl;
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      return repos.organization.update(id, updateData);
    },

    async delete(id: string): Promise<boolean> {
      return repos.organization.delete(id);
    },

    // =========================================================================
    // Member Management
    // =========================================================================

    async listMembers(organizationId: string): Promise<OrganizationMemberWithOwner[]> {
      return repos.organization.listMembers(organizationId);
    },

    async addMember(
      organizationId: string,
      programOwnerId: string,
      role: OrganizationRole,
      actorOwnerId: string
    ): Promise<OrganizationMember | null> {
      // Check authorization - actor must be an admin
      const canManage = await checkCanManageMembers(organizationId, actorOwnerId);
      if (!canManage) {
        return null;
      }

      // Check if member already exists
      const existing = await repos.organization.getMember(organizationId, programOwnerId);
      if (existing) {
        return existing; // Already a member
      }

      return repos.organization.addMember({
        organizationId,
        programOwnerId,
        role,
      });
    },

    async updateMemberRole(
      organizationId: string,
      programOwnerId: string,
      role: OrganizationRole,
      actorOwnerId: string
    ): Promise<OrganizationMember | null> {
      // Check authorization - actor must be an admin
      const canManage = await checkCanManageMembers(organizationId, actorOwnerId);
      if (!canManage) {
        return null;
      }

      // Prevent demoting the last admin
      if (role !== 'admin') {
        const membership = await repos.organization.getMember(organizationId, programOwnerId);
        if (membership?.role === 'admin') {
          const adminCount = await repos.organization.countAdmins(organizationId);
          if (adminCount <= 1) {
            // Cannot demote the last admin
            return null;
          }
        }
      }

      return repos.organization.updateMemberRole(organizationId, programOwnerId, role);
    },

    async removeMember(
      organizationId: string,
      programOwnerId: string,
      actorOwnerId: string
    ): Promise<boolean> {
      // Check authorization - actor must be an admin
      const canManage = await checkCanManageMembers(organizationId, actorOwnerId);
      if (!canManage) {
        return false;
      }

      // Prevent removing the last admin
      const membership = await repos.organization.getMember(organizationId, programOwnerId);
      if (membership?.role === 'admin') {
        const adminCount = await repos.organization.countAdmins(organizationId);
        if (adminCount <= 1) {
          // Cannot remove the last admin
          return false;
        }
      }

      return repos.organization.removeMember(organizationId, programOwnerId);
    },

    // =========================================================================
    // Member Queries
    // =========================================================================

    async getMemberRole(organizationId: string, programOwnerId: string): Promise<OrganizationRole | null> {
      const membership = await repos.organization.getMember(organizationId, programOwnerId);
      return membership?.role ?? null;
    },

    async listOrganizationsForOwner(programOwnerId: string): Promise<(Organization & { role: OrganizationRole })[]> {
      return repos.organization.listOrganizationsForOwner(programOwnerId);
    },

    async canManageMembers(organizationId: string, programOwnerId: string): Promise<boolean> {
      return checkCanManageMembers(organizationId, programOwnerId);
    },

    async canCreateContent(organizationId: string, programOwnerId: string): Promise<boolean> {
      const membership = await repos.organization.getMember(organizationId, programOwnerId);
      if (!membership) return false;
      return membership.role === 'admin' || membership.role === 'editor';
    },
  };
}
