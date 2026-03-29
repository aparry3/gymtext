/**
 * k6 Load Test: Daily Workout Burst
 *
 * Simulates the morning workout delivery window where all users
 * receive their daily workout SMS. This is the highest-throughput
 * scenario for gymtext.
 *
 * What it tests:
 * - SMS webhook endpoint throughput (simulating Twilio inbound)
 * - Inngest job scheduling capacity
 * - Database read/write under load
 *
 * Usage:
 *   k6 run k6/daily-workout-burst.js
 *   k6 run --vus 100 --duration 2m k6/daily-workout-burst.js
 *   k6 run -e BASE_URL=https://staging.gymtext.co k6/daily-workout-burst.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const webhookDuration = new Trend('webhook_duration', true);
const healthCheckDuration = new Trend('health_check_duration', true);
const messagesScheduled = new Counter('messages_scheduled');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    // Scenario 1: Ramp up to simulate morning burst
    morning_burst: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },   // Ramp up
        { duration: '2m', target: 200 },    // Sustain peak (simulating 10k users over 2 hours)
        { duration: '30s', target: 0 },     // Ramp down
      ],
      gracefulRampDown: '10s',
    },
    // Scenario 2: Health check baseline
    health_monitor: {
      executor: 'constant-vus',
      vus: 2,
      duration: '3m',
      exec: 'healthCheck',
    },
  },
  thresholds: {
    // API response times
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
    // Webhook specific
    'webhook_duration': ['p(95)<500', 'p(99)<1000'],
    // Health check should be fast
    'health_check_duration': ['p(95)<200'],
    // Error rate
    'errors': ['rate<0.01'], // Less than 1% errors
    // HTTP failures
    'http_req_failed': ['rate<0.01'],
  },
};

// Simulated user phone numbers (use test prefix)
function getTestPhone(vuId) {
  return `+1555${String(vuId).padStart(7, '0')}`;
}

// Main test: Simulate inbound SMS webhook (Twilio format)
export default function () {
  const phone = getTestPhone(__VU);

  // Simulate Twilio SMS webhook POST
  const payload = {
    MessageSid: `SM${Date.now()}${__VU}`,
    AccountSid: 'ACtest',
    From: phone,
    To: '+15555550000', // GymText number
    Body: 'Send me my workout for today',
    NumMedia: '0',
  };

  const params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    tags: { name: 'twilio_webhook' },
  };

  const res = http.post(
    `${BASE_URL}/api/twilio/sms`,
    payload,
    params
  );

  webhookDuration.add(res.timings.duration);

  const success = check(res, {
    'webhook status 200': (r) => r.status === 200,
    'webhook response time < 500ms': (r) => r.timings.duration < 500,
    'webhook has TwiML response': (r) => r.body && r.body.includes('Response'),
  });

  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
    messagesScheduled.add(1);
  }

  // Small delay between messages (simulates real user timing)
  sleep(Math.random() * 2 + 0.5);
}

// Health check function
export function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`, {
    tags: { name: 'health_check' },
  });

  healthCheckDuration.add(res.timings.duration);

  check(res, {
    'health check 200': (r) => r.status === 200,
    'health check < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(5);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'k6/results/daily-workout-burst.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  // k6 built-in summary handles this
  return '';
}
