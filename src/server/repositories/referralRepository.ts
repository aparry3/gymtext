import { BaseRepository } from './baseRepository';
import { Referral, NewReferral } from '../models/referral';
import { sql } from 'kysely';

/**
 * Repository for managing referrals
 * Handles storage and retrieval of referral relationships
 */
export class ReferralRepository extends BaseRepository {
  /**
   * Create a new referral record
   * Called when a referee signs up using a referral code
   */
  async create(referrerId: string, refereeId: string): Promise<Referral> {
    const result = await this.db
      .insertInto('referrals')
      .values({
        referrerId,
        refereeId,
        creditApplied: false,
        creditAmountCents: 0,
        createdAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Find a referral by referee ID
   * Used by webhook to find the referral when crediting the referrer
   */
  async findByRefereeId(refereeId: string): Promise<Referral | null> {
    const result = await this.db
      .selectFrom('referrals')
      .selectAll()
      .where('refereeId', '=', refereeId)
      .executeTakeFirst();

    return result || null;
  }

  /**
   * Find all referrals for a referrer
   * Used for displaying referral stats on the /me page
   */
  async findByReferrerId(referrerId: string): Promise<Referral[]> {
    return await this.db
      .selectFrom('referrals')
      .selectAll()
      .where('referrerId', '=', referrerId)
      .orderBy('createdAt', 'desc')
      .execute();
  }

  /**
   * Mark a referral as credited
   * Called after successfully applying credit to the referrer's Stripe account
   */
  async markCreditApplied(id: string, amountCents: number): Promise<Referral> {
    const result = await this.db
      .updateTable('referrals')
      .set({
        creditApplied: true,
        creditAmountCents: amountCents,
        creditedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Count credits earned by a referrer
   * Only counts referrals where credit was actually applied
   */
  async countCreditsEarned(referrerId: string): Promise<number> {
    const result = await this.db
      .selectFrom('referrals')
      .select(sql<number>`count(*)`.as('count'))
      .where('referrerId', '=', referrerId)
      .where('creditApplied', '=', true)
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  /**
   * Count total referrals by a referrer (regardless of credit status)
   */
  async countByReferrer(referrerId: string): Promise<number> {
    const result = await this.db
      .selectFrom('referrals')
      .select(sql<number>`count(*)`.as('count'))
      .where('referrerId', '=', referrerId)
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  /**
   * Check if a user has already been referred
   * Each user can only be referred once
   */
  async hasBeenReferred(refereeId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('referrals')
      .select('id')
      .where('refereeId', '=', refereeId)
      .executeTakeFirst();

    return !!result;
  }
}
