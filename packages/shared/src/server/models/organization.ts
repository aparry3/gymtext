import type { Insertable, Selectable, Updateable } from 'kysely';
import type { Organizations, OrganizationMembers } from './_types';

// Database types from Kysely codegen
export type OrganizationDB = Selectable<Organizations>;
export type NewOrganization = Insertable<Organizations>;
export type OrganizationUpdate = Updateable<Organizations>;

export type OrganizationMemberDB = Selectable<OrganizationMembers>;
export type NewOrganizationMember = Insertable<OrganizationMembers>;
export type OrganizationMemberUpdate = Updateable<OrganizationMembers>;

// Role types
export type OrganizationRole = 'admin' | 'editor' | 'viewer';

// Organization type
export type OrganizationType = 'gym' | 'brand' | 'media' | 'hospitality' | 'education' | 'corporate';

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  wordmarkUrl: string | null;
  websiteUrl: string | null;
  organizationType: OrganizationType | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization member (junction between organization and program_owner)
 */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  programOwnerId: string;
  role: OrganizationRole;
  joinedAt: Date;
}

/**
 * Organization member with owner details (for member lists)
 */
export interface OrganizationMemberWithOwner extends OrganizationMember {
  owner: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    ownerType: string;
  };
}

/**
 * Organization with member count (for list views)
 */
export interface OrganizationWithStats extends Organization {
  memberCount: number;
  programCount: number;
  blogPostCount: number;
}

/**
 * Organization model utilities
 */
export class OrganizationModel {
  /**
   * Convert database row to Organization entity
   */
  static fromDB(row: OrganizationDB): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logoUrl: row.logoUrl,
      wordmarkUrl: row.wordmarkUrl,
      websiteUrl: row.websiteUrl,
      organizationType: row.organizationType as OrganizationType | null,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }

  /**
   * Generate a URL-friendly slug from a name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
      .slice(0, 200);            // Limit length
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    // Slug must be lowercase alphanumeric with hyphens, 1-200 chars
    return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug) && slug.length <= 200;
  }
}

/**
 * Organization member model utilities
 */
export class OrganizationMemberModel {
  /**
   * Convert database row to OrganizationMember entity
   */
  static fromDB(row: OrganizationMemberDB): OrganizationMember {
    return {
      id: row.id,
      organizationId: row.organizationId,
      programOwnerId: row.programOwnerId,
      role: row.role as OrganizationRole,
      joinedAt: new Date(row.joinedAt as unknown as string | number | Date),
    };
  }

  /**
   * Check if a role can manage members (add/remove/update roles)
   */
  static canManageMembers(role: OrganizationRole): boolean {
    return role === 'admin';
  }

  /**
   * Check if a role can create content on behalf of the organization
   */
  static canCreateContent(role: OrganizationRole): boolean {
    return role === 'admin' || role === 'editor';
  }
}
