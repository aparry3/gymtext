import { vi, type Mock } from 'vitest';

interface MockCustomer {
  id: string;
  email: string;
  phone?: string;
  metadata: Record<string, string>;
  created: number;
}

interface MockSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: 'day' | 'week' | 'month' | 'year';
          interval_count: number;
        };
      };
    }>;
  };
  metadata: Record<string, string>;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
}

interface MockCheckoutSession {
  id: string;
  customer: string | null;
  customer_email: string | null;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  status: 'open' | 'complete' | 'expired';
  success_url: string;
  cancel_url: string;
  metadata: Record<string, string>;
  line_items?: {
    data: Array<{
      price: {
        id: string;
        product: string;
        unit_amount: number;
        currency: string;
      };
      quantity: number;
    }>;
  };
  subscription?: string;
  mode: 'payment' | 'subscription' | 'setup';
  url: string;
}

/**
 * Mock Stripe client for testing
 */
export class MockStripeClient {
  public customers: {
    create: Mock;
    retrieve: Mock;
    update: Mock;
    list: Mock;
  };

  public subscriptions: {
    create: Mock;
    retrieve: Mock;
    update: Mock;
    cancel: Mock;
    list: Mock;
  };

  public checkout: {
    sessions: {
      create: Mock;
      retrieve: Mock;
      listLineItems: Mock;
    };
  };

  public webhooks: {
    constructEvent: Mock;
  };

  private mockCustomers: Map<string, MockCustomer> = new Map();
  private mockSubscriptions: Map<string, MockSubscription> = new Map();
  private mockSessions: Map<string, MockCheckoutSession> = new Map();
  private idCounter = 1000;
  private shouldFail = false;
  private failureMessage = 'Test failure';

  constructor() {
    // Customers API
    this.customers = {
      create: vi.fn(async (params: any) => {
        if (this.shouldFail) throw new Error(this.failureMessage);

        const customer: MockCustomer = {
          id: `cus_${this.generateId()}`,
          email: params.email,
          phone: params.phone,
          metadata: params.metadata || {},
          created: Math.floor(Date.now() / 1000),
        };

        this.mockCustomers.set(customer.id, customer);
        return customer;
      }),

      retrieve: vi.fn(async (id: string) => {
        const customer = this.mockCustomers.get(id);
        if (!customer) throw new Error(`No such customer: ${id}`);
        return customer;
      }),

      update: vi.fn(async (id: string, params: any) => {
        const customer = this.mockCustomers.get(id);
        if (!customer) throw new Error(`No such customer: ${id}`);

        const updated = { ...customer, ...params };
        this.mockCustomers.set(id, updated);
        return updated;
      }),

      list: vi.fn(async (params?: any) => {
        const customers = Array.from(this.mockCustomers.values());
        return { data: customers, has_more: false };
      }),
    };

    // Subscriptions API
    this.subscriptions = {
      create: vi.fn(async (params: any) => {
        if (this.shouldFail) throw new Error(this.failureMessage);

        const subscription: MockSubscription = {
          id: `sub_${this.generateId()}`,
          customer: params.customer,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          items: {
            data: [{
              id: `si_${this.generateId()}`,
              price: {
                id: params.items[0].price || process.env.STRIPE_PRICE_ID || 'price_test',
                product: 'prod_test',
                unit_amount: 2999,
                currency: 'usd',
                recurring: {
                  interval: 'month',
                  interval_count: 1,
                },
              },
            }],
          },
          metadata: params.metadata || {},
          cancel_at_period_end: false,
          canceled_at: null,
        };

        this.mockSubscriptions.set(subscription.id, subscription);
        return subscription;
      }),

      retrieve: vi.fn(async (id: string) => {
        const subscription = this.mockSubscriptions.get(id);
        if (!subscription) throw new Error(`No such subscription: ${id}`);
        return subscription;
      }),

      update: vi.fn(async (id: string, params: any) => {
        const subscription = this.mockSubscriptions.get(id);
        if (!subscription) throw new Error(`No such subscription: ${id}`);

        const updated = { ...subscription, ...params };
        this.mockSubscriptions.set(id, updated);
        return updated;
      }),

      cancel: vi.fn(async (id: string, params?: any) => {
        const subscription = this.mockSubscriptions.get(id);
        if (!subscription) throw new Error(`No such subscription: ${id}`);

        const canceled = {
          ...subscription,
          status: 'canceled' as const,
          cancel_at_period_end: true,
          canceled_at: Math.floor(Date.now() / 1000),
        };

        this.mockSubscriptions.set(id, canceled);
        return canceled;
      }),

      list: vi.fn(async (params?: any) => {
        let subscriptions = Array.from(this.mockSubscriptions.values());
        
        if (params?.customer) {
          subscriptions = subscriptions.filter(s => s.customer === params.customer);
        }
        
        if (params?.status) {
          subscriptions = subscriptions.filter(s => s.status === params.status);
        }

        return { data: subscriptions, has_more: false };
      }),
    };

    // Checkout Sessions API
    this.checkout = {
      sessions: {
        create: vi.fn(async (params: any) => {
          if (this.shouldFail) throw new Error(this.failureMessage);

          const sessionId = `cs_test_${this.generateId()}`;
          const session: MockCheckoutSession = {
            id: sessionId,
            customer: params.customer || null,
            customer_email: params.customer_email || null,
            payment_status: 'unpaid',
            status: 'open',
            success_url: params.success_url,
            cancel_url: params.cancel_url,
            metadata: params.metadata || {},
            mode: params.mode || 'subscription',
            url: `https://checkout.stripe.com/test/${sessionId}`,
          };

          if (params.line_items) {
            session.line_items = {
              data: params.line_items.map((item: any) => ({
                price: {
                  id: item.price,
                  product: 'prod_test',
                  unit_amount: 2999,
                  currency: 'usd',
                },
                quantity: item.quantity || 1,
              })),
            };
          }

          this.mockSessions.set(session.id, session);
          return session;
        }),

        retrieve: vi.fn(async (id: string) => {
          const session = this.mockSessions.get(id);
          if (!session) throw new Error(`No such checkout session: ${id}`);
          return session;
        }),

        listLineItems: vi.fn(async (id: string) => {
          const session = this.mockSessions.get(id);
          if (!session) throw new Error(`No such checkout session: ${id}`);
          
          return {
            data: session.line_items?.data || [],
            has_more: false,
          };
        }),
      },
    };

    // Webhooks API
    this.webhooks = {
      constructEvent: vi.fn((payload: string, header: string, secret: string) => {
        // In test mode, parse the payload and return it as an event
        try {
          const data = JSON.parse(payload);
          return {
            id: `evt_${this.generateId()}`,
            type: data.type || 'checkout.session.completed',
            data: data.data || { object: {} },
            created: Math.floor(Date.now() / 1000),
          };
        } catch (error) {
          throw new Error('Invalid webhook payload');
        }
      }),
    };
  }

  /**
   * Simulate completing a checkout session
   */
  completeCheckoutSession(sessionId: string, customerId?: string): MockCheckoutSession {
    const session = this.mockSessions.get(sessionId);
    if (!session) throw new Error(`No such checkout session: ${sessionId}`);

    const completedSession = {
      ...session,
      status: 'complete' as const,
      payment_status: 'paid' as const,
      customer: customerId || session.customer || `cus_${this.generateId()}`,
    };

    // Create subscription if in subscription mode
    if (session.mode === 'subscription') {
      const subscription = this.subscriptions.create({
        customer: completedSession.customer,
        items: [{ price: session.line_items?.data[0]?.price.id }],
        metadata: session.metadata,
      });
      completedSession.subscription = (subscription as any).id;
    }

    this.mockSessions.set(sessionId, completedSession);
    return completedSession;
  }

  /**
   * Create a webhook event
   */
  createWebhookEvent(type: string, data: any) {
    return {
      id: `evt_${this.generateId()}`,
      type,
      data: { object: data },
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Simulate failure
   */
  simulateFailure(message: string = 'Test failure'): void {
    this.shouldFail = true;
    this.failureMessage = message;
  }

  /**
   * Reset failure simulation
   */
  resetFailure(): void {
    this.shouldFail = false;
  }

  /**
   * Clear all data
   */
  reset(): void {
    this.mockCustomers.clear();
    this.mockSubscriptions.clear();
    this.mockSessions.clear();
    this.idCounter = 1000;
    this.shouldFail = false;
    
    // Clear all mocks
    Object.values(this.customers).forEach(fn => fn.mockClear());
    Object.values(this.subscriptions).forEach(fn => fn.mockClear());
    Object.values(this.checkout.sessions).forEach(fn => fn.mockClear());
    this.webhooks.constructEvent.mockClear();
  }

  private generateId(): string {
    return (this.idCounter++).toString();
  }
}

/**
 * Create a mock Stripe instance
 */
export function createMockStripe() {
  const mockClient = new MockStripeClient();
  
  // Store globally for access in mocked module
  (globalThis as any).__mockStripeClient = mockClient;
  
  // Mock the stripe module
  vi.mock('stripe', () => {
    return {
      default: vi.fn(() => (globalThis as any).__mockStripeClient),
      Stripe: vi.fn(() => (globalThis as any).__mockStripeClient),
    };
  });
  
  return mockClient;
}

/**
 * Test scenarios for payment functionality
 */
export const stripeTestScenarios = {
  /**
   * Successful subscription creation
   */
  successfulSubscription: async (mockClient: MockStripeClient) => {
    // Create customer
    const customer = await mockClient.customers.create({
      email: 'test@example.com',
      phone: '+12125551234',
      metadata: { userId: 'user_123' },
    });

    // Create checkout session
    const session = await mockClient.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: { userId: 'user_123' },
    });

    // Complete the session
    const completed = mockClient.completeCheckoutSession(session.id, customer.id);

    return { customer, session, completed };
  },

  /**
   * Failed payment
   */
  failedPayment: (mockClient: MockStripeClient) => {
    mockClient.simulateFailure('Your card was declined');
    return mockClient;
  },

  /**
   * Subscription cancellation
   */
  cancelSubscription: async (mockClient: MockStripeClient) => {
    // First create a subscription
    const { customer } = await stripeTestScenarios.successfulSubscription(mockClient);
    
    // Get the subscription
    const subscriptions = await mockClient.subscriptions.list({ customer: customer.id });
    const subscription = subscriptions.data[0];
    
    // Cancel it
    const canceled = await mockClient.subscriptions.cancel(subscription.id);
    
    return { customer, subscription: canceled };
  },

  /**
   * Webhook events
   */
  webhookEvents: (mockClient: MockStripeClient) => {
    const events = {
      checkoutCompleted: mockClient.createWebhookEvent('checkout.session.completed', {
        id: 'cs_test_123',
        customer: 'cus_123',
        subscription: 'sub_123',
        metadata: { userId: 'user_123' },
      }),
      
      subscriptionDeleted: mockClient.createWebhookEvent('customer.subscription.deleted', {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'canceled',
      }),
      
      paymentFailed: mockClient.createWebhookEvent('invoice.payment_failed', {
        id: 'in_123',
        customer: 'cus_123',
        subscription: 'sub_123',
        attempt_count: 1,
      }),
    };
    
    return events;
  },
};