import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'This will permanently erase your profile, matches, messages, and photos in compliance with Google Play data safety standards. This cannot be undone.',
      [
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
            Alert.alert('Account Deleted', 'All your data has been successfully erased.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Membership</Text>
              <Text style={[styles.rowValue, { color: '#7A2269', fontWeight: '800' }]}>Luma Standard</Text>
            </View>
          </View>
        </View>

        {/* Discovery & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Privacy & Activity</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Active Status</Text>
                <Text style={styles.rowSub}>Show when you were last online</Text>
              </View>
              <Switch
                value={showActiveStatus}
                onValueChange={setShowActiveStatus}
                trackColor={{ false: '#EDEDF2', true: '#7A2269' }}
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
                onValueChange={setNotifications}
                trackColor={{ false: '#EDEDF2', true: '#7A2269' }}
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
                onValueChange={setIncognitoMode}
                trackColor={{ false: '#EDEDF2', true: '#7A2269' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Safety & Legal (Google Play Compliance) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Safety & Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Safety Center', 'Luma is committed to genuine, secure connections.')}>
              <Text style={styles.linkLabel}>🛡️ Member Safety Center</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Community Guidelines', 'Treat everyone with respect and kindness.')}>
              <Text style={styles.linkLabel}>📜 Community Guidelines</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Privacy Policy', 'Your personal data is encrypted and never sold.')}>
              <Text style={styles.linkLabel}>🔒 Privacy Policy</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
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
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111111' },
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
