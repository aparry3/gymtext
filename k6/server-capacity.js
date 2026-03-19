/**
 * k6 Load Test: Server Capacity Baseline
 *
 * Tests raw HTTP throughput and connection handling.
 * Uses health endpoint to measure server capacity without
 * external dependencies (DB, AI, Twilio).
 *
 * Stages:
 *  1. Warm-up: 10 VUs for 10s
 *  2. Ramp-up: 10→100 VUs over 20s
 *  3. Sustained: 100 VUs for 30s
 *  4. Spike: 100→200 VUs over 10s
 *  5. Peak: 200 VUs for 20s
 *  6. Cool-down: 200→0 VUs over 10s
 *
 * Usage:
 *   k6 run k6/server-capacity.js
 *   k6 run -e BASE_URL=https://staging.gymtext.co k6/server-capacity.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const healthDuration = new Trend('health_duration', true);
const requestCount = new Counter('total_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Warm-up
    { duration: '20s', target: 100 },   // Ramp-up
    { duration: '30s', target: 100 },   // Sustained load
    { duration: '10s', target: 200 },   // Spike
    { duration: '20s', target: 200 },   // Peak load
    { duration: '10s', target: 0 },     // Cool-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'errors': ['rate<0.05'],
    'health_duration': ['p(95)<200'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  healthDuration.add(res.timings.duration);
  requestCount.add(1);

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'response < 200ms': (r) => r.timings.duration < 200,
    'response < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(ok ? 0 : 1);
  sleep(0.1 + Math.random() * 0.3); // 100-400ms between requests
}
