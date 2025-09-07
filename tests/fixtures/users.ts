import type { User, UserWithProfile, FitnessProfile, NewUser, CreateUserData } from '@/server/models/userModel';

export class UserBuilder {
  private user: User;
  private profile: FitnessProfile;

  constructor(overrides: Partial<User> = {}) {
    const now = new Date();
    const userId = this.generateUuid();
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
    this.user = {
      id: userId,
      name: 'John Doe',
      phoneNumber: `+1555555${randomSuffix}`, // Generates unique phone numbers
      email: null,
      stripeCustomerId: null,
      preferredSendHour: 8,
      timezone: 'America/New_York',
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
    this.profile = {
      id: this.generateUuid(),
      userId: userId,
      fitnessGoals: 'General fitness',
      skillLevel: 'intermediate',
      exerciseFrequency: '3-4 days/week',
      gender: 'male',
      age: 30,
      createdAt: now,
      updatedAt: now,
    };
  }

  withId(id: string): UserBuilder {
    this.user.id = id;
    return this;
  }

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  withPhoneNumber(phoneNumber: string): UserBuilder {
    this.user.phoneNumber = phoneNumber;
    return this;
  }

  withEmail(email: string | null): UserBuilder {
    this.user.email = email;
    return this;
  }

  withStripeCustomerId(stripeCustomerId: string | null): UserBuilder {
    this.user.stripeCustomerId = stripeCustomerId;
    return this;
  }

  withCreatedAt(createdAt: Date): UserBuilder {
    this.user.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): UserBuilder {
    this.user.updatedAt = updatedAt;
    return this;
  }

  withPreferredSendHour(hour: number): UserBuilder {
    if (hour < 0 || hour > 23) {
      throw new Error('Preferred send hour must be between 0 and 23');
    }
    this.user.preferredSendHour = hour;
    return this;
  }

  withTimezone(timezone: string): UserBuilder {
    this.user.timezone = timezone;
    return this;
  }

  asNewUser(): NewUser {
    const { id, createdAt, updatedAt, ...newUser } = this.user;
    return newUser;
  }

  asCreateUserData(): CreateUserData {
    const { id, createdAt, updatedAt, ...createData } = this.user;
    return createData;
  }

  build(): UserWithProfile {
    // Update profile userId to match user id in case it was changed
    this.profile.userId = this.user.id;
    return { 
      ...this.user,
      profile: this.profile,
      info: []
    };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const mockUsers = {
  john: () => new UserBuilder()
    .withId('user-1')
    .withName('John Doe')
    .withPhoneNumber('+12025551234')
    .withEmail('john@example.com')
    .build(),

  jane: () => new UserBuilder()
    .withId('user-2')
    .withName('Jane Smith')
    .withPhoneNumber('+13035556789')
    .withEmail('jane@example.com')
    .withStripeCustomerId('cus_jane123')
    .build(),

  noEmail: () => new UserBuilder()
    .withId('user-3')
    .withName('No Email User')
    .withPhoneNumber('+14045551111')
    .withEmail(null)
    .build(),

  withStripe: () => new UserBuilder()
    .withId('user-4')
    .withName('Premium User')
    .withPhoneNumber('+15055552222')
    .withEmail('premium@example.com')
    .withStripeCustomerId('cus_premium456')
    .build(),

  // Timezone-specific users
  newYork: () => new UserBuilder()
    .withId('user-ny')
    .withName('New York User')
    .withPhoneNumber('+12125551234')
    .withEmail('ny@example.com')
    .withTimezone('America/New_York')
    .withPreferredSendHour(8)
    .build(),

  losAngeles: () => new UserBuilder()
    .withId('user-la')
    .withName('Los Angeles User')
    .withPhoneNumber('+13105551234')
    .withEmail('la@example.com')
    .withTimezone('America/Los_Angeles')
    .withPreferredSendHour(8)
    .build(),

  london: () => new UserBuilder()
    .withId('user-lon')
    .withName('London User')
    .withPhoneNumber('+17185551234') // US number for consistency
    .withEmail('london@example.com')
    .withTimezone('Europe/London')
    .withPreferredSendHour(8)
    .build(),

  tokyo: () => new UserBuilder()
    .withId('user-tokyo')
    .withName('Tokyo User')
    .withPhoneNumber('+14155551234') // US number for consistency
    .withEmail('tokyo@example.com')
    .withTimezone('Asia/Tokyo')
    .withPreferredSendHour(8)
    .build(),

  sydney: () => new UserBuilder()
    .withId('user-sydney')
    .withName('Sydney User')
    .withPhoneNumber('+16195551234') // US number for consistency
    .withEmail('sydney@example.com')
    .withTimezone('Australia/Sydney')
    .withPreferredSendHour(8)
    .build(),

  mumbai: () => new UserBuilder()
    .withId('user-mumbai')
    .withName('Mumbai User')
    .withPhoneNumber('+17735551234') // US number for consistency
    .withEmail('mumbai@example.com')
    .withTimezone('Asia/Kolkata')
    .withPreferredSendHour(8)
    .build(),

  // Edge case timezones
  kiribati: () => new UserBuilder()
    .withId('user-kiribati')
    .withName('Kiribati User')
    .withPhoneNumber('+19075551234') // US number for consistency
    .withEmail('kiribati@example.com')
    .withTimezone('Pacific/Kiritimati') // UTC+14
    .withPreferredSendHour(8)
    .build(),

  baker: () => new UserBuilder()
    .withId('user-baker')
    .withName('Baker Island User')
    .withPhoneNumber('+18081234567')
    .withEmail('baker@example.com')
    .withTimezone('Pacific/Midway') // UTC-11 (close to Baker Island UTC-12)
    .withPreferredSendHour(8)
    .build(),
};

export const createMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => 
    new UserBuilder()
      .withId(`user-${i + 1}`)
      .withName(`User ${i + 1}`)
      .withPhoneNumber(`+1555000${String(i + 1).padStart(4, '0')}`)
      .withEmail(i % 2 === 0 ? `user${i + 1}@example.com` : null)
      .build()
  );
};

export const createMockCreateUserData = (): CreateUserData => {
  return new UserBuilder().asCreateUserData();
};

export const createInvalidUsers = () => ({
  missingName: { phoneNumber: '+12025551234' },
  emptyName: { name: '', phoneNumber: '+12025551234' },
  shortName: { name: 'A', phoneNumber: '+12025551234' },
  invalidPhone: { name: 'Invalid Phone', phoneNumber: 'not-a-phone' },
  shortPhone: { name: 'Short Phone', phoneNumber: '+123' },
  invalidEmail: { name: 'Bad Email', phoneNumber: '+12025551234', email: 'not-an-email' },
});

export const phoneNumbers = {
  valid: [
    '+12025551234',
    '+1 202 555 1234',
    '+1-202-555-1234',
    '+1 (202) 555-1234',
    '12025551234',
    '2025551234',
  ],
  invalid: [
    '',
    '123',
    'not-a-phone',
    '+++123456',
    'abc123456789',
  ],
};