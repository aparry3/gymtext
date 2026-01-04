// Re-export everything from shared workout types
export * from '@/shared/types/workout';
export class WorkoutInstanceModel {
    clientId;
    microcycleId;
    sessionType;
    createdAt;
    date;
    id;
    updatedAt;
    goal;
    details;
    completedAt;
    constructor(workoutInstance) {
        this.clientId = workoutInstance.clientId;
        this.createdAt = workoutInstance.createdAt;
        this.date = workoutInstance.date;
        this.id = workoutInstance.id;
        this.microcycleId = workoutInstance.microcycleId;
        this.sessionType = workoutInstance.sessionType;
        this.details = workoutInstance.details; // Details is required in DB
        this.goal = workoutInstance.goal;
        this.completedAt = workoutInstance.completedAt;
    }
}
