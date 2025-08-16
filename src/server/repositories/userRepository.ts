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
      .leftJoin('fitnessProfiles', 'users.id', 'fitnessProfiles.userId')
      .selectAll('users')
      .select((eb) => [
        eb.ref('fitnessProfiles.id').as('profileId'),
        eb.ref('fitnessProfiles.fitnessGoals').as('fitnessGoals'),
        eb.ref('fitnessProfiles.skillLevel').as('skillLevel'),
        eb.ref('fitnessProfiles.exerciseFrequency').as('exerciseFrequency'),
        eb.ref('fitnessProfiles.gender').as('gender'),
        eb.ref('fitnessProfiles.age').as('age'),
        eb.ref('fitnessProfiles.createdAt').as('profileCreatedAt'),
        eb.ref('fitnessProfiles.updatedAt').as('profileUpdatedAt'),
      ]);

    if (q) {
      const like = `%${q}%`;
      query = query.where((eb) => eb.or([
        eb('users.name', 'ilike', like),
        eb('users.email', 'ilike', like),
        eb('users.phoneNumber', 'ilike', like),
      ]));
    }

    if (createdFrom) {
      query = query.where('users.createdAt', '>=', createdFrom);
    }
    if (createdTo) {
      query = query.where('users.createdAt', '<=', createdTo);
    }

    // Note: hasProfile/hasPlan filters can be added when plan joins are available

    const countQuery = this.db
      .selectFrom('users')
      .leftJoin('fitnessProfiles', 'users.id', 'fitnessProfiles.userId')
      .select((eb) => eb.fn.countAll<number>().as('count'));

    // apply same filters to count
    if (q) {
      const like = `%${q}%`;
      // @ts-expect-error Kysely typing for or conditions
      countQuery.where((eb) => eb.or([
        eb('users.name', 'ilike', like),
        eb('users.email', 'ilike', like),
        eb('users.phoneNumber', 'ilike', like),
      ]));
    }
    if (createdFrom) countQuery.where('users.createdAt', '>=', createdFrom);
    if (createdTo) countQuery.where('users.createdAt', '<=', createdTo);

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.count || 0);

    const usersRows = await query
      // @ts-expect-error dynamic orderBy
      .orderBy(`users.${sortField}`, sortDir === 'asc' ? 'asc' : 'desc')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .execute();

    const users: UserWithProfile[] = usersRows.map((u) => ({
      id: u.id,
      name: u.name,
      phoneNumber: u.phoneNumber,
      email: u.email,
      stripeCustomerId: u.stripeCustomerId,
      preferredSendHour: u.preferredSendHour,
      timezone: u.timezone,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile: (u as any).profileId ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (u as any).profileId,
        userId: u.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fitnessGoals: (u as any).fitnessGoals,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        skillLevel: (u as any).skillLevel,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exerciseFrequency: (u as any).exerciseFrequency,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gender: (u as any).gender,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        age: (u as any).age,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: (u as any).profileCreatedAt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: (u as any).profileUpdatedAt,
      } : null,
      info: [],
    }));

    return { users, total };
  }
  async create(userData: CreateUserData): Promise<User> {
    return await this.db
      .insertInto('users')
      .values({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email || null,
        stripeCustomerId: userData.stripeCustomerId || null,
        timezone: userData.timezone,
        preferredSendHour: userData.preferredSendHour,
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