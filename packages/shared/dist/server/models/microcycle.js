// Re-export schema types from shared
export * from '@/shared/types/microcycle';
export class MicrocycleModel {
    static fromDB(row) {
        return {
            id: row.id,
            clientId: row.clientId,
            absoluteWeek: row.absoluteWeek,
            days: row.days ?? [],
            description: row.description ?? null,
            isDeload: row.isDeload ?? false,
            message: row.message ?? null,
            structured: row.structured,
            startDate: new Date(row.startDate),
            endDate: new Date(row.endDate),
            isActive: row.isActive ?? true,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }
    static toDB(microcycle) {
        return {
            clientId: microcycle.clientId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            absoluteWeek: microcycle.absoluteWeek,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            days: microcycle.days,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            description: microcycle.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isDeload: microcycle.isDeload,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: microcycle.message,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            structured: microcycle.structured,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            startDate: microcycle.startDate,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            endDate: microcycle.endDate,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isActive: microcycle.isActive,
        };
    }
}
