import { vi, type Mock } from 'vitest';

/**
 * Mock LLM response factory for LangChain models
 */
export class MockLLMResponseBuilder {
  private content: string | object = 'Default response';
  private metadata: Record<string, any> = {};

  withContent(content: string | object): MockLLMResponseBuilder {
    this.content = content;
    return this;
  }

  withTextContent(text: string): MockLLMResponseBuilder {
    this.content = text;
    return this;
  }

  withJsonContent(json: object): MockLLMResponseBuilder {
    this.content = json;
    return this;
  }

  withMetadata(metadata: Record<string, any>): MockLLMResponseBuilder {
    this.metadata = metadata;
    return this;
  }

  build() {
    return {
      content: this.content,
      response_metadata: this.metadata,
      additional_kwargs: {},
      tool_calls: [],
      invalid_tool_calls: [],
    };
  }
}

/**
 * Create a mock ChatGoogleGenerativeAI instance
 */
export function createMockLLM() {
  const mockInvoke = vi.fn();
  const mockBatch = vi.fn();
  const mockStream = vi.fn();
  
  const mockLLM = {
    invoke: mockInvoke,
    batch: mockBatch,
    stream: mockStream,
    temperature: 0.7,
    model: 'gemini-2.5-flash',
    // Add other properties that might be accessed
    _llmType: () => 'google-genai',
    _modelType: () => 'gemini-2.0-flash',
  };

  // Default to returning a simple text response
  mockInvoke.mockResolvedValue(
    new MockLLMResponseBuilder().withTextContent('Default mock response').build()
  );

  return {
    mockLLM,
    mockInvoke,
    mockBatch,
    mockStream,
  };
}

/**
 * Mock the ChatGoogleGenerativeAI module
 */
export function mockChatGoogleGenerativeAI() {
  const { mockLLM, mockInvoke, mockBatch, mockStream } = createMockLLM();
  
  // Store the mock globally so it can be accessed by the vi.mock function
  (globalThis as any).__mockLLM = mockLLM;
  
  vi.mock('@langchain/google-genai', () => ({
    ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => (globalThis as any).__mockLLM),
  }));

  return {
    mockLLM,
    mockInvoke,
    mockBatch,
    mockStream,
  };
}

/**
 * Helper to create conversation mock responses
 */
export const mockLLMResponses = {
  chatResponse: (message: string = 'I understand. How can I help you today?') => 
    new MockLLMResponseBuilder().withTextContent(message).build(),

  welcomeMessage: (name: string = 'there') => 
    new MockLLMResponseBuilder()
      .withTextContent(`Welcome ${name}! I'm your AI fitness coach. Let's start by understanding your fitness goals.`)
      .build(),

  dailyMessage: (hasWorkout: boolean = true) => 
    new MockLLMResponseBuilder()
      .withTextContent(
        hasWorkout 
          ? "Good morning! Today's workout: Upper Body Strength\n\n1. Bench Press 3x8\n2. Pull-ups 3x8\n3. Shoulder Press 3x10\n\nLet's crush it! 💪"
          : "Good morning! Today is a rest day. Focus on recovery - hydration, nutrition, and light stretching. Your body grows stronger during rest!"
      )
      .build(),

  fitnessPlan: () => 
    new MockLLMResponseBuilder()
      .withJsonContent({
        programType: 'strength',
        goalStatement: 'Build strength and muscle mass',
        overview: 'A comprehensive strength training program',
        macrocycles: [
          {
            phase: 'Foundation',
            weekCount: 4,
            description: 'Build foundational strength',
            focuses: ['technique', 'volume'],
          },
          {
            phase: 'Strength',
            weekCount: 4,
            description: 'Increase max strength',
            focuses: ['intensity', 'recovery'],
          },
        ],
      })
      .build(),

  mesocycleBreakdown: () => 
    new MockLLMResponseBuilder()
      .withJsonContent({
        microcycles: [
          {
            weekNumber: 1,
            focus: 'Adaptation',
            workouts: [
              {
                day: 1,
                sessionType: 'strength',
                goal: 'Upper body introduction',
                details: {
                  sessionType: 'lift',
                  details: [
                    {
                      label: 'Main Work',
                      activities: ['Bench Press 3x8 @ 70%', 'Rows 3x10'],
                    },
                  ],
                },
              },
            ],
          },
        ],
      })
      .build(),

  errorResponse: (error: string = 'Something went wrong') => {
    throw new Error(error);
  },
};

/**
 * Helper to setup LLM mock for specific test scenarios
 */
export function setupLLMMockScenario(
  mockInvoke: Mock,
  scenario: 'chat' | 'welcome' | 'daily' | 'fitness-plan' | 'mesocycle' | 'error',
  customResponse?: any
) {
  switch (scenario) {
    case 'chat':
      mockInvoke.mockResolvedValue(customResponse || mockLLMResponses.chatResponse());
      break;
    case 'welcome':
      mockInvoke.mockResolvedValue(customResponse || mockLLMResponses.welcomeMessage());
      break;
    case 'daily':
      mockInvoke.mockResolvedValue(customResponse || mockLLMResponses.dailyMessage());
      break;
    case 'fitness-plan':
      mockInvoke.mockResolvedValue(customResponse || mockLLMResponses.fitnessPlan());
      break;
    case 'mesocycle':
      mockInvoke.mockResolvedValue(customResponse || mockLLMResponses.mesocycleBreakdown());
      break;
    case 'error':
      mockInvoke.mockRejectedValue(new Error(customResponse || 'LLM Error'));
      break;
  }
}

