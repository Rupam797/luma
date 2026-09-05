import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  badgeCount,
}: {
  label: string;
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  badgeCount?: number;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={styles.iconWrapper}>
        <Ionicons
          name={focused ? activeIcon : inactiveIcon}
          size={24}
          color={focused ? PRIMARY_COLOR : '#8E8E93'}
        />
        {!!badgeCount && badgeCount > 0 && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused ? (
        <View style={styles.activeDot} />
      ) : (
        <View style={styles.inactiveDotPlaceholder} />
      )}
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 8);
  const tabHeight = 58 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EDEDF2',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
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
              activeIcon="flame"
              inactiveIcon="flame-outline"
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
              badgeCount={2}
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
              activeIcon="chatbubble-ellipses"
              inactiveIcon="chatbubble-ellipses-outline"
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
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: PRIMARY_COLOR,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 2,
  },
  inactiveDotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
});
