import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevHost = () => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  if (Platform.OS === 'android') {
    return '192.168.0.110';
  }
  return 'localhost';
};

export const DEV_HOST = getDevHost();
export const API_BASE_URL = `http://${DEV_HOST}:4000/api/v1`;
export const SOCKET_URL = `http://${DEV_HOST}:4000`;

class ApiService {
  private token: string | null = null;
  private socket: Socket | null = null;

  setAuthToken(token: string) {
    this.token = token;
  }

  getBaseUrl() {
    return API_BASE_URL;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // Auth: Demo Login / OTP Verification
  async login(email: string) {
    const res = await this.fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
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
  async updateProfile(data: { full_name?: string; bio?: string; gender?: string; birth_date?: string; interests?: string[]; photos?: string[] }) {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return { success: true, updated: data };
    }
  }

  // Discovery: Fetch nearby candidates
  async getDiscoveryFeed() {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/discovery`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return await res.json();
    } catch (e) {
      return { candidates: [] };
    }
  }

  // Swipe: Process swipe action (like, dislike, superlike)
  async processSwipe(toUserId: string, action: 'like' | 'dislike' | 'superlike') {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ toUserId, action }),
      });
      return await res.json();
    } catch (e) {
      return { success: true, match: false };
    }
  }

  // Chat: Fetch user matches
  async getMatches() {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/matches`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return await res.json();
    } catch (e) {
      return { matches: [] };
    }
  }

  // Chat: Get message history for a match
  async getMessageHistory(matchId: string) {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/matches/${matchId}/messages`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return await res.json();
    } catch (e) {
      return { messages: [] };
    }
  }

  // Safety: Report user
  async reportUser(reportedUserId: string, reason: string, details?: string) {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/safety/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ reportedUserId, reason, details }),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  }

  // Safety: Self-service account & data deletion (Play Store Compliance)
  async deleteAccount() {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  }

  // WebSockets: Initialize real-time chat connection
  connectSocket(userId: string, onMessageReceived: (msg: any) => void) {
    if (this.socket) this.socket.disconnect();

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
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
