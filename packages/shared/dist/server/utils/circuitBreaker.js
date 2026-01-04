export var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
export class CircuitBreaker {
    state = CircuitState.CLOSED;
    failureCount = 0;
    successCount = 0;
    lastFailureTime = null;
    options;
    constructor(options = {}) {
        this.options = {
            failureThreshold: options.failureThreshold || 5,
            resetTimeout: options.resetTimeout || 60000, // 60 seconds
            monitoringPeriod: options.monitoringPeriod || 60000 // 60 seconds
        };
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
            }
            else {
                console.warn('Circuit breaker is OPEN, skipping execution');
                return null;
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= 3) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                console.info('Circuit breaker is now CLOSED');
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
            console.warn('Circuit breaker is now OPEN due to failure in HALF_OPEN state');
        }
        else if (this.failureCount >= this.options.failureThreshold) {
            this.state = CircuitState.OPEN;
            console.warn(`Circuit breaker is now OPEN after ${this.failureCount} failures`);
        }
    }
    shouldAttemptReset() {
        return (this.lastFailureTime !== null &&
            Date.now() - this.lastFailureTime >= this.options.resetTimeout);
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}
