import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  getPublishedContractorByExternalId,

  type Contractor,
} from '@/lib/contractors';

export default function ContractorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contractorId = Array.isArray(id) ? id[0] : id;
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadContractor = useCallback(async () => {
    if (!contractorId) {
      setErrorMessage('No contractor was selected.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const publishedContractor = await getPublishedContractorByExternalId(contractorId);

      if (!publishedContractor) {
        setContractor(null);
        setErrorMessage('This contractor listing is not available.');
        return;
      }

      setContractor(publishedContractor);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load this contractor right now.',
      );
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  useEffect(() => {
    void loadContractor();
  }, [loadContractor]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contractor profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contractor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorTitle}>Profile unavailable</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Contractors</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to Contractors</Text>
        </TouchableOpacity>

        <View style={styles.profileCard}>
          <Text style={styles.name}>{contractor.name}</Text>
          <Text style={styles.specialty}>{contractor.specialty}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {contractor.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>
              {contractor.reviews} reviews
            </Text>
          </View>

          <Text style={styles.description}>{contractor.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{contractor.rate}</Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{contractor.completedProjects}</Text>
              <Text style={styles.statLabel}>Completed projects</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={() =>
              router.push({
                pathname: '/contractor/[id]/request',
                params: { id: contractor.id },
              })
            }
          >
            <Text style={styles.requestButtonText}>Request a Quote</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: {
    color: '#1F2937',
    fontSize: 28,
    fontWeight: 'bold',
  },
  specialty: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  rating: {
    color: '#B7791F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviews: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 12,
  },
  description: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 24,
    paddingTop: 20,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  requestButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 22,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#B91C1C',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 20,
  },
  backButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
