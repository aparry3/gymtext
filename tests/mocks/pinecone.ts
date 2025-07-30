import { vi, type Mock } from 'vitest';

interface MockVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
  score?: number;
}

interface MockQueryResponse {
  matches: MockVector[];
  namespace: string;
}

interface MockUpsertResponse {
  upsertedCount: number;
}

/**
 * Mock Pinecone Index
 */
export class MockPineconeIndex {
  private vectors: Map<string, MockVector> = new Map();
  private currentNamespace: string = '';

  public upsert: Mock;
  public query: Mock;
  public deleteOne: Mock;
  public deleteMany: Mock;
  public deleteAll: Mock;
  public describeIndexStats: Mock;

  constructor() {
    // Upsert vectors
    this.upsert = vi.fn(async (params: {
      vectors: Array<{ id: string; values: number[]; metadata?: any }>;
      namespace?: string;
    }): Promise<MockUpsertResponse> => {
      const ns = params.namespace || 'default';
      
      params.vectors.forEach(vector => {
        const key = `${ns}:${vector.id}`;
        this.vectors.set(key, {
          id: vector.id,
          values: vector.values,
          metadata: vector.metadata,
        });
      });

      return { upsertedCount: params.vectors.length };
    });

    // Query vectors
    this.query = vi.fn(async (params: {
      vector?: number[];
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
      namespace?: string;
    }): Promise<MockQueryResponse> => {
      const ns = params.namespace || 'default';
      const topK = params.topK || 10;
      
      // Get all vectors from the namespace
      const namespaceVectors: MockVector[] = [];
      this.vectors.forEach((vector, key) => {
        if (key.startsWith(`${ns}:`)) {
          namespaceVectors.push(vector);
        }
      });

      // Apply filters if provided
      let filteredVectors = namespaceVectors;
      if (params.filter) {
        filteredVectors = namespaceVectors.filter(vector => {
          if (!vector.metadata) return false;
          
          return Object.entries(params.filter!).every(([key, value]) => {
            if (key === '$and' || key === '$or') {
              // Handle complex filters
              return true; // Simplified for mock
            }
            return vector.metadata[key] === value;
          });
        });
      }

      // Calculate similarity scores (mock - just random for now)
      const matches = filteredVectors
        .map(vector => ({
          ...vector,
          score: params.vector ? this.calculateSimilarity(params.vector, vector.values) : 1,
        }))
        .sort((a, b) => b.score! - a.score!)
        .slice(0, topK);

      // Remove metadata if not requested
      if (!params.includeMetadata) {
        matches.forEach(match => delete match.metadata);
      }

      return {
        matches,
        namespace: ns,
      };
    });

    // Delete operations
    this.deleteOne = vi.fn(async (id: string, namespace?: string) => {
      const ns = namespace || 'default';
      const key = `${ns}:${id}`;
      return this.vectors.delete(key);
    });

    this.deleteMany = vi.fn(async (params: {
      ids?: string[];
      filter?: Record<string, any>;
      namespace?: string;
    }) => {
      const ns = params.namespace || 'default';
      let deletedCount = 0;

      if (params.ids) {
        params.ids.forEach(id => {
          const key = `${ns}:${id}`;
          if (this.vectors.delete(key)) {
            deletedCount++;
          }
        });
      }

      return { deleted: deletedCount };
    });

    this.deleteAll = vi.fn(async (namespace?: string) => {
      const ns = namespace || 'default';
      let deletedCount = 0;

      Array.from(this.vectors.keys()).forEach(key => {
        if (key.startsWith(`${ns}:`)) {
          this.vectors.delete(key);
          deletedCount++;
        }
      });

      return { deleted: deletedCount };
    });

    // Index stats
    this.describeIndexStats = vi.fn(async () => {
      const namespaces: Record<string, { vectorCount: number }> = {};
      
      this.vectors.forEach((_, key) => {
        const ns = key.split(':')[0];
        if (!namespaces[ns]) {
          namespaces[ns] = { vectorCount: 0 };
        }
        namespaces[ns].vectorCount++;
      });

      return {
        dimension: 1536, // OpenAI embedding dimension
        indexFullness: 0.1,
        totalVectorCount: this.vectors.size,
        namespaces,
      };
    });
  }

  /**
   * Set namespace for operations
   */
  namespace(ns: string): MockPineconeIndex {
    this.currentNamespace = ns;
    return this;
  }

