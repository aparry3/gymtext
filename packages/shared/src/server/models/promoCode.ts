import type { PromoCodes } from './_types';
import type { Insertable, Selectable } from 'kysely';

export type PromoCode = Selectable<PromoCodes>;
export type NewPromoCode = Insertable<PromoCodes>;
