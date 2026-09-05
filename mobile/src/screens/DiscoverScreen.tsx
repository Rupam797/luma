import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { useAlert } from '../context/AlertContext';

const PRIMARY_COLOR = '#6B1D56';
const { width } = Dimensions.get('window');

interface ProfilePrompt {
  id: string;
  question: string;
  answer: string;
}

interface ProfileData {
  id: string;
  name: string;
  age: number;
  verified: boolean;
  activeStatus: string;
  photos: string[];
  prompts: ProfilePrompt[];
  distanceMiles?: number;
  vitals: {
    gender: string;
    orientation: string;
    height: string;
    religion: string;
    hometown: string;
    politics: string;
    ethnicity: string;
    datingGoals: string;
    relationshipType: string;
  };
}

const PROFILES: ProfileData[] = [
  {
    id: 'user-svetlana',
    name: 'Svetlana',
    age: 22,
    verified: true,
    activeStatus: 'Active now',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    ],
    distanceMiles: 2,
    prompts: [
      {
        id: 'p1',
        question: 'A random fact I love is',
        answer: 'Penguins propose with pebbles.',
      },
      {
        id: 'p2',
        question: 'My simple pleasures',
        answer: 'Sunday morning pour-over coffee & browsing indie record stores.',
      },
      {
        id: 'p3',
        question: 'Together, we could',
        answer: 'Find the city’s best hidden ramen bars and book spontaneous weekend getaways.',
      },
    ],
    vitals: {
      gender: 'Woman',
      orientation: 'Straight',
      height: "5'6\"",
      religion: 'Hindu',
      hometown: 'Kolkata',
      politics: 'Liberal',
      ethnicity: 'Southeast Asian',
      datingGoals: 'Figuring out my dating goals',
      relationshipType: 'Monogamous, open to explore',
    },
  },
  {
    id: 'user-sophia',
    name: 'Sophia',
    age: 24,
    verified: true,
    activeStatus: 'Active 10m ago',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
    ],
    distanceMiles: 4,
    prompts: [
      {
        id: 'p1',
        question: 'The key to my heart is',
        answer: 'Crispy wood-fired pizza and great conversation under city lights.',
      },
      {
        id: 'p2',
        question: 'I geek out on',
        answer: 'Architecture history, modern UI design, and rooftop sunset spots.',
      },
    ],
    vitals: {
      gender: 'Woman',
      orientation: 'Straight',
      height: "5'7\"",
      religion: 'Spiritual',
      hometown: 'Mumbai',
      politics: 'Moderate',
      ethnicity: 'South Asian',
      datingGoals: 'Long-term relationship',
      relationshipType: 'Monogamous',
    },
  },
  {
    id: 'user-elena',
    name: 'Elena',
    age: 23,
    verified: true,
    activeStatus: 'Active today',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    ],
    distanceMiles: 7,
    prompts: [
      {
        id: 'p1',
        question: 'I will pick the restaurant if',
        answer: 'You promise to save room for dessert.',
      },
    ],
    vitals: {
      gender: 'Woman',
      orientation: 'Bisexual',
      height: "5'5\"",
      religion: 'Agnostic',
      hometown: 'Delhi',
      politics: 'Progressive',
      ethnicity: 'Asian',
      datingGoals: 'Short-term fun, open to long',
      relationshipType: 'Open',
    },
  },
];

