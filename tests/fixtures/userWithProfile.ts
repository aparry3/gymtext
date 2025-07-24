import { UserBuilder, mockUsers } from './users';
import { FitnessProfileBuilder, mockProfiles } from './fitnessProfiles';
import type { User, FitnessProfile, UserWithProfile } from '@/server/models/userModel';

export class UserWithProfileBuilder {
  private userBuilder: UserBuilder;
  private profileBuilder: FitnessProfileBuilder;

  constructor(userOverrides: Partial<User> = {}, profileOverrides: Partial<FitnessProfile> = {}) {
    this.userBuilder = new UserBuilder(userOverrides);
    this.profileBuilder = new FitnessProfileBuilder(profileOverrides);
  }

  withUser(builder: UserBuilder): UserWithProfileBuilder {
    this.userBuilder = builder;
    return this;
  }

  withProfile(builder: FitnessProfileBuilder): UserWithProfileBuilder {
    this.profileBuilder = builder;
    return this;
  }

  withoutProfile(): { user: User, userWithProfile: UserWithProfile } {
    const user = this.userBuilder.build();
    
    return {
      user,
      userWithProfile: {
        ...user,
        profile: null,
        info: [],
      },
    };
  }

  build(): { user: User, profile: FitnessProfile, userWithProfile: UserWithProfile } {
    const user = this.userBuilder.build();
    const profile = this.profileBuilder.withUserId(user.id).build();
    
    return {
      user,
      profile,
      userWithProfile: {
        ...user,
        profile,
        info: [
          `Age: ${profile.age}`,
          `Gender: ${profile.gender}`,
          `Skill Level: ${profile.skillLevel}`,
          `Exercise Frequency: ${profile.exerciseFrequency}`,
          `Fitness Goals: ${profile.fitnessGoals}`,
        ],
      },
    };
  }
}

export const mockUserWithProfile = {
  beginnerUser: () => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder(mockUsers.john()))
      .withProfile(new FitnessProfileBuilder(mockProfiles.beginner()));
    return builder.build();
  },

  intermediateUser: () => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder(mockUsers.jane()))
      .withProfile(new FitnessProfileBuilder(mockProfiles.intermediate()));
    return builder.build();
  },

  advancedUser: () => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder(mockUsers.withStripe()))
      .withProfile(new FitnessProfileBuilder(mockProfiles.advanced()));
    return builder.build();
  },

  userWithoutProfile: () => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder(mockUsers.noEmail()));
    return builder.withoutProfile();
  },

  youngBeginnerUser: () => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder()
        .withId('user-young')
        .withName('Young Beginner')
        .withPhoneNumber('+16065551234')
        .withEmail('young@example.com'))
      .withProfile(new FitnessProfileBuilder(mockProfiles.youngBeginner()));
    return builder.build();
  },

  seniorIntermediateUser: () => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder()
        .withId('user-senior')
        .withName('Senior User')
        .withPhoneNumber('+17075556789')
        .withEmail('senior@example.com')
        .withStripeCustomerId('cus_senior789'))
      .withProfile(new FitnessProfileBuilder(mockProfiles.seniorIntermediate()));
    return builder.build();
  },
};

export const createMockUsersWithProfiles = (count: number): UserWithProfile[] => {
  return Array.from({ length: count }, (_, i) => {
    const builder = new UserWithProfileBuilder()
      .withUser(new UserBuilder()
        .withId(`user-${i + 1}`)
        .withName(`User ${i + 1}`)
        .withPhoneNumber(`+1555000${String(i + 1).padStart(4, '0')}`)
        .withEmail(i % 2 === 0 ? `user${i + 1}@example.com` : null))
      .withProfile(new FitnessProfileBuilder()
        .withId(`profile-${i + 1}`)
        .withAge(20 + (i % 40))
        .withSkillLevel(i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'advanced'));
    
    return builder.build().userWithProfile;
  });
};