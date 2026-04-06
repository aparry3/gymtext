import type { RepositoryContainer } from '../../../repositories/factory';
import type { Program, NewProgram, ProgramUpdate } from '../../../models/program';
import { stripeClient, fetchPriceAmountCents } from '@/server/connections/stripe';

/**
 * Program Service Instance Interface
 */
export interface ProgramServiceInstance {
  create(data: NewProgram): Promise<Program>;
  getById(id: string): Promise<Program | null>;
  getByOwnerId(ownerId: string): Promise<Program[]>;
  getAiProgram(): Promise<Program>;
  listPublic(): Promise<Program[]>;
  listActive(): Promise<Program[]>;
  listAll(): Promise<Program[]>;
  update(id: string, data: ProgramUpdate): Promise<Program | null>;
  updatePricing(id: string, pricing: { priceAmountCents: number | null; priceCurrency: string }): Promise<Program | null>;
}

/**
 * Create a ProgramService instance
 */
export function createProgramService(
  repos: RepositoryContainer
): ProgramServiceInstance {
  // Cache the AI program to avoid repeated lookups
  let cachedAiProgram: Program | null = null;

  async function enrichWithPrice(program: Program): Promise<Program> {
    if (program.priceAmountCents) return program;
    const price = await fetchPriceAmountCents(program.stripePriceId);
    return { ...program, priceAmountCents: price };
  }

  async function enrichAllWithPrice(programs: Program[]): Promise<Program[]> {
    return Promise.all(programs.map(enrichWithPrice));
  }

  return {
    async create(data: NewProgram): Promise<Program> {
      const program = await repos.program.create(data);

      // Auto-create initial draft version so every program has at least one version
      await repos.programVersion.create({
        programId: program.id,
        versionNumber: 1,
        status: 'draft',
        content: null,
        generationConfig: null,
        defaultDurationWeeks: null,
        difficultyMetadata: null,
      });

      return program;
    },

    async getById(id: string): Promise<Program | null> {
      const program = await repos.program.findById(id);
      return program ? enrichWithPrice(program) : null;
    },

    async getByOwnerId(ownerId: string): Promise<Program[]> {
      const programs = await repos.program.findByOwnerId(ownerId);
      return enrichAllWithPrice(programs);
    },

    async getAiProgram(): Promise<Program> {
      if (cachedAiProgram) {
        return cachedAiProgram;
      }

      const program = await repos.program.findAiProgram();
      if (!program) {
        throw new Error('AI Personal Training program not found - run migrations');
      }

      cachedAiProgram = program;
      return program;
    },

    async listPublic(): Promise<Program[]> {
      const programs = await repos.program.listPublic();
      return enrichAllWithPrice(programs);
    },

    async listActive(): Promise<Program[]> {
      const programs = await repos.program.listActive();
      return enrichAllWithPrice(programs);
    },

    async listAll(): Promise<Program[]> {
      const programs = await repos.program.listAll();
      return enrichAllWithPrice(programs);
    },

    async update(id: string, data: ProgramUpdate): Promise<Program | null> {
      // Invalidate cache if updating AI program
      if (cachedAiProgram && cachedAiProgram.id === id) {
        cachedAiProgram = null;
      }
      return repos.program.update(id, data);
    },

    async updatePricing(id: string, pricing: { priceAmountCents: number | null; priceCurrency: string }): Promise<Program | null> {
      const { priceAmountCents, priceCurrency } = pricing;

      const existing = await repos.program.findById(id);
      if (!existing) return null;

      // Clearing the price
      if (!priceAmountCents) {
        return repos.program.update(id, {
          priceAmountCents: null,
          priceCurrency,
          stripeProductId: null,
          stripePriceId: null,
        });
      }

      // Create Stripe Product if none exists
      let productId = existing.stripeProductId;
      if (!productId) {
        const product = await stripeClient.products.create({
          name: existing.name,
          metadata: { programId: id, source: 'gymtext-admin' },
        });
        productId = product.id;
      }

      // Always create a new Price (Stripe Prices are immutable)
      const price = await stripeClient.prices.create({
        product: productId,
        unit_amount: priceAmountCents,
        currency: priceCurrency,
        recurring: { interval: 'month' },
      });

      // Deactivate old Price
      if (existing.stripePriceId && existing.stripePriceId !== price.id) {
        await stripeClient.prices.update(existing.stripePriceId, { active: false });
      }

      return repos.program.update(id, {
        priceAmountCents,
        priceCurrency,
        stripeProductId: productId,
        stripePriceId: price.id,
      });
    },

  };
}
