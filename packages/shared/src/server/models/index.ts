// Model class exports
export { UserModel } from './user';
export { FitnessPlanModel } from './fitnessPlan';
export { WorkoutInstanceModel } from './workout';
export { MicrocycleModel } from './microcycle';

// User types (DB types + shared types re-exported)
export type {
  User, NewUser, UserUpdate,
  FitnessProfile,
  UserWithProfile, CreateUserData, CreateFitnessProfileData
} from './user';

// Message types (DB types)
export type {
  Message, NewMessage, MessageUpdate, RecentMessage
} from './conversation';

// Fitness plan types (DB types + shared types)
export type {
  FitnessPlan, NewFitnessPlan, FitnessPlanUpdate,
  FitnessPlanDB, FitnessPlanOverview,
  PlanStructure, PlanStatus, PlanCurrentState
} from './fitnessPlan';
export { PlanStructureSchema, PlanScheduleTemplateSchema } from './fitnessPlan';

// Workout types (DB types + shared types)
export type {
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate,
  WorkoutStructure, WorkoutActivity, WorkoutSection, Intensity, ExerciseResolution
} from './workout';
export { WorkoutStructureSchema, WorkoutActivitySchema, WorkoutSectionSchema, IntensitySchema, ExerciseResolutionSchema } from './workout';

// Microcycle types
export type { Microcycle, MicrocycleStructure, MicrocycleDay } from './microcycle';
export type { MicrocyclePattern, MicrocycleGenerationOutput } from './microcycle';
export { MicrocycleStructureSchema, MicrocycleDaySchema } from './microcycle';

// Profile types (structured profile from LLM extraction)
export type { StructuredProfile, StructuredConstraint, ExperienceLevel } from './profile';
export { StructuredProfileSchema, StructuredConstraintSchema, ExperienceLevelSchema } from './profile';

// PageVisit types
export type { PageVisit, NewPageVisit } from './pageVisit';

// Prompt types
export type { Prompt, NewPrompt, PromptRole, PromptPair } from './prompt';

// Referral types
export type { Referral, NewReferral, ReferralUpdate, ReferralStats } from './referral';
export { MAX_REFERRAL_CREDITS, REFERRAL_CREDIT_AMOUNT_CENTS } from './referral';

// Program owner types
export type {
  ProgramOwner, NewProgramOwner, ProgramOwnerUpdate, OwnerType
} from './programOwner';
export { ProgramOwnerModel } from './programOwner';

// Program types
export type {
  Program, NewProgram, ProgramUpdate,
  SchedulingMode, Cadence, LateJoinerPolicy, BillingModel
} from './program';
export { ProgramModel } from './program';

// Program enrollment types
export type {
  ProgramEnrollment, NewProgramEnrollment, ProgramEnrollmentUpdate, EnrollmentStatus
} from './programEnrollment';
export { ProgramEnrollmentModel } from './programEnrollment';

// Program version types (the "recipe")
export type {
  ProgramVersion, NewProgramVersion, ProgramVersionUpdate,
  ProgramVersionStatus, GenerationConfig, DifficultyMetadata,
  ProgramQuestion
} from './programVersion';
export { ProgramVersionModel, AI_PROGRAM_VERSION_ID } from './programVersion';

// Program family types (grouping)
export type {
  ProgramFamily, NewProgramFamily, ProgramFamilyUpdate,
  ProgramFamilyProgram, NewProgramFamilyProgram, ProgramFamilyProgramUpdate,
  FamilyType, FamilyVisibility, ProgramFamilyRole
} from './programFamily';
export { ProgramFamilyModel, ProgramFamilyProgramModel } from './programFamily';

// Exercise types (canonical exercises and aliases)
export type {
  Exercise, NewExercise, ExerciseUpdate,
  ExerciseAlias, NewExerciseAlias, ExerciseAliasUpdate,
  AliasSource, ExerciseWithAliases
} from './exercise';

// Movement types (progress tracking groupings)
export type { Movement, NewMovement, MovementUpdate, MetricType } from './movement';

// Exercise resolution types
export type {
  ExerciseMatchMethod,
  SignalScores,
  ExerciseSearchResult,
  ExerciseResolutionResult,
  ResolutionOptions,
} from './exerciseResolution';

// Blog post types
export type {
  BlogPost, NewBlogPost, BlogPostUpdate,
  BlogPostWithAuthor, BlogPostListItem, BlogPostStatus
} from './blogPost';
export { BlogPostModel } from './blogPost';

// Re-export database types from _types
export * from './_types';
