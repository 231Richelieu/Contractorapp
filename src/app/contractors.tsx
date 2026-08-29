import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  getPublishedContractors,
  type Contractor,
} from '@/lib/contractors';

export default function ContractorsScreen() {
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadContractors = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const publishedContractors = await getPublishedContractors();
      setContractors(publishedContractors);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load contractors right now.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContractors();
  }, [loadContractors]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(contractors.map((item) => item.specialty)))],
    [contractors],
  );

  const filteredContractors = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return contractors.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.specialty.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === 'All' || item.specialty === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [contractors, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contractors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Contractors</Text>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search contractors or specialties..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryBadge,
              selectedCategory === item && styles.categoryBadgeActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={null}
      />

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Contractors unavailable</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadContractors}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredContractors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {errorMessage
              ? ''
              : 'No published contractors match your search.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.contractorName}>{item.name}</Text>
              <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
            </View>

            <Text style={styles.specialtyText}>{item.specialty}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailItem}>
                {item.completedProjects} completed projects
              </Text>
              <Text style={styles.detailItem}>{item.rate}</Text>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                router.push({
                  pathname: '/contractor/[id]',
                  params: { id: item.external_id },
                })
              }
            >
              <Text style={styles.profileButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#CED4DA',
    fontSize: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    marginRight: 8,
  },
  categoryBadgeActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#495057',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contractorName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B7791F',
  },
  specialtyText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#495057',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    fontSize: 14,
    color: '#495057',
  },
  profileButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6C757D',
    marginTop: 32,
    fontSize: 16,
  },
});
