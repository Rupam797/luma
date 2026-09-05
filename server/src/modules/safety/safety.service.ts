import { pool } from '../../config/database';

export class SafetyService {
  /**
   * Report a user profile or content (Play Store UGC Policy Requirement)
   */
  static async reportUser(reporterId: string, reportedUserId: string, reason: string, details?: string) {
    const result = await pool.query(
      `INSERT INTO reports (reporter_id, reported_user_id, reason, details)
       VALUES ($1, $2, $3, $4)
       RETURNING id, status, created_at`,
      [reporterId, reportedUserId, reason, details || null]
    );

    // Auto-block reported user for safety
    await this.blockUser(reporterId, reportedUserId);

    return result.rows[0];
  }

  /**
   * Block a user profile
   */
  static async blockUser(blockerId: string, blockedId: string) {
    await pool.query(
      `INSERT INTO blocked_users (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [blockerId, blockedId]
    );

    // Deactivate any active match between these users
    await pool.query(
      `UPDATE matches SET is_active = FALSE 
       WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
      [blockerId, blockedId]
    );

    return { success: true };
  }

  /**
   * Full Account & Data Hard Deletion (Google Play Privacy Policy Requirement)
   * Hard-deletes user record, locations, swipes, matches, and uploaded media records.
   */
  static async deleteUserAccount(userId: string) {
    // Cascading DB deletion handles user_locations, user_preferences, swipes, matches, messages
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    return { success: true, message: 'User account and associated data completely deleted.' };
  }
}
