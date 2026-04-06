import { sql } from 'kysely';
import { BaseRepository } from './baseRepository';

/**
 * Repository for managing admin test user routing.
 *
 * Tracks which test user identity is "active" for each admin phone number,
 * so inbound SMS from that admin phone is routed to the correct test user.
 */
export class AdminTestRoutingRepository extends BaseRepository {
  /**
   * Get the active test user ID for an admin phone number.
   * Returns null if no active test user is set.
   */
  async getActiveTestUserId(adminPhone: string): Promise<string | null> {
    const result = await sql<{ active_user_id: string }>`
      SELECT active_user_id FROM admin_active_test_user
      WHERE admin_phone = ${adminPhone}
    `.execute(this.db);

    return result.rows[0]?.active_user_id ?? null;
  }

  /**
   * Set the active test user for an admin phone number.
   * Upserts — creates or updates the mapping.
   */
  async setActiveTestUser(adminPhone: string, userId: string): Promise<void> {
    await sql`
      INSERT INTO admin_active_test_user (admin_phone, active_user_id, updated_at)
      VALUES (${adminPhone}, ${userId}, NOW())
      ON CONFLICT (admin_phone) DO UPDATE SET
        active_user_id = ${userId},
        updated_at = NOW()
    `.execute(this.db);
  }

  /**
   * Clear the active test user for an admin phone number.
   */
  async clearActiveTestUser(adminPhone: string): Promise<void> {
    await sql`
      DELETE FROM admin_active_test_user
      WHERE admin_phone = ${adminPhone}
    `.execute(this.db);
  }
}
