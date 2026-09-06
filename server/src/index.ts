import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { pool } from './config/database';
import { SwipeService } from './modules/swipe/swipe.service';
import { ChatService } from './modules/chat/chat.service';
import { SafetyService } from './modules/safety/safety.service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_luma_jwt_key_2026';

// Middleware Configuration
app.use(helmet());
app.use(cors());
app.use(express.json());

// ==========================================
// MULTI-TIER RATE LIMITING CONFIGURATION
// ==========================================

// 1. Global API Rate Limiter (DDoS & General Scraping Prevention)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});
app.use('/api/', apiLimiter);

// 2. Strict Authentication Rate Limiter (Brute-Force & Credential Stuffing Prevention)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 login attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again.' },
});

// 3. Anti-Bot Swipe Rate Limiter (Prevents automated bot swiping & scraping)
const swipeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 swipes per minute per user/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are swiping too fast! Take a breath and review profiles carefully.' },
});

// 4. Safety & Report Abuse Limiter (Prevents malicious mass reporting)
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 reports per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Report limit reached. Our moderation team is already reviewing your submissions.' },
});

// Authentication Middleware
const authenticateToken = (req: Request, res: Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    (req as any).user = user;
    next();
  });
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Luma Dating API', timestamp: new Date().toISOString() });
});

// Auth & Demo User Login Endpoint (Protected by authLimiter)
app.post('/api/v1/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length === 0) {
      // Create demo user if not exists
      const newUser = await pool.query(
        `INSERT INTO users (email, full_name, birth_date, gender, bio, photos)
         VALUES ($1, $2, '1998-05-14', 'man', 'Passionate about travel, coffee & tech.', $3)
         RETURNING *`,
        [email, email.split('@')[0], ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500']]
      );
      user = newUser.rows[0];

      // Add default location (NYC coordinates)
      await pool.query(
        `INSERT INTO user_locations (user_id, location, city, country)
         VALUES ($1, ST_MakePoint(-74.006, 40.7128)::geography, 'New York', 'USA')
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );

      // Add default preferences
      await pool.query(
        `INSERT INTO user_preferences (user_id, min_age, max_age, preferred_gender, max_distance_km)
         VALUES ($1, 18, 45, ARRAY['woman', 'man'], 50)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );
    } else {
      user = userResult.rows[0];
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Discovery Feed Endpoint (PostGIS Nearby Candidates)
app.get('/api/v1/discovery', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const candidates = await SwipeService.getDiscoveryFeed(userId);
    res.json({ candidates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Swipe Endpoint (Protected by anti-bot swipeLimiter)
app.post('/api/v1/swipe', authenticateToken, swipeLimiter, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { toUserId, action } = req.body;

    if (!toUserId || !['like', 'dislike', 'superlike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid swipe parameters' });
    }

    const result = await SwipeService.processSwipe(userId, toUserId, action);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Matches
app.get('/api/v1/matches', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const matches = await ChatService.getUserMatches(userId);
    res.json({ matches });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Chat Messages History
app.get('/api/v1/matches/:matchId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const messages = await ChatService.getMessageHistory(matchId);
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Report User (Protected by reportLimiter)
app.post('/api/v1/safety/report', authenticateToken, reportLimiter, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { reportedUserId, reason, details } = req.body;
    const report = await SafetyService.reportUser(userId, reportedUserId, reason, details);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Account (Play Store Privacy Policy Requirement)
app.delete('/api/v1/users/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const result = await SafetyService.deleteUserAccount(userId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// WEBSOCKET REAL-TIME CHAT GATEWAY
// ==========================================

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User Authentication & Room Join
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room user:${userId}`);
  });

  // Real-Time Chat Message Handler
  socket.on('send_message', async (data: { matchId: string; senderId: string; recipientId: string; content: string }) => {
    try {
      const message = await ChatService.sendMessage(data.matchId, data.senderId, data.content);

      // Emit to sender
      socket.emit('message_received', message);

      // Emit to recipient room
      io.to(`user:${data.recipientId}`).emit('message_received', message);
    } catch (err) {
      console.error('Socket message error:', err);
      socket.emit('error', { message: 'Failed to deliver message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Luma Backend API & WebSocket Server running on port ${PORT}`);
});
