import { testDb } from './db';
import { testConfig } from './config';
import chalk from 'chalk';

export interface UserData {
  name: string;
  phoneNumber: string;
  email?: string;
  fitnessGoals?: string;
  skillLevel?: string;
  exerciseFrequency?: string;
  gender?: string;
  age?: string;
  timezone?: string;
  preferredSendHour?: number;
}

export interface FitnessProfile {
  fitnessGoals?: string;
  skillLevel?: string;
  exerciseFrequency?: string;
  equipment?: string[];
  workoutPreferences?: string[];
  injuries?: string[];
}

/**
 * User management utility for test scripts
 */
export class TestUsers {
  private static instance: TestUsers;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TestUsers {
    if (!TestUsers.instance) {
      TestUsers.instance = new TestUsers();
    }
    return TestUsers.instance;
  }

  /**
   * Create a new user via API
   */
  async createUser(data: UserData, skipPayment: boolean = false): Promise<{ userId?: string; sessionId?: string } | null> {
    try {
      const url = testConfig.getApiUrl('checkout');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timezone: data.timezone || 'America/New_York',
          preferredSendHour: data.preferredSendHour ?? 8,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Checkout failed: ${result.message || response.statusText}`);
      }

      if (result.userId) {
        console.log(chalk.green('✅ User created successfully'));
        console.log(chalk.white('User ID:'), result.userId);
        return { userId: result.userId };
      } else if (result.sessionId) {
        console.log(chalk.yellow('⚠️  Stripe checkout session created'));
        console.log(chalk.white('Session ID:'), result.sessionId);
        
        if (!skipPayment) {
          console.log(chalk.yellow('Payment required to continue'));
        }
        
        return { sessionId: result.sessionId };
      }

      return null;
    } catch (error) {
      console.error(chalk.red('Error creating user:'), error);
      return null;
    }
  }

  /**
   * Update user's fitness profile
   */
  async updateProfile(userId: string, profile: FitnessProfile): Promise<boolean> {
    try {
      const url = testConfig.getApiUrl(`users/${userId}/profile`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Profile update failed: ${error.message || response.statusText}`);
      }

      console.log(chalk.green('✅ Profile updated successfully'));
      return true;
    } catch (error) {
      console.error(chalk.red('Error updating profile:'), error);
      return false;
    }
  }

  /**
   * Delete a test user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const deleted = await testDb.deleteUser(userId);
      if (deleted) {
        console.log(chalk.green('✅ User deleted successfully'));
      }
      return deleted;
    } catch (error) {
      console.error(chalk.red('Error deleting user:'), error);
      return false;
    }
  }

  /**
   * List all active users
   */
  async listActiveUsers(): Promise<any[]> {
    try {
      const users = await testDb.getActiveUsers();
      console.log(chalk.blue(`Found ${users.length} active users`));
      return users;
    } catch (error) {
      console.error(chalk.red('Error listing active users:'), error);
      return [];
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(phoneOrId: string) {
    try {
      let user;
      
      // Check if it's a phone number or ID
      if (phoneOrId.startsWith('+') || phoneOrId.match(/^\d{10,}$/)) {
        // Format phone number if needed
        const phone = phoneOrId.startsWith('+') ? phoneOrId : `+${phoneOrId}`;
        user = await testDb.getUserByPhone(phone);
      } else {
        user = await testDb.getUserById(phoneOrId);
      }

      if (!user) {
        console.log(chalk.yellow('User not found'));
        return null;
      }

      // Get additional details
      const profile = await testDb.getUserWithProfile(user.id);
      const plan = await testDb.getFitnessPlan(user.id);
      // NOTE: Progress tracking via DB is deprecated - now calculated from dates
      // const progress = await testDb.getCurrentProgress(user.id);
      const progress = null;
      const microcycle = await testDb.getMicrocycle(user.id);

      return {
        user,
        profile,
        plan,
        progress,
        microcycle,
      };
    } catch (error) {
      console.error(chalk.red('Error getting user details:'), error);
      return null;
    }
  }

  /**
   * Display user summary
   */
  displayUserSummary(details: any): void {
    if (!details || !details.user) {
      console.log(chalk.red('No user data to display'));
      return;
    }

    const { user, profile, plan, progress, microcycle } = details;

    console.log(chalk.bold('\n👤 User Information'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white('Name:'), user.name);
    console.log(chalk.white('Phone:'), user.phoneNumber);
    console.log(chalk.white('Email:'), user.email || 'N/A');
    console.log(chalk.white('Timezone:'), user.timezone);
    console.log(chalk.white('Send Time:'), `${user.preferredSendHour}:00`);

    if (profile && profile.profile) {
      console.log(chalk.bold('\n💪 Fitness Profile'));
      console.log(chalk.gray('─'.repeat(50)));
      const profileData = typeof profile.profile === 'object' && profile.profile ? profile.profile : {};
      console.log(chalk.white('Goals:'), (profileData as any).fitnessGoals || 'N/A');
      console.log(chalk.white('Skill Level:'), (profileData as any).skillLevel || 'N/A');
      console.log(chalk.white('Frequency:'), (profileData as any).exerciseFrequency || 'N/A');
    }

    if (plan) {
      console.log(chalk.bold('\n📋 Fitness Plan'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.white('Program Type:'), plan.programType);
      console.log(chalk.white('Total Weeks:'), plan.lengthWeeks || 'N/A');
      console.log(chalk.white('Started:'), new Date(plan.startDate).toLocaleDateString());
    }

    if (progress) {
      console.log(chalk.bold('\n📊 Progress'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.white('Mesocycle:'), progress.mesocycleIndex + 1);
      console.log(chalk.white('Week:'), progress.microcycleWeek);
    }

    if (microcycle) {
      console.log(chalk.bold('\n🗓️ Current Microcycle'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.white('Week Number:'), microcycle.weekNumber);
      console.log(chalk.white('Active:'), microcycle.isActive ? 'Yes' : 'No');
    }
  }
}

// Export singleton instance
export const testUsers = TestUsers.getInstance();