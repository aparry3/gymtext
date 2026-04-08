import type { Insertable, Selectable, Updateable } from 'kysely';
import { BaseRepository } from '@/server/repositories/baseRepository';
import type { CoachBookings } from '@/server/models/_types';

export type CoachBookingDB = Selectable<CoachBookings>;
export type NewCoachBooking = Insertable<CoachBookings>;
export type CoachBookingUpdate = Updateable<CoachBookings>;

export type CoachBookingStatus = 'active' | 'canceled' | 'no_show';

/**
 * Repository for coach_bookings — records of Calendly bookings made via
 * coach scheduling links sent through GymText.
 */
export class CoachBookingRepository extends BaseRepository {
  /**
   * Create a new booking record (called from the Calendly webhook on invitee.created).
   */
  async create(data: NewCoachBooking): Promise<CoachBookingDB> {
    return this.db
      .insertInto('coachBookings')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findByInviteeUri(inviteeUri: string): Promise<CoachBookingDB | null> {
    const result = await this.db
      .selectFrom('coachBookings')
      .selectAll()
      .where('calendlyInviteeUri', '=', inviteeUri)
      .executeTakeFirst();
    return result ?? null;
  }

  /**
   * Mark a booking as canceled (called from invitee.canceled webhook).
   */
  async markCanceled(
    inviteeUri: string,
    canceledAt: Date,
    reason: string | null,
  ): Promise<CoachBookingDB | null> {
    const result = await this.db
      .updateTable('coachBookings')
      .set({
        status: 'canceled',
        canceledAt,
        cancelReason: reason,
        updatedAt: new Date(),
      })
      .where('calendlyInviteeUri', '=', inviteeUri)
      .returningAll()
      .executeTakeFirst();
    return result ?? null;
  }

  /**
   * Count active bookings for a client. Used by Part 2 (session-limit enforcement).
   */
  async countActiveByClient(clientId: string): Promise<number> {
    const result = await this.db
      .selectFrom('coachBookings')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('clientId', '=', clientId)
      .where('status', '=', 'active')
      .executeTakeFirst();
    return Number(result?.count ?? 0);
  }
}
