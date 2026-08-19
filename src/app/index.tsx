import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
export default function HomeScreen() {
  const router = useRouter(); // <--
  return (
    // Your UI code...
  );
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Welcome back!</Text>
          <Text style={styles.headerTitle}>Build & Dwelling</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.contractorCardFlat} 
           onPress={() => {
              console.log("Contractor button pressed!");
              router.push('/contractors');
            }}
          >
            <Text style={styles.cardTitle}>👷 Hire Contractors</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.realEstateCardFlat} 
            onPress={() => {
              console.log("Real estate button pressed!");
              router.push('/explore');
            }}
          >
            <Text style={styles.cardTitle}>🏡 Buy & Sell</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Contractors Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Contractors</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {/* Contractor 1 */}
          <View style={styles.itemCard}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.itemMainText}>John Doe Masonry</Text>
            <Text style={styles.itemSubText}>⭐ 4.9 (48 reviews)</Text>
            <Text style={styles.tagText}>Brickwork & Concrete</Text>
          </View>

          {/* Contractor 2 */}
          <View style={styles.itemCard}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#1E90FF' }]}>
              <Text style={styles.avatarText}>ES</Text>
            </View>
            <Text style={styles.itemMainText}>Elite Structures Ltd</Text>
            <Text style={styles.itemSubText}>⭐ 4.8 (120 reviews)</Text>
            <Text style={styles.tagText}>General Contractor</Text>
          </View>
        </ScrollView>

        {/* Featured Properties Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {/* Property 1 */}
          <View style={styles.itemCard}>
            <View style={[styles.imagePlaceholder, { backgroundColor: '#2E8B57' }]}>
              <Text style={styles.imageEmoji}>🏠</Text>
            </View>
            <Text style={styles.itemMainText}>Modern 3-Bed Villa</Text>
            <Text style={styles.priceText}>$450,000</Text>
            <Text style={styles.itemSubText}>Kigali, Rwanda</Text>
          </View>

          {/* Property 2 */}
          <View style={styles.itemCard}>
            <View style={[styles.imagePlaceholder, { backgroundColor: '#8B008B' }]}>
              <Text style={styles.imageEmoji}>🏢</Text>
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
    marginBottom: 32,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
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
    fontSize: 32,
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