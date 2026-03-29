/**
 * k6 Load Test: Onboarding Spike
 *
 * Simulates a marketing campaign driving many simultaneous signups.
 * Tests the signup → profile → plan → microcycle → workout → SMS pipeline.
 *
 * Usage:
 *   k6 run k6/onboarding-spike.js
 *   k6 run -e BASE_URL=https://staging.gymtext.co k6/onboarding-spike.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const signupDuration = new Trend('signup_duration', true);
const signupsCompleted = new Counter('signups_completed');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    signup_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },   // Trickle
        { duration: '30s', target: 50 },    // Spike
        { duration: '1m', target: 100 },    // Peak (marketing campaign hits)
        { duration: '30s', target: 10 },    // Settling
        { duration: '10s', target: 0 },     // Done
      ],
    },
  },
  thresholds: {
    'signup_duration': ['p(95)<5000', 'p(99)<10000'],
    'errors': ['rate<0.02'], // < 2% signup failures
    'http_req_failed': ['rate<0.02'],
  },
};

function getTestPhone(vuId, iteration) {
  // Unique phone per VU+iteration
  const id = vuId * 10000 + iteration;
  return `+1555${String(id).padStart(7, '0')}`;
}

// Realistic signup data
function getSignupData(vuId) {
  const goals = ['lose weight', 'build muscle', 'get stronger', 'improve fitness', 'tone up'];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const frequencies = [3, 4, 5];

  return {
    name: `Test User ${vuId}`,
    phone: getTestPhone(vuId, __ITER),
    goal: goals[vuId % goals.length],
    fitnessLevel: levels[vuId % levels.length],
    daysPerWeek: frequencies[vuId % frequencies.length],
    equipment: 'full gym',
    injuries: vuId % 5 === 0 ? 'bad knee' : 'none',
    timezone: 'America/New_York',
  };
}

export default function () {
  const signupData = getSignupData(__VU);

  group('signup_flow', function () {
    // Step 1: Submit signup
    const signupRes = http.post(
      `${BASE_URL}/api/users/signup`,
      JSON.stringify(signupData),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'signup' },
      }
    );

    signupDuration.add(signupRes.timings.duration);

    const success = check(signupRes, {
      'signup status 200 or 201': (r) => r.status === 200 || r.status === 201,
      'signup response < 5s': (r) => r.timings.duration < 5000,
      'signup returns user id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.userId || body.user?.id;
        } catch {
          return false;
        }
      },
    });

    if (success) {
      signupsCompleted.add(1);
      errorRate.add(0);
    } else {
      errorRate.add(1);
    }
  });

  // Simulate realistic signup timing
  sleep(Math.random() * 5 + 2);
}
