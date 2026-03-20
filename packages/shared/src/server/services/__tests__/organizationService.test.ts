import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrganizationService } from '../domain/organization/organizationService';
import type { OrganizationServiceInstance } from '../domain/organization/organizationService';

// Mock the OrganizationModel
vi.mock('../../../models/organization', async (importOriginal) => {
  const original = await importOriginal() as Record<string, any>;
  return {
    ...original,
    OrganizationModel: {
      generateSlug: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
    },
  };
});

function makeOrg(overrides: Record<string, any> = {}) {
  return {
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    description: null,
    logoUrl: null,
    wordmarkUrl: null,
    websiteUrl: null,
    organizationType: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMember(overrides: Record<string, any> = {}) {
  return {
    id: 'member-1',
    organizationId: 'org-1',
    programOwnerId: 'owner-1',
    role: 'admin' as const,
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    organization: {
      create: vi.fn().mockResolvedValue(makeOrg()),
      findById: vi.fn().mockResolvedValue(makeOrg()),
      findBySlug: vi.fn().mockResolvedValue(makeOrg()),
      listAll: vi.fn().mockResolvedValue([makeOrg()]),
      listAllWithStats: vi.fn().mockResolvedValue([{ ...makeOrg(), memberCount: 3 }]),
      listActive: vi.fn().mockResolvedValue([makeOrg()]),
      update: vi.fn().mockResolvedValue(makeOrg({ name: 'Updated' })),
      delete: vi.fn().mockResolvedValue(true),
      isSlugUnique: vi.fn().mockResolvedValue(true),
      listMembers: vi.fn().mockResolvedValue([makeMember()]),
      getMember: vi.fn().mockResolvedValue(makeMember()),
      addMember: vi.fn().mockResolvedValue(makeMember()),
      updateMemberRole: vi.fn().mockResolvedValue(makeMember({ role: 'editor' })),
      removeMember: vi.fn().mockResolvedValue(true),
      countAdmins: vi.fn().mockResolvedValue(2),
      listOrganizationsForOwner: vi.fn().mockResolvedValue([{ ...makeOrg(), role: 'admin' }]),
    },
  } as any;
}

describe('OrganizationService', () => {
  let service: OrganizationServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createOrganizationService(repos);
  });

  describe('create', () => {
    it('should create org with auto-generated slug', async () => {
      await service.create({ name: 'My Gym' });
      expect(repos.organization.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My Gym',
        slug: 'my-gym',
        isActive: true,
      }));
    });

    it('should use custom slug when provided', async () => {
      await service.create({ name: 'My Gym', slug: 'custom' });
      expect(repos.organization.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'custom',
      }));
    });

    it('should handle slug uniqueness conflicts', async () => {
      repos.organization.isSlugUnique
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      await service.create({ name: 'My Gym' });
      expect(repos.organization.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'my-gym-1',
      }));
    });
  });

  describe('getById', () => {
    it('should return org', async () => {
      const result = await service.getById('org-1');
      expect(result).toEqual(expect.objectContaining({ id: 'org-1' }));
    });

    it('should return null when not found', async () => {
      repos.organization.findById.mockResolvedValueOnce(null);
      expect(await service.getById('unknown')).toBeNull();
    });
  });

  describe('getBySlug', () => {
    it('should return org by slug', async () => {
      const result = await service.getBySlug('test-org');
      expect(result).not.toBeNull();
    });
  });

  describe('listAll / listActive / listAllWithStats', () => {
    it('should list all orgs', async () => {
      expect(await service.listAll()).toHaveLength(1);
    });

    it('should list active orgs', async () => {
      expect(await service.listActive()).toHaveLength(1);
    });

    it('should list all with stats', async () => {
      const result = await service.listAllWithStats();
      expect(result[0]).toHaveProperty('memberCount');
    });
  });

  describe('update', () => {
    it('should update org fields', async () => {
      await service.update('org-1', { name: 'Updated', description: 'New desc' });
      expect(repos.organization.update).toHaveBeenCalledWith('org-1', expect.objectContaining({
        name: 'Updated',
        description: 'New desc',
      }));
    });

    it('should ensure slug uniqueness on update', async () => {
      repos.organization.isSlugUnique.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      await service.update('org-1', { slug: 'taken-slug' });
      expect(repos.organization.update).toHaveBeenCalledWith('org-1', expect.objectContaining({
        slug: 'taken-slug-1',
      }));
    });
  });

  describe('delete', () => {
    it('should delete org', async () => {
      expect(await service.delete('org-1')).toBe(true);
    });
  });

  // Member management
  describe('addMember', () => {
    it('should add member when actor is admin', async () => {
      const result = await service.addMember('org-1', 'new-owner', 'editor', 'admin-owner');
      expect(result).not.toBeNull();
    });

    it('should return null when actor is not admin', async () => {
      repos.organization.getMember
        .mockResolvedValueOnce(makeMember({ role: 'editor' })); // actor check
      const result = await service.addMember('org-1', 'new-owner', 'editor', 'editor-owner');
      expect(result).toBeNull();
    });

    it('should return existing member if already a member', async () => {
      repos.organization.getMember
        .mockResolvedValueOnce(makeMember()) // actor check (admin)
        .mockResolvedValueOnce(makeMember({ programOwnerId: 'existing' })); // existing check
      const result = await service.addMember('org-1', 'existing', 'editor', 'admin-owner');
      expect(result).not.toBeNull();
      expect(repos.organization.addMember).not.toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    it('should update role when actor is admin', async () => {
      repos.organization.getMember
        .mockResolvedValueOnce(makeMember()) // actor check (admin)
        .mockResolvedValueOnce(makeMember({ role: 'editor' })); // target member check
      const result = await service.updateMemberRole('org-1', 'owner-1', 'viewer', 'admin-owner');
      expect(result).not.toBeNull();
    });

    it('should prevent demoting the last admin', async () => {
      repos.organization.getMember
        .mockResolvedValueOnce(makeMember()) // actor check
        .mockResolvedValueOnce(makeMember({ role: 'admin' })); // target is admin
      repos.organization.countAdmins.mockResolvedValueOnce(1); // only 1 admin

      const result = await service.updateMemberRole('org-1', 'owner-1', 'editor', 'admin-owner');
      expect(result).toBeNull();
    });
  });

  describe('removeMember', () => {
    it('should remove member when actor is admin', async () => {
      repos.organization.getMember
        .mockResolvedValueOnce(makeMember()) // actor check
        .mockResolvedValueOnce(makeMember({ role: 'editor' })); // target is not admin
      const result = await service.removeMember('org-1', 'editor-owner', 'admin-owner');
      expect(result).toBe(true);
    });

    it('should prevent removing the last admin', async () => {
      repos.organization.getMember
        .mockResolvedValueOnce(makeMember()) // actor check
        .mockResolvedValueOnce(makeMember({ role: 'admin' })); // target is admin
      repos.organization.countAdmins.mockResolvedValueOnce(1);
      const result = await service.removeMember('org-1', 'last-admin', 'admin-owner');
      expect(result).toBe(false);
    });

    it('should return false when actor is not admin', async () => {
      repos.organization.getMember.mockResolvedValueOnce(makeMember({ role: 'viewer' }));
      const result = await service.removeMember('org-1', 'target', 'viewer-owner');
      expect(result).toBe(false);
    });
  });

  describe('getMemberRole', () => {
    it('should return role for member', async () => {
      const role = await service.getMemberRole('org-1', 'owner-1');
      expect(role).toBe('admin');
    });

    it('should return null for non-member', async () => {
      repos.organization.getMember.mockResolvedValueOnce(null);
      const role = await service.getMemberRole('org-1', 'unknown');
      expect(role).toBeNull();
    });
  });

  describe('canManageMembers', () => {
    it('should return true for admins', async () => {
      expect(await service.canManageMembers('org-1', 'admin-owner')).toBe(true);
    });

    it('should return false for non-admins', async () => {
      repos.organization.getMember.mockResolvedValueOnce(makeMember({ role: 'editor' }));
      expect(await service.canManageMembers('org-1', 'editor-owner')).toBe(false);
    });

    it('should return false for non-members', async () => {
      repos.organization.getMember.mockResolvedValueOnce(null);
      expect(await service.canManageMembers('org-1', 'stranger')).toBe(false);
    });
  });

  describe('canCreateContent', () => {
    it('should return true for admins', async () => {
      expect(await service.canCreateContent('org-1', 'admin-owner')).toBe(true);
    });

    it('should return true for editors', async () => {
      repos.organization.getMember.mockResolvedValueOnce(makeMember({ role: 'editor' }));
      expect(await service.canCreateContent('org-1', 'editor-owner')).toBe(true);
    });

    it('should return false for viewers', async () => {
      repos.organization.getMember.mockResolvedValueOnce(makeMember({ role: 'viewer' }));
      expect(await service.canCreateContent('org-1', 'viewer-owner')).toBe(false);
    });

    it('should return false for non-members', async () => {
      repos.organization.getMember.mockResolvedValueOnce(null);
      expect(await service.canCreateContent('org-1', 'stranger')).toBe(false);
    });
  });
});
