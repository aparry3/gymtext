import { vi, type Mock } from 'vitest';
import { MockLLMResponseBuilder } from './llm';

/**
 * Enhanced LLM mock for integration testing with predictable, sequential responses
 */
export class PredictableLLM {
  private responses: any[] = [];
  private currentIndex = 0;
  public mockInvoke: Mock;
  public mockBatch: Mock;
  public mockStream: Mock;

  constructor() {
    this.mockInvoke = vi.fn();
    this.mockBatch = vi.fn();
    this.mockStream = vi.fn();
    
    // Set up the mock to return responses in sequence
    this.mockInvoke.mockImplementation(() => {
      if (this.currentIndex >= this.responses.length) {
        throw new Error('No more mock responses available. Add more responses or check your test.');
      }
      const response = this.responses[this.currentIndex];
      this.currentIndex++;
      
      // If response is an error, throw it
      if (response instanceof Error) {
        throw response;
      }
      
      return Promise.resolve(response);
    });
  }

  /**
   * Add a response to the queue
   */
  addResponse(response: any): PredictableLLM {
    this.responses.push(response);
    return this;
  }

  /**
   * Add multiple responses to the queue
   */
  addResponses(...responses: any[]): PredictableLLM {
    this.responses.push(...responses);
    return this;
  }

  /**
   * Add an error response to the queue
   */
  addError(error: Error | string): PredictableLLM {
    const errorObj = error instanceof Error ? error : new Error(error);
    this.responses.push(errorObj);
    return this;
  }

  /**
   * Reset the mock to start from the beginning
   */
  reset(): void {
    this.currentIndex = 0;
    this.mockInvoke.mockClear();
    this.mockBatch.mockClear();
    this.mockStream.mockClear();
  }

  /**
   * Get the mock LLM object
   */
  getMock() {
    return {
      invoke: this.mockInvoke,
      batch: this.mockBatch,
      stream: this.mockStream,
      temperature: 0.7,
      model: 'gemini-2.0-flash',
      _llmType: () => 'google-genai',
      _modelType: () => 'gemini-2.0-flash',
    };
  }
}

/**
 * Integration test scenarios with complete, realistic responses
 */
