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

// Mock Data for Real Estate Listings
const PROPERTIES = [
  {
    id: '1',
    title: 'Commercial Development Land',
    type: 'Land',
    status: 'For Sale',
    price: '$120,000',
    location: 'Downtown Logistics Zone',
    size: '2.5 Acres',
  },
  {
    id: '2',
    title: 'Modern 3-Bedroom Residential Shell',
    type: 'House',
    status: 'For Sale',
    price: '$245,000',
    location: 'Oakridge Suburbs',
    size: '2,800 sqft',
  },
  {
    id: '3',
    title: 'Industrial Warehouse Structure',
    type: 'Industrial',
    status: 'For Rent',
    price: '$4,500/mo',
    location: 'Metro Industrial Park',
    size: '12,000 sqft',
  },
  {
    id: '4',
    title: 'Suburban Multi-Family Lot',
    type: 'Land',
    status: 'For Sale',
    price: '$85,000',
    location: 'Riverview Heights',
    size: '0.75 Acres',
  },
];

const FILTERS = ['All', 'Land', 'House', 'Industrial'];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter listings matching parameters
  const filteredProperties = PROPERTIES.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || property.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Marketplace</Text>
      </View>

      {/* Search Input bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by location or property type..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Horizontal Filter Row */}
      <View style={styles.filterContainer}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterBadge,
                selectedFilter === item && styles.filterBadgeActive
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item && styles.filterTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Grid List of Properties */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusBadge, 
                item.status === 'For Sale' ? styles.saleBadge : styles.rentBadge
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>

            <Text style={styles.propertyTitle}>{item.title}</Text>
            <Text style={styles.locationText}>📍 {item.location}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.specsRow}>
              <Text style={styles.specsText}>📐 Size: {item.size}</Text>
              <Text style={styles.specsText}>🏷️ Type: {item.type}</Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => alert(Inquiry submitted for: ${item.title})}
            >
              <Text style={styles.actionButtonText}>View Listing Details</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No listings match your current filters.</Text>
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
    color: '#10B981',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchBar: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  filterContainer: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  filterBadgeActive: {
    backgroundColor: '#10B981',
  },
  filterText: {
    color: '#374151',
    fontWeight: '500',
  },
  filterTextActive: {
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleBadge: {
    backgroundColor: '#FEF3C7',
  },
  rentBadge: {
    backgroundColor: '#E0F2FE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  specsText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
    fontSize: 16,
  },
});