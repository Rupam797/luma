# 🔥 Luma - Premium Next-Gen Dating & Social Discovery Platform

Luma is a high-performance, real-time dating application built with **React Native (Expo SDK 57)** on the frontend and **Node.js, Express, TypeScript, and WebSockets (Socket.io)** on the backend.

---

## ✨ Features

- **⚡ Discovery & Deck Swiping**: High-performance gesture-driven card swiping with Superlike, Like, Pass, and Rewind actions.
- **💬 Real-Time Messaging**: Real-time 1-on-1 socket chat with live typing indicators and message history.
- **📸 Multi-Photo Profile System**: Gallery upload, camera capture, primary avatar management, and bio personalization via `expo-image-picker`.
- **🛡️ Google Play Compliance & Safety**:
  - In-app user reporting mechanism for UGC safety.
  - Full self-service account & data deletion endpoint (`DELETE /api/v1/users/me`).
  - Privacy policy and terms references.
- **🎨 Ultra-Sleek Glassmorphic Dark Mode**: Designed with dynamic Linear Gradients, micro-interactions, and modern typography.

---

## 🏗️ Architecture

```
luma/
├── mobile/                  # React Native / Expo Mobile App
│   ├── src/
│   │   ├── context/         # Auth & Session Management (AsyncStorage)
│   │   ├── navigation/      # Stack & Bottom Tabs (React Navigation)
│   │   ├── screens/         # Onboarding, Discover, Chat, Profile, Settings
│   │   └── services/        # REST & Socket.io Networking Service
│   ├── app.json
│   └── package.json
└── server/                  # Node.js + TypeScript Backend
    ├── src/
    │   ├── index.ts         # REST API & Socket.io Server
    │   └── ...
    └── package.json
```

---

## 🚀 Getting Started

### 1. Backend Server
```bash
cd server
npm install
npm run dev
```

### 2. Mobile App
```bash
cd mobile
npm install
npx expo start --lan -c
```

---

## 📄 License
MIT License
