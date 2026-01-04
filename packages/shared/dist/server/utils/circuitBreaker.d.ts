export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
}
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private readonly options;
    constructor(options?: Partial<CircuitBreakerOptions>);
    execute<T>(fn: () => Promise<T>): Promise<T | null>;
    private onSuccess;
    private onFailure;
    private shouldAttemptReset;
    getState(): CircuitState;
    getStats(): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        lastFailureTime: number | null;
    };
}
export {};
//# sourceMappingURL=circuitBreaker.d.ts.map