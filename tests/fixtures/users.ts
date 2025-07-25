import type { User, NewUser, CreateUserData } from '@/server/models/userModel';

export class UserBuilder {
  private user: User;

  constructor(overrides: Partial<User> = {}) {
    const now = new Date();
    this.user = {
      id: this.generateUuid(),
      name: 'John Doe',
      phoneNumber: '+1234567890',
      email: null,
      stripeCustomerId: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
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

  asNewUser(): NewUser {
    const { id, createdAt, updatedAt, ...newUser } = this.user;
    return newUser;
  }

  asCreateUserData(): CreateUserData {
    const { id, createdAt, updatedAt, ...createData } = this.user;
    return createData;
  }

  build(): User {
    return { ...this.user };
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