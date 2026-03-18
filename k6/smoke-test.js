/**
 * k6 Smoke Test
 *
 * Quick validation that the server is running and responding.
 * Run this first before the heavier load tests.
 *
 * Usage:
 *   k6 run k6/smoke-test.js
 *   k6 run -e BASE_URL=https://staging.gymtext.co k6/smoke-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const healthDuration = new Trend('health_duration', true);

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    'http_req_duration': ['p(95)<1000'],
    'errors': ['rate<0.1'],
  },
};

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  healthDuration.add(healthRes.timings.duration);

  const healthOk = check(healthRes, {
    'health status 200': (r) => r.status === 200,
    'health response < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(healthOk ? 0 : 1);

  // Verify Twilio webhook endpoint exists (should return 405 for GET)
  const webhookRes = http.get(`${BASE_URL}/api/twilio/sms`);
  check(webhookRes, {
    'webhook endpoint exists': (r) => r.status !== 404,
  });

  sleep(1);
}
