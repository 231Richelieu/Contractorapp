import { useCallback, useEffect, useState } from 'react';
import { QuoteResponseEditor } from '@/components/quote-response-editor';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

type RequestStatus =
  | 'pending'
  | 'reviewed'
  | 'accepted'
  | 'declined'
  | 'completed';

type ContractorProfile = {
  contractor_id: string;
  display_name: string;
  specialty: string;
  approved: boolean;
};

type IncomingRequest = {
  id: string;
  contractor_id: string;
  customer_name: string;
  project_description: string;
  budget: number;
  status: RequestStatus;
  created_at: string;
};

const nextStatuses: Record<RequestStatus, RequestStatus[]> = {
  pending: ['reviewed', 'accepted', 'declined'],
  reviewed: ['accepted', 'declined'],
  accepted: ['completed'],
  declined: [],
  completed: [],
};

const getStatusActionLabel = (status: RequestStatus) => {
  switch (status) {
    case 'reviewed':
      return 'Mark Reviewed';
    case 'accepted':
      return 'Accept Request';
    case 'declined':
      return 'Decline Request';
    case 'completed':
      return 'Mark Completed';
    default:
      return status;
  }
};

export default function ContractorRequestsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadInbox = useCallback(async () => {
    setErrorMessage('');

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      router.replace('/login');
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('contractor_id, display_name, specialty, approved')
      .single();

    if (profileError || !profileData) {
      setProfile(null);
      setErrorMessage(
        'This account does not have an approved contractor profile.',
      );
      return;
    }

    const contractorProfile = profileData as ContractorProfile;

    if (!contractorProfile.approved) {
      setProfile(contractorProfile);
      setErrorMessage(
        'This contractor profile is waiting for approval before it can receive requests.',
      );
      return;
    }

    setProfile(contractorProfile);

    const { data: requestData, error: requestError } = await supabase
      .from('quote_requests')
      .select(
        'id, contractor_id, customer_name, project_description, budget, status, created_at',
      )
      .order('created_at', { ascending: false });

    if (requestError) {
      setErrorMessage(requestError.message);
      return;
    }

    setRequests((requestData ?? []) as IncomingRequest[]);
  }, [router]);

  useEffect(() => {
    const loadInitialInbox = async () => {
      setLoading(true);
      await loadInbox();
      setLoading(false);
    };

    void loadInitialInbox();
  }, [loadInbox]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInbox();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (
    requestId: string,
    nextStatus: RequestStatus,
  ) => {
    setUpdatingRequestId(requestId);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase
      .from('quote_requests')
      .update({ status: nextStatus })
      .eq('id', requestId);

    setUpdatingRequestId(null);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? { ...request, status: nextStatus }
          : request,
      ),
    );
    setSuccessMessage(`Request status changed to ${nextStatus}.`);
  };

  const getStatusColor = (status: RequestStatus) => {
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
          <Text style={styles.loadingText}>Loading contractor requests...</Text>
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
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Incoming Requests</Text>
        <Text style={styles.subtitle}>
          {profile?.display_name ?? 'Contractor'} · {profile?.specialty ?? ''}
        </Text>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Inbox unavailable</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successCard}>
            <Text style={styles.successMessage}>{successMessage}</Text>
          </View>
        ) : null}

        {!errorMessage && requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No incoming requests</Text>
            <Text style={styles.emptyMessage}>
              New quote requests for this contractor will appear here.
            </Text>
          </View>
        ) : null}

        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.requestLabel}>Quote request</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {request.status}
              </Text>
            </View>

            <Text style={styles.customerName}>{request.customer_name}</Text>
            <Text style={styles.description}>{request.project_description}</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Budget: ${request.budget}</Text>
              <Text style={styles.detailText}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>
              <QuoteResponseEditor
  requestId={request.id}
  contractorId={request.contractor_id}
  requestStatus={request.status}
/>

            </View>

            {nextStatuses[request.status].length > 0 ? (
              <View style={styles.actionsContainer}>
                {nextStatuses[request.status].map((nextStatus) => (
                  <TouchableOpacity
                    key={nextStatus}
                    style={[
                      styles.statusButton,
                      updatingRequestId === request.id && styles.disabledButton,
                    ]}
                    onPress={() =>
                      void handleStatusUpdate(request.id, nextStatus)
                    }
                    disabled={updatingRequestId === request.id}
                  >
                    {updatingRequestId === request.id ? (
                      <ActivityIndicator color="#007AFF" />
                    ) : (
                      <Text style={styles.statusButtonText}>
                        {getStatusActionLabel(nextStatus)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
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
  requestLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  customerName: {
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
  actionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
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
  successCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  successMessage: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
});
