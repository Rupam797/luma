import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const defaultPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  ];

  const currentPhotos = user?.photos && user.photos.length > 0 ? user.photos : defaultPhotos;
  const mainAvatar = currentPhotos[0];

  const requestPermissionAndPick = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
          return null;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          return result.assets[0].uri;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Photo library permission is required to select photos.');
          return null;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          return result.assets[0].uri;
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to select image.');
    }
    return null;
  };

  const handleAvatarChange = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose a source for your new profile picture',
      [
        {
          text: '📸 Take Photo',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(true);
            if (uri) {
              const updated = [uri, ...currentPhotos.filter((p) => p !== uri)];
              updateProfile({ photos: updated });
            }
            setUploading(false);
          },
        },
        {
          text: '🖼️ Choose from Library',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(false);
            if (uri) {
              const updated = [uri, ...currentPhotos.filter((p) => p !== uri)];
              updateProfile({ photos: updated });
            }
            setUploading(false);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddPhoto = () => {
    if (currentPhotos.length >= 6) {
      Alert.alert('Limit Reached', 'You can upload up to 6 photos to your profile.');
      return;
    }

    Alert.alert(
      'Add Photo',
      'Add a new photo to showcase your lifestyle',
      [
        {
          text: '📸 Take Photo',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(true);
            if (uri) {
              const updated = [...currentPhotos, uri];
              updateProfile({ photos: updated });
            }
            setUploading(false);
          },
        },
        {
          text: '🖼️ Choose from Library',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(false);
            if (uri) {
              const updated = [...currentPhotos, uri];
              updateProfile({ photos: updated });
            }
            setUploading(false);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePhotoPress = (index: number) => {
    if (index === 0) {
      handleAvatarChange();
      return;
    }

    Alert.alert(
      'Photo Options',
      'Manage this photo',
      [
        {
          text: '⭐ Make Primary Avatar',
          onPress: () => {
            const target = currentPhotos[index];
            const remaining = currentPhotos.filter((_, i) => i !== index);
            updateProfile({ photos: [target, ...remaining] });
          },
        },
        {
          text: '🗑️ Delete Photo',
          style: 'destructive',
          onPress: () => {
            const updated = currentPhotos.filter((_, i) => i !== index);
            updateProfile({ photos: updated });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const stats = [
    { label: 'Likes Given', value: '47', icon: '❤️' },
    { label: 'Matches', value: '12', icon: '💫' },
    { label: 'Messages', value: '89', icon: '💬' },
  ];

  const interests = user?.interests && user.interests.length > 0 ? user.interests : [
    '☕ Coffee Addict',
    '🏔️ Weekend Hikes',
    '🎨 UX & Design',
    '🎵 Indie Music',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarChange}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.avatarGradientRing}>
              <Image source={{ uri: mainAvatar }} style={styles.avatar} />
            </LinearGradient>
            <View style={styles.cameraIconBadge}>
              <Text style={{ fontSize: 13, color: '#FFFFFF' }}>📷</Text>
            </View>
            {uploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#FF3366" size="small" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.nameText}>
            {user?.full_name || 'Alex Morgan'}, 26
          </Text>
          <Text style={styles.locationText}>📍 New York, USA</Text>
          <Text style={styles.bioText}>
            {user?.bio || 'Passionate about travel, coffee & tech. Looking for good vibes & deep conversations.'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Passions</Text>
          <View style={styles.tagsContainer}>
            {interests.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Photos Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Photos ({currentPhotos.length}/6)</Text>
            <Text style={styles.sectionSub}>Tap a photo to manage</Text>
          </View>
          <View style={styles.photosGrid}>
            {currentPhotos.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.photoGridItemWrapper}
                onPress={() => handlePhotoPress(idx)}
                activeOpacity={0.8}
              >
                <Image source={{ uri }} style={styles.photoGridItem} />
                {idx === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>MAIN</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {currentPhotos.length < 6 && (
              <TouchableOpacity
                style={styles.addPhotoBtn}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Premium Upsell */}
        <TouchableOpacity style={styles.premiumCard} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF3366', '#FF884D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumGradient}
          >
            <View>
              <Text style={styles.premiumTitle}>⚡ Luma Premium</Text>
              <Text style={styles.premiumSub}>Unlimited likes, see who liked you & rewind</Text>
            </View>
            <Text style={styles.premiumArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0E15' },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative' },
  avatarGradientRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: '#0D0E15',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3366',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D0E15',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginTop: 12 },
  locationText: { fontSize: 14, color: '#8E92B2', marginTop: 4 },
  bioText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#141622',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#8E92B2', marginTop: 2 },
  section: {
    backgroundColor: '#141622',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sectionSub: { color: '#8E92B2', fontSize: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: {
    backgroundColor: '#1A1C28',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tagText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoGridItemWrapper: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoGridItem: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 51, 102, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addPhotoBtn: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#1A1C28',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,51,102,0.4)',
  },
  addPhotoIcon: { fontSize: 26, color: '#FF3366', fontWeight: '700' },
  addPhotoText: { fontSize: 11, color: '#FF3366', marginTop: 2, fontWeight: '700' },
  premiumCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  premiumGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  premiumTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  premiumSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  premiumArrow: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
});
