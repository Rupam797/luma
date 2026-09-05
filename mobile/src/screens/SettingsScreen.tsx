import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Switch,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function SettingsScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [maxDistance, setMaxDistance] = useState(50);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${apiService.getBaseUrl?.() || 'http://localhost:4000/api/v1'}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id || ''}`,
        },
        body: JSON.stringify({ full_name: fullName, bio }),
      });
      updateProfile({ full_name: fullName, bio });
      setEditMode(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      updateProfile({ full_name: fullName, bio });
      setEditMode(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAccount();
            } catch (e) {}
            await logout();
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
            style={styles.avatar}
          />
          {!editMode ? (
            <>
              <Text style={styles.displayName}>{user?.full_name || 'Your Name'}</Text>
              <Text style={styles.displayEmail}>{user?.email || 'email@example.com'}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
                <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor="#8E92B2"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  placeholderTextColor="#8E92B2"
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditMode(false)}>
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                  <LinearGradient colors={['#FF3366', '#FF884D']} style={styles.saveGradient}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Discovery Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discovery Preferences</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Maximum Distance</Text>
              <Text style={styles.settingValue}>{maxDistance} km</Text>
            </View>
            <View style={styles.distanceBtns}>
              <TouchableOpacity
                style={styles.distanceBtn}
                onPress={() => setMaxDistance(Math.max(5, maxDistance - 10))}
              >
                <Text style={styles.distanceBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.distanceBtn}
                onPress={() => setMaxDistance(Math.min(200, maxDistance + 10))}
              >
                <Text style={styles.distanceBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#2A2D3E', true: '#FF3366' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#2A2D3E', true: '#FF3366' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>📜 Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>🔒 Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>📋 Community Guidelines</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Luma v1.0.0 • Built with ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0E15' },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF3366', marginBottom: 12 },
  displayName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  displayEmail: { fontSize: 14, color: '#8E92B2', marginTop: 4 },
  editBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1A1C28' },
  editBtnText: { color: '#FF3366', fontSize: 14, fontWeight: '600' },
  inputGroup: { width: '100%', marginTop: 12 },
  label: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#1A1C28',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  cancelEditBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cancelEditText: { color: '#8E92B2', fontWeight: '600' },
  saveBtn: { flex: 1, height: 46, borderRadius: 14, overflow: 'hidden' },
  saveGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  section: {
    backgroundColor: '#141622',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: { color: '#FFFFFF', fontSize: 15 },
  settingValue: { color: '#8E92B2', fontSize: 13, marginTop: 2 },
  distanceBtns: { flexDirection: 'row', gap: 8 },
  distanceBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1C28',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  distanceBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  linkRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  linkText: { color: '#8E92B2', fontSize: 15 },
  logoutBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  deleteBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    marginBottom: 16,
  },
  deleteText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#3A3E52', fontSize: 12, marginTop: 8 },
});
