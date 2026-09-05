import { pool } from '../../config/database';

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  media_url?: string;
  is_read: boolean;
  sent_at: string;
}

export class ChatService {
  /**
   * Get all active matches for a user with their latest message
   */
  static async getUserMatches(userId: string) {
    const query = `
      SELECT 
        m.id AS match_id,
        m.matched_at,
        u.id AS partner_id,
        u.full_name AS partner_name,
        u.photos AS partner_photos,
        u.last_active_at,
        msg.content AS last_message,
        msg.sent_at AS last_message_time,
        msg.sender_id AS last_message_sender_id,
        COALESCE(unread.unread_count, 0) AS unread_count
      FROM matches m
      JOIN users u ON u.id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
      LEFT JOIN LATERAL (
        SELECT content, sent_at, sender_id 
        FROM messages 
        WHERE match_id = m.id 
        ORDER BY sent_at DESC 
        LIMIT 1
      ) msg ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS unread_count
        FROM messages
        WHERE match_id = m.id AND sender_id != $1 AND is_read = FALSE
      ) unread ON TRUE
      WHERE (m.user1_id = $1 OR m.user2_id = $1)
        AND m.is_active = TRUE
      ORDER BY COALESCE(msg.sent_at, m.matched_at) DESC;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Fetch chat message history for a match with pagination
   */
  static async getMessageHistory(matchId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const query = `
      SELECT id, match_id, sender_id, content, media_url, is_read, sent_at
      FROM messages
      WHERE match_id = $1
      ORDER BY sent_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [matchId, limit, offset]);
    return result.rows.reverse(); // Return in chronological order
  }

  /**
   * Send and persist a new message in database
   */
  static async sendMessage(matchId: string, senderId: string, content: string, mediaUrl?: string): Promise<ChatMessage> {
    const query = `
      INSERT INTO messages (match_id, sender_id, content, media_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, match_id, sender_id, content, media_url, is_read, sent_at;
    `;
    const result = await pool.query(query, [matchId, senderId, content, mediaUrl || null]);
    return result.rows[0];
  }

  /**
   * Mark messages in a match as read
   */
  static async markAsRead(matchId: string, userId: string): Promise<void> {
    await pool.query(
      `UPDATE messages SET is_read = TRUE WHERE match_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [matchId, userId]
    );
  }
}
