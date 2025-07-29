import { BaseRepository } from '@/server/repositories/baseRepository';
import type { 
  User, 
  FitnessProfile, 
  UserWithProfile, 
  CreateUserData, 
  CreateFitnessProfileData 
} from '@/server/models/userModel';
import { getLocalHourForTimezone } from '@/server/utils/timezone';

export class UserRepository extends BaseRepository {
  async create(userData: CreateUserData): Promise<User> {
    return await this.db
      .insertInto('users')
      .values({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email || null,
        stripeCustomerId: userData.stripeCustomerId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst();
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('stripeCustomerId', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst();
  }

  async update(id: string, userData: Partial<CreateUserData>): Promise<User> {
    return await this.db
      .updateTable('users')
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    return await this.db
      .insertInto('fitnessProfiles')
      .values({
        userId: userId,
        fitnessGoals: profileData.fitnessGoals,
        skillLevel: profileData.skillLevel,
        exerciseFrequency: profileData.exerciseFrequency,
        gender: profileData.gender,
        age: profileData.age,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow() as FitnessProfile;
  }

  async findWithProfile(userId: string): Promise<UserWithProfile | null> {
    const user = await this.findById(userId);
    
    if (!user) {
      return null;
    }

    const profile = await this.db
      .selectFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();

    return {
      ...user,
      profile: profile || null,
      info: []
    };
  }

  async findFitnessProfileByUserId(userId: string): Promise<FitnessProfile | undefined> {
    return await this.db
      .selectFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();
  }

  async updatePreferences(userId: string, preferences: { 
    preferredSendHour?: number; 
    timezone?: string; 
  }): Promise<User> {
    return await this.db
      .updateTable('users')
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]> {
    // This query finds all users whose local preferred hour matches the current UTC hour
    // We'll need to calculate this for each timezone
    const users = await this.db
      .selectFrom('users')
      .leftJoin('fitnessProfiles', 'users.id', 'fitnessProfiles.userId')
      // .leftJoin('subscriptions', 'users.id', 'subscriptions.userId')
      // .where('subscriptions.status', '=', 'active')
      .selectAll('users')
      .select([
        'fitnessProfiles.id as profileId',
        'fitnessProfiles.fitnessGoals',
        'fitnessProfiles.skillLevel',
        'fitnessProfiles.exerciseFrequency',
        'fitnessProfiles.gender',
        'fitnessProfiles.age',
        'fitnessProfiles.createdAt as profileCreatedAt',
        'fitnessProfiles.updatedAt as profileUpdatedAt'
      ])
      .execute();

    // Filter users whose local hour matches their preference
    const matchingUsers: UserWithProfile[] = [];
    const currentUtcDate = new Date();
    currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);

    for (const user of users) {
      try {
        const localHour = getLocalHourForTimezone(currentUtcDate, user.timezone);
        if (localHour === user.preferredSendHour) {
          const profile: FitnessProfile | null = user.profileId ? {
            id: user.profileId,
            userId: user.id,
            fitnessGoals: user.fitnessGoals!,
            skillLevel: user.skillLevel!,
            exerciseFrequency: user.exerciseFrequency!,
            gender: user.gender!,
            age: user.age!,
            createdAt: user.profileCreatedAt!,
            updatedAt: user.profileUpdatedAt!
          } : null;

          matchingUsers.push({
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            email: user.email,
            stripeCustomerId: user.stripeCustomerId,
            preferredSendHour: user.preferredSendHour,
            timezone: user.timezone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile,
            info: []
          });
        }
      } catch (error) {
        console.error(`Error processing user ${user.id} timezone:`, error);
        // Skip users with invalid timezone data
      }
    }

    return matchingUsers;
  }

  async findActiveUsersWithPreferences(): Promise<User[]> {
    return await this.db
      .selectFrom('users')
      .innerJoin('subscriptions', 'users.id', 'subscriptions.userId')
      .where('subscriptions.status', '=', 'active')
      .selectAll('users')
      .execute();
  }
}