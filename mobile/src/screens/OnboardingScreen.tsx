import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const INTEREST_TAGS = [
  '☕ Coffee Addict',
  '🏔️ Weekend Hikes',
  '🎨 UX & Design',
  '🎵 Indie Music',
  '🍕 Foodie',
  '✈️ World Travel',
  '🐕 Dog Parent',
  '🍷 Wine Tasting',
  '🎮 Gaming',
  '🧘 Yoga & Fitness',
];

interface OnboardingProps {
  onComplete: (email: string, profileData?: any) => Promise<void>;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('woman');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
  );
  const [loading, setLoading] = useState(false);

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, tag]);
      }
    }
  };

  const handlePickPhoto = () => {
    Alert.alert(
      'Choose Profile Photo',
      'Select a photo that clearly shows your face',
      [
        {
          text: '📸 Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera permission is required.');
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
          text: '🖼️ Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Gallery permission is required.');
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
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    if (step === 2 && !fullName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await onComplete(email.trim(), {
          full_name: fullName.trim() || 'Alex Morgan',
          birth_date: birthDate.trim() || '2000-01-01',
          gender,
          bio: bio.trim() || 'Excited to meet new people!',
          interests: selectedInterests,
          photos: [selectedPhoto],
        });
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={styles.stepProgress}>Step {step} of 4</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar in Plum */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>💜</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Luma</Text>
            <Text style={styles.welcomeSub}>Designed to be deleted. Connect with genuine people.</Text>

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
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSub}>Your profile name will be shown to matches.</Text>

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
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7A2269', '#FF3366']}
                  style={styles.changePhotoGradient}
                >
                  <Text style={styles.changePhotoText}>📷 Change / Upload Photo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#7A2269', '#FF3366']} style={styles.nextGradient}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step === 4 ? "Start Discovering 💫" : "Continue"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#111111', fontSize: 22, fontWeight: '700' },
  stepProgress: { color: '#777777', fontSize: 13, fontWeight: '700' },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#EDEDF2',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#7A2269', borderRadius: 2 },
  content: { padding: 24, paddingBottom: 40 },
  stepContainer: { alignItems: 'center' },
  logoBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F5EBF4', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoIcon: { fontSize: 32 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: '#111111', marginBottom: 8, fontFamily: 'serif' },
  welcomeSub: { fontSize: 15, color: '#666666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: '#111111', marginBottom: 8, textAlign: 'center', fontFamily: 'serif' },
  stepSub: { fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 24 },
  inputGroup: { width: '100%', marginBottom: 18 },
  label: { color: '#444444', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#F7F7F9',
    borderWidth: 1,
    borderColor: '#E6E6EC',
    borderRadius: 16,
    padding: 14,
    color: '#111111',
    fontSize: 16,
  },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F7F7F9',
    borderWidth: 1,
    borderColor: '#E6E6EC',
    alignItems: 'center',
  },
  genderPillActive: { borderColor: '#7A2269', backgroundColor: '#F5EBF4' },
  genderText: { color: '#666666', fontWeight: '600', fontSize: 14 },
  genderTextActive: { color: '#7A2269', fontWeight: '700' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 },
  tagPill: {
    backgroundColor: '#F7F7F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6EC',
  },
  selectedTagPill: { borderColor: '#7A2269', backgroundColor: '#F5EBF4' },
  tagText: { color: '#666666', fontSize: 14, fontWeight: '600' },
  selectedTagText: { color: '#7A2269', fontWeight: '700' },
  tagCount: { color: '#777777', fontSize: 13 },
  photoBox: { width: '100%', alignItems: 'center' },
  previewImage: { width: 220, height: 280, borderRadius: 24, marginBottom: 20 },
  changePhotoBtn: { borderRadius: 16, overflow: 'hidden', width: 220 },
  changePhotoGradient: { paddingVertical: 14, alignItems: 'center' },
  changePhotoText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#EDEDF2' },
  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  nextGradient: { paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
