/**
 * Domain model for User
 * This model is independent of database schema and represents
 * the core business entity
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly email: string | null,
    public readonly stripeCustomerId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if user has a Stripe customer ID
   */
  hasStripeCustomer(): boolean {
    return this.stripeCustomerId !== null;
  }

  /**
   * Check if user has an email
   */
  hasEmail(): boolean {
    return this.email !== null;
  }

  /**
   * Create a new User instance with updated fields
   */
  with(updates: Partial<Omit<User, 'id' | 'createdAt'>>): User {
    return new User(
      this.id,
      updates.name ?? this.name,
      updates.phoneNumber ?? this.phoneNumber,
      updates.email !== undefined ? updates.email : this.email,
      updates.stripeCustomerId !== undefined ? updates.stripeCustomerId : this.stripeCustomerId,
      this.createdAt,
      updates.updatedAt ?? new Date()
    );
  }
}

/**
 * Interface for creating a new user
 */
export interface CreateUserInput {
  name: string;
  phoneNumber: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}

/**
 * Interface for updating a user
 */
export interface UpdateUserInput {
  name?: string;
  phoneNumber?: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}