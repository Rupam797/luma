import { pool, redis } from '../../config/database';

export interface CandidateProfile {
  id: string;
  full_name: string;
  birth_date: string;
  age: number;
  gender: string;
  bio: string;
  photos: string[];
  distance_km: number;
  city: string;
}

export class SwipeService {
  /**
   * PostGIS Spatial Candidate Discovery Engine
   * Fetches nearby profiles within preference radius, filtering out already swiped or blocked profiles.
   */
  static async getDiscoveryFeed(userId: string, limit = 20): Promise<CandidateProfile[]> {
    const query = `
      WITH user_pref AS (
        SELECT up.min_age, up.max_age, up.preferred_gender, up.max_distance_km, ul.location
        FROM user_preferences up
        JOIN user_locations ul ON up.user_id = ul.user_id
        WHERE up.user_id = $1
      )
      SELECT 
        u.id, 
        u.full_name, 
        u.birth_date,
        EXTRACT(YEAR FROM age(u.birth_date))::int AS age,
        u.gender, 
        u.bio, 
        u.photos,
        ul.city,
        -- Calculate distance in KM using PostGIS ST_Distance
        ROUND((ST_Distance(ul.location, pref.location) / 1000)::numeric, 1)::float AS distance_km
      FROM users u
      JOIN user_locations ul ON u.id = ul.user_id
      CROSS JOIN user_pref pref
      WHERE u.id != $1
        AND u.is_active = TRUE
        -- Filter by gender preference
        AND u.gender = ANY(pref.preferred_gender)
        -- Filter by age range preference
        AND EXTRACT(YEAR FROM age(u.birth_date)) BETWEEN pref.min_age AND pref.max_age
        -- PostGIS spatial filter within distance_km
        AND ST_DWithin(ul.location, pref.location, pref.max_distance_km * 1000)
        -- Exclude already swiped profiles
        AND u.id NOT IN (
          SELECT to_user_id FROM swipes WHERE from_user_id = $1
        )
        -- Exclude blocked users
        AND u.id NOT IN (
          SELECT blocked_id FROM blocked_users WHERE blocker_id = $1
          UNION
          SELECT blocker_id FROM blocked_users WHERE blocked_id = $1
        )
      ORDER BY ST_Distance(ul.location, pref.location) ASC
      LIMIT $2;
    `;

    const result = await pool.query(query, [userId, limit]);

    // Apply location privacy jitter (random spatial offset so exact coordinates can't be pinpointed)
    return result.rows.map((profile) => ({
      ...profile,
      // Add slight privacy noise to distance (+/- 0.2 km)
      distance_km: Math.max(0.5, Math.round((profile.distance_km + (Math.random() * 0.4 - 0.2)) * 10) / 10),
    }));
  }

  /**
   * High-Performance Swipe & Double-Match Detection Engine
   * Uses Redis if connected, with automatic PostgreSQL mutual-like fallback.
   */
  static async processSwipe(fromUserId: string, toUserId: string, action: 'like' | 'dislike' | 'superlike') {
    // 1. Persist swipe in PostgreSQL
    await pool.query(
      `INSERT INTO swipes (from_user_id, to_user_id, action) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (from_user_id, to_user_id) DO UPDATE SET action = $3`,
      [fromUserId, toUserId, action]
    );

    // If swipe is 'dislike', return no match immediately
    if (action === 'dislike') {
      return { isMatch: false, matchId: null };
    }

    let isMutualLike = false;

    // 2. Try fast Redis check if available
    try {
      if (redis.status === 'ready' || redis.status === 'connect') {
        await redis.sadd(`user:${fromUserId}:likes`, toUserId);
        const member = await redis.sismember(`user:${toUserId}:likes`, fromUserId);
        isMutualLike = !!member;
      } else {
        throw new Error('Redis not connected');
      }
    } catch {
      // Fallback: Check PostgreSQL for mutual like
      const mutualRes = await pool.query(
        `SELECT id FROM swipes 
         WHERE from_user_id = $1 AND to_user_id = $2 AND action IN ('like', 'superlike')`,
        [toUserId, fromUserId]
      );
      isMutualLike = mutualRes.rows.length > 0;
    }

    if (isMutualLike) {
      // It's a MATCH! Create match record in PostgreSQL
      const matchResult = await pool.query(
        `INSERT INTO matches (user1_id, user2_id) 
         VALUES (LEAST($1::uuid, $2::uuid), GREATEST($1::uuid, $2::uuid))
         ON CONFLICT (user1_id, user2_id) DO UPDATE SET is_active = TRUE
         RETURNING id, matched_at`,
        [fromUserId, toUserId]
      );

      const matchId = matchResult.rows[0].id;

      try {
        if (redis.status === 'ready') {
          await redis.publish(
            'match_events',
            JSON.stringify({
              matchId,
              user1Id: fromUserId,
              user2Id: toUserId,
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (e) {
        // PubSub optional
      }

      return {
        isMatch: true,
        matchId,
        matchedWithId: toUserId,
      };
    }

    return { isMatch: false, matchId: null };
  }
}
