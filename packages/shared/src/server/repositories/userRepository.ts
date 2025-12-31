import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  type User,
  type UserWithProfile,
  type CreateUserData,
  UserModel
} from '@/server/models/user';
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

    // hasProfile filter checks for existence in profiles table
    if (params.hasProfile === true) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('profiles')
            .whereRef('profiles.clientId', '=', 'users.id')
            .select('profiles.id')
        )
      );
    } else if (params.hasProfile === false) {
      query = query.where((eb) =>
        eb.not(
          eb.exists(
            eb.selectFrom('profiles')
              .whereRef('profiles.clientId', '=', 'users.id')
              .select('profiles.id')
          )
        )
      );
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

    // hasProfile filter checks for existence in profiles table
    if (params.hasProfile === true) {
      countBuilder = countBuilder.where((eb) =>
        eb.exists(
          eb.selectFrom('profiles')
            .whereRef('profiles.clientId', '=', 'users.id')
            .select('profiles.id')
        )
      );
    } else if (params.hasProfile === false) {
      countBuilder = countBuilder.where((eb) =>
        eb.not(
          eb.exists(
            eb.selectFrom('profiles')
              .whereRef('profiles.clientId', '=', 'users.id')
              .select('profiles.id')
          )
        )
      );
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
      age: userData.age || null,
      gender: userData.gender || null,
      email: userData.email || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      timezone: userData.timezone,
      preferredSendHour: userData.preferredSendHour,
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
      .executeTakeFirst());
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst());
  }

  async findByEmail(email: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst());
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('stripeCustomerId', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst());
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
      .executeTakeFirst());
  }

  /**
   * Find user with latest profile
   * Performs LEFT JOIN with profiles table to get most recent profile
   */
  async findWithProfile(userId: string): Promise<UserWithProfile | undefined> {
    const result = await this.db
      .selectFrom('users')
      .leftJoin('profiles', (join) =>
        join
          .onRef('profiles.clientId', '=', 'users.id')
          .on((eb) => {
            // Only join the most recent profile for this user
            const subquery = eb
              .selectFrom('profiles as p2')
              .select((eb) => eb.fn.max('p2.createdAt').as('maxCreated'))
              .whereRef('p2.clientId', '=', 'users.id');

            return eb('profiles.createdAt', '=', subquery);
          })
      )
      .selectAll('users')
      .select('profiles.profile')
      .where('users.id', '=', userId)
      .executeTakeFirst();

    if (!result) {
      return undefined;
    }

    return UserModel.fromDbWithProfile(result);
  }

  async updatePreferences(userId: string, preferences: {
    preferredSendHour?: number;
    timezone?: string;
    name?: string;
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
    // This query finds all users with active subscriptions whose local hour is at or past their preferred send hour
    // Only users with status='active' receive messages (excludes 'cancel_pending' and 'canceled')
    // Note: This returns candidates - the caller should also filter by workout existence to avoid duplicates
    const users = await this.db
      .selectFrom('users')
      .innerJoin('subscriptions', 'users.id', 'subscriptions.clientId')
      .where('subscriptions.status', '=', 'active')
      .selectAll('users')
      .execute();

    // Filter users whose local hour is at or past their preferred send hour
    const matchingUsers: UserWithProfile[] = [];
    const currentUtcDate = new Date();
    currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);

    for (const user of users) {
      try {
        const localHour = getLocalHourForTimezone(currentUtcDate, user.timezone);
        if (localHour >= user.preferredSendHour) {
          matchingUsers.push(UserModel.fromDb(user)!);
        }
      } catch (error) {
        console.error(`Error processing user ${user.id} timezone:`, error);
        // Skip users with invalid timezone data
      }
    }

    return matchingUsers;
  }

  async findUsersByTimezones(timezones: string[]): Promise<UserWithProfile[]> {
    // Return empty array if no timezones provided
    if (timezones.length === 0) {
      return [];
    }

    // Query users with active subscriptions in the specified timezones
    // Only users with status='active' receive messages (excludes 'cancel_pending' and 'canceled')
    const users = await this.db
      .selectFrom('users')
      .innerJoin('subscriptions', 'users.id', 'subscriptions.clientId')
      .where('subscriptions.status', '=', 'active')
      .where('timezone', 'in', timezones)
      .selectAll('users')
      .execute();

    return users.map(u => UserModel.fromDb(u)).filter(u => u !== undefined) as UserWithProfile[];
  }

  async findActiveUsersWithPreferences(): Promise<User[]> {
    return await this.db
      .selectFrom('users')
      .innerJoin('subscriptions', 'users.id', 'subscriptions.clientId')
      .where('subscriptions.status', '=', 'active')
      .selectAll('users')
      .execute();
  }

  async delete(id: string): Promise<boolean> {
    // First, clean up admin_activity_logs which has no FK constraint
    // Delete where user is the target or the actor
    await this.db
      .deleteFrom('adminActivityLogs')
      .where((eb) => eb.or([
        eb('targetClientId', '=', id),
        eb('actorClientId', '=', id)
      ]))
      .execute();

    // Now delete the user - CASCADE will handle all other related tables:
    // profile_updates, subscriptions, conversations, messages, fitness_plans,
    // microcycles, workout_instances, user_onboarding, profiles, short_links, message_queues
    const result = await this.db
      .deleteFrom('users')
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  // ============================================
  // Referral Code Methods
  // ============================================

  /**
   * Generate a random 6-character referral code
   * Uses uppercase letters and numbers, excluding confusing characters (O/0, I/1, L)
   */
  generateReferralCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get or create a referral code for a user
   * If the user already has a code, returns it; otherwise generates and saves a new one
   */
  async getOrCreateReferralCode(userId: string): Promise<string | null> {
    // First check if user already has a code
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'referralCode'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate a new code with retry logic for uniqueness
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const newCode = this.generateReferralCode();

      try {
        const updated = await this.db
          .updateTable('users')
          .set({ referralCode: newCode, updatedAt: new Date() })
          .where('id', '=', userId)
          .where('referralCode', 'is', null) // Only update if still null (race condition protection)
          .returningAll()
          .executeTakeFirst();

        if (updated) {
          return newCode;
        }

        // If no rows updated, the user might have gotten a code from another request
        const refreshedUser = await this.db
          .selectFrom('users')
          .select('referralCode')
          .where('id', '=', userId)
          .executeTakeFirst();

        if (refreshedUser?.referralCode) {
          return refreshedUser.referralCode;
        }
      } catch (error) {
        // Unique constraint violation - try again with a new code
        attempts++;
        if (attempts >= maxAttempts) {
          console.error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
          throw error;
        }
      }
    }

    return null;
  }

  /**
   * Find a user by their referral code
   * Used to validate referral codes during signup
   */
  async findByReferralCode(code: string): Promise<UserWithProfile | undefined> {
    return UserModel.fromDb(await this.db
      .selectFrom('users')
      .where('referralCode', '=', code.toUpperCase())
      .selectAll()
      .executeTakeFirst());
  }
}