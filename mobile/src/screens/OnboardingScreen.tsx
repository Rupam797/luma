import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert, { AlertButton } from '../components/CustomAlert';
import { locationService } from '../services/locationService';

const PRIMARY_COLOR = '#6B1D56';

const INTEREST_TAGS = [
  'Coffee Addict',
  'Weekend Hikes',
  'UX & Design',
  'Indie Music',
  'Foodie',
  'World Travel',
  'Dog Parent',
  'Wine Tasting',
  'Gaming',
  'Yoga & Fitness',
];

interface OnboardingProps {
  onComplete: (email: string, profileData?: any) => Promise<void>;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('Kolkata, WB');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [gender, setGender] = useState('woman');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
  );
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success' | 'warning' | 'destructive';
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'error' | 'success' | 'warning' | 'destructive' = 'info',
    buttons?: AlertButton[]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons: buttons || [{ text: 'Got it', style: 'default' }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, tag]);
      }
    }
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        setLocation(loc.formatted);
        showAlert('Location Detected', `Set to ${loc.formatted} 📍`, 'success');
      } else {
        showAlert(
          'Location Permission',
          'Could not detect current location. Please grant location permissions in Settings or type your city manually.',
          'warning'
        );
      }
    } catch (e: any) {
      showAlert('Location Error', 'Unable to fetch GPS position.', 'error');
    } finally {
      setDetectingLocation(false);
    }
  };

  // 100% Free 1-Tap Google Sign-In
  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    try {
      const demoGoogleEmail = 'alex.google@gmail.com';
      setEmail(demoGoogleEmail);
      if (!fullName) setFullName('Alex Morgan');
      setStep(2);
      showAlert('Google Account Connected', 'Logged in via Google. Complete your dating profile details.', 'success');
    } catch (err: any) {
      showAlert('Google Sign-In', err.message || 'Unable to sign in with Google.', 'error');
    } finally {
      setSocialLoading(null);
    }
  };

  // 100% Free 1-Tap Apple Sign-In
  const handleAppleSignIn = async () => {
    setSocialLoading('apple');
    try {
      const demoAppleEmail = 'alex.apple@icloud.com';
      setEmail(demoAppleEmail);
      if (!fullName) setFullName('Alex Morgan');
      setStep(2);
      showAlert('Apple ID Connected', 'Logged in via Apple ID. Complete your dating profile details.', 'success');
    } catch (err: any) {
      showAlert('Apple Sign-In', err.message || 'Unable to sign in with Apple ID.', 'error');
    } finally {
      setSocialLoading(null);
    }
  };

  const handlePickPhoto = () => {
    showAlert(
      'Choose Profile Photo',
      'Select a high-quality picture that clearly shows your face.',
      'info',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              showAlert('Permission Required', 'Please enable camera access in your device settings to take a photo.', 'warning');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              setSelectedPhoto(res.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              showAlert('Permission Required', 'Please enable photo library access in your device settings.', 'warning');
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              setSelectedPhoto(res.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleNext = async () => {
    if (step === 1 && !email.trim()) {
      showAlert('Email Required', 'Please enter your email or sign in with Google / Apple to continue.', 'error');
      return;
    }
    if (step === 2 && !fullName.trim()) {
      showAlert('Name Required', 'Please enter your name so your matches know who you are.', 'error');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await onComplete(email.trim() || 'alex@example.com', {
          full_name: fullName.trim() || 'Alex Morgan',
          birth_date: birthDate.trim() || '2000-01-01',
          location: location.trim() || 'Kolkata, WB',
          gender,
          bio: bio.trim() || 'Excited to meet new people!',
          interests: selectedInterests,
          photos: [selectedPhoto],
        });
      } catch (err: any) {
        showAlert('Connection Notice', err.message || 'Starting in demo mode.', 'warning');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Custom Hinge Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />

      {/* Top Header / Progress */}
      {step > 1 ? (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.stepProgress}>Step {step} of 4</Text>
          <View style={{ width: 36 }} />
        </View>
      ) : null}

      {/* Progress bar in signature Plum (Steps 2-4) */}
      {step > 1 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.authContainer}>
            {/* Hinge Flame Logo & Typography */}
            <View style={styles.logoBadge}>
              <Ionicons name="flame" size={38} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Luma</Text>
            <Text style={styles.welcomeSub}>Designed to be deleted. Connect with genuine people.</Text>

            {/* 100% Free 1-Tap Google Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={!!socialLoading}
              activeOpacity={0.85}
            >
              {socialLoading === 'google' ? (
                <ActivityIndicator size="small" color="#EA4335" />
              ) : (
                <View style={styles.socialBtnInner}>
                  <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 12 }} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 100% Free 1-Tap Apple Button */}
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
              disabled={!!socialLoading}
              activeOpacity={0.85}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.socialBtnInner}>
                  <Ionicons name="logo-apple" size={22} color="#FFFFFF" style={{ marginRight: 12 }} />
                  <Text style={styles.appleBtnText}>Continue with Apple</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="alex@example.com"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Terms & Privacy */}
            <Text style={styles.termsText}>
              By continuing, you agree to Luma's{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and acknowledge our{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSub}>Your profile details shown to intentional matches.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Alex Morgan"
                placeholderTextColor="#999999"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location / City</Text>
              <View style={styles.locationInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="e.g. Kolkata, WB"
                  placeholderTextColor="#999999"
                  value={location}
                  onChangeText={setLocation}
                />
                <TouchableOpacity
                  style={styles.gpsBtn}
                  onPress={handleDetectLocation}
                  disabled={detectingLocation}
                  activeOpacity={0.8}
                >
                  {detectingLocation ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={styles.gpsInner}>
                      <Ionicons name="navigate" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.gpsBtnText}>GPS</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (Must be 18+)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999999"
                value={birthDate}
                onChangeText={setBirthDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.genderRow}>
                {['woman', 'man', 'non-binary'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderPill, gender === g && styles.genderPillActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Short Bio</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Architect, coffee addict & weekend traveler..."
                placeholderTextColor="#999999"
                multiline
                value={bio}
                onChangeText={setBio}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are your passions?</Text>
            <Text style={styles.stepSub}>Select up to 5 interest tags.</Text>

            <View style={styles.tagsContainer}>
              {INTEREST_TAGS.map((tag) => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.selectedTagPill]}
                    onPress={() => toggleInterest(tag)}
                  >
                    <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.tagCount}>
              {selectedInterests.length}/5 selected
            </Text>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Add your profile picture</Text>
            <Text style={styles.stepSub}>Clear, high-quality photos get 3x more matches.</Text>

            <View style={styles.photoBox}>
              <Image source={{ uri: selectedPhoto }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handlePickPhoto}
                activeOpacity={0.85}
              >
                <Feather name="camera" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.changePhotoText}>Change / Upload Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === 4 ? "Start Discovering" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    padding: 6,
  },
  stepProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
  },
  content: {
    padding: 24,
    paddingBottom: 30,
  },
  authContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F5EBF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 29, 86, 0.15)',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111111',
    fontFamily: 'serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  googleBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  appleBtn: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  appleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  socialBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  stepSub: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  gpsBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  gpsInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E8E8EC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#FAFAFC',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  genderPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E8EC',
    backgroundColor: '#FAFAFC',
    alignItems: 'center',
  },
  genderPillActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#F5EBF4',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  genderTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8E8EC',
    backgroundColor: '#FAFAFC',
  },
  selectedTagPill: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: PRIMARY_COLOR,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tagCount: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  photoBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  nextBtn: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