  /**
   * Calculate mock similarity between vectors
   */
  private calculateSimilarity(vector1: number[], vector2: number[]): number {
    // Simple cosine similarity
    if (vector1.length !== vector2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Clear all vectors
   */
  clear(): void {
    this.vectors.clear();
  }

  /**
   * Get vector count
   */
  getVectorCount(): number {
    return this.vectors.size;
  }

  /**
   * Add test vectors
   */
  addTestVectors(vectors: Array<{ id: string; values: number[]; metadata?: any }>, namespace = 'default'): void {
    vectors.forEach(vector => {
      const key = `${namespace}:${vector.id}`;
      this.vectors.set(key, vector);
    });
  }

  /**
   * Reset all mocks
   */
  reset(): void {
    this.upsert.mockClear();
    this.query.mockClear();
    this.deleteOne.mockClear();
    this.deleteMany.mockClear();
    this.deleteAll.mockClear();
    this.describeIndexStats.mockClear();
    this.vectors.clear();
  }
}

/**
 * Mock Pinecone Client
 */
export class MockPineconeClient {
  private indexes: Map<string, MockPineconeIndex> = new Map();

  public Index: Mock;
  public createIndex: Mock;
  public listIndexes: Mock;
  public describeIndex: Mock;
  public deleteIndex: Mock;

  constructor() {
    // Get or create index
    this.Index = vi.fn((indexName: string) => {
      if (!this.indexes.has(indexName)) {
        this.indexes.set(indexName, new MockPineconeIndex());
      }
      return this.indexes.get(indexName)!;
    });

    // Create index
    this.createIndex = vi.fn(async (params: {
      name: string;
      dimension: number;
      metric?: 'cosine' | 'euclidean' | 'dotproduct';
    }) => {
      if (!this.indexes.has(params.name)) {
        this.indexes.set(params.name, new MockPineconeIndex());
      }
      return { name: params.name, dimension: params.dimension };
    });

    // List indexes
    this.listIndexes = vi.fn(async () => {
      return Array.from(this.indexes.keys()).map(name => ({
        name,
        dimension: 1536,
        metric: 'cosine',
      }));
    });

    // Describe index
    this.describeIndex = vi.fn(async (indexName: string) => {
      if (!this.indexes.has(indexName)) {
        throw new Error(`Index ${indexName} not found`);
      }
      
      return {
        name: indexName,
        dimension: 1536,
        metric: 'cosine',
        host: `${indexName}-test.pinecone.io`,
        status: { ready: true, state: 'Ready' },
      };
    });

    // Delete index
    this.deleteIndex = vi.fn(async (indexName: string) => {
      return this.indexes.delete(indexName);
    });
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.indexes.forEach(index => index.reset());
    this.indexes.clear();
    
    this.Index.mockClear();
    this.createIndex.mockClear();
    this.listIndexes.mockClear();
    this.describeIndex.mockClear();
    this.deleteIndex.mockClear();
  }
}

/**
 * Create a mock Pinecone instance
 */
export function createMockPinecone() {
  const mockClient = new MockPineconeClient();
  
  // Store globally for access in mocked module
  (globalThis as any).__mockPineconeClient = mockClient;
  
  // Mock the @pinecone-database/pinecone module
  vi.mock('@pinecone-database/pinecone', () => ({
    Pinecone: vi.fn(() => (globalThis as any).__mockPineconeClient),
  }));
  
  return mockClient;
}

/**
 * Test data generators
 */
export const pineconeTestData = {
  /**
   * Generate mock embedding vector
   */
  generateEmbedding(dimension: number = 1536): number[] {
    return Array.from({ length: dimension }, () => Math.random() * 2 - 1);
  },

  /**
   * Create fitness-related test vectors
   */
  fitnessVectors: () => [
    {
      id: 'workout-1',
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        type: 'workout',
        category: 'strength',
        muscle_groups: ['chest', 'triceps'],
        difficulty: 'intermediate',
        equipment: ['barbell', 'bench'],
        text: 'Bench press for chest and triceps development',
      },
    },
    {
      id: 'workout-2',
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        type: 'workout',
        category: 'cardio',
        duration: 30,
        intensity: 'high',
        equipment: ['treadmill'],
        text: 'High intensity interval training on treadmill',
      },
    },
    {
      id: 'nutrition-1',
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        type: 'nutrition',
        meal_type: 'post-workout',
        protein: 30,
        carbs: 40,
        fats: 10,
        text: 'Post-workout protein shake with banana',
      },
    },
    {
      id: 'recovery-1',
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        type: 'recovery',
        category: 'stretching',
        duration: 15,
        target_areas: ['hamstrings', 'glutes'],
        text: 'Lower body stretching routine for recovery',
      },
    },
  ],

  /**
   * Create user conversation vectors
   */
  conversationVectors: (userId: string) => [
    {
      id: `conv-${userId}-1`,
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        user_id: userId,
        type: 'conversation',
        timestamp: new Date('2024-01-01').toISOString(),
        content: 'I want to build muscle and lose fat',
        topic: 'goals',
      },
    },
    {
      id: `conv-${userId}-2`,
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        user_id: userId,
        type: 'conversation',
        timestamp: new Date('2024-01-02').toISOString(),
        content: 'I completed my workout today',
        topic: 'workout_completion',
      },
    },
  ],
};

/**
 * Test scenarios for vector search
 */
export const pineconeTestScenarios = {
  /**
   * Fitness knowledge base search
   */
  fitnessKnowledgeSearch: (mockClient: MockPineconeClient) => {
    const index = mockClient.Index('fitness-knowledge');
    index.addTestVectors(pineconeTestData.fitnessVectors());
    return mockClient;
  },

  /**
   * User conversation history search
   */
  conversationHistorySearch: (mockClient: MockPineconeClient, userId: string) => {
    const index = mockClient.Index('conversations');
    index.addTestVectors(pineconeTestData.conversationVectors(userId));
    return mockClient;
  },

  /**
   * Empty index scenario
   */
  emptyIndex: (mockClient: MockPineconeClient) => {
    mockClient.Index('empty-index');
    return mockClient;
  },

  /**
   * Large dataset scenario
   */
  largeDataset: (mockClient: MockPineconeClient) => {
    const index = mockClient.Index('large-dataset');
    const vectors = Array.from({ length: 1000 }, (_, i) => ({
      id: `vector-${i}`,
      values: pineconeTestData.generateEmbedding(),
      metadata: {
        index: i,
        category: i % 3 === 0 ? 'workout' : i % 3 === 1 ? 'nutrition' : 'recovery',
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      },
    }));
    index.addTestVectors(vectors);
    return mockClient;
  },
};