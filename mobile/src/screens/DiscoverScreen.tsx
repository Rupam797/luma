import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

interface Candidate {
  id: string;
  full_name: string;
  age: number;
  city: string;
  bio: string;
  photos: string[];
  distance_km?: number;
}

const FALLBACK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    full_name: 'Sophia Martinez',
    age: 24,
    city: 'New York, 3 km away',
    bio: 'Architect & coffee addict ☕. Looking for someone to explore hidden rooftop bars with 🌃',
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'],
  },
  {
    id: 'cand-2',
    full_name: 'Elena Rostova',
    age: 26,
    city: 'Brooklyn, 5 km away',
    bio: 'UX Designer 🎨. Passionate about live indie concerts, photography & weekend hiking 🏔️',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'],
  },
  {
    id: 'cand-3',
    full_name: 'Aria Chen',
    age: 23,
    city: 'Manhattan, 2 km away',
    bio: 'Foodie & dog mom 🐕. Let\'s debate whether pineapple belongs on pizza over drinks 🍕🍷',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600'],
  },
];

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(FALLBACK_CANDIDATES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;

  const loadCandidates = useCallback(async () => {
    try {
      const data = await apiService.getDiscoveryFeed();
      if (data.candidates && data.candidates.length > 0) {
        setCandidates(data.candidates);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.log('Using fallback candidates:', err);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCandidates();
    setRefreshing(false);
  };

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 6],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 6, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [{ rotate }, ...position.getTranslateTransform()],
  };

  const handleSwipeComplete = async (direction: 'left' | 'right') => {
    const candidate = candidates[currentIndex];
    if (!candidate) return;

    const action = direction === 'right' ? 'like' : 'dislike';

    try {
      const result = await apiService.processSwipe(candidate.id, action);
      if (result.matched) {
        setCurrentMatch(candidate);
        setMatchModalVisible(true);
      }
    } catch (err) {
      console.log('Swipe API error (offline mode):', err);
      // Simulate 30% match rate in offline mode
      if (direction === 'right' && Math.random() < 0.3) {
        setCurrentMatch(candidate);
        setMatchModalVisible(true);
      }
    }

    setCurrentIndex((prev) => prev + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? width + 100 : -width - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete(direction));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF3366" />
        <Text style={{ color: '#8E92B2', marginTop: 12, fontSize: 14 }}>Finding people near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandGroup}>
          <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🔥</Text>
          </LinearGradient>
          <Text style={styles.brandTitle}>Luma</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Card Deck */}
      <View style={styles.deckArea}>
        {currentIndex >= candidates.length ? (
          <View style={styles.noMoreCards}>
            <Text style={{ fontSize: 48 }}>✨</Text>
            <Text style={styles.noMoreTitle}>You've seen everyone nearby!</Text>
            <Text style={styles.noMoreSub}>Expand your distance filter to see more profiles.</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setCurrentIndex(0); loadCandidates(); }}>
              <Text style={styles.resetBtnText}>Reset Discovery Feed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          candidates.map((item, i) => {
            if (i < currentIndex) return null;
            const photo = item.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600';
            const displayCity = item.distance_km
              ? `${item.city}, ${item.distance_km} km away`
              : item.city;

            if (i === currentIndex) {
              return (
                <Animated.View
                  key={item.id}
                  style={[rotateAndTranslate, styles.card]}
                  {...panResponder.panHandlers}
                >
                  {/* LIKE overlay */}
                  <Animated.View style={[styles.stampContainer, styles.likeStamp, { opacity: likeOpacity }]}>
                    <Text style={styles.likeStampText}>LIKE</Text>
                  </Animated.View>
                  {/* NOPE overlay */}
                  <Animated.View style={[styles.stampContainer, styles.nopeStamp, { opacity: nopeOpacity }]}>
                    <Text style={styles.nopeStampText}>NOPE</Text>
                  </Animated.View>

                  <Image source={{ uri: photo }} style={styles.cardImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                  >
                    <Text style={styles.nameText}>
                      {item.full_name}, {item.age} <Text style={styles.badge}>✓</Text>
                    </Text>
                    <Text style={styles.locationText}>📍 {displayCity}</Text>
                    <Text style={styles.bioText}>{item.bio}</Text>
                  </LinearGradient>
                </Animated.View>
              );
            }

            return (
              <Animated.View key={item.id} style={[styles.card, { top: 10 * (i - currentIndex) }]}>
                <Image source={{ uri: photo }} style={styles.cardImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.gradientOverlay}
                >
                  <Text style={styles.nameText}>
                    {item.full_name}, {item.age} <Text style={styles.badge}>✓</Text>
                  </Text>
                  <Text style={styles.locationText}>📍 {displayCity}</Text>
                  <Text style={styles.bioText}>{item.bio}</Text>
                </LinearGradient>
              </Animated.View>
            );
          }).reverse()
        )}
      </View>

      {/* Action Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={() => forceSwipe('left')}
        >
          <Text style={styles.passIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.superlikeBtn]}
          onPress={() => forceSwipe('right')}
        >
          <Text style={styles.superlikeIcon}>⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => forceSwipe('right')}
        >
          <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.likeGradient}>
            <Text style={styles.likeIcon}>❤️</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      <Modal visible={matchModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Text style={styles.matchHeader}>IT'S A MATCH!</Text>
          <Text style={styles.matchSub}>
            You and {currentMatch?.full_name?.split(' ')[0]} liked each other
          </Text>
          <View style={styles.matchAvatars}>
            <Image
              source={{ uri: user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.avatarImg}
            />
            <Image
              source={{ uri: currentMatch?.photos?.[0] }}
              style={styles.avatarImg}
            />
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setMatchModalVisible(false)}
          >
            <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.btnGradient}>
              <Text style={styles.primaryBtnText}>Send a Message 💬</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setMatchModalVisible(false)}
          >
            <Text style={styles.secondaryBtnText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0E15' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoIcon: { fontSize: 16 },
  brandTitle: { fontSize: 24, fontWeight: '800', color: '#FF3366' },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1A1C28', justifyContent: 'center', alignItems: 'center' },
  deckArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: width - 32,
    height: height * 0.58,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1A1C28',
  },
  cardImage: { width: '100%', height: '100%' },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  nameText: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  badge: { fontSize: 16, color: '#00C6FF' },
  locationText: { fontSize: 14, color: '#8E92B2', marginTop: 4 },
  bioText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', marginTop: 8, lineHeight: 20 },
  // LIKE / NOPE stamps
  stampContainer: {
    position: 'absolute',
    top: 50,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeStamp: { left: 24, borderColor: '#4DED30', transform: [{ rotate: '-20deg' }] },
  likeStampText: { fontSize: 32, fontWeight: '800', color: '#4DED30' },
  nopeStamp: { right: 24, borderColor: '#FF4B4B', transform: [{ rotate: '20deg' }] },
  nopeStampText: { fontSize: 32, fontWeight: '800', color: '#FF4B4B' },
  noMoreCards: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  noMoreTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 12 },
  noMoreSub: { fontSize: 14, color: '#8E92B2', textAlign: 'center', marginTop: 6 },
  resetBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: '#FF3366' },
  resetBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  controls: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingBottom: 24 },
  actionBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A1C28', justifyContent: 'center', alignItems: 'center' },
  passBtn: { borderWidth: 1, borderColor: 'rgba(255, 75, 75, 0.3)' },
  passIcon: { fontSize: 22, color: '#FF4B4B', fontWeight: '800' },
  superlikeBtn: { borderWidth: 1, borderColor: 'rgba(0, 198, 255, 0.3)' },
  superlikeIcon: { fontSize: 22 },
  likeBtn: { width: 70, height: 70, borderRadius: 35, overflow: 'hidden' },
  likeGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  likeIcon: { fontSize: 26 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 14, 21, 0.96)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  matchHeader: { fontSize: 32, fontWeight: '800', color: '#FF3366', letterSpacing: 1.5 },
  matchSub: { fontSize: 14, color: '#8E92B2', marginTop: 8 },
  matchAvatars: { flexDirection: 'row', marginVertical: 32, gap: 16 },
  avatarImg: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF3366' },
  primaryBtn: { width: '100%', height: 52, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { width: '100%', height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', marginTop: 12 },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 15 },
});
