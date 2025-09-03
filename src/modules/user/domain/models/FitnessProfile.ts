/**
 * Domain model for FitnessProfile
 * Represents a user's fitness profile information
 */
export class FitnessProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly fitnessGoals: string,
    public readonly skillLevel: SkillLevel,
    public readonly exerciseFrequency: ExerciseFrequency,
    public readonly gender: Gender,
    public readonly age: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if the profile is for a beginner
   */
  isBeginner(): boolean {
    return this.skillLevel === SkillLevel.BEGINNER;
  }

  /**
   * Check if the user exercises frequently (4+ times per week)
   */
  isFrequentExerciser(): boolean {
    return this.exerciseFrequency === ExerciseFrequency.FOUR_PLUS_PER_WEEK;
  }

  /**
   * Create a new FitnessProfile instance with updated fields
   */
  with(updates: Partial<Omit<FitnessProfile, 'id' | 'userId' | 'createdAt'>>): FitnessProfile {
    return new FitnessProfile(
      this.id,
      this.userId,
      updates.fitnessGoals ?? this.fitnessGoals,
      updates.skillLevel ?? this.skillLevel,
      updates.exerciseFrequency ?? this.exerciseFrequency,
      updates.gender ?? this.gender,
      updates.age ?? this.age,
      this.createdAt,
      updates.updatedAt ?? new Date()
    );
  }
}

/**
 * Skill level enumeration
 */
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Exercise frequency enumeration
 */
export enum ExerciseFrequency {
  ONE_TO_TWO_PER_WEEK = '1-2_per_week',
  THREE_PER_WEEK = '3_per_week',
  FOUR_PLUS_PER_WEEK = '4+_per_week'
}

/**
 * Gender enumeration
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

/**
 * Interface for creating a new fitness profile
 */
export interface CreateFitnessProfileInput {
  userId: string;
  fitnessGoals: string;
  skillLevel: SkillLevel;
  exerciseFrequency: ExerciseFrequency;
  gender: Gender;
  age: number;
}

/**
 * Interface for updating a fitness profile
 */
export interface UpdateFitnessProfileInput {
  fitnessGoals?: string;
  skillLevel?: SkillLevel;
  exerciseFrequency?: ExerciseFrequency;
  gender?: Gender;
  age?: number;
}