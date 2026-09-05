import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { locationService } from '../services/locationService';

const PRIMARY_COLOR = '#6B1D56';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { showAlert, showToast } = useAlert();
  const [uploading, setUploading] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const handleUpdateLocation = async () => {
    setUpdatingLocation(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        updateProfile({ location: loc.formatted });
        showToast({ title: 'Location Updated', message: `Set to ${loc.formatted} 📍`, type: 'success' });
      } else {
        showAlert({
          title: 'Location Permission',
          message: 'Enable location access in device Settings to update your neighborhood.',
          type: 'warning',
        });
      }
    } catch (e: any) {
      showAlert({ title: 'Error', message: 'Failed to fetch GPS location.', type: 'error' });
    } finally {
      setUpdatingLocation(false);
    }
  };

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
          showAlert({
            title: 'Camera Permission',
            message: 'Camera permission is required to take a profile photo.',
            type: 'warning',
          });
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
          showAlert({
            title: 'Photos Permission',
            message: 'Photo library permission is required to upload pictures.',
            type: 'warning',
          });
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
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to select image.',
        type: 'error',
      });
    }
    return null;
  };

  const handleAvatarChange = () => {
    showAlert({
      title: 'Update Profile Photo',
      message: 'Choose how you would like to select your new primary picture.',
      type: 'info',
      buttons: [
        {
          text: 'Take Photo',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(true);
            if (uri) {
              updateProfile({ photos: [uri, ...currentPhotos.filter((p) => p !== uri)] });
              showToast({ title: 'Success', message: 'Profile photo updated! ✨', type: 'success' });
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
              showToast({ title: 'Success', message: 'Profile photo updated! ✨', type: 'success' });
            }
            setUploading(false);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  const handleAddPhoto = () => {
    if (currentPhotos.length >= 6) {
      showAlert({
        title: 'Limit Reached',
        message: 'You can upload up to 6 photos on your Luma profile.',
        type: 'info',
      });
      return;
    }

    showAlert({
      title: 'Add Photo',
      message: 'Add a new lifestyle picture to showcase your passions.',
      type: 'info',
      buttons: [
        {
          text: 'Take Photo',
          onPress: async () => {
            setUploading(true);
            const uri = await requestPermissionAndPick(true);
            if (uri) {
              updateProfile({ photos: [...currentPhotos, uri] });
              showToast({ title: 'Photo Added', message: 'New photo added to your profile.', type: 'success' });
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
              showToast({ title: 'Photo Added', message: 'New photo added to your profile.', type: 'success' });
            }
            setUploading(false);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  const handlePhotoPress = (index: number) => {
    if (index === 0) {
      handleAvatarChange();
      return;
    }
    showAlert({
      title: 'Manage Photo',
      message: 'Choose an action for this photo.',
      type: 'info',
      buttons: [
        {
          text: 'Set as Primary',
          onPress: () => {
            const target = currentPhotos[index];
            const remaining = currentPhotos.filter((_, i) => i !== index);
            updateProfile({ photos: [target, ...remaining] });
            showToast({ title: 'Updated', message: 'Primary photo updated.', type: 'success' });
          },
        },
        {
          text: 'Delete Photo',
          style: 'destructive',
          onPress: () => {
            updateProfile({ photos: currentPhotos.filter((_, i) => i !== index) });
            showToast({ title: 'Deleted', message: 'Photo removed from profile.', type: 'info' });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  const userPrompts = [
    { question: 'A random fact I love is', answer: 'Penguins propose with pebbles.' },
    { question: 'My simple pleasures', answer: 'Sunday morning espresso and vintage vinyl records.' },
    { question: 'Together, we could', answer: 'Find the city’s best hidden ramen bars and plan weekend getaways.' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsIconBtn}
          onPress={() => {
            showAlert({
              title: 'Account Options',
              message: `Signed in as ${user?.email || 'demo@luma.app'}`,
              type: 'info',
              buttons: [
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: logout,
                },
                { text: 'Cancel', style: 'cancel' },
              ],
            });
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
                <ActivityIndicator color={PRIMARY_COLOR} size="small" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.full_name || 'Alex Morgan'}, 24</Text>
              <Ionicons name="checkmark-circle" size={18} color={PRIMARY_COLOR} style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.userSubtitle}>Product Designer • {user?.location || 'Kolkata, WB'}</Text>
            <View style={styles.completionPill}>
              <Text style={styles.completionText}>Profile 95% Complete</Text>
            </View>
          </View>
        </View>

        {/* Photos Grid Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Photos ({currentPhotos.length}/6)</Text>
            <TouchableOpacity onPress={handleAddPhoto}>
              <Text style={styles.sectionActionText}>+ Add Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photoGrid}>
            {currentPhotos.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.gridPhotoWrapper}
                onPress={() => handlePhotoPress(idx)}
                activeOpacity={0.85}
              >
                <Image source={{ uri }} style={styles.gridPhoto} />
                {idx === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>MAIN</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {currentPhotos.length < 6 && (
              <TouchableOpacity
                style={styles.addPhotoSlot}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={24} color="#999999" />
                <Text style={styles.addSlotText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Prompts Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Written Prompts</Text>
          <View style={styles.promptsList}>
            {userPrompts.map((prompt, idx) => (
              <View key={idx} style={styles.promptItem}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>"{prompt.answer}"</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Vitals Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Vitals</Text>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalChip}>
              <Feather name="user" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.vitalChipText}>Woman</Text>
            </View>
            <View style={styles.vitalChip}>
              <Ionicons name="sparkles-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.vitalChipText}>Straight</Text>
            </View>
            <TouchableOpacity
              style={[styles.vitalChip, updatingLocation && { opacity: 0.7 }]}
              onPress={handleUpdateLocation}
              disabled={updatingLocation}
            >
              {updatingLocation ? (
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
              ) : (
                <Feather name="map-pin" size={14} color={PRIMARY_COLOR} />
              )}
              <Text style={styles.vitalChipText}>{user?.location || 'Kolkata, WB'}</Text>
            </TouchableOpacity>
            <View style={styles.vitalChip}>
              <Ionicons name="heart-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.vitalChipText}>Long-term relationship</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F9' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  topHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#111111', fontFamily: 'serif' },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, gap: 16, paddingBottom: 50 },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMeta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 20, fontWeight: '800', color: '#111111', fontFamily: 'serif' },
  userSubtitle: { fontSize: 13, color: '#666666', marginTop: 2 },
  completionPill: {
    backgroundColor: '#F5EBF4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completionText: { fontSize: 11, fontWeight: '700', color: PRIMARY_COLOR },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111111', fontFamily: 'serif' },
  sectionActionText: { fontSize: 13, fontWeight: '700', color: PRIMARY_COLOR },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridPhotoWrapper: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  gridPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  addPhotoSlot: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFC',
  },
  addSlotText: { fontSize: 12, color: '#888888', fontWeight: '600', marginTop: 4 },
  promptsList: { marginTop: 12, gap: 12 },
  promptItem: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFF2',
  },
  promptQuestion: { fontSize: 13, fontWeight: '700', color: '#888888' },
  promptAnswer: { fontSize: 15, fontWeight: '700', color: '#111111', marginTop: 4, fontFamily: 'serif' },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  vitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5EBF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vitalChipText: { fontSize: 13, fontWeight: '600', color: '#333333' },
});
