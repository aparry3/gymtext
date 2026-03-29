# GymText Load Tests (k6)

Load testing scripts for validating gymtext can handle 10,000+ users.

## Prerequisites

```bash
# Install k6
brew install k6

# Or with Docker
docker run -i grafana/k6 run - <script.js
```

## Test Scenarios

### 1. Daily Workout Burst
Simulates the morning workout send window (highest throughput).
```bash
k6 run k6/daily-workout-burst.js
```

### 2. Concurrent Chat
Simulates multiple users chatting with the AI trainer simultaneously.
```bash
k6 run k6/concurrent-chat.js
```

### 3. Onboarding Spike
Simulates a marketing campaign driving signups.
```bash
k6 run k6/onboarding-spike.js
```

## Running Against Staging
```bash
k6 run -e BASE_URL=https://staging.gymtext.co k6/daily-workout-burst.js
```

## Custom Parameters
```bash
# Scale up VUs
k6 run --vus 200 --duration 5m k6/daily-workout-burst.js

# Output to JSON for analysis
k6 run --out json=results.json k6/daily-workout-burst.js
```

## Thresholds (SLOs)

| Metric | Target | Critical |
|--------|--------|----------|
| API response (p95) | < 500ms | < 2s |
| Chat response (p95) | < 30s | < 60s |
| Signup (p95) | < 5s | < 10s |
| Error rate | < 1% | < 5% |

## Notes

- Tests use `+1555XXXXXXX` phone numbers (test prefix)
- Against local dev: AI calls will be real (costs money)
- Against staging: Use with `MESSAGING_PROVIDER=local` to avoid real SMS
- Monitor Inngest dashboard during tests for queue depth
