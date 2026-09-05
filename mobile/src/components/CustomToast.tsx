import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const PRIMARY_COLOR = '#6B1D56';
const { width } = Dimensions.get('window');

export interface CustomToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
  duration?: number;
}

export default function CustomToast({
  visible,
  message,
  title,
  type = 'info',
  onDismiss,
  duration = 3200,
}: CustomToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={22} color="#16A34A" />;
      case 'warning':
        return <Ionicons name="alert-circle" size={22} color="#D97706" />;
      case 'error':
        return <Ionicons name="close-circle" size={22} color="#DC2626" />;
      case 'info':
      default:
        return <Ionicons name="sparkles" size={22} color={PRIMARY_COLOR} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContainer}
        onPress={dismiss}
        activeOpacity={0.9}
      >
        <View style={styles.iconBox}>{renderIcon()}</View>
        <View style={styles.textBox}>
          {!!title && <Text style={styles.toastTitle}>{title}</Text>}
          <Text style={styles.toastMessage}>{message}</Text>
        </View>
        <Feather name="x" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 29, 86, 0.08)',
  },
  iconBox: {
    marginRight: 12,
  },
  textBox: {
    flex: 1,
    paddingRight: 8,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    lineHeight: 18,
  },
});