export default function DiscoverScreen() {
  const { showAlert, showToast } = useAlert();
  const [profileIndex, setProfileIndex] = useState(0);
  const [passedHistory, setPassedHistory] = useState<number[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedAge, setSelectedAge] = useState('18-28');
  const [selectedDistance, setSelectedDistance] = useState('25 km');
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [likeItemTarget, setLikeItemTarget] = useState<{ type: 'photo' | 'prompt'; content: string; title?: string } | null>(null);
  const [likeComment, setLikeComment] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const currentProfile = PROFILES[profileIndex] || PROFILES[0];

  const handleNextProfile = (action: 'like' | 'pass') => {
    if (action === 'pass') {
      setPassedHistory((prev) => [...prev, profileIndex]);
    }
    const nextIdx = (profileIndex + 1) % PROFILES.length;
    setProfileIndex(nextIdx);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRewind = () => {
    if (passedHistory.length === 0) {
      showAlert({
        title: 'No Previous Profile',
        message: 'You have not passed any profiles in this session yet.',
        type: 'info',
        buttons: [{ text: 'Got it', style: 'default' }],
      });
      return;
    }
    const lastIdx = passedHistory[passedHistory.length - 1];
    setPassedHistory((prev) => prev.slice(0, -1));
    setProfileIndex(lastIdx);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleOpenLikeModal = (type: 'photo' | 'prompt', content: string, title?: string) => {
    setLikeItemTarget({ type, content, title });
    setLikeComment('');
    setLikeModalVisible(true);
  };

  const handleSendLike = async () => {
    setLikeModalVisible(false);
    try {
      await apiService.processSwipe(currentProfile.id, 'like');
    } catch (e) {
      console.log('Like sent in demo mode');
    }

    showToast({
      title: 'Like Sent!',
      message: `Liked ${currentProfile.name}'s ${likeItemTarget?.type === 'prompt' ? 'prompt response' : 'photo'} ✨`,
      type: 'success',
    });

    handleNextProfile('like');
  };

  const handleReportOrBlock = () => {
    showAlert({
      title: `Manage ${currentProfile.name}`,
      message: 'Choose an action for this profile to keep your feed safe and comfortable.',
      type: 'warning',
      buttons: [
        {
          text: 'Report Profile',
          style: 'destructive',
          onPress: () => {
            showToast({
              title: 'Report Submitted',
              message: 'Our moderation team will review this profile within 24 hours.',
              type: 'info',
            });
            handleNextProfile('pass');
          },
        },
        {
          text: 'Block & Hide',
          style: 'destructive',
          onPress: () => {
            showToast({
              title: 'Profile Blocked',
              message: `${currentProfile.name} will no longer appear in your feed.`,
              type: 'info',
            });
            handleNextProfile('pass');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Filter Bar */}
      <View style={styles.topFilterBar}>
        <TouchableOpacity
          style={styles.filterTuneBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Feather name="sliders" size={18} color="#111111" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterPill, styles.signalsPill]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="sparkles" size={13} color={PRIMARY_COLOR} style={{ marginRight: 4 }} />
            <Text style={styles.signalsPillText}>Signals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterPillText}>Age {selectedAge}</Text>
            <Feather name="chevron-down" size={14} color="#666666" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterPillText}>Height</Text>
            <Feather name="chevron-down" size={14} color="#666666" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterPillText}>Dating Goals</Text>
            <Feather name="chevron-down" size={14} color="#666666" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterPillText}>Religion</Text>
            <Feather name="chevron-down" size={14} color="#666666" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Profile Stream Scrollable Feed */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.streamContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTitleRow}>
            <View style={styles.nameGroup}>
              <Text style={styles.profileName}>{currentProfile.name}</Text>
              {currentProfile.verified && (
                <View style={styles.verifiedRosette}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.rewindBtn} onPress={handleRewind}>
                <Ionicons name="arrow-undo-outline" size={22} color="#111111" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreBtn} onPress={handleReportOrBlock}>
                <Feather name="more-horizontal" size={22} color="#111111" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={styles.statusPill}>
              <Ionicons name="sparkles" size={12} color={PRIMARY_COLOR} style={{ marginRight: 4 }} />
              <Text style={styles.statusPillText}>Signals · {currentProfile.activeStatus}</Text>
            </View>

            <View style={styles.locationPill}>
              <Ionicons name="location-sharp" size={12} color={PRIMARY_COLOR} style={{ marginRight: 4 }} />
              <Text style={styles.locationPillText}>
                {currentProfile.vitals.hometown} · {currentProfile.distanceMiles || 3} mi away
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Main Photo Card */}
        {currentProfile.photos[0] && (
          <View style={styles.photoCard}>
            <Image source={{ uri: currentProfile.photos[0] }} style={styles.cardImage} />
            <TouchableOpacity
              style={styles.likeFabOnCard}
              onPress={() => handleOpenLikeModal('photo', currentProfile.photos[0], `${currentProfile.name}'s Photo`)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Editorial Prompt Card #1 */}
        {currentProfile.prompts[0] && (
          <View style={styles.promptCard}>
            <Text style={styles.promptQuestion}>{currentProfile.prompts[0].question}</Text>
            <Text style={styles.promptAnswer}>{currentProfile.prompts[0].answer}</Text>
            <TouchableOpacity
              style={styles.likeFabOnPrompt}
              onPress={() => handleOpenLikeModal('prompt', currentProfile.prompts[0].answer, currentProfile.prompts[0].question)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Personal Vitals Table */}
        <View style={styles.vitalsCard}>
          <View style={styles.vitalsTopRow}>
            <View style={styles.vitalCol}>
              <Feather name="calendar" size={16} color="#666666" />
              <Text style={styles.vitalVal}>{currentProfile.age}</Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalCol}>
              <Feather name="user" size={16} color="#666666" />
              <Text style={styles.vitalVal}>{currentProfile.vitals.gender}</Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalCol}>
              <Ionicons name="compass-outline" size={17} color="#666666" />
              <Text style={styles.vitalVal}>{currentProfile.vitals.orientation}</Text>
            </View>
          </View>

          <View style={styles.vitalsSeparator} />

          <View style={styles.vitalListItem}>
            <Feather name="book-open" size={16} color="#666666" style={styles.vitalIconWrap} />
            <Text style={styles.vitalListText}>{currentProfile.vitals.religion}</Text>
          </View>
          <View style={styles.vitalsSeparator} />

          <View style={styles.vitalListItem}>
            <Feather name="home" size={16} color="#666666" style={styles.vitalIconWrap} />
            <Text style={styles.vitalListText}>{currentProfile.vitals.hometown}</Text>
          </View>
          <View style={styles.vitalsSeparator} />

          <View style={styles.vitalListItem}>
            <Ionicons name="business-outline" size={16} color="#666666" style={styles.vitalIconWrap} />
            <Text style={styles.vitalListText}>{currentProfile.vitals.politics}</Text>
          </View>
          <View style={styles.vitalsSeparator} />

          <View style={styles.vitalListItem}>
            <Feather name="globe" size={16} color="#666666" style={styles.vitalIconWrap} />
            <Text style={styles.vitalListText}>{currentProfile.vitals.ethnicity}</Text>
          </View>
          <View style={styles.vitalsSeparator} />

          <View style={styles.vitalListItem}>
            <Feather name="search" size={16} color="#666666" style={styles.vitalIconWrap} />
            <Text style={styles.vitalListText}>{currentProfile.vitals.datingGoals}</Text>
          </View>
          <View style={styles.vitalsSeparator} />

          <View style={styles.vitalListItem}>
            <Feather name="users" size={16} color="#666666" style={styles.vitalIconWrap} />
            <Text style={styles.vitalListText}>{currentProfile.vitals.relationshipType}</Text>
          </View>
        </View>

        {/* 4. Second Photo Card */}
        {currentProfile.photos[1] && (
          <View style={styles.photoCard}>
            <Image source={{ uri: currentProfile.photos[1] }} style={styles.cardImage} />
            <TouchableOpacity
              style={styles.likeFabOnCard}
              onPress={() => handleOpenLikeModal('photo', currentProfile.photos[1], `${currentProfile.name}'s Photo`)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Editorial Prompt Card #2 */}
        {currentProfile.prompts[1] && (
          <View style={styles.promptCard}>
            <Text style={styles.promptQuestion}>{currentProfile.prompts[1].question}</Text>
            <Text style={styles.promptAnswer}>{currentProfile.prompts[1].answer}</Text>
            <TouchableOpacity
              style={styles.likeFabOnPrompt}
              onPress={() => handleOpenLikeModal('prompt', currentProfile.prompts[1].answer, currentProfile.prompts[1].question)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 6. Third Photo Card */}
        {currentProfile.photos[2] && (
          <View style={styles.photoCard}>
            <Image source={{ uri: currentProfile.photos[2] }} style={styles.cardImage} />
            <TouchableOpacity
              style={styles.likeFabOnCard}
              onPress={() => handleOpenLikeModal('photo', currentProfile.photos[2], `${currentProfile.name}'s Photo`)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Buttons (Pass & Like) */}
      <View style={styles.floatingActionsRow}>
        <TouchableOpacity
          style={styles.floatingPassBtn}
          onPress={() => handleNextProfile('pass')}
          activeOpacity={0.85}
        >
          <Feather name="x" size={26} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingLikeBtn}
          onPress={() => handleOpenLikeModal('photo', currentProfile.photos[0], `${currentProfile.name}`)}
          activeOpacity={0.85}
        >
          <Ionicons name="heart" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Interactive Like & Comment Bottom Sheet Modal */}
      <Modal
        visible={likeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLikeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.likeModalCard}>
            <View style={styles.modalDragBar} />
            <Text style={styles.modalHeaderTitle}>
              Like {currentProfile.name}'s {likeItemTarget?.type === 'prompt' ? 'Prompt' : 'Photo'}
            </Text>

            {likeItemTarget?.type === 'prompt' ? (
              <View style={styles.modalPromptPreview}>
                <Text style={styles.modalPromptQ}>{likeItemTarget.title}</Text>
                <Text style={styles.modalPromptA}>"{likeItemTarget.content}"</Text>
              </View>
            ) : (
              likeItemTarget?.content && (
                <Image source={{ uri: likeItemTarget.content }} style={styles.modalPhotoPreview} />
              )
            )}

            <TextInput
              style={styles.commentInput}
              placeholder={`Send a comment to ${currentProfile.name}...`}
              placeholderTextColor="#8E92B2"
              value={likeComment}
              onChangeText={setLikeComment}
              multiline
            />

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLikeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSendBtn}
                onPress={handleSendLike}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSendText}>
                  {likeComment.trim() ? 'Send with Comment' : 'Send Like'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Preference Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Discovery Preferences</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={20} color="#888888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionLabel}>Age Range</Text>
            <View style={styles.filterPillRow}>
              {['18-24', '18-28', '22-35', 'All'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[styles.filterChoicePill, selectedAge === range && styles.filterChoiceActive]}
                  onPress={() => setSelectedAge(range)}
                >
                  <Text style={[styles.filterChoiceText, selectedAge === range && styles.filterChoiceTextActive]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionLabel}>Maximum Distance</Text>
            <View style={styles.filterPillRow}>
              {['10 km', '25 km', '50 km', 'Whole City', 'Nationwide'].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[styles.filterChoicePill, selectedDistance === dist && styles.filterChoiceActive]}
                  onPress={() => setSelectedDistance(dist)}
                >
                  <Text style={[styles.filterChoiceText, selectedDistance === dist && styles.filterChoiceTextActive]}>
                    {dist}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyFilterBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyFilterText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  topFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  filterTuneBtn: {
    paddingRight: 10,
    paddingLeft: 2,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D4DF',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  signalsPill: {
    backgroundColor: '#F5EBF4',
    borderColor: PRIMARY_COLOR,
  },
  signalsPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  toastBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  streamContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  profileTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.5,
  },
  verifiedRosette: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rewindBtn: {
    padding: 4,
  },
  moreBtn: {
    padding: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EBF4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EBF4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  locationPillText: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  photoCard: {
    width: '100%',
    height: width * 1.15,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#EAEAEA',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeFabOnCard: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  likeFabOnPrompt: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingBottom: 40,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F4',
  },
  promptQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 14,
  },
  promptAnswer: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 32,
    paddingRight: 40,
    fontFamily: 'serif',
  },
  vitalsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F4',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vitalsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  vitalCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vitalVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  vitalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EBEBEF',
  },
  vitalsSeparator: {
    height: 1,
    backgroundColor: '#F0F0F4',
    marginVertical: 12,
  },
  vitalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  vitalIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  vitalListText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  floatingActionsRow: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
    zIndex: 50,
  },
  floatingPassBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  floatingLikeBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  likeModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalDragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPromptPreview: {
    backgroundColor: '#F7F7F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalPromptQ: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 6,
  },
  modalPromptA: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    fontFamily: 'serif',
  },
  modalPhotoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#F4F4F7',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111111',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F0F0F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555555',
  },
  modalSendBtn: {
    flex: 2,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSendText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    width: width - 40,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 10,
    marginTop: 10,
  },
  filterPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChoicePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F4F4F7',
    borderWidth: 1,
    borderColor: '#E6E6EC',
  },
  filterChoiceActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  filterChoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  filterChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  applyFilterBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyFilterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
