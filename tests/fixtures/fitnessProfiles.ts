import type { FitnessProfile, NewFitnessProfile } from '@/server/models/userModel';

export class FitnessProfileBuilder {
  private profile: FitnessProfile;

  constructor(overrides: Partial<FitnessProfile> = {}) {
    const now = new Date();
    this.profile = {
      id: this.generateUuid(),
      userId: this.generateUuid(),
      fitnessGoals: 'Build muscle, Lose weight',
      skillLevel: 'intermediate',
      exerciseFrequency: '3-4 times per week',
      gender: 'male',
      age: 30,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  withId(id: string): FitnessProfileBuilder {
    this.profile.id = id;
    return this;
  }

  withUserId(userId: string): FitnessProfileBuilder {
    this.profile.userId = userId;
    return this;
  }

  withFitnessGoals(goals: string): FitnessProfileBuilder {
    this.profile.fitnessGoals = goals;
    return this;
  }

  withSkillLevel(level: 'beginner' | 'intermediate' | 'advanced'): FitnessProfileBuilder {
    this.profile.skillLevel = level;
    return this;
  }

  withExerciseFrequency(frequency: string): FitnessProfileBuilder {
    this.profile.exerciseFrequency = frequency;
    return this;
  }

  withGender(gender: string): FitnessProfileBuilder {
    this.profile.gender = gender;
    return this;
  }

  withAge(age: number): FitnessProfileBuilder {
    this.profile.age = age;
    return this;
  }

  withCreatedAt(createdAt: Date): FitnessProfileBuilder {
    this.profile.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): FitnessProfileBuilder {
    this.profile.updatedAt = updatedAt;
    return this;
  }

  asNewFitnessProfile(): NewFitnessProfile {
    const { id, createdAt, updatedAt, ...newProfile } = this.profile;
    return newProfile;
  }

  build(): FitnessProfile {
    return { ...this.profile };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const mockProfiles = {
  beginner: () => new FitnessProfileBuilder()
    .withId('profile-1')
    .withSkillLevel('beginner')
    .withFitnessGoals('Lose weight, Get healthier')
    .withExerciseFrequency('2-3 times per week')
    .withAge(35)
    .withGender('female')
    .build(),

  intermediate: () => new FitnessProfileBuilder()
    .withId('profile-2')
    .withSkillLevel('intermediate')
    .withFitnessGoals('Build muscle, Increase strength')
    .withExerciseFrequency('3-4 times per week')
    .withAge(28)
    .withGender('male')
    .build(),

  advanced: () => new FitnessProfileBuilder()
    .withId('profile-3')
    .withSkillLevel('advanced')
    .withFitnessGoals('Compete in powerlifting, Build strength')
    .withExerciseFrequency('5-6 times per week')
    .withAge(32)
    .withGender('non-binary')
    .build(),

  youngBeginner: () => new FitnessProfileBuilder()
    .withId('profile-4')
    .withSkillLevel('beginner')
    .withFitnessGoals('Get fit, Build endurance')
    .withExerciseFrequency('2-3 times per week')
    .withAge(22)
    .withGender('male')
    .build(),

  seniorIntermediate: () => new FitnessProfileBuilder()
    .withId('profile-5')
    .withSkillLevel('intermediate')
    .withFitnessGoals('Stay healthy, Maintain muscle')
    .withExerciseFrequency('3-4 times per week')
    .withAge(55)
    .withGender('female')
    .build(),
};

export const createMockFitnessProfiles = (count: number, userId?: string): FitnessProfile[] => {
  const skillLevels = ['beginner', 'intermediate', 'advanced'] as const;
  const genders = ['male', 'female', 'non-binary'];
  const goals = [
    'Build muscle, Lose weight',
    'Increase strength, Build endurance',
    'Get healthier, Stay active',
    'Compete in sports, Build power',
  ];
  const frequencies = [
    '2-3 times per week',
    '3-4 times per week',
    '4-5 times per week',
    '5-6 times per week',
  ];

  return Array.from({ length: count }, (_, i) => 
    new FitnessProfileBuilder()
      .withId(`profile-${i + 1}`)
      .withUserId(userId || `user-${i + 1}`)
      .withSkillLevel(skillLevels[i % skillLevels.length])
      .withGender(genders[i % genders.length])
      .withAge(20 + (i % 40))
      .withFitnessGoals(goals[i % goals.length])
      .withExerciseFrequency(frequencies[i % frequencies.length])
      .build()
  );
};

export const createInvalidProfiles = () => ({
  missingGoals: {
    userId: 'user-1',
    skillLevel: 'intermediate',
    exerciseFrequency: '3-4 times per week',
    gender: 'male',
    age: 30,
  },
  invalidSkillLevel: {
    userId: 'user-1',
    fitnessGoals: 'Build muscle',
    skillLevel: 'expert',
    exerciseFrequency: '3-4 times per week',
    gender: 'male',
    age: 30,
  },
  negativeAge: {
    userId: 'user-1',
    fitnessGoals: 'Build muscle',
    skillLevel: 'intermediate',
    exerciseFrequency: '3-4 times per week',
    gender: 'male',
    age: -5,
  },
  tooYoung: {
    userId: 'user-1',
    fitnessGoals: 'Build muscle',
    skillLevel: 'intermediate',
    exerciseFrequency: '3-4 times per week',
    gender: 'male',
    age: 10,
  },
  tooOld: {
    userId: 'user-1',
    fitnessGoals: 'Build muscle',
    skillLevel: 'intermediate',
    exerciseFrequency: '3-4 times per week',
    gender: 'male',
    age: 120,
  },
});