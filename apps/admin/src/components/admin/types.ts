import { User } from '@/server/models/user';

// ============================================
// Shared Types
// ============================================

// Signup data from onboarding form
export interface SignupData {
  // Formatted text for LLM (backward compatible)
  fitnessGoals?: string;
  currentExercise?: string;
  injuries?: string;
  environment?: string;

  // Structured data from MultiStepSignupForm (for analytics/reporting)
  primaryGoals?: ('strength' | 'endurance' | 'weight_loss' | 'general_fitness')[];
  goalsElaboration?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  desiredDaysPerWeek?: '3_per_week' | '4_per_week' | '5_per_week' | '6_per_week';
  availabilityElaboration?: string;
  trainingLocation?: 'home' | 'commercial_gym' | 'bodyweight';
  equipment?: string[];
  acceptedRisks?: boolean;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// User Admin Types
// ============================================

// Admin-specific user types
export interface AdminUser extends User {
  hasProfile: boolean;
  profileSummary?: {
    primaryGoal?: string;
    experienceLevel?: string;
    lastActivity?: string;
  };
  stats?: {
    totalWorkouts?: number;
    lastLoginAt?: string;
    isActiveToday?: boolean;
  };
}

// Filter types for the users list
export interface UserFilters {
  search?: string;
  hasEmail?: boolean;
  hasProfile?: boolean;
  gender?: string;
  timezone?: string;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

// Sorting options
export interface UserSort {
  field: 'name' | 'email' | 'createdAt' | 'age' | 'timezone';
  direction: 'asc' | 'desc';
}

// API Response types
export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
  stats: {
    totalUsers: number;
    withEmail: number;
    withProfile: number;
    activeToday: number;
  };
}

export type SubscriptionStatus = 'active' | 'cancel_pending' | 'canceled' | 'none';

export interface AdminUserDetailResponse {
  user: AdminUser;
  profile: string | null;
  signupData: SignupData | null;
  subscriptionStatus?: SubscriptionStatus;
  recentActivity?: {
    lastMessage?: string;
    lastWorkout?: string;
    totalMessages?: number;
    totalWorkouts?: number;
  };
}

// Form data types
export interface UserContactData {
  email?: string;
  phoneNumber: string;
  preferredSendHour: number;
  timezone: string;
}

// Action types
export type AdminAction = 'view' | 'edit' | 'delete' | 'send-workout' | 'copy-contact';

// ============================================
// Message Admin Types
// ============================================

// Source type to distinguish between messages table and queue
export type MessageSource = 'message' | 'queue';

// Delivery status for messages
export type MessageDeliveryStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'undelivered';

// Direction
export type MessageDirection = 'inbound' | 'outbound';

// Provider type
export type MessageProvider = 'twilio' | 'local' | 'websocket';

// Row variant for color coding
export type MessageRowVariant =
  | 'inbound'
  | 'outbound-delivered'
  | 'outbound-sent'
  | 'outbound-failed'
  | 'queued';

// Unified message item for display (messages + queue items)
export interface AdminMessageItem {
  id: string;
  clientId: string;
  direction: MessageDirection;
  content: string;
  phoneFrom: string | null;
  phoneTo: string | null;
  provider: MessageProvider | null;
  providerMessageId: string | null;
  deliveryStatus: MessageDeliveryStatus;
  deliveryError: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  // Source info
  source: MessageSource;
  // Queue-specific fields
  queueName?: string;
  sequenceNumber?: number;
  // User info (for global view)
  userName?: string | null;
  userPhone?: string | null;
}

// Filter types for the messages list
export interface MessageFilters {
  search?: string;
  direction?: MessageDirection;
  status?: MessageDeliveryStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Sorting options
export interface MessageSort {
  field: 'createdAt';
  direction: 'asc' | 'desc';
}

// Stats for the messages page
export interface MessageStats {
  totalMessages: number;
  inbound: number;
  outbound: number;
  pending: number;
  failed: number;
}

// API Response type
export interface AdminMessagesResponse {
  messages: AdminMessageItem[];
  pagination: Pagination;
  stats: MessageStats;
}

// ============================================
// Program Owner Admin Types
// ============================================

// Owner type enum
export type OwnerType = 'ai' | 'coach' | 'trainer' | 'influencer';

// Admin-specific program owner type with stats
export interface AdminProgramOwner {
  id: string;
  userId: string | null;
  ownerType: OwnerType;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  stripeConnectAccountId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Stats
  programCount: number;
  enrollmentCount: number;
}

// Filter types for the program owners list
export interface ProgramOwnerFilters {
  search?: string;
  ownerType?: OwnerType;
  isActive?: boolean;
}

// Sorting options
export interface ProgramOwnerSort {
  field: 'displayName' | 'ownerType' | 'createdAt' | 'programCount' | 'enrollmentCount';
  direction: 'asc' | 'desc';
}

// Stats for the program owners page
export interface ProgramOwnerStats {
  totalOwners: number;
  byType: {
    ai: number;
    coach: number;
    trainer: number;
    influencer: number;
  };
  activeOwners: number;
  totalPrograms: number;
  totalEnrollments: number;
}

// API Response type for list
export interface AdminProgramOwnersResponse {
  owners: AdminProgramOwner[];
  pagination: Pagination;
  stats: ProgramOwnerStats;
}

// API Response type for detail
export interface AdminProgramOwnerDetailResponse {
  owner: AdminProgramOwner;
  programs: {
    id: string;
    name: string;
    isActive: boolean;
    enrollmentCount: number;
    createdAt: Date;
  }[];
}

// Form data for create/update
export interface ProgramOwnerFormData {
  displayName: string;
  ownerType: OwnerType;
  bio?: string;
  avatarUrl?: string;
  userId?: string;
  isActive?: boolean;
}

// ============================================
// Program Admin Types
// ============================================

// Scheduling mode for programs
export type SchedulingMode = 'rolling_start' | 'cohort';

// Cadence type for programs
export type ProgramCadence = 'calendar_days' | 'training_days_only';

// Admin-specific program type with stats
export interface AdminProgram {
  id: string;
  ownerId: string;
  ownerName: string;                  // Denormalized for display
  ownerType: OwnerType;               // For badge display
  name: string;
  description: string | null;
  schedulingMode: SchedulingMode;
  cadence: ProgramCadence;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Stats
  enrollmentCount: number;
  versionCount: number;
}

// Filter types for the programs list
export interface ProgramFilters {
  search?: string;
  ownerId?: string;
  schedulingMode?: SchedulingMode;
  isActive?: boolean;
  isPublic?: boolean;
}

// Sorting options
export interface ProgramSort {
  field: 'name' | 'ownerName' | 'createdAt' | 'enrollmentCount';
  direction: 'asc' | 'desc';
}

// Stats for the programs page
export interface ProgramStats {
  totalPrograms: number;
  bySchedulingMode: {
    rolling_start: number;
    cohort: number;
  };
  activePrograms: number;
  publicPrograms: number;
  totalEnrollments: number;
}

// API Response type for list
export interface AdminProgramsResponse {
  programs: AdminProgram[];
  pagination: Pagination;
  stats: ProgramStats;
}

// API Response type for detail
export interface AdminProgramDetailResponse {
  program: AdminProgram;
  owner: {
    id: string;
    displayName: string;
    ownerType: OwnerType;
    avatarUrl: string | null;
  };
  enrollments: AdminEnrollment[];
}

// Form data for create/update
export interface ProgramFormData {
  name: string;
  ownerId: string;
  description?: string;
  schedulingMode: SchedulingMode;
  cadence: ProgramCadence;
  isActive?: boolean;
  isPublic?: boolean;
}

// ============================================
// Enrollment Admin Types
// ============================================

// Enrollment status
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// Admin-specific enrollment type with denormalized data
export interface AdminEnrollment {
  id: string;
  clientId: string;
  clientName: string;                 // Denormalized
  clientPhone: string;                // Denormalized
  programId: string;
  programName: string;                // Denormalized
  programVersionId: string | null;    // The program version the user is enrolled in
  startDate: Date;
  currentWeek: number;
  status: EnrollmentStatus;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Filter types for enrollments
export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  search?: string;
  programId?: string;
}

// Sorting options
export interface EnrollmentSort {
  field: 'clientName' | 'startDate' | 'enrolledAt' | 'currentWeek' | 'status';
  direction: 'asc' | 'desc';
}

// Stats for enrollments
export interface EnrollmentStats {
  total: number;
  byStatus: {
    active: number;
    paused: number;
    completed: number;
    cancelled: number;
  };
}

// API Response type for enrollments list
export interface AdminEnrollmentsResponse {
  enrollments: AdminEnrollment[];
  pagination: Pagination;
  stats: EnrollmentStats;
}

// Form data for enrollment actions
export interface EnrollmentActionData {
  action: 'pause' | 'resume' | 'cancel' | 'complete';
}

export interface EnrollmentUpdateData {
  status?: EnrollmentStatus;
  currentWeek?: number;
}
