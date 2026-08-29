import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  getQuoteResponseForRequest,
  type QuoteResponse,
} from '@/lib/quote-responses';

type QuoteResponseCardProps = {
  requestId: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unable to load the contractor response.';
}

export function QuoteResponseCard({ requestId }: QuoteResponseCardProps) {
  const [response, setResponse] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadResponse = async () => {
      setLoading(true);
      setError('');

      try {
        const existing = await getQuoteResponseForRequest(requestId);
        if (mounted) setResponse(existing);
      } catch (loadError) {
        if (mounted) setError(errorMessage(loadError));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadResponse();

    return () => {
      mounted = false;
    };
  }, [requestId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#007AFF" />
        <Text style={styles.mutedText}>Checking for contractor response…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!response) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Contractor response</Text>
        <Text style={styles.mutedText}>No contractor response yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contractor response</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Proposed price</Text>
        <Text style={styles.priceValue}>${response.proposedPrice.toFixed(2)}</Text>
      </View>
      <Text style={styles.label}>Estimated timeline</Text>
      <Text style={styles.value}>{response.timeline}</Text>
      <Text style={styles.label}>Message</Text>
      <Text style={styles.value}>{response.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  title: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: '700',
  },
  priceValue: {
    color: '#1E3A8A',
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: '#4A5568',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  value: {
    color: '#2D3748',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 3,
  },
  mutedText: {
    color: '#718096',
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 19,
  },
});
