import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OnboardingScreen from '../screens/OnboardingScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import StandoutsScreen from '../screens/StandoutsScreen';
import LikesScreen from '../screens/LikesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnimatedFlameLoading from '../components/AnimatedFlameLoading';
import { useAuth } from '../context/AuthContext';

const PRIMARY_COLOR = '#6B1D56';

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
        color={focused ? PRIMARY_COLOR : '#9999AA'}
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
    return <AnimatedFlameLoading />;
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
  const { login } = useAuth();

  const handleComplete = async (email: string, profileData?: any) => {
    await login(email || 'demo@luma.app', profileData);
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: '#9999AA', fontWeight: '600', marginTop: 2 },
  tabLabelActive: { color: PRIMARY_COLOR, fontWeight: '800' },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 2,
  },
});
