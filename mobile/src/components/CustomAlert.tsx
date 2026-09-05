import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const PRIMARY_COLOR = '#6B1D56';
const { width } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning' | 'destructive';
  buttons?: AlertButton[];
  onClose: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', style: 'default' }],
  onClose,
}: CustomAlertProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const renderIcon = () => {
    switch (type) {
      case 'error':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle" size={30} color="#DC2626" />
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="warning-outline" size={28} color="#D97706" />
          </View>
        );
      case 'success':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle" size={30} color="#16A34A" />
          </View>
        );
      case 'destructive':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#FFE4E6' }]}>
            <Feather name="trash-2" size={26} color="#E11D48" />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#F5EBF4' }]}>
            <Ionicons name="flame" size={30} color={PRIMARY_COLOR} />
          </View>
        );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.dialogCard,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {/* Top Icon Badge */}
              <View style={styles.iconContainer}>{renderIcon()}</View>

              {/* Title & Message */}
              <Text style={styles.titleText}>{title}</Text>
              <Text style={styles.messageText}>{message}</Text>

              {/* Action Buttons */}
              <View style={[styles.buttonsRow, buttons.length > 2 && styles.buttonsCol]}>
                {buttons.map((btn, idx) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.buttonBase,
                        isCancel && styles.cancelButton,
                        isDestructive && styles.destructiveButton,
                        !isCancel && !isDestructive && styles.primaryButton,
                        buttons.length === 1 && { flex: 1 },
                      ]}
                      onPress={() => {
                        onClose();
                        if (btn.onPress) btn.onPress();
                      }}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isCancel && styles.cancelButtonText,
                          isDestructive && styles.destructiveButtonText,
                          !isCancel && !isDestructive && styles.primaryButtonText,
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: width - 48,
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  messageText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonsCol: {
    flexDirection: 'column',
    gap: 10,
  },
  buttonBase: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '700',
  },
  destructiveButton: {
    backgroundColor: '#FFE4E6',
  },
  destructiveButtonText: {
    color: '#E11D48',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonText: {
    fontSize: 15,
  },
});
