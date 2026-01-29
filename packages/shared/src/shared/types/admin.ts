import type { User } from '../../server/models/user';

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

  // Program-specific data (for program signups)
  programId?: string;
  programAnswers?: Record<string, string | string[]>;
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
