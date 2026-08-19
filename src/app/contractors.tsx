import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';

// Mock Data for Construction Companies
const CONTRACTORS = [
  {
    id: '1',
    name: 'Apex Framing & Carpentry',
    specialty: 'Framing',
    rating: 4.9,
    reviews: 124,
    rate: '$55/hr',
    completedProjects: 82,
  },
  {
    id: '2',
    name: 'Solid Ground Foundation Co.',
    specialty: 'Concrete',
    rating: 4.7,
    reviews: 98,
    rate: '$75/hr',
    completedProjects: 140,
  },
  {
    id: '3',
    name: 'Elite Plumbing & Piping',
    specialty: 'Plumbing',
    rating: 4.8,
    reviews: 156,
    rate: '$60/hr',
    completedProjects: 210,
  },
  {
    id: '4',
    name: 'Volt Masters Electrical',
    specialty: 'Electrical',
    rating: 4.9,
    reviews: 88,
    rate: '$65/hr',
    completedProjects: 75,
  },
];

const CATEGORIES = ['All', 'Framing', 'Concrete', 'Plumbing', 'Electrical'];

export default function ContractorsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter logic
  const filteredContractors = CONTRACTORS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.specialty === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Contractors</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search contractors or specialties..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Filter Badges */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryBadge,
                selectedCategory === item && styles.categoryBadgeActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Contractor List */}
      <FlatList
        data={filteredContractors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.contractorName}>{item.name}</Text>
              <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            </View>
            
            <Text style={styles.specialtyText}>{item.specialty}</Text>
            
            <View style={styles.detailsRow}>
              <Text style={styles.detailItem}>💼 {item.completedProjects} Jobs</Text>
              <Text style={styles.detailItem}>💵 {item.rate}</Text>
            </View>

            <TouchableOpacity 
              style={styles.hireButton}
              onPress={() => alert(Contacting ${item.name}...)}
            >
              <Text style={styles.hireButtonText}>Request Quote</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No contractors found matching your search.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#CED4DA',
    fontSize: 16,
  },
  categoryContainer: {
    paddingLeft: 16,
    marginBottom: 8,
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
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contractorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  specialtyText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
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
  hireButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  hireButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6C757D',
    marginTop: 32,
    fontSize: 16,
  },
});