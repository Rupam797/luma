import React, { useState, useEffect, useRef } from 'react';
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
  { id: 'match-1', name: 'Svetlana', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', lastMessage: 'That rooftop bar was amazing! 🌃', time: '2m ago', unreadCount: 2, recipientId: 'user-svetlana' },
  { id: 'match-2', name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', lastMessage: 'Which cafe is your favorite in Brooklyn?', time: '1h ago', unreadCount: 0, recipientId: 'user-sophia' },
  { id: 'match-3', name: 'Elena', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300', lastMessage: 'See you at the indie show! 🎵', time: '3h ago', unreadCount: 1, recipientId: 'user-elena' },
];

const INITIAL_MESSAGES: MessageItem[] = [
  { id: '1', senderId: 'them', text: 'Hey! I saw you liked my prompt about penguins 🐧', time: '10:30 AM' },
  { id: '2', senderId: 'me', text: 'Haha yes! Such an underrated fact. Have you ever seen them in real life?', time: '10:32 AM' },
  { id: '3', senderId: 'them', text: 'Yes, on a trip to Patagonia! Best experience ever.', time: '10:35 AM' },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>(DEMO_MATCHES);
  const [activeMatch, setActiveMatch] = useState<MatchItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeMatch) return;

    const newMessage: MessageItem = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (user) {
      apiService.sendMessage(activeMatch.id, user.id, activeMatch.recipientId || '', inputMessage.trim());
    }

    setInputMessage('');
    setTyping(true);
    setTimeout(() => setTyping(false), 2000);
  };

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
          <Text style={styles.headerTitle}>Matches & Chats</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Matches</Text>
        </View>
        <View style={styles.newMatchesRow}>
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.newMatchAvatarContainer}
              onPress={() => setActiveMatch(match)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarPlumRing}>
                <Image source={{ uri: match.avatar }} style={styles.newMatchAvatar} />
              </View>
              <Text style={styles.newMatchName}>{match.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conversations</Text>
        </View>
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() => setActiveMatch(item)}
              activeOpacity={0.7}
            >
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
        <View style={styles.headerChat}>
          <TouchableOpacity onPress={() => setActiveMatch(null)} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.activeUserGroup}>
            <Image source={{ uri: activeMatch.avatar }} style={styles.headerAvatar} />
            <View>
              <Text style={styles.activeUserName}>{activeMatch.name}</Text>
              <Text style={styles.activeUserStatus}>
                {typing ? 'typing...' : 'Active now'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: '#111111' }}>···</Text>
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
                  <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.msgTime, isMe ? styles.myMsgTime : styles.theirMsgTime]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {typing && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {activeMatch.name.split(' ')[0]} is typing...
            </Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#888888"
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn} activeOpacity={0.8}>
            <LinearGradient colors={['#7A2269', '#FF3366']} style={styles.sendGradient}>
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  headerTitle: { color: '#111111', fontSize: 24, fontWeight: '800' },
  headerChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#111111', fontSize: 22, fontWeight: '700' },
  activeUserGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  activeUserName: { color: '#111111', fontSize: 16, fontWeight: '700' },
  activeUserStatus: { color: '#7A2269', fontSize: 12, fontWeight: '600' },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { color: '#666666', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  newMatchesRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, paddingBottom: 16 },
  newMatchAvatarContainer: { alignItems: 'center' },
  avatarPlumRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#7A2269',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  newMatchAvatar: { width: 58, height: 58, borderRadius: 29 },
  newMatchName: { color: '#111111', fontSize: 13, marginTop: 6, fontWeight: '700' },
  chatRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F7' },
  chatAvatar: { width: 56, height: 56, borderRadius: 28 },
  chatContent: { flex: 1 },
  chatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { color: '#111111', fontSize: 16, fontWeight: '700' },
  chatTime: { color: '#888888', fontSize: 12 },
  chatLastMsg: { color: '#666666', fontSize: 14 },
  unreadBadge: { backgroundColor: '#7A2269', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  messagesContainer: { padding: 16, paddingBottom: 8 },
  msgRow: { marginVertical: 4, flexDirection: 'row' },
  myMsgRow: { justifyContent: 'flex-end' },
  theirMsgRow: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '78%', padding: 14, borderRadius: 20 },
  myBubble: { backgroundColor: '#7A2269', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#F0F0F4', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 21 },
  myMsgText: { color: '#FFFFFF' },
  theirMsgText: { color: '#111111' },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  myMsgTime: { color: 'rgba(255,255,255,0.7)' },
  theirMsgTime: { color: '#888888' },
  typingContainer: { paddingHorizontal: 20, paddingBottom: 6 },
  typingText: { color: '#7A2269', fontSize: 12, fontStyle: 'italic', fontWeight: '600' },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDEDF2',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F4F4F7',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    color: '#111111',
    fontSize: 15,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
});
