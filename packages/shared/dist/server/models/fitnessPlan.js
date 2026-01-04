import { _FitnessPlanSchema } from '@/shared/types/plan';
// Re-export schema types from shared
export * from '@/shared/types/plan';
export class FitnessPlanModel {
    id;
    clientId;
    description;
    message;
    structured;
    startDate;
    createdAt;
    updatedAt;
    constructor(id, clientId, description, message, structured, startDate, createdAt, updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.description = description;
        this.message = message;
        this.structured = structured;
        this.startDate = startDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromDB(fitnessPlan) {
        return {
            id: fitnessPlan.id,
            clientId: fitnessPlan.clientId,
            description: fitnessPlan.description || '',
            message: fitnessPlan.message,
            structured: fitnessPlan.structured,
            startDate: new Date(fitnessPlan.startDate),
            createdAt: new Date(fitnessPlan.createdAt),
            updatedAt: new Date(fitnessPlan.updatedAt),
        };
    }
    static fromFitnessPlanOverview(user, fitnessPlanOverview) {
        return {
            clientId: user.id,
            description: fitnessPlanOverview.description,
            message: fitnessPlanOverview.message || null,
            structured: fitnessPlanOverview.structure || null,
            startDate: new Date(),
        };
    }
    static schema = _FitnessPlanSchema;
}
