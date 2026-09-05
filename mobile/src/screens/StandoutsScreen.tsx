import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STANDOUTS = [
  {
    id: 's1',
    name: 'Aria',
    age: 23,
    prompt: 'My most controversial opinion',
    answer: 'Pineapple belongs on pizza and iced coffee is a four-season beverage.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    tag: 'Trending Prompt 🔥',
  },
  {
    id: 's2',
    name: 'Maya',
    age: 25,
    prompt: 'Best travel story',
    answer: 'Got lost in Tokyo at 3 AM and ended up in a hidden jazz basement.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
    tag: 'High Compatibility ⭐',
  },
  {
    id: 's3',
    name: 'Chloe',
    age: 24,
    prompt: 'Two truths and a lie',
    answer: 'I run marathons, have met Keanu Reeves, and can cook Michelin pasta.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
    tag: 'New on Luma ✨',
  },
];

export default function StandoutsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Standouts & Top Picks</Text>
        <Text style={styles.headerSub}>Refreshes daily with your most compatible profiles</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {STANDOUTS.map((item) => (
          <View key={item.id} style={styles.standoutCard}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}, {item.age}</Text>
              <Text style={styles.promptQ}>{item.prompt}</Text>
              <Text style={styles.promptA}>"{item.answer}"</Text>

              <TouchableOpacity style={styles.roseBtn} activeOpacity={0.85}>
                <LinearGradient colors={['#7A2269', '#FF3366']} style={styles.roseGradient}>
                  <Text style={styles.roseText}>🌹 Send a Rose</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111111' },
  headerSub: { fontSize: 13, color: '#666666', marginTop: 4 },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  standoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardImage: { width: '100%', height: 260, resizeMode: 'cover' },
  tagBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(17,17,17,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 20 },
  cardName: { fontSize: 22, fontWeight: '800', color: '#111111', marginBottom: 8 },
  promptQ: { fontSize: 13, fontWeight: '700', color: '#666666', marginBottom: 4 },
  promptA: { fontSize: 16, fontWeight: '600', color: '#111111', fontFamily: 'serif', lineHeight: 22, marginBottom: 16 },
  roseBtn: { borderRadius: 16, overflow: 'hidden' },
  roseGradient: { paddingVertical: 12, alignItems: 'center' },
  roseText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
