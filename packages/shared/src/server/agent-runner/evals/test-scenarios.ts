/**
 * Test Scenarios for Comparison Eval
 *
 * Representative user scenarios to compare old vs new agent systems.
 */

import type { TestScenario } from './comparison-eval';

/**
 * Standard test scenarios covering common user interactions
 */
export const TEST_SCENARIOS: TestScenario[] = [
  // Chat scenarios
  {
    id: 'chat-simple-question',
    type: 'chat',
    description: 'User asks simple question about their workout',
    input: {
      userId: 'test-user-1',
      message: "How many sets should I do today?",
    },
    expectedDimensions: ['relevance', 'clarity', 'accuracy'],
  },
  {
    id: 'chat-workout-modification',
    type: 'chat',
    description: 'User requests workout modification',
    input: {
      userId: 'test-user-2',
      message: "Can you replace squats with leg press? I have a knee issue.",
    },
    expectedDimensions: ['relevance', 'safety', 'personalization'],
  },
  {
    id: 'chat-progress-question',
    type: 'chat',
    description: 'User asks about progress',
    input: {
      userId: 'test-user-3',
      message: "Am I making good progress? I've been training for 3 weeks.",
    },
    expectedDimensions: ['relevance', 'encouragement', 'data-usage'],
  },
  {
    id: 'chat-form-check',
    type: 'chat',
    description: 'User asks for form advice',
    input: {
      userId: 'test-user-4',
      message: "I felt some lower back pain during deadlifts. Is my form off?",
    },
    expectedDimensions: ['relevance', 'safety', 'actionability'],
  },
  {
    id: 'chat-scheduling',
    type: 'chat',
    description: 'User asks about workout schedule',
    input: {
      userId: 'test-user-5',
      message: "Can I do upper body today instead? I can't make it to the gym tomorrow.",
    },
    expectedDimensions: ['flexibility', 'plan-awareness', 'helpfulness'],
  },

  // Daily workout scenarios
  {
    id: 'daily-workout-beginner',
    type: 'daily-workout',
    description: 'Daily workout for beginner user',
    input: {
      userId: 'test-user-beginner',
    },
    expectedDimensions: ['formatting', 'completeness', 'appropriateness'],
    rubricPath: '../../../prompts/eval-rubric-workout-format.md',
  },
  {
    id: 'daily-workout-intermediate',
    type: 'daily-workout',
    description: 'Daily workout for intermediate user',
    input: {
      userId: 'test-user-intermediate',
    },
    expectedDimensions: ['formatting', 'completeness', 'progression'],
    rubricPath: '../../../prompts/eval-rubric-workout-format.md',
  },
  {
    id: 'daily-workout-advanced',
    type: 'daily-workout',
    description: 'Daily workout for advanced user',
    input: {
      userId: 'test-user-advanced',
    },
    expectedDimensions: ['formatting', 'completeness', 'intensity'],
    rubricPath: '../../../prompts/eval-rubric-workout-format.md',
  },

  // Onboarding scenarios
  {
    id: 'onboarding-complete-beginner',
    type: 'onboarding',
    description: 'Onboarding for complete fitness beginner',
    input: {
      userId: 'test-user-onboard-1',
      userContext: {
        experience: 'beginner',
        goals: ['lose weight', 'build strength'],
        availability: '3 days per week',
      },
    },
    expectedDimensions: ['completeness', 'safety', 'personalization'],
  },
  {
    id: 'onboarding-experienced-lifter',
    type: 'onboarding',
    description: 'Onboarding for experienced lifter',
    input: {
      userId: 'test-user-onboard-2',
      userContext: {
        experience: 'intermediate',
        goals: ['build muscle', 'increase strength'],
        availability: '5 days per week',
      },
    },
    expectedDimensions: ['completeness', 'progression', 'personalization'],
  },
  {
    id: 'onboarding-special-needs',
    type: 'onboarding',
    description: 'Onboarding for user with injuries/limitations',
    input: {
      userId: 'test-user-onboard-3',
      userContext: {
        experience: 'beginner',
        goals: ['general fitness'],
        limitations: ['lower back pain', 'shoulder injury'],
        availability: '3 days per week',
      },
    },
    expectedDimensions: ['completeness', 'safety', 'adaptability'],
  },
];

/**
 * Edge case scenarios to test robustness
 */
export const EDGE_CASE_SCENARIOS: TestScenario[] = [
  {
    id: 'chat-empty-context',
    type: 'chat',
    description: 'Chat with user who has no fitness context yet',
    input: {
      userId: 'test-user-new',
      message: "What should I do today?",
    },
    expectedDimensions: ['graceful-degradation', 'helpfulness'],
  },
  {
    id: 'chat-off-topic',
    type: 'chat',
    description: 'User asks completely off-topic question',
    input: {
      userId: 'test-user-1',
      message: "What's the weather like?",
    },
    expectedDimensions: ['boundary-setting', 'helpfulness'],
  },
  {
    id: 'chat-very-long-message',
    type: 'chat',
    description: 'User sends very long message with multiple questions',
    input: {
      userId: 'test-user-1',
      message: "I've been doing the program for 3 weeks and I'm seeing some progress but I'm not sure if I should increase the weight or keep it the same, also I missed a workout last week because I was sick and now I'm not sure if I should repeat the week or just continue where I left off, and also I'm thinking about adding some cardio but I don't want to interfere with my strength gains, what do you think?",
    },
    expectedDimensions: ['comprehension', 'structure', 'completeness'],
  },
];

/**
 * All scenarios combined
 */
export const ALL_SCENARIOS = [...TEST_SCENARIOS, ...EDGE_CASE_SCENARIOS];
