import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
export default function HomeScreen() {
  const router = useRouter();
  const [contractorInboxVisible, setContractorInboxVisible] = useState(false);

useEffect(() => {
  let active = true;

  const loadContractorAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from('contractor_profiles')
      .select('approved')
      .maybeSingle();

    if (active && !error) {
      setContractorInboxVisible(Boolean(data?.approved));
    }
  };

  void loadContractorAccess();

  return () => {
    active = false;
  };
}, []);
const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign-out failed:', error.message);
    return;
  }

  router.replace('/login');
};
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Welcome back!</Text>
          <Text style={styles.headerTitle}>Build & Dwelling</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.contractorCardFlat}
            onPress={() => router.push('/contractors')}
          >
            <Text style={styles.cardTitle}>Hire Contractors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.realEstateCardFlat}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.cardTitle}>Buy & Sell</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => router.push('/my-requests')}
        >
          <Text style={styles.requestsButtonTitle}>My Quote Requests</Text>
          <Text style={styles.requestsButtonDescription}>
            View the requests you have submitted
          </Text>
        </TouchableOpacity>
{contractorInboxVisible ? (
  <TouchableOpacity
    style={styles.contractorInboxButton}
    onPress={() => router.push('/contractor-requests')}
  >
    <Text style={styles.contractorInboxButtonTitle}>Contractor Inbox</Text>
    <Text style={styles.contractorInboxButtonDescription}>
      View and manage incoming quote requests
    </Text>
  </TouchableOpacity>
) : null}
<TouchableOpacity
  style={styles.signOutButton}
  onPress={handleSignOut}
>
  <Text style={styles.signOutButtonText}>Sign out</Text>
</TouchableOpacity>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Contractors</Text>
          <TouchableOpacity onPress={() => router.push('/contractors')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          <View style={styles.itemCard}>
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: '#FFD700' }]}
            >
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.itemMainText}>John Doe Masonry</Text>
            <Text style={styles.itemSubText}>4.9 stars, 48 reviews</Text>
            <Text style={styles.tagText}>Brickwork & Concrete</Text>
          </View>

          <View style={styles.itemCard}>
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: '#1E90FF' }]}
            >
              <Text style={styles.avatarText}>ES</Text>
            </View>
            <Text style={styles.itemMainText}>Elite Structures Ltd</Text>
            <Text style={styles.itemSubText}>4.8 stars, 120 reviews</Text>
            <Text style={styles.tagText}>General Contractor</Text>
          </View>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          <View style={styles.itemCard}>
            <View
              style={[styles.imagePlaceholder, { backgroundColor: '#2E8B57' }]}
            >
              <Text style={styles.imageEmoji}>House</Text>
            </View>
            <Text style={styles.itemMainText}>Modern 3-Bed Villa</Text>
            <Text style={styles.priceText}>$450,000</Text>
            <Text style={styles.itemSubText}>Kigali, Rwanda</Text>
          </View>

          <View style={styles.itemCard}>
            <View
              style={[styles.imagePlaceholder, { backgroundColor: '#8B008B' }]}
            >
              <Text style={styles.imageEmoji}>Apartment</Text>
            </View>
            <Text style={styles.itemMainText}>Luxury Apartment</Text>
            <Text style={styles.priceText}>$220,000</Text>
            <Text style={styles.itemSubText}>Downtown District</Text>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contractorCardFlat: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  realEstateCardFlat: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#E6F2FF',
    borderWidth: 1,
    borderColor: '#CCE5FF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  requestsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  requestsButtonTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  requestsButtonDescription: {
    color: '#E6F2FF',
    fontSize: 13,
    marginTop: 5,
  },
  contractorInboxButton: {
  backgroundColor: '#ECFDF5',
  borderRadius: 14,
  padding: 16,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: '#A7F3D0',
},
contractorInboxButtonTitle: {
  color: '#065F46',
  fontSize: 17,
  fontWeight: 'bold',
},
contractorInboxButtonDescription: {
  color: '#047857',
  fontSize: 13,
  marginTop: 5,
},
  signOutButton: {
  alignSelf: 'flex-start',
  borderWidth: 1,
  borderColor: '#B91C1C',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 10,
  marginBottom: 24,
},
signOutButtonText: {
  color: '#B91C1C',
  fontSize: 14,
  fontWeight: '600',
},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  seeAllText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginBottom: 24,
    paddingBottom: 8,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 180,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageEmoji: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemMainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  itemSubText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B6CB0',
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    color: '#4A5568',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
