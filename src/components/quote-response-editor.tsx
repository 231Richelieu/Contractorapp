import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getQuoteResponseForRequest,
  saveQuoteResponse,
  type QuoteResponse,
} from '@/lib/quote-responses';

type QuoteResponseEditorProps = {
  requestId: string;
  contractorId: string;
  requestStatus: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function QuoteResponseEditor({
  requestId,
  contractorId,
  requestStatus,
}: QuoteResponseEditorProps) {
  const [response, setResponse] = useState<QuoteResponse | null>(null);
  const [price, setPrice] = useState('');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canRespond = ['pending', 'reviewed', 'accepted'].includes(requestStatus);

  useEffect(() => {
    let mounted = true;

    const loadResponse = async () => {
      setLoading(true);
      setError('');

      try {
        const existing = await getQuoteResponseForRequest(requestId);
        if (!mounted) return;

        setResponse(existing);
        setPrice(existing ? String(existing.proposedPrice) : '');
        setTimeline(existing?.timeline ?? '');
        setMessage(existing?.message ?? '');
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

  const handleSave = async () => {
    if (saving || !canRespond) return;

    const proposedPrice = Number(price);
    const trimmedTimeline = timeline.trim();
    const trimmedMessage = message.trim();

    if (!price.trim() || !Number.isFinite(proposedPrice) || proposedPrice < 0) {
      setError('Enter a valid proposed price of 0 or more.');
      return;
    }

    if (!trimmedTimeline || trimmedTimeline.length > 120) {
      setError('Enter a timeline between 1 and 120 characters.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length > 2000) {
      setError('Enter a message between 1 and 2,000 characters.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const saved = await saveQuoteResponse({
        quoteRequestId: requestId,
        contractorId,
        proposedPrice,
        timeline: trimmedTimeline,
        message: trimmedMessage,
      });
      setResponse(saved);
      setPrice(String(saved.proposedPrice));
      setTimeline(saved.timeline);
      setMessage(saved.message);
      setSuccess('Quote response saved.');
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#007AFF" />
        <Text style={styles.mutedText}>Loading quote response…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {response ? 'Your quote response' : 'Send a quote response'}
      </Text>

      {!canRespond ? (
        <Text style={styles.mutedText}>
          This request is {requestStatus} and can no longer receive a response.
        </Text>
      ) : (
        <>
          <Text style={styles.label}>Proposed price</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Example: 5000"
            placeholderTextColor="#8A94A6"
            style={styles.input}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Estimated timeline</Text>
          <TextInput
            value={timeline}
            onChangeText={setTimeline}
            placeholder="Example: 3 weeks"
            placeholderTextColor="#8A94A6"
            style={styles.input}
            maxLength={120}
          />

          <Text style={styles.label}>Message to customer</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Explain what your quote includes"
            placeholderTextColor="#8A94A6"
            style={[styles.input, styles.messageInput]}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />

          <Text style={styles.counter}>{message.length}/2000 characters</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <Pressable
            onPress={() => void handleSave()}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressed,
              saving && styles.disabledButton,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {response ? 'Update quote response' : 'Send quote response'}
              </Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E0',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  title: {
    color: '#1A202C',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  mutedText: {
    color: '#718096',
    fontSize: 13,
    lineHeight: 19,
  },
  label: {
    color: '#2D3748',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E0',
    borderRadius: 9,
    borderWidth: 1,
    color: '#1A202C',
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  messageInput: {
    minHeight: 90,
  },
  counter: {
    color: '#718096',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 9,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
  successText: {
    color: '#15803D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
});
