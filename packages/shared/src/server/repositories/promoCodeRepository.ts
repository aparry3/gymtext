import { BaseRepository } from './baseRepository';
import type { PromoCode } from '../models/promoCode';

export class PromoCodeRepository extends BaseRepository {
  async findByCode(code: string): Promise<PromoCode | null> {
    const result = await this.db
      .selectFrom('promoCodes')
      .selectAll()
      .where('code', '=', code.toUpperCase())
      .where('isActive', '=', true)
      .executeTakeFirst();

    return result || null;
  }

  async findAll(): Promise<PromoCode[]> {
    return this.db
      .selectFrom('promoCodes')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();
  }

  async create(data: { code: string; name: string; stripeCouponId: string }): Promise<PromoCode> {
    return this.db
      .insertInto('promoCodes')
      .values({
        code: data.code.toUpperCase(),
        name: data.name,
        stripeCouponId: data.stripeCouponId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deactivate(id: string): Promise<PromoCode> {
    return this.db
      .updateTable('promoCodes')
      .set({ isActive: false })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
