import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MatchItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  recipientId?: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

const DEMO_MATCHES: MatchItem[] = [
  { id: 'match-1', name: 'Sophia Martinez', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', lastMessage: 'That rooftop bar was amazing! 🌃', time: '2m ago', unreadCount: 2, recipientId: 'user-sophia' },
  { id: 'match-2', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200', lastMessage: 'See you at the indie show?', time: '1h ago', unreadCount: 0, recipientId: 'user-elena' },
  { id: 'match-3', name: 'Aria Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', lastMessage: 'My dog says hi 🐕', time: '3h ago', unreadCount: 1, recipientId: 'user-aria' },
];

const INITIAL_MESSAGES: MessageItem[] = [
  { id: '1', senderId: 'them', text: 'Hey! I saw you like rooftop bars too 🌃', time: '10:30 AM' },
  { id: '2', senderId: 'me', text: 'Yes! Have you been to the one in Williamsburg?', time: '10:32 AM' },
  { id: '3', senderId: 'them', text: 'That rooftop bar was amazing! The sunset views are incredible', time: '10:35 AM' },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>(DEMO_MATCHES);
  const [activeMatch, setActiveMatch] = useState<MatchItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load matches from API
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await apiService.getMatches();
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.log('Using demo matches');
      }
    };
    loadMatches();
  }, []);

  // Connect socket when entering a chat
  useEffect(() => {
    if (activeMatch && user) {
      apiService.connectSocket(user.id, (msg: any) => {
        const newMsg: MessageItem = {
          id: msg.id || Date.now().toString(),
          senderId: msg.sender_id === user.id ? 'me' : 'them',
          text: msg.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, newMsg]);
      });

      // Load message history
      const loadHistory = async () => {
        try {
          const data = await apiService.getMessageHistory(activeMatch.id);
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m: any) => ({
              id: m.id,
              senderId: m.sender_id === user.id ? 'me' : 'them',
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })));
          }
        } catch (err) {
          console.log('Using demo messages');
        }
      };
      loadHistory();
    }
  }, [activeMatch, user]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeMatch) return;

    const newMessage: MessageItem = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Send via socket
    if (user) {
      apiService.sendMessage(
        activeMatch.id,
        user.id,
        activeMatch.recipientId || '',
        inputMessage.trim()
      );
    }

    setInputMessage('');

    // Simulate typing indicator
    setTyping(true);
    setTimeout(() => setTyping(false), 2000);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ====== MATCH LIST VIEW ======
  if (!activeMatch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Matches & Chats</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Matches 💫</Text>
        </View>
        <View style={styles.newMatchesRow}>
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.newMatchAvatarContainer}
              onPress={() => setActiveMatch(match)}
            >
              <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.avatarGradientRing}>
                <Image source={{ uri: match.avatar }} style={styles.newMatchAvatar} />
              </LinearGradient>
              <Text style={styles.newMatchName}>{match.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Messages</Text>
        </View>
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatRow} onPress={() => setActiveMatch(item)}>
              <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
              <View style={styles.chatContent}>
                <View style={styles.chatHeaderRow}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <Text style={styles.chatLastMsg} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ====== CHAT CONVERSATION VIEW ======
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveMatch(null)} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.activeUserGroup}>
            <Image source={{ uri: activeMatch.avatar }} style={styles.headerAvatar} />
            <View>
              <Text style={styles.activeUserName}>{activeMatch.name}</Text>
              <Text style={styles.activeUserStatus}>
                {typing ? 'Typing...' : 'Active Now 🟢'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.backBtn}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          renderItem={({ item }) => {
            const isMe = item.senderId === 'me';
            return (
              <View style={[styles.msgRow, isMe ? styles.myMsgRow : styles.theirMsgRow]}>
                <View style={[styles.msgBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  <Text style={styles.msgText}>{item.text}</Text>
                  <Text style={styles.msgTime}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />

        {typing && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {activeMatch.name.split(' ')[0]} is typing
              <Text style={styles.typingDots}> ...</Text>
            </Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#8E92B2"
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn}>
            <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.sendGradient}>
              <Text style={styles.sendIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0E15' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  newMatchesRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 16, paddingBottom: 16 },
  newMatchAvatarContainer: { alignItems: 'center' },
  avatarGradientRing: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center' },
  newMatchAvatar: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: '#0D0E15' },
  newMatchName: { color: '#FFFFFF', fontSize: 12, marginTop: 4, fontWeight: '600' },
  chatRow: { flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12 },
  chatAvatar: { width: 52, height: 52, borderRadius: 26 },
  chatContent: { flex: 1 },
  chatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chatName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  chatTime: { color: '#8E92B2', fontSize: 12 },
  chatLastMsg: { color: '#8E92B2', fontSize: 14, marginTop: 2 },
  unreadBadge: { backgroundColor: '#FF3366', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  activeUserGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  activeUserName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  activeUserStatus: { color: '#00C6FF', fontSize: 11, fontWeight: '600' },
  messagesContainer: { padding: 16, paddingBottom: 8 },
  msgRow: { marginVertical: 4, flexDirection: 'row' },
  myMsgRow: { justifyContent: 'flex-end' },
  theirMsgRow: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '78%', padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: '#FF3366', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#1A1C28', borderBottomLeftRadius: 4 },
  msgText: { color: '#FFFFFF', fontSize: 15, lineHeight: 20 },
  msgTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  typingContainer: { paddingHorizontal: 20, paddingBottom: 4 },
  typingText: { color: '#8E92B2', fontSize: 12, fontStyle: 'italic' },
  typingDots: { color: '#FF3366' },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1A1C28',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