export const integrationTestScenarios = {
  /**
   * Complete user onboarding flow
   */
  userOnboarding: () => {
    const llm = new PredictableLLM();
    
    // 1. Welcome message response
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withTextContent(
          "Welcome to GymText, Sarah! 🎯 I'm excited to be your AI fitness coach. " +
          "I see you're looking to build strength and lose weight. Let's create a personalized " +
          "plan that fits your schedule (4 days/week) and helps you reach your goals. " +
          "Ready to start your fitness journey?"
        )
        .build()
    );
    
    // 2. Fitness plan generation response
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withJsonContent({
          programType: 'hybrid',
          goalStatement: 'Build lean muscle while losing body fat through a combination of strength training and metabolic conditioning',
          overview: 'This 12-week program combines strength training with metabolic work to help you build muscle and lose fat simultaneously',
          macrocycles: [
            {
              phase: 'Foundation & Adaptation',
              weekCount: 4,
              description: 'Build movement patterns and metabolic base',
              focuses: ['movement quality', 'work capacity', 'habit formation'],
            },
            {
              phase: 'Strength & Conditioning',
              weekCount: 4,
              description: 'Increase strength while maintaining conditioning',
              focuses: ['progressive overload', 'metabolic conditioning', 'recovery'],
            },
            {
              phase: 'Peak & Consolidation',
              weekCount: 4,
              description: 'Peak strength and lock in body composition changes',
              focuses: ['strength expression', 'body composition', 'sustainability'],
            },
          ],
        })
        .build()
    );
    
    // 3. Mesocycle breakdown response
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withJsonContent({
          microcycles: [
            {
              weekNumber: 1,
              focus: 'Movement Assessment & Baseline',
              workouts: [
                {
                  day: 1,
                  sessionType: 'strength',
                  goal: 'Full body movement assessment and introduction',
                  details: {
                    sessionType: 'lift',
                    details: [
                      {
                        label: 'Warm-up',
                        activities: ['5 min easy bike', 'Dynamic stretching sequence'],
                      },
                      {
                        label: 'Main Work',
                        activities: [
                          'Goblet Squat 3x12 (light weight, focus on form)',
                          'Push-ups 3x8-12 (modify as needed)',
                          'DB Row 3x10 each arm',
                          'Plank 3x30-45 seconds',
                        ],
                      },
                      {
                        label: 'Cool-down',
                        activities: ['5 min walk', 'Static stretching 5 min'],
                      },
                    ],
                  },
                },
                {
                  day: 3,
                  sessionType: 'cardio',
                  goal: 'Metabolic conditioning baseline test',
                  details: {
                    sessionType: 'metcon',
                    details: [
                      {
                        label: 'Warm-up',
                        activities: ['5 min progressive bike/row'],
                      },
                      {
                        label: 'Main Work',
                        activities: [
                          '20 min AMRAP:',
                          '10 Air Squats',
                          '10 Push-ups (modify as needed)',
                          '10 Sit-ups',
                          '200m Run/Row',
                          'Track rounds completed',
                        ],
                      },
                      {
                        label: 'Cool-down',
                        activities: ['Easy walk to recover', 'Stretch major muscle groups'],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        })
        .build()
    );
    
    // 4. Daily message response
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withTextContent(
          "Good morning Sarah! 💪 Today is Day 1 - Full Body Assessment\n\n" +
          "We're starting with movement basics today:\n" +
          "• Goblet Squats (3x12)\n" +
          "• Push-ups (3x8-12)\n" +
          "• DB Rows (3x10 each)\n" +
          "• Planks (3x30-45s)\n\n" +
          "Focus on form over weight. This is about building a foundation!\n\n" +
          "Reply 'done' when finished, or let me know if you need modifications."
        )
        .build()
    );
    
    return llm;
  },

  /**
   * Daily conversation flow
   */
  dailyConversation: () => {
    const llm = new PredictableLLM();
    
    // Morning check-in
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withTextContent(
          "Good morning! Ready for today's upper body session? " +
          "How are you feeling after Wednesday's leg day?"
        )
        .build()
    );
    
    // Response to user feedback
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withTextContent(
          "Some soreness is normal and shows you worked hard! " +
          "Let's do a longer warm-up today to help with that. " +
          "Ready for your workout details?"
        )
        .build()
    );
    
    // Workout details
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withTextContent(
          "Upper Body Strength - Week 2 Day 4\n\n" +
          "Warm-up (10 min):\n" +
          "• Arm circles, band pull-aparts\n" +
          "• Light bench press practice\n\n" +
          "Main Work:\n" +
          "• Bench Press 4x6 @ 75%\n" +
          "• Pull-ups 4x6-8\n" +
          "• DB Shoulder Press 3x10\n" +
          "• Cable Rows 3x12\n" +
          "• Bicep/Tricep superset 3x15\n\n" +
          "Take 2-3 min rest between main lifts!"
        )
        .build()
    );
    
    // Post-workout response
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withTextContent(
          "Excellent work! 🎯 Hitting all your reps at 75% shows great progress. " +
          "Make sure to get protein within the next hour and stay hydrated. " +
          "Rest day tomorrow - any questions about recovery?"
        )
        .build()
    );
    
    return llm;
  },

  /**
   * Error scenarios
   */
  errorScenarios: () => {
    const llm = new PredictableLLM();
    
    // Timeout error
    llm.addError(new Error('Request timeout after 30000ms'));
    
    // Rate limit error
    llm.addError(new Error('Rate limit exceeded. Please try again later.'));
    
    // Invalid response error
    llm.addError(new Error('Failed to parse LLM response'));
    
    return llm;
  },

  /**
   * Session type mapping test scenario
   */
  sessionTypeMapping: () => {
    const llm = new PredictableLLM();
    
    // Response with all LLM session types that need mapping
    llm.addResponse(
      new MockLLMResponseBuilder()
        .withJsonContent({
          microcycles: [
            {
              weekNumber: 1,
              focus: 'Varied Training',
              workouts: [
                {
                  day: 1,
                  sessionType: 'strength', // Maps to 'strength' (no change)
                  goal: 'Heavy lifting day',
                  details: {
                    sessionType: 'lift', // LLM type
                    details: [{ label: 'Main', activities: ['Squats 5x5'] }],
                  },
                },
                {
                  day: 2,
                  sessionType: 'cardio', // Maps to 'cardio' (no change)
                  goal: 'Running intervals',
                  details: {
                    sessionType: 'run', // LLM type
                    details: [{ label: 'Main', activities: ['6x800m intervals'] }],
                  },
                },
                {
                  day: 3,
                  sessionType: 'cardio', // Should map from 'metcon' to 'cardio'
                  goal: 'Metabolic conditioning',
                  details: {
                    sessionType: 'metcon', // LLM type
                    details: [{ label: 'Main', activities: ['21-15-9 workout'] }],
                  },
                },
                {
                  day: 4,
                  sessionType: 'mobility', // Maps to 'mobility' (no change)
                  goal: 'Recovery and flexibility',
                  details: {
                    sessionType: 'mobility', // LLM type
                    details: [{ label: 'Main', activities: ['Yoga flow 45 min'] }],
                  },
                },
                {
                  day: 5,
                  sessionType: 'recovery', // Should map from 'rest' to 'recovery'
                  goal: 'Active recovery',
                  details: {
                    sessionType: 'rest', // LLM type
                    details: [{ label: 'Main', activities: ['Light walk, stretching'] }],
                  },
                },
                {
                  day: 6,
                  sessionType: 'recovery', // Should map from 'other' to 'recovery'
                  goal: 'Cross training',
                  details: {
                    sessionType: 'other', // LLM type
                    details: [{ label: 'Main', activities: ['Swimming 30 min'] }],
                  },
                },
              ],
            },
          ],
        })
        .build()
    );
    
    return llm;
  },
};

/**
 * Helper to create a mock LLM module for integration tests
 */
export function createIntegrationLLMMock(scenario?: keyof typeof integrationTestScenarios) {
  const llm = scenario ? integrationTestScenarios[scenario]() : new PredictableLLM();
  
  // Store the mock globally
  (globalThis as any).__integrationLLM = llm.getMock();
  
  // Mock both Google and OpenAI modules
  vi.mock('@langchain/google-genai', () => ({
    ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => (globalThis as any).__integrationLLM),
  }));
  
  vi.mock('@langchain/openai', () => ({
    ChatOpenAI: vi.fn().mockImplementation(() => (globalThis as any).__integrationLLM),
  }));
  
  return llm;
}