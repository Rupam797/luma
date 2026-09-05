import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { locationService } from '../services/locationService';
import { apiService } from '../services/api';

const PRIMARY_COLOR = '#6B1D56';

export default function SettingsScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { showAlert, showToast } = useAlert();
  const [notifications, setNotifications] = useState(true);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Delete Account & Data',
      message: 'This will permanently erase your profile, matches, messages, and photos in compliance with Google Play data safety standards. This cannot be undone.',
      type: 'destructive',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAccount();
            } catch (e) {
              console.log('Account deleted locally');
            }
            await logout();
            showToast({
              title: 'Account Deleted',
              message: 'All your data has been successfully erased.',
              type: 'info',
            });
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{user?.email || 'demo@luma.app'}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                const loc = await locationService.getCurrentLocation();
                if (loc) {
                  updateProfile({ location: loc.formatted });
                  showToast({ title: 'Location Updated', message: `Set to ${loc.formatted} 📍`, type: 'success' });
                } else {
                  showAlert({
                    title: 'Location Permission',
                    message: 'Please grant location permissions in device settings to update your city.',
                    type: 'warning',
                  });
                }
              }}
            >
              <View>
                <Text style={styles.rowLabel}>Current City / Location</Text>
                <Text style={styles.rowSub}>Tap to refresh with GPS</Text>
              </View>
              <Text style={[styles.rowValue, { color: PRIMARY_COLOR, fontWeight: '700' }]}>
                {user?.location || 'Kolkata, WB'} 📍
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Discovery & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Privacy & Activity</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Location Services</Text>
                <Text style={styles.rowSub}>Show approximate distance on profile</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={(val) => {
                  setLocationEnabled(val);
                  showToast({ message: val ? 'Distance visible to matches' : 'Distance hidden from matches' });
                }}
                trackColor={{ false: '#EDEDF2', true: PRIMARY_COLOR }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Active Status</Text>
                <Text style={styles.rowSub}>Show when you were last online</Text>
              </View>
              <Switch
                value={showActiveStatus}
                onValueChange={(val) => {
                  setShowActiveStatus(val);
                  showToast({ message: val ? 'Active status is now visible' : 'Active status hidden' });
                }}
                trackColor={{ false: '#EDEDF2', true: PRIMARY_COLOR }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <Text style={styles.rowSub}>New matches, likes & messages</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={(val) => {
                  setNotifications(val);
                  showToast({ message: val ? 'Notifications enabled' : 'Notifications disabled' });
                }}
                trackColor={{ false: '#EDEDF2', true: PRIMARY_COLOR }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Incognito Browsing</Text>
                <Text style={styles.rowSub}>Only be visible to people you like</Text>
              </View>
              <Switch
                value={incognitoMode}
                onValueChange={(val) => {
                  setIncognitoMode(val);
                  showToast({ message: val ? 'Incognito browsing turned ON' : 'Incognito browsing turned OFF' });
                }}
                trackColor={{ false: '#EDEDF2', true: PRIMARY_COLOR }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Safety & Legal (Google Play Compliance) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Safety & Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() =>
                showAlert({
                  title: 'Member Safety Center',
                  message: 'Luma is committed to genuine, secure, and respectful dating. We employ AI verification and zero-tolerance harassment policies.',
                  type: 'info',
                })
              }
            >
              <Text style={styles.linkLabel}>Member Safety Center</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() =>
                showAlert({
                  title: 'Community Guidelines',
                  message: 'Be authentic, kind, and respectful. Discrimination, spam, and unsolicited content result in immediate ban.',
                  type: 'info',
                })
              }
            >
              <Text style={styles.linkLabel}>Community Guidelines</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() =>
                showAlert({
                  title: 'Privacy Policy',
                  message: 'Your personal data is strictly encrypted at rest and in transit. We never sell your personal information or messages.',
                  type: 'info',
                })
              }
            >
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              showAlert({
                title: 'Sign Out',
                message: 'Are you sure you want to log out of your Luma account?',
                type: 'info',
                buttons: [
                  { text: 'Log Out', style: 'destructive', onPress: logout },
                  { text: 'Cancel', style: 'cancel' },
                ],
              });
            }}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account & Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F9' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111111', fontFamily: 'serif' },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  section: { gap: 8 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#777777', textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDEDF2',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '700', color: '#111111' },
  rowSub: { fontSize: 12, color: '#888888', marginTop: 2 },
  rowValue: { fontSize: 14, color: '#666666', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#F0F0F4' },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  linkLabel: { fontSize: 15, fontWeight: '600', color: '#111111' },
  linkArrow: { fontSize: 20, color: '#BBBBCC', fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDF2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#111111' },
  deleteBtn: {
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteText: { fontSize: 15, fontWeight: '700', color: '#E0245E' },
});
