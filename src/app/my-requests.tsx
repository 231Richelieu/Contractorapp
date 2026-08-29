import { useCallback, useEffect, useState } from 'react';
import { QuoteResponseCard } from '@/components/quote-response-card';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

type QuoteRequest = {
  id: string;
  contractor_id: string;
  customer_name: string;
  project_description: string;
  budget: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'declined' | 'completed';
  created_at: string;
};

export default function MyRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = useCallback(async () => {
    setErrorMessage('');

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('quote_requests')
      .select(
        'id, contractor_id, customer_name, project_description, budget, status, created_at',
      )
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setRequests((data ?? []) as QuoteRequest[]);
  }, [router]);

  useEffect(() => {
    const loadInitialRequests = async () => {
      setLoading(true);
      await loadRequests();
      setLoading(false);
    };

    void loadInitialRequests();
  }, [loadRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const updateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .eq('id', requestId);
    
    if (error) {
      Alert.alert('Error', 'Failed to update status: ' + error.message);
      return false;
    }
    return true;
  };

  const getStatusColor = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'accepted':
        return '#15803D';
      case 'declined':
        return '#B91C1C';
      case 'completed':
        return '#6D28D9';
      case 'reviewed':
        return '#B45309';
      default:
        return '#1D4ED8';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back to home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Quote Requests</Text>
        <Text style={styles.subtitle}>
          Track the requests you have submitted to contractors.
        </Text>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load requests</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!errorMessage && requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No quote requests yet</Text>
            <Text style={styles.emptyMessage}>
              When you submit a request to a contractor, it will appear here.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/contractors')}
            >
              <Text style={styles.primaryButtonText}>Find a Contractor</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.contractorId}>
                Contractor #{request.contractor_id}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {request.status}
              </Text>
            </View>

            <Text style={styles.requestName}>{request.customer_name}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {request.project_description}
            </Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Budget: ${request.budget}</Text>
              <Text style={styles.detailText}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>
            </View>

            {/* Quote Response Details */}
            <QuoteResponseCard requestId={request.id} />

            {/* Customer Decision Actions */}
            {(request.status === 'pending' || request.status === 'reviewed') && (
              <View style={styles.customerActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={async () => {
                    if (await updateRequestStatus(request.id, 'accepted')) {
                      await loadRequests(); 
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>Accept Quote</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => {
                    Alert.alert(
                      'Decline Quote',
                      'Are you sure you want to decline this quote?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Decline', 
                          style: 'destructive',
                          onPress: async () => {
                            if (await updateRequestStatus(request.id, 'declined')) {
                              await loadRequests();
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>Decline Quote</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 24,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contractorId: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  requestName: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  detailText: {
    color: '#6B7280',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyMessage: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
