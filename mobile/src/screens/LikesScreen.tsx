import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';

const PRIMARY_COLOR = '#6B1D56';

const INBOUND_LIKES = [
  {
    id: 'l1',
    name: 'Svetlana',
    age: 22,
    likedItem: 'Liked your photo in Brooklyn',
    comment: 'That rooftop sunset is unreal! Loved the colors.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    time: '2h ago',
  },
  {
    id: 'l2',
    name: 'Elena',
    age: 23,
    likedItem: 'Liked your prompt: Sunday morning espresso',
    comment: 'Which cafe is this?',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
    time: '4h ago',
  },
];

export default function LikesScreen() {
  const { showAlert } = useAlert();
  const [likes, setLikes] = useState(INBOUND_LIKES);

  const handleMatch = (name: string, id: string) => {
    showAlert({
      title: "It's a Match! 🎉",
      message: `You and ${name} are now connected. Start an intentional conversation in your Matches tab!`,
      type: 'success',
      buttons: [{ text: 'Start Chatting', style: 'default' }],
    });
    setLikes((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePass = (id: string) => {
    setLikes((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Likes You ({likes.length})</Text>
        <Text style={styles.headerSub}>Upgrade to Luma Premium to see everyone who likes you</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {likes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={48} color={PRIMARY_COLOR} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySub}>Check back soon for new likes & comments.</Text>
          </View>
        ) : (
          likes.map((item) => (
            <View key={item.id} style={styles.likeCard}>
              <Image source={{ uri: item.image }} style={styles.likeAvatar} />

              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.likeName}>{item.name}, {item.age}</Text>
                  <Text style={styles.likeTime}>{item.time}</Text>
                </View>

                <View style={styles.likedItemRow}>
                  <Ionicons name="heart" size={14} color={PRIMARY_COLOR} style={{ marginRight: 4 }} />
                  <Text style={styles.likedItemText}>{item.likedItem}</Text>
                </View>

                {item.comment && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>"{item.comment}"</Text>
                  </View>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.passBtn}
                    onPress={() => handlePass(item.id)}
                  >
                    <Text style={styles.passText}>Pass</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.matchBtn}
                    onPress={() => handleMatch(item.name, item.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="chatbubbles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.matchText}>Match & Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F9' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111111', fontFamily: 'serif' },
  headerSub: { fontSize: 13, color: '#666666', marginTop: 4 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  likeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  likeAvatar: { width: '100%', height: 260, resizeMode: 'cover' },
  cardBody: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  likeName: { fontSize: 22, fontWeight: '800', color: '#111111', fontFamily: 'serif' },
  likeTime: { fontSize: 12, color: '#888888', fontWeight: '600' },
  likedItemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  likedItemText: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '700' },
  commentBox: {
    backgroundColor: '#F5EBF4',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  commentText: { fontSize: 14, color: '#111111', fontWeight: '600', fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  passBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F0F0F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passText: { fontSize: 14, fontWeight: '700', color: '#666666' },
  matchBtn: {
    flex: 2,
    borderRadius: 14,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  matchText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111111', marginBottom: 6, fontFamily: 'serif' },
  emptySub: { fontSize: 14, color: '#888888', textAlign: 'center' },
});
