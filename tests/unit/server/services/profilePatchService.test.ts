import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePatchService } from '@/server/services/profilePatchService';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileUpdateRepository } from '@/server/repositories/profileUpdateRepository';
import type { FitnessProfile } from '@/server/models/userModel';

// Mock the repositories
vi.mock('@/server/repositories/userRepository', () => ({
  UserRepository: vi.fn().mockImplementation(() => ({
    patchProfile: vi.fn(),
    findWithProfile: vi.fn()
  }))
}));

vi.mock('@/server/repositories/profileUpdateRepository', () => ({
  ProfileUpdateRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn()
  }))
}));

describe('ProfilePatchService', () => {
  let service: ProfilePatchService;
  let mockUserRepo: any;
  let mockProfileUpdateRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProfilePatchService();
    mockUserRepo = new UserRepository();
    mockProfileUpdateRepo = new ProfileUpdateRepository();
  });

  describe('applyPatch', () => {
    it('should apply a valid patch and record the update', async () => {
      const userId = 'user-123';
      const currentProfile: FitnessProfile = {
        userId,
        age: 25,
        gender: 'male',
        experienceLevel: 'beginner',
        fitnessGoals: 'build muscle',
        exerciseFrequency: '3 days per week'
      };

      const patch = {
        experienceLevel: 'intermediate',
        exerciseFrequency: '5 days per week',
        equipment: {
          access: 'gym',
          gymName: 'Planet Fitness'
        }
      };

      const updatedProfile = {
        ...currentProfile,
        ...patch
      };

      // Mock successful patch
      mockUserRepo.patchProfile.mockResolvedValue(updatedProfile);
      
      // Mock successful update record
      mockProfileUpdateRepo.create.mockResolvedValue({
        id: 'update-123',
        userId,
        patch,
        path: 'user.profile',
        reason: 'User specified new training frequency and gym',
        source: 'chat_agent',
        createdAt: new Date()
      });

      const result = await service.applyPatch({
        userId,
        patch,
        reason: 'User specified new training frequency and gym',
        source: 'chat_agent'
      });

      expect(result.profile).toEqual(updatedProfile);
      expect(result.updateId).toBe('update-123');
      expect(result.fieldsUpdated).toEqual(['experienceLevel', 'exerciseFrequency', 'equipment']);
      
      // Verify repository calls
      expect(mockUserRepo.patchProfile).toHaveBeenCalledWith(userId, patch);
      expect(mockProfileUpdateRepo.create).toHaveBeenCalledWith({
        userId,
        patch,
        path: 'user.profile',
        reason: 'User specified new training frequency and gym',
        source: 'chat_agent'
      });
    });

    it('should handle nested object patches correctly', async () => {
      const userId = 'user-456';
      const patch = {
        availability: {
          daysPerWeek: 6,
          minutesPerSession: 90,
          preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        equipment: {
          access: 'home',
          available: ['dumbbells', 'resistance bands', 'pull-up bar']
        }
      };

      const updatedProfile: FitnessProfile = {
        userId,
        age: 30,
        gender: 'female',
        availability: patch.availability,
        equipment: patch.equipment
      };

      mockUserRepo.patchProfile.mockResolvedValue(updatedProfile);
      mockProfileUpdateRepo.create.mockResolvedValue({
        id: 'update-456',
        userId,
        patch,
        createdAt: new Date()
      });

      const result = await service.applyPatch({
        userId,
        patch,
        reason: 'Updated availability and equipment',
        source: 'profile_form'
      });

      expect(result.fieldsUpdated).toEqual(['availability', 'equipment']);
      expect(result.profile.availability).toEqual(patch.availability);
      expect(result.profile.equipment).toEqual(patch.equipment);
    });

    it('should handle empty patches gracefully', async () => {
      const userId = 'user-789';
      const emptyPatch = {};
      
      const currentProfile: FitnessProfile = {
        userId,
        age: 28,
        gender: 'male'
      };

      mockUserRepo.patchProfile.mockResolvedValue(currentProfile);
      mockProfileUpdateRepo.create.mockResolvedValue({
        id: 'update-789',
        userId,
        patch: emptyPatch,
        createdAt: new Date()
      });

      const result = await service.applyPatch({
        userId,
        patch: emptyPatch,
        reason: 'No changes',
        source: 'system'
      });

      expect(result.fieldsUpdated).toEqual([]);
      expect(result.profile).toEqual(currentProfile);
    });

    it('should throw error when user repository fails', async () => {
      const userId = 'user-error';
      const patch = { age: 35 };

      mockUserRepo.patchProfile.mockRejectedValue(new Error('Database error'));

      await expect(service.applyPatch({
        userId,
        patch,
        reason: 'Age update',
        source: 'chat_agent'
      })).rejects.toThrow('Failed to apply profile patch');
    });

    it('should still return profile when update recording fails', async () => {
      const userId = 'user-999';
      const patch = { fitnessGoals: 'lose weight' };
      
      const updatedProfile: FitnessProfile = {
        userId,
        age: 40,
        gender: 'female',
        fitnessGoals: 'lose weight'
      };

      mockUserRepo.patchProfile.mockResolvedValue(updatedProfile);
      
      // Mock update record failure (non-critical)
      mockProfileUpdateRepo.create.mockRejectedValue(new Error('Failed to record'));

      const result = await service.applyPatch({
        userId,
        patch,
        reason: 'Goal change',
        source: 'chat_agent'
      });

      // Should still return the updated profile
      expect(result.profile).toEqual(updatedProfile);
      expect(result.fieldsUpdated).toEqual(['fitnessGoals']);
      // updateId will be undefined since recording failed
      expect(result.updateId).toBeUndefined();
    });
  });

  describe('validatePatch', () => {
    it('should validate correct patch structure', async () => {
      const validPatch = {
        age: 30,
        gender: 'female',
        experienceLevel: 'intermediate',
        fitnessGoals: 'build strength',
        exerciseFrequency: '4 days per week',
        equipment: {
          access: 'gym',
          available: ['barbell', 'dumbbells']
        },
        availability: {
          daysPerWeek: 4,
          minutesPerSession: 60
        }
      };

      const result = await service.validatePatch(validPatch);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject patches with invalid field types', async () => {
      const invalidPatch = {
        age: 'thirty', // Should be number
        exerciseFrequency: 5, // Should be string
        equipment: 'gym' // Should be object
      };

      const result = await service.validatePatch(invalidPatch);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid type for field: age');
      expect(result.errors).toContain('Invalid type for field: exerciseFrequency');
      expect(result.errors).toContain('Invalid type for field: equipment');
    });

    it('should reject patches with unknown fields', async () => {
      const patchWithUnknownFields = {
        age: 25,
        unknownField: 'value',
        anotherUnknown: 123
      };

      const result = await service.validatePatch(patchWithUnknownFields);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown field: unknownField');
      expect(result.errors).toContain('Unknown field: anotherUnknown');
    });

    it('should validate nested object structures', async () => {
      const validNestedPatch = {
        equipment: {
          access: 'home',
          available: ['dumbbells'],
          gymName: undefined // Optional field
        },
        availability: {
          daysPerWeek: 3,
          minutesPerSession: 45,
          preferredDays: ['monday', 'wednesday', 'friday']
        }
      };

      const result = await service.validatePatch(validNestedPatch);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid nested structures', async () => {
      const invalidNestedPatch = {
        equipment: {
          access: 123, // Should be string
          available: 'dumbbells' // Should be array
        }
      };

      const result = await service.validatePatch(invalidNestedPatch);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getUpdateHistory', () => {
    it('should retrieve user update history', async () => {
      const userId = 'user-history';
      const mockHistory = [
        {
          id: 'update-1',
          userId,
          patch: { age: 26 },
          reason: 'Birthday',
          source: 'user_input',
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'update-2',
          userId,
          patch: { experienceLevel: 'intermediate' },
          reason: 'Progress update',
          source: 'chat_agent',
          createdAt: new Date('2024-01-15')
        }
      ];

      // Mock the repository to have a findByUserId method
      mockProfileUpdateRepo.findByUserId = vi.fn().mockResolvedValue(mockHistory);

      const result = await service.getUpdateHistory(userId, { limit: 10 });
      
      expect(result).toEqual(mockHistory);
      expect(mockProfileUpdateRepo.findByUserId).toHaveBeenCalledWith(userId, { limit: 10 });
    });
  });
});