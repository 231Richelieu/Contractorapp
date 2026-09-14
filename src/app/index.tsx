import { useEffect, useState } from 'react';
import { getApprovedAdminStatus } from '@/lib/admin-contractors';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [contractorInboxVisible, setContractorInboxVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const loadContractorAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setContractorInboxVisible(false);
        }
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

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      try {
        const approved = await getApprovedAdminStatus();
        if (mounted) {
          setIsAdmin(approved);
        }
      } catch {
        if (mounted) {
          setIsAdmin(false);
        }
      }
    };

    void loadAdminStatus();

    return () => {
      mounted = false;
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

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) {
      router.push('/contractors');
      return;
    }

    router.push({
      pathname: '/contractors',
      params: { q: query },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandBlock}>
              <Text style={styles.brandKicker}>CONTRACTORAPP</Text>
              <Text style={styles.headerTitle}>Build &amp; Dwelling</Text>
              <Text style={styles.headerSubtitle}>
                Find trusted people and places for your next project.
              </Text>
            </View>

            <View style={styles.navIcons}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Home"
                style={styles.navItem}
                onPress={() => router.push('/')}
              >
                <Text style={styles.navIcon}>⌂</Text>
                <Text style={styles.navLabel}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Contractors"
                style={styles.navItem}
                onPress={() => router.push('/contractors')}
              >
                <Text style={styles.navIcon}>⚒</Text>
                <Text style={styles.navLabel}>Contractors</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Properties"
                style={styles.navItem}
                onPress={() => router.push('/explore')}
              >
                <Text style={styles.navIcon}>▦</Text>
                <Text style={styles.navLabel}>Properties</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="My quote requests"
                style={styles.navItem}
                onPress={() => router.push('/my-requests')}
              >
                <Text style={styles.navIcon}>≡</Text>
                <Text style={styles.navLabel}>Requests</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              accessibilityLabel="Search contractors and properties"
              style={styles.searchInput}
              placeholder="Search contractors, specialties, or properties"
              placeholderTextColor="#718096"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Search"
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.contractorCardFlat}
            onPress={() => router.push('/contractors')}
          >
            <Text style={styles.actionIcon}>⚒</Text>
            <Text style={styles.cardTitle}>Hire Contractors</Text>
            <Text style={styles.cardDescription}>
              Find trusted professionals for your build.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.realEstateCardFlat}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.actionIcon}>▦</Text>
            <Text style={styles.cardTitle}>Buy &amp; Sell</Text>
            <Text style={styles.cardDescription}>
              Explore properties and real-estate opportunities.
            </Text>
          </TouchableOpacity>
        </View>

        {isAdmin ? (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/admin-contractors')}
          >
            <Text style={styles.adminButtonIcon}>⚙</Text>
            <Text style={styles.adminButtonText}>Admin Catalog</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => router.push('/my-requests')}
        >
          <Text style={styles.requestsButtonIcon}>≡</Text>
          <View style={styles.buttonTextBlock}>
            <Text style={styles.requestsButtonTitle}>My Quote Requests</Text>
            <Text style={styles.requestsButtonDescription}>
              View the requests you have submitted.
            </Text>
          </View>
        </TouchableOpacity>

        {contractorInboxVisible ? (
          <TouchableOpacity
            style={styles.contractorInboxButton}
            onPress={() => router.push('/contractor-requests')}
          >
            <Text style={styles.contractorInboxButtonIcon}>✉</Text>
            <View style={styles.buttonTextBlock}>
              <Text style={styles.contractorInboxButtonTitle}>
                Contractor Inbox
              </Text>
              <Text style={styles.contractorInboxButtonDescription}>
                View and manage incoming quote requests.
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
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
              style={[styles.avatarPlaceholder, { backgroundColor: '#D97706' }]}
            >
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.itemMainText}>John Doe Masonry</Text>
            <Text style={styles.itemSubText}>4.9 stars, 48 reviews</Text>
            <Text style={styles.tagText}>Brickwork &amp; Concrete</Text>
          </View>

          <View style={styles.itemCard}>
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: '#2563EB' }]}
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
              style={[styles.imagePlaceholder, { backgroundColor: '#15803D' }]}
            >
              <Text style={styles.imageEmoji}>House</Text>
            </View>
            <Text style={styles.itemMainText}>Modern 3-Bed Villa</Text>
            <Text style={styles.priceText}>$450,000</Text>
            <Text style={styles.itemSubText}>Kigali, Rwanda</Text>
          </View>

          <View style={styles.itemCard}>
            <View
              style={[styles.imagePlaceholder, { backgroundColor: '#7E22CE' }]}
            >
              <Text style={styles.imageEmoji}>Apartment</Text>
            </View>
            <Text style={styles.itemMainText}>Luxury Apartment</Text>
            <Text style={styles.priceText}>$220,000</Text>
            <Text style={styles.itemSubText}>Downtown District</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerBrandBlock}>
            <Text style={styles.footerBrand}>Contractorapp</Text>
            <Text style={styles.footerDescription}>
              A trusted marketplace for building, property, and professional
              services.
            </Text>
          </View>

          <View style={styles.footerLinksRow}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>Explore</Text>
              <TouchableOpacity onPress={() => router.push('/contractors')}>
                <Text style={styles.footerLink}>Find Contractors</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={styles.footerLink}>Browse Properties</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>Account</Text>
              <TouchableOpacity onPress={() => router.push('/my-requests')}>
                <Text style={styles.footerLink}>My Requests</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>Support</Text>
              <Text style={styles.footerLink}>Help &amp; feedback</Text>
              <Text style={styles.footerLink}>Privacy &amp; terms</Text>
            </View>
          </View>

          <View style={styles.footerBottomRow}>
            <Text style={styles.footerCopyright}>© 2026 Contractorapp</Text>
            <Text style={styles.footerCredit}>Built by Nobeh's Net</Text>
          </View>
        </View>
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
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  brandBlock: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 220,
  },
  brandKicker: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '800',
  },
  navIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  navItem: {
    minWidth: 62,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navIcon: {
    color: '#2563EB',
    fontSize: 22,
    lineHeight: 24,
  },
  navLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  searchRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingLeft: 12,
    overflow: 'hidden',
  },
  searchIcon: {
    color: '#2563EB',
    fontSize: 24,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: '#0F172A',
    fontSize: 15,
    paddingVertical: 13,
  },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  contractorCardFlat: {
    flexGrow: 1,
    flexBasis: 260,
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  realEstateCardFlat: {
    flexGrow: 1,
    flexBasis: 260,
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionIcon: {
    color: '#2563EB',
    fontSize: 24,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  adminButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginRight: 10,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  requestsButtonIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginRight: 12,
  },
  buttonTextBlock: {
    flex: 1,
  },
  requestsButtonTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  requestsButtonDescription: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 5,
  },
  contractorInboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  contractorInboxButtonIcon: {
    color: '#047857',
    fontSize: 24,
    marginRight: 12,
  },
  contractorInboxButtonTitle: {
    color: '#065F46',
    fontSize: 17,
    fontWeight: '800',
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
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#1A202C',
    fontSize: 18,
    fontWeight: '800',
  },
  seeAllText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  horizontalScroll: {
    marginBottom: 24,
    paddingBottom: 8,
  },
  itemCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
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
    fontWeight: '800',
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
    fontWeight: '800',
  },
  itemMainText: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemSubText: {
    color: '#718096',
    fontSize: 12,
    marginBottom: 4,
  },
  priceText: {
    color: '#2B6CB0',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  tagText: {
    alignSelf: 'flex-start',
    color: '#4A5568',
    fontSize: 10,
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 24,
    marginTop: 8,
  },
  footerBrandBlock: {
    maxWidth: 520,
  },
  footerBrand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  footerDescription: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  footerLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    marginTop: 24,
  },
  footerColumn: {
    minWidth: 130,
  },
  footerHeading: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  footerLink: {
    color: '#E2E8F0',
    fontSize: 13,
    marginBottom: 8,
  },
  footerBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 24,
    paddingTop: 16,
  },
  footerCopyright: {
    color: '#94A3B8',
    fontSize: 12,
  },
  footerCredit: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '800',
  },
});
