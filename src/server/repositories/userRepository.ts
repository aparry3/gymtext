import { BaseRepository } from '@/server/repositories/baseRepository';
import { sql } from 'kysely';
import { 
  type User, 
  type FitnessProfile, 
  type UserWithProfile, 
  type CreateUserData, 
  type CreateFitnessProfileData, 
  UserModel
} from '@/server/models/userModel';
import { getLocalHourForTimezone } from '@/server/utils/timezone';

export class UserRepository extends BaseRepository {
  async list(params: {
    q?: string;
    status?: string;
    hasProfile?: boolean;
    hasPlan?: boolean;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<{ users: UserWithProfile[]; total: number; }> {
    const {
      q,
      createdFrom,
      createdTo,
      page = 1,
      pageSize = 20,
      sort = 'createdAt:desc',
    } = params;

    const [sortField, sortDir] = sort.split(':');

    let query = this.db
      .selectFrom('users')
      .selectAll('users');

    if (q) {
      const like = `%${q}%`;
      query = query.where((eb) => eb.or([
        eb('users.name', 'ilike', like),
        eb('users.email', 'ilike', like),
        eb('users.phoneNumber', 'ilike', like),
      ]));
    }

    if (createdFrom) {
      query = query.where('users.createdAt', '>=', new Date(createdFrom));
    }
    if (createdTo) {
      query = query.where('users.createdAt', '<=', new Date(createdTo));
    }

    // Note: hasProfile filter can check if profile is not empty JSON
    if (params.hasProfile === true) {
      query = query.where('users.profile', 'is not', null)
        .where('users.profile', '!=', '{}');
    } else if (params.hasProfile === false) {
      query = query.where((eb) => eb.or([
        eb('users.profile', 'is', null),
        eb('users.profile', '=', '{}')
      ]));
    }

    let countBuilder = this.db
      .selectFrom('users');

    if (q) {
      const like = `%${q}%`;
      countBuilder = countBuilder.where((eb) => eb.or([
        eb('users.name', 'ilike', like),
        eb('users.email', 'ilike', like),
        eb('users.phoneNumber', 'ilike', like),
      ]));
    }
    if (createdFrom) countBuilder = countBuilder.where('users.createdAt', '>=', new Date(createdFrom));
    if (createdTo) countBuilder = countBuilder.where('users.createdAt', '<=', new Date(createdTo));
    
    if (params.hasProfile === true) {
      countBuilder = countBuilder.where('users.profile', 'is not', null)
        .where('users.profile', '!=', '{}');
    } else if (params.hasProfile === false) {
      countBuilder = countBuilder.where((eb) => eb.or([
        eb('users.profile', 'is', null),
        eb('users.profile', '=', '{}')
      ]));
    }

    const totalResult = await countBuilder
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirst();
    const total = Number(totalResult?.count || 0);

    const usersRows = await query
      // @ts-expect-error dynamic orderBy
      .orderBy(`users.${sortField}`, sortDir === 'asc' ? 'asc' : 'desc')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .execute();

    const users: UserWithProfile[] = usersRows.map((u) => (UserModel.fromDb(u))).filter((u) => u !== undefined);

    return { users, total };
  }

  async create(userData: CreateUserData): Promise<UserWithProfile | undefined> {
    const user = await this.db
    .insertInto('users')
    .values({
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      email: userData.email || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      timezone: userData.timezone,
      preferredSendHour: userData.preferredSendHour,
      profile: userData.profile || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
    return UserModel.fromDb(user);
  }

  async findById(id: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirstOrThrow());
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .selectAll()
      .executeTakeFirstOrThrow());
  }

  async findByEmail(email: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirstOrThrow());
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('stripeCustomerId', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirstOrThrow());
  }

  async update(id: string, userData: Partial<CreateUserData>): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .updateTable('users')
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow());
  }

  async createOrUpdateFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile | undefined> {
    // Get the current user
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Merge the new profile data with existing profile
    const existingProfile = user.profile
    
    // Ensure required fields have defaults for new schema structure
    const updatedProfile: FitnessProfile = {
      goals: { primary: 'General fitness improvement' }, // Default goal
      ...existingProfile,
      ...profileData,
    };

    // Update the user's profile field
    await this.db
      .updateTable('users')
      .set({
        profile: JSON.parse(JSON.stringify(updatedProfile)), // Ensure it's a plain object
        updatedAt: new Date(),
      })
      .where('id', '=', userId)
      .execute();

    // Also log the update in profile_updates table
    await this.db
      .insertInto('profileUpdates')
      .values({
        userId,
        patch: JSON.parse(JSON.stringify(profileData)),
        source: 'api',
        reason: 'Profile update',
        createdAt: new Date()
      })
      .execute();

    return updatedProfile;
  }

  async findWithProfile(userId: string): Promise<UserWithProfile | undefined> {
    const user = await this.findById(userId);
    
    if (!user) {
      return undefined;
    }

    return UserModel.fromDb(user)
  }

  async findFitnessProfileByUserId(userId: string): Promise<FitnessProfile | undefined> {
    const user = await this.findById(userId);
    if (!user) {
      return undefined;
    }
    
    return UserModel.parseProfile(user.profile) || undefined;
  }

  async updatePreferences(userId: string, preferences: { 
    preferredSendHour?: number; 
    timezone?: string; 
  }): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .updateTable('users')
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow());
  }

  async findUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]> {
    // This query finds all users whose local preferred hour matches the current UTC hour
    const users = await this.db
      .selectFrom('users')
      // .leftJoin('subscriptions', 'users.id', 'subscriptions.userId')
      // .where('subscriptions.status', '=', 'active')
      .selectAll('users')
      .execute();

    // Filter users whose local hour matches their preference
    const matchingUsers: UserWithProfile[] = [];
    const currentUtcDate = new Date();
    currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);

    for (const user of users) {
      try {
        const localHour = getLocalHourForTimezone(currentUtcDate, user.timezone);
        if (localHour === user.preferredSendHour) {
          matchingUsers.push(UserModel.fromDb(user)!);
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

  /**
   * Patch the user's profile with a partial update using JSONB merge
   * This performs a deep merge of the provided patch with the existing profile
   */
  async patchProfile(userId: string, patch: Partial<FitnessProfile>): Promise<UserWithProfile | undefined> {
    // Use PostgreSQL's JSONB merge operator to deep merge the patch
    // The || operator merges two JSONB values, with the right-hand value overwriting keys
    const result = await this.db
      .updateTable('users')
      .set({
        // Use raw SQL for JSONB merge operation
        profile: sql`profile || ${JSON.stringify(patch)}::jsonb`,
        updatedAt: new Date(),
      })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();

      return UserModel.fromDb(result);
  }
}