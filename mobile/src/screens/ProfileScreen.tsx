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
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [uploading, setUploading] = useState(false);

  const defaultPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
  ];

  const currentPhotos = user?.photos && user.photos.length > 0 ? user.photos : defaultPhotos;
  const mainAvatar = currentPhotos[0];

  const requestPermissionAndPick = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required.');
          return null;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          return res.assets[0].uri;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Photo library permission is required.');
          return null;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          return res.assets[0].uri;
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
      'Select source',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(true);
            if (uri) {
              updateProfile({ photos: [uri, ...currentPhotos.filter((p) => p !== uri)] });
            }
            setUploading(false);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(false);
            if (uri) {
              updateProfile({ photos: [uri, ...currentPhotos.filter((p) => p !== uri)] });
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
      Alert.alert('Limit Reached', 'You can upload up to 6 photos.');
      return;
    }

    Alert.alert(
      'Add Photo',
      'Add a new lifestyle picture',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(true);
            if (uri) {
              updateProfile({ photos: [...currentPhotos, uri] });
            }
            setUploading(false);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(false);
            if (uri) {
              updateProfile({ photos: [...currentPhotos, uri] });
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
      'Manage Photo',
      'Choose an option',
      [
        {
          text: 'Set as Primary',
          onPress: () => {
            const target = currentPhotos[index];
            const remaining = currentPhotos.filter((_, i) => i !== index);
            updateProfile({ photos: [target, ...remaining] });
          },
        },
        {
          text: 'Delete Photo',
          style: 'destructive',
          onPress: () => {
            updateProfile({ photos: currentPhotos.filter((_, i) => i !== index) });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const userPrompts = [
    { question: 'A random fact I love is', answer: 'Penguins propose with pebbles.' },
    { question: 'My simple pleasures', answer: 'Sunday morning espresso and vintage vinyl records.' },
    { question: 'Together, we could', answer: 'Find the city’s best hidden ramen bars and plan weekend getaways.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsIconBtn}
          onPress={() => {
            Alert.alert('Account', `Signed in as ${user?.email || 'demo@luma.app'}`, [
              { text: 'Log Out', style: 'destructive', onPress: logout },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Feather name="settings" size={20} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarChange}
            activeOpacity={0.8}
          >
            <View style={styles.avatarRing}>
              <Image source={{ uri: mainAvatar }} style={styles.avatar} />
            </View>
            <View style={styles.cameraBadge}>
              <Feather name="camera" size={13} color="#FFFFFF" />
            </View>
            {uploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#7A2269" size="small" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.full_name || 'Alex Morgan'}, 26</Text>
            <View style={styles.verifiedRosette}>
              <Ionicons name="checkmark" size={11} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color="#777777" style={{ marginRight: 4 }} />
            <Text style={styles.userLocation}>New York, USA</Text>
          </View>
        </View>

        {/* Completeness Bar */}
        <View style={styles.completenessBox}>
          <View style={styles.completenessTextRow}>
            <Text style={styles.completenessLabel}>Profile Strength</Text>
            <Text style={styles.completenessPercent}>90% (Very Strong)</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '90%' }]} />
          </View>
        </View>

        {/* My Photos (Hinge 6-Grid) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Photos & Videos</Text>
            <Text style={styles.sectionSub}>{currentPhotos.length}/6</Text>
          </View>

          <View style={styles.photosGrid}>
            {currentPhotos.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.photoGridWrapper}
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
                <Feather name="plus" size={24} color="#7A2269" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* My Written Prompts (Hinge Editorial Style) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Written Prompts</Text>
            <Text style={styles.sectionSub}>3 Prompts</Text>
          </View>

          {userPrompts.map((p, idx) => (
            <View key={idx} style={styles.promptItemBox}>
              <Text style={styles.promptItemQ}>{p.question}</Text>
              <Text style={styles.promptItemA}>"{p.answer}"</Text>
              <TouchableOpacity style={styles.editPromptBtn}>
                <Text style={styles.editPromptText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* My Vitals & Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Vitals</Text>

          <View style={styles.vitalRow}>
            <Text style={styles.vitalLabel}>Height</Text>
            <Text style={styles.vitalVal}>5'10"</Text>
          </View>
          <View style={styles.vitalSeparator} />

          <View style={styles.vitalRow}>
            <Text style={styles.vitalLabel}>Hometown</Text>
            <Text style={styles.vitalVal}>New York</Text>
          </View>
          <View style={styles.vitalSeparator} />

          <View style={styles.vitalRow}>
            <Text style={styles.vitalLabel}>Dating Intentions</Text>
            <Text style={styles.vitalVal}>Long-term relationship</Text>
          </View>
          <View style={styles.vitalSeparator} />

          <View style={styles.vitalRow}>
            <Text style={styles.vitalLabel}>Religion</Text>
            <Text style={styles.vitalVal}>Spiritual</Text>
          </View>
        </View>

        {/* Luma Member Benefits */}
        <TouchableOpacity style={styles.upgradeCard} activeOpacity={0.9}>
          <LinearGradient colors={['#7A2269', '#FF3366']} style={styles.upgradeGradient}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.upgradeTitle}>Luma Premium</Text>
            </View>
            <Text style={styles.upgradeSub}>Unlimited likes, see who likes you & standout roses</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F9' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  topHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#111111' },
  settingsIconBtn: { padding: 4 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDF2',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#7A2269',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7A2269',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 22, fontWeight: '800', color: '#111111' },
  verifiedRosette: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#7A2269', justifyContent: 'center', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  userLocation: { fontSize: 14, color: '#777777' },
  completenessBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDEDF2',
  },
  completenessTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  completenessLabel: { fontSize: 14, fontWeight: '700', color: '#111111' },
  completenessPercent: { fontSize: 13, fontWeight: '700', color: '#7A2269' },
  progressBar: { height: 6, backgroundColor: '#EDEDF2', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7A2269', borderRadius: 3 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDEDF2',
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111111' },
  sectionSub: { fontSize: 13, color: '#888888', fontWeight: '600' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoGridWrapper: { width: '31%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  photoGridItem: { width: '100%', height: '100%' },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(122, 34, 105, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  addPhotoBtn: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F5F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4D4DF',
  },
  addPhotoText: { fontSize: 11, color: '#7A2269', fontWeight: '700', marginTop: 4 },
  promptItemBox: {
    backgroundColor: '#F9F9FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    position: 'relative',
  },
  promptItemQ: { fontSize: 13, fontWeight: '700', color: '#666666', marginBottom: 6 },
  promptItemA: { fontSize: 16, fontWeight: '600', color: '#111111', fontFamily: 'serif', lineHeight: 22, paddingRight: 40 },
  editPromptBtn: { position: 'absolute', top: 14, right: 14 },
  editPromptText: { fontSize: 13, color: '#7A2269', fontWeight: '700' },
  vitalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  vitalLabel: { fontSize: 14, color: '#666666', fontWeight: '600' },
  vitalVal: { fontSize: 14, color: '#111111', fontWeight: '700' },
  vitalSeparator: { height: 1, backgroundColor: '#F0F0F4' },
  upgradeCard: { borderRadius: 20, overflow: 'hidden' },
  upgradeGradient: { padding: 20, alignItems: 'center' },
  upgradeTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  upgradeSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center' },
});
