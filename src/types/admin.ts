import { User, FitnessProfile } from '@/server/models/user';

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

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export interface AdminUserDetailResponse {
  user: AdminUser;
  profile: FitnessProfile | null;
  markdownProfile?: string | null;
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