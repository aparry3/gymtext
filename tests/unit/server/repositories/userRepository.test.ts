import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '@/server/repositories/userRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { UserBuilder, mockUsers, createInvalidUsers } from '../../../fixtures/users';
import { FitnessProfileBuilder, mockProfiles } from '../../../fixtures/fitnessProfiles';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('UserRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let userRepository: UserRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    userRepository = new UserRepository(mockDb);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = new UserBuilder().asCreateUserData();
      const expectedUser = new UserBuilder(userData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('users');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedUser);

      const result = await userRepository.create(userData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('users');
      expect(insertBuilder.values).toHaveBeenCalledWith({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        stripeCustomerId: userData.stripeCustomerId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should handle null email and stripeCustomerId', async () => {
      const userData = new UserBuilder()
        .withEmail(null)
        .withStripeCustomerId(null)
        .asCreateUserData();
      const expectedUser = new UserBuilder(userData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('users');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedUser);

      const result = await userRepository.create(userData);

      expect(insertBuilder.values).toHaveBeenCalledWith({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: null,
        stripeCustomerId: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(result.email).toBeNull();
      expect(result.stripeCustomerId).toBeNull();
    });

    it('should throw error when insert fails', async () => {
      const userData = new UserBuilder().asCreateUserData();
      const insertBuilder = dbHelper.mockInsertInto('users');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(userRepository.create(userData)).rejects.toThrow('Insert failed');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const user = mockUsers.john();
      const selectBuilder = dbHelper.mockSelectFrom('users');
      selectBuilder.executeTakeFirst.mockResolvedValue(user);

      const result = await userRepository.findById(user.id);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      expect(selectBuilder.where).toHaveBeenCalledWith('id', '=', user.id);
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should return undefined when user not found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('users');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await userRepository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByPhoneNumber', () => {
    it('should find user by phone number', async () => {
      const user = mockUsers.jane();
      const selectBuilder = dbHelper.mockSelectFrom('users');
      selectBuilder.executeTakeFirst.mockResolvedValue(user);

      const result = await userRepository.findByPhoneNumber(user.phoneNumber);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      expect(selectBuilder.where).toHaveBeenCalledWith('phoneNumber', '=', user.phoneNumber);
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should return undefined when phone number not found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('users');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await userRepository.findByPhoneNumber('+19999999999');

      expect(result).toBeUndefined();
    });
  });

  describe('findByStripeCustomerId', () => {
    it('should find user by stripe customer id', async () => {
      const user = mockUsers.withStripe();
      const selectBuilder = dbHelper.mockSelectFrom('users');
      selectBuilder.executeTakeFirst.mockResolvedValue(user);

      const result = await userRepository.findByStripeCustomerId(user.stripeCustomerId!);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      expect(selectBuilder.where).toHaveBeenCalledWith('stripeCustomerId', '=', user.stripeCustomerId);
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should return undefined when stripe customer id not found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('users');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await userRepository.findByStripeCustomerId('cus_notfound');

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const user = mockUsers.john();
      const updateData = { name: 'John Updated', email: 'john.updated@example.com' };
      const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
      
      const updateBuilder = dbHelper.mockUpdateTable('users');
      updateBuilder.executeTakeFirstOrThrow.mockResolvedValue(updatedUser);

      const result = await userRepository.update(user.id, updateData);

      expect(mockDb.updateTable).toHaveBeenCalledWith('users');
      expect(updateBuilder.set).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(updateBuilder.where).toHaveBeenCalledWith('id', '=', user.id);
      expect(updateBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should update only specified fields', async () => {
      const user = mockUsers.jane();
      const updateData = { stripeCustomerId: 'cus_updated123' };
      const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
      
      const updateBuilder = dbHelper.mockUpdateTable('users');
      updateBuilder.executeTakeFirstOrThrow.mockResolvedValue(updatedUser);

      const result = await userRepository.update(user.id, updateData);

      expect(updateBuilder.set).toHaveBeenCalledWith({
        stripeCustomerId: 'cus_updated123',
        updatedAt: expect.any(Date),
      });
      expect(result.stripeCustomerId).toBe('cus_updated123');
    });

    it('should throw error when update fails', async () => {
      const updateBuilder = dbHelper.mockUpdateTable('users');
      updateBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Update failed'));

      await expect(userRepository.update('user-1', { name: 'New Name' })).rejects.toThrow('Update failed');
    });

    it('should throw error when user not found', async () => {
      const updateBuilder = dbHelper.mockUpdateTable('users');
      updateBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('No results'));

      await expect(userRepository.update('non-existent', { name: 'New Name' })).rejects.toThrow('No results');
    });
  });

  describe('createFitnessProfile', () => {
    it('should create fitness profile successfully', async () => {
      const userId = 'user-1';
      const profileData = new FitnessProfileBuilder().asNewFitnessProfile();
      const expectedProfile = new FitnessProfileBuilder({ ...profileData, userId }).build();
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessProfiles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedProfile);

      const result = await userRepository.createFitnessProfile(userId, profileData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('fitnessProfiles');
      expect(insertBuilder.values).toHaveBeenCalledWith({
        userId,
        fitnessGoals: profileData.fitnessGoals,
        skillLevel: profileData.skillLevel,
        exerciseFrequency: profileData.exerciseFrequency,
        gender: profileData.gender,
        age: profileData.age,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedProfile);
    });

    it('should create fitness profile with different skill levels', async () => {
      const skillLevels = ['beginner', 'intermediate', 'advanced'] as const;
      
      for (const skillLevel of skillLevels) {
        const profileData = new FitnessProfileBuilder()
          .withSkillLevel(skillLevel)
          .asNewFitnessProfile();
        const expectedProfile = new FitnessProfileBuilder({ ...profileData }).build();
        
        const insertBuilder = dbHelper.mockInsertInto('fitnessProfiles');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedProfile);

        const result = await userRepository.createFitnessProfile('user-1', profileData);

        expect(result.skillLevel).toBe(skillLevel);
      }
    });

    it('should throw error when profile creation fails', async () => {
      const insertBuilder = dbHelper.mockInsertInto('fitnessProfiles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(
        userRepository.createFitnessProfile('user-1', new FitnessProfileBuilder().asNewFitnessProfile())
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('findWithProfile', () => {
    it('should find user with profile', async () => {
      const user = mockUsers.john();
      const profile = mockProfiles.intermediate();
      
      let callCount = 0;
      mockDb.selectFrom = vi.fn().mockImplementation((table) => {
        const queryBuilder = {
          where: vi.fn().mockReturnThis(),
          selectAll: vi.fn().mockReturnThis(),
          executeTakeFirst: vi.fn(),
        };
        
        if (table === 'users' && callCount === 0) {
          queryBuilder.executeTakeFirst.mockResolvedValue(user);
          callCount++;
        } else if (table === 'fitnessProfiles') {
          queryBuilder.executeTakeFirst.mockResolvedValue(profile);
        }
        
        return queryBuilder;
      });

      const result = await userRepository.findWithProfile(user.id);

      expect(result).toEqual({
        ...user,
        profile,
        info: [],
      });
    });

    it('should return user with null profile when profile not found', async () => {
      const user = mockUsers.noEmail();
      
      let callCount = 0;
      mockDb.selectFrom = vi.fn().mockImplementation((table) => {
        const queryBuilder = {
          where: vi.fn().mockReturnThis(),
          selectAll: vi.fn().mockReturnThis(),
          executeTakeFirst: vi.fn(),
        };
        
        if (table === 'users' && callCount === 0) {
          queryBuilder.executeTakeFirst.mockResolvedValue(user);
          callCount++;
        } else if (table === 'fitnessProfiles') {
          queryBuilder.executeTakeFirst.mockResolvedValue(undefined);
        }
        
        return queryBuilder;
      });

      const result = await userRepository.findWithProfile(user.id);

      expect(result).toEqual({
        ...user,
        profile: null,
        info: [],
      });
    });

    it('should return null when user not found', async () => {
      mockDb.selectFrom = vi.fn().mockImplementation(() => ({
        where: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      }));

      const result = await userRepository.findWithProfile('non-existent');

      expect(result).toBeNull();
      expect(mockDb.selectFrom).toHaveBeenCalledTimes(1);
    });
  });

  describe('findFitnessProfileByUserId', () => {
    it('should find fitness profile by user id', async () => {
      const profile = mockProfiles.advanced();
      const selectBuilder = dbHelper.mockSelectFrom('fitnessProfiles');
      selectBuilder.executeTakeFirst.mockResolvedValue(profile);

      const result = await userRepository.findFitnessProfileByUserId(profile.userId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('fitnessProfiles');
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', profile.userId);
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(result).toEqual(profile);
    });

    it('should return undefined when profile not found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('fitnessProfiles');
      selectBuilder.executeTakeFirst.mockResolvedValue(undefined);

      const result = await userRepository.findFitnessProfileByUserId('user-without-profile');

      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.selectFrom = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(userRepository.findById('user-1')).rejects.toThrow('Database connection failed');
    });

    it('should handle transaction errors in complex operations', async () => {
      const user = mockUsers.john();
      
      let callCount = 0;
      mockDb.selectFrom = vi.fn().mockImplementation((table) => {
        const queryBuilder = {
          where: vi.fn().mockReturnThis(),
          selectAll: vi.fn().mockReturnThis(),
          executeTakeFirst: vi.fn(),
        };
        
        if (table === 'users' && callCount === 0) {
          queryBuilder.executeTakeFirst.mockResolvedValue(user);
          callCount++;
        } else if (table === 'fitnessProfiles') {
          queryBuilder.executeTakeFirst.mockRejectedValue(new Error('Query failed'));
        }
        
        return queryBuilder;
      });

      await expect(userRepository.findWithProfile(user.id)).rejects.toThrow('Query failed');
    });
  });
});