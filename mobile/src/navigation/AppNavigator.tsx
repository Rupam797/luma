import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Feather } from '@expo/vector-icons';

import OnboardingScreen from '../screens/OnboardingScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import StandoutsScreen from '../screens/StandoutsScreen';
import LikesScreen from '../screens/LikesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({
  label,
  focused,
  activeIcon,
  inactiveIcon,
}: {
  label: string;
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={24}
        color={focused ? '#111111' : '#9999AA'}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EDEDF2',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Discover"
              focused={focused}
              activeIcon="compass"
              inactiveIcon="compass-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Standouts"
        component={StandoutsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Standouts"
              focused={focused}
              activeIcon="star"
              inactiveIcon="star-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Likes You"
              focused={focused}
              activeIcon="heart"
              inactiveIcon="heart-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Matches"
              focused={focused}
              activeIcon="chatbubbles"
              inactiveIcon="chatbubbles-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Profile"
              focused={focused}
              activeIcon="person"
              inactiveIcon="person-outline"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogo}>
          <Ionicons name="flame" size={40} color="#7A2269" />
        </View>
        <Text style={styles.loadingText}>Luma</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function OnboardingWrapper() {
  const { login, updateProfile } = useAuth();

  const handleComplete = async (email: string, profileData?: any) => {
    const res = await login(email || 'demo@luma.app');
    if (res.success && profileData) {
      updateProfile(profileData);
    }
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: '#9999AA', fontWeight: '600', marginTop: 2 },
  tabLabelActive: { color: '#111111', fontWeight: '800' },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7A2269',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F5EBF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    marginTop: 16,
    fontFamily: 'serif',
  },
});
