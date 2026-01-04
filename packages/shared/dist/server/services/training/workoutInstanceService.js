import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { workoutAgentService } from '@/server/services/agents/training';
import { FitnessPlanService } from './fitnessPlanService';
import { ProgressService } from './progressService';
import { MicrocycleService } from './microcycleService';
import { shortLinkService } from '../links/shortLinkService';
import { getWeekday, getDayOfWeekName } from '@/shared/utils/date';
import { normalizeWhitespace } from '@/server/utils/formatters';
export class WorkoutInstanceService {
    static instance;
    workoutRepo;
    fitnessPlanService;
    progressService;
    microcycleService;
    constructor() {
        this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
        this.fitnessPlanService = FitnessPlanService.getInstance();
        this.progressService = ProgressService.getInstance();
        this.microcycleService = MicrocycleService.getInstance();
    }
    static getInstance() {
        if (!WorkoutInstanceService.instance) {
            WorkoutInstanceService.instance = new WorkoutInstanceService();
        }
        return WorkoutInstanceService.instance;
    }
    /**
     * Get recent workouts for a user
     */
    async getRecentWorkouts(userId, limit = 10) {
        return await this.workoutRepo.getRecentWorkouts(userId, limit);
    }
    /**
     * Get workouts by date range
     */
    async getWorkoutsByDateRange(userId, startDate, endDate) {
        return await this.workoutRepo.getWorkoutsByDateRange(userId, startDate, endDate);
    }
    /**
     * Get a specific workout by ID and verify it belongs to the user
     */
    async getWorkoutById(workoutId, userId) {
        const workout = await this.workoutRepo.getWorkoutById(workoutId);
        if (!workout || workout.clientId !== userId) {
            return null;
        }
        return workout;
    }
    /**
     * Get a workout by ID without authorization check
     * For internal service-to-service use only
     */
    async getWorkoutByIdInternal(workoutId) {
        return await this.workoutRepo.getWorkoutById(workoutId);
    }
    /**
     * Get a workout by user ID and date
     */
    async getWorkoutByUserIdAndDate(userId, date) {
        return await this.workoutRepo.findByClientIdAndDate(userId, date);
    }
    /**
     * Update the message for a workout
     */
    async updateWorkoutMessage(workoutId, message) {
        return await this.workoutRepo.update(workoutId, { message });
    }
    /**
     * Create a new workout instance
     */
    async createWorkout(workout) {
        return await this.workoutRepo.create(workout);
    }
    /**
     * Update a workout with new details, description, reasoning, and message
     */
    async updateWorkout(workoutId, updates) {
        return await this.workoutRepo.update(workoutId, updates);
    }
    /**
     * Generate a workout for a specific date using AI
     *
     * This is the core business logic for workout generation:
     * 1. Gets user's fitness plan and current progress
     * 2. Determines day pattern from microcycle
     * 3. Generates workout using AI agent
     * 4. Saves workout with pre-generated message
     * 5. Creates short link and appends to message
     *
     * @param user - User with profile
     * @param targetDate - Date to generate workout for
     * @param providedMicrocycle - Optional pre-loaded microcycle (avoids extra DB query)
     * @returns Generated and saved workout instance
     */
    async generateWorkoutForDate(user, targetDate, providedMicrocycle) {
        try {
            // Get fitness plan
            const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
            if (!plan) {
                console.log(`No fitness plan found for user ${user.id}`);
                return null;
            }
            // Get current progress for the target date
            const progress = await this.progressService.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
            if (!progress) {
                console.log(`No progress found for user ${user.id} on ${targetDate.toISODate()}`);
                return null;
            }
            // Use provided microcycle or get/create one for the target date
            let microcycle = providedMicrocycle ?? null;
            if (!microcycle) {
                const result = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, targetDate.toJSDate(), user.timezone);
                microcycle = result.microcycle;
            }
            if (!microcycle) {
                console.log(`Could not get/create microcycle for user ${user.id}`);
                return null;
            }
            // Get the day's overview from the microcycle
            // getWeekday returns 1-7 (Mon-Sun), days array is 0-indexed (Mon=0, Sun=6)
            const dayIndex = getWeekday(targetDate.toJSDate(), user.timezone) - 1;
            const dayOverview = microcycle.days?.[dayIndex];
            if (!dayOverview || typeof dayOverview !== 'string') {
                console.log(`No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
                return null;
            }
            // Get activity type from structured microcycle data (if available)
            const structuredDay = microcycle.structured?.days?.[dayIndex];
            const activityType = structuredDay?.activityType;
            // Get recent workouts for context (last 7 days)
            // const recentWorkouts = await this.getRecentWorkouts(user.id, 7);
            // Use AI agent service to generate workout with message
            const { response: description, message, structure } = await workoutAgentService.generateWorkout(user, dayOverview, microcycle.isDeload ?? false, activityType);
            // Extract theme from structured data or use default
            const theme = structure?.title || 'Workout';
            const details = {
                theme, // Keep theme for quick access
            };
            // Convert to database format
            const workout = {
                clientId: user.id,
                microcycleId: microcycle.id,
                date: targetDate.toJSDate(),
                sessionType: 'workout', // Use generic session type since we don't have theme from day overview
                goal: dayOverview.substring(0, 100), // Use first 100 chars of overview as goal
                details: JSON.parse(JSON.stringify(details)),
                description,
                message,
                structured: structure,
                completedAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Save the workout to the database
            const savedWorkout = await this.createWorkout(workout);
            console.log(`Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);
            // Generate short link for the workout
            try {
                const shortLink = await shortLinkService.createWorkoutLink(user.id, savedWorkout.id);
                const fullUrl = shortLinkService.getFullUrl(shortLink.code);
                console.log(`Created short link for workout ${savedWorkout.id}: ${fullUrl}`);
                // Append short link to message
                if (savedWorkout.message) {
                    const dayOfWeekTitle = getDayOfWeekName(targetDate.toJSDate(), user.timezone); // Monday, Tuesday, etc.
                    savedWorkout.message = normalizeWhitespace(`${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n(More details: ${fullUrl})`);
                    await this.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
                }
            }
            catch (error) {
                console.error(`Failed to create short link for workout ${savedWorkout.id}:`, error);
                // Continue without link - not critical
            }
            return savedWorkout;
        }
        catch (error) {
            console.error(`Error generating workout for user ${user.id}:`, error);
            throw error;
        }
    }
    /**
     * Maps theme to session type for database storage
     * Valid frontend types: run, lift, metcon, mobility, rest, other
     */
    mapThemeToSessionType(theme) {
        const themeLower = theme.toLowerCase();
        if (themeLower.includes('run') || themeLower.includes('running'))
            return 'run';
        if (themeLower.includes('metcon') || themeLower.includes('hiit') ||
            themeLower.includes('conditioning') || themeLower.includes('cardio'))
            return 'metcon';
        if (themeLower.includes('lift') || themeLower.includes('strength') ||
            themeLower.includes('upper') || themeLower.includes('lower') ||
            themeLower.includes('push') || themeLower.includes('pull'))
            return 'lift';
        if (themeLower.includes('mobility') || themeLower.includes('flexibility') ||
            themeLower.includes('stretch'))
            return 'mobility';
        if (themeLower.includes('rest') || themeLower.includes('recovery') ||
            themeLower.includes('deload'))
            return 'rest';
        return 'other';
    }
    /**
     * Delete a workout instance
     */
    async deleteWorkout(workoutId, userId) {
        // First verify the workout belongs to the user
        const workout = await this.workoutRepo.getWorkoutById(workoutId);
        if (!workout || workout.clientId !== userId) {
            return false;
        }
        // Delete the workout
        return await this.workoutRepo.delete(workoutId);
    }
    /**
     * Get workouts by microcycle ID
     */
    async getWorkoutsByMicrocycle(userId, microcycleId) {
        return await this.workoutRepo.getWorkoutsByMicrocycle(userId, microcycleId);
    }
}
// Export singleton instance
export const workoutInstanceService = WorkoutInstanceService.getInstance();
