import { io, Socket } from 'socket.io-client';

export const API_BASE_URL = 'http://localhost:4000/api/v1';
export const SOCKET_URL = 'http://localhost:4000';

class ApiService {
  private token: string | null = null;
  private socket: Socket | null = null;

  setAuthToken(token: string) {
    this.token = token;
  }

  getBaseUrl() {
    return API_BASE_URL;
  }

  // Auth: Demo Login / OTP Verification
  async login(email: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.token) {
      this.setAuthToken(data.token);
    }
    return data;
  }

  // Profile: Update user profile
  async updateProfile(data: { full_name?: string; bio?: string; gender?: string; birth_date?: string; interests?: string[] }) {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  // Discovery: Fetch nearby candidates
  async getDiscoveryFeed() {
    const res = await fetch(`${API_BASE_URL}/discovery`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return await res.json();
  }

  // Swipe: Process swipe action (like, dislike, superlike)
  async processSwipe(toUserId: string, action: 'like' | 'dislike' | 'superlike') {
    const res = await fetch(`${API_BASE_URL}/swipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ toUserId, action }),
    });
    return await res.json();
  }

  // Chat: Fetch user matches
  async getMatches() {
    const res = await fetch(`${API_BASE_URL}/matches`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return await res.json();
  }

  // Chat: Get message history for a match
  async getMessageHistory(matchId: string) {
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/messages`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return await res.json();
  }

  // Safety: Report user
  async reportUser(reportedUserId: string, reason: string, details?: string) {
    const res = await fetch(`${API_BASE_URL}/safety/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ reportedUserId, reason, details }),
    });
    return await res.json();
  }

  // Safety: Self-service account & data deletion (Play Store Compliance)
  async deleteAccount() {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return await res.json();
  }

  // WebSockets: Initialize real-time chat connection
  connectSocket(userId: string, onMessageReceived: (msg: any) => void) {
    if (this.socket) this.socket.disconnect();

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
      this.socket?.emit('join', userId);
    });

    this.socket.on('message_received', (msg) => {
      onMessageReceived(msg);
    });

    return this.socket;
  }

  // WebSockets: Send real-time chat message
  sendMessage(matchId: string, senderId: string, recipientId: string, content: string) {
    if (this.socket) {
      this.socket.emit('send_message', { matchId, senderId, recipientId, content });
    }
  }
}

export const apiService = new ApiService();
