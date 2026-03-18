/**
 * k6 Load Test: Concurrent Chat Messages
 *
 * Simulates multiple users chatting with the AI trainer simultaneously.
 * This tests the most latency-sensitive flow: user sends message → AI processes → response.
 *
 * Usage:
 *   k6 run k6/concurrent-chat.js
 *   k6 run -e BASE_URL=https://staging.gymtext.co k6/concurrent-chat.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const chatDuration = new Trend('chat_response_time', true);

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Realistic chat messages users might send
const CHAT_MESSAGES = [
  'What workout do I have today?',
  'Can I swap squats for leg press?',
  'How many sets should I do for bench?',
  'I hurt my shoulder, can you modify my workout?',
  'What should I eat before my workout?',
  'Can I do cardio today instead?',
  'How much weight should I add this week?',
  'My legs are really sore from yesterday',
  'What time should I work out?',
  'Can you make today easier? I didnt sleep well',
];

export const options = {
  scenarios: {
    // Sustained chat load
    chat_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 25 },   // Ramp up
        { duration: '2m', target: 50 },     // Sustain (5% of 1000 users chatting)
        { duration: '1m', target: 100 },    // Peak (10% active)
        { duration: '15s', target: 0 },     // Ramp down
      ],
    },
  },
  thresholds: {
    // Chat should respond within 30s (AI processing)
    'chat_response_time': ['p(95)<30000', 'p(99)<60000'],
    'errors': ['rate<0.05'], // < 5% errors (AI can be flaky)
    'http_req_failed': ['rate<0.05'],
  },
};

function getTestPhone(vuId) {
  return `+1555${String(vuId + 1000).padStart(7, '0')}`;
}

export default function () {
  const phone = getTestPhone(__VU);
  const message = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];

  // Simulate Twilio webhook with chat message
  const payload = {
    MessageSid: `SM${Date.now()}${__VU}`,
    AccountSid: 'ACtest',
    From: phone,
    To: '+15555550000',
    Body: message,
    NumMedia: '0',
  };

  const res = http.post(`${BASE_URL}/api/twilio/sms`, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    tags: { name: 'chat_message' },
  });

  chatDuration.add(res.timings.duration);

  const success = check(res, {
    'chat status 200': (r) => r.status === 200,
    'chat response < 30s': (r) => r.timings.duration < 30000,
  });

  errorRate.add(success ? 0 : 1);

  // Simulate realistic chat timing (users don't spam)
  sleep(Math.random() * 10 + 5);
}
