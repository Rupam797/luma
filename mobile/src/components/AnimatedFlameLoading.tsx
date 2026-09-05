import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#6B1D56';
const FIRE_ACCENT = '#9E2A7A';
const FIRE_GLOW = '#FF6B6B';
const { width, height } = Dimensions.get('window');

export default function AnimatedFlameLoading() {
  // Flame breathing & flicker animation values
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;
  const innerFlameScale = useRef(new Animated.Value(0.9)).current;
  const innerFlameOpacity = useRef(new Animated.Value(0.8)).current;

  // Pulse ring 1 (Heat aura)
  const pulse1Scale = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.5)).current;

  // Pulse ring 2 (Outer shockwave)
  const pulse2Scale = useRef(new Animated.Value(1)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.35)).current;

  // Ember particles rising
  const ember1Y = useRef(new Animated.Value(0)).current;
  const ember1Opacity = useRef(new Animated.Value(0)).current;
  const ember2Y = useRef(new Animated.Value(0)).current;
  const ember2Opacity = useRef(new Animated.Value(0)).current;
  const ember3Y = useRef(new Animated.Value(0)).current;
  const ember3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Flame Breathing & Organic Flickering Loop
    const flameFlickerAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1.12,
            duration: 700,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(flameRotate, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(innerFlameScale, {
            toValue: 1.18,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(innerFlameOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 0.96,
            duration: 650,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(flameRotate, {
            toValue: -1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(innerFlameScale, {
            toValue: 0.88,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(innerFlameOpacity, {
            toValue: 0.7,
            duration: 650,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1.06,
            duration: 550,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(flameRotate, {
            toValue: 0.5,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1.0,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(flameRotate, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // 2. Continuous Radial Heat Waves (Pulse 1)
    const pulse1Animation = Animated.loop(
      Animated.parallel([
        Animated.timing(pulse1Scale, {
          toValue: 1.75,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse1Opacity, {
          toValue: 0,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Staggered Outer Heat Wave (Pulse 2)
    const pulse2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(pulse2Scale, {
            toValue: 2.2,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse2Opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // 4. Rising Embers / Sparks
    const ember1Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(ember1Y, {
            toValue: -70,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ember1Opacity, { toValue: 0.9, duration: 400, useNativeDriver: true }),
            Animated.timing(ember1Opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(ember1Y, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    const ember2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(ember2Y, {
            toValue: -85,
            duration: 1600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ember2Opacity, { toValue: 0.85, duration: 500, useNativeDriver: true }),
            Animated.timing(ember2Opacity, { toValue: 0, duration: 1100, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(ember2Y, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    const ember3Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(1100),
        Animated.parallel([
          Animated.timing(ember3Y, {
            toValue: -60,
            duration: 1300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ember3Opacity, { toValue: 0.75, duration: 350, useNativeDriver: true }),
            Animated.timing(ember3Opacity, { toValue: 0, duration: 950, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(ember3Y, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    flameFlickerAnimation.start();
    pulse1Animation.start();
    pulse2Animation.start();
    ember1Animation.start();
    ember2Animation.start();
    ember3Animation.start();

    return () => {
      flameFlickerAnimation.stop();
      pulse1Animation.stop();
      pulse2Animation.stop();
      ember1Animation.stop();
      ember2Animation.stop();
      ember3Animation.stop();
    };
  }, []);

  const spinInterpolation = flameRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.flameWrapper}>
        {/* Outer Heat Wave 2 */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulse2Scale }],
              opacity: pulse2Opacity,
            },
          ]}
        />

        {/* Outer Heat Wave 1 */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulse1Scale }],
              opacity: pulse1Opacity,
            },
          ]}
        />

        {/* Rising Ember Sparks */}
        <Animated.View
          style={[
            styles.emberDot,
            { left: 32, transform: [{ translateY: ember1Y }, { scale: 0.9 }], opacity: ember1Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.emberDot,
            { right: 28, transform: [{ translateY: ember2Y }, { scale: 1.1 }], opacity: ember2Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.emberDot,
            { left: 52, transform: [{ translateY: ember3Y }, { scale: 0.7 }], opacity: ember3Opacity },
          ]}
        />

        {/* Core Glowing Flame Orb */}
        <Animated.View
          style={[
            styles.coreFlameCircle,
            {
              transform: [
                { scale: flameScale },
                { rotate: spinInterpolation },
              ],
            },
          ]}
        >
          {/* Inner ember glow backdrop */}
          <Animated.View
            style={[
              styles.innerGlow,
              {
                transform: [{ scale: innerFlameScale }],
                opacity: innerFlameOpacity,
              },
            ]}
          />

          {/* Primary Flame Icon */}
          <Ionicons
            name="flame"
            size={56}
            color={PRIMARY_COLOR}
            style={styles.mainFlameIcon}
          />

          {/* Inner Flame Core highlight */}
          <Ionicons
            name="flame-sharp"
            size={36}
            color="#C83B8E"
            style={styles.innerFlameIcon}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flameWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5EBF4',
    borderWidth: 1.5,
    borderColor: 'rgba(107, 29, 86, 0.25)',
  },
  emberDot: {
    position: 'absolute',
    top: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C83B8E',
    shadowColor: '#C83B8E',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  coreFlameCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5EBF4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(107, 29, 86, 0.12)',
    position: 'relative',
  },
  innerGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(235, 178, 217, 0.45)',
  },
  mainFlameIcon: {
    position: 'absolute',
    bottom: 18,
  },
  innerFlameIcon: {
    position: 'absolute',
    bottom: 20,
    opacity: 0.9,
  },
});
