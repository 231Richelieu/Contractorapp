import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  getPublishedContractorByExternalId,

  type Contractor,
} from '@/lib/contractors';
import { supabase } from '@/lib/supabase';

export default function QuoteRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contractorId = Array.isArray(id) ? id[0] : id;

  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loadingContractor, setLoadingContractor] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadContractor = useCallback(async () => {
    if (!contractorId) {
      setLoadError('No contractor was selected.');
      setLoadingContractor(false);
      return;
    }

    setLoadingContractor(true);
    setLoadError('');

    try {
      const publishedContractor = await getPublishedContractorByExternalId(contractorId);

      if (!publishedContractor) {
        setContractor(null);
        setLoadError('This contractor listing is not available.');
        return;
      }

      setContractor(publishedContractor);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load this contractor right now.',
      );
    } finally {
      setLoadingContractor(false);
    }
  }, [contractorId]);

  useEffect(() => {
    void loadContractor();
  }, [loadContractor]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = projectDescription.trim();
    const trimmedBudget = budget.trim();
    const numericBudget = Number(trimmedBudget.replace(/[^0-9.]/g, ''));

    setFormError('');

    if (!trimmedName) {
      setFormError('Please enter your name.');
      return;
    }

    if (trimmedDescription.length < 20) {
      setFormError(
        'Please describe your project in at least 20 characters.',
      );
      return;
    }

    if (!trimmedBudget || !Number.isFinite(numericBudget)) {
      setFormError('Please enter a valid estimated budget.');
      return;
    }

    if (!contractor) {
      setFormError('This contractor listing is no longer available.');
      return;
    }

    setSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setSaving(false);
      setFormError('Please sign in before submitting a quote request.');
      return;
    }

    const { error: insertError } = await supabase
      .from('quote_requests')
      .insert({
        user_id: userData.user.id,
        contractor_id: contractor.id,
        customer_name: trimmedName,
        project_description: trimmedDescription,
        budget: numericBudget,
      });

    setSaving(false);

    if (insertError) {
      setFormError(
        `We could not save your request. ${insertError.message}`,
      );
      return;
    }

    setSubmitted(true);
  };

  if (loadingContractor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contractor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contractor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorTitle}>Contractor unavailable</Text>
          <Text style={styles.errorMessage}>{loadError}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>OK</Text>
          </View>
          <Text style={styles.successTitle}>Request saved</Text>
          <Text style={styles.successMessage}>
            Your quote request for {contractor.name} was saved successfully.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Return to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back to profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Request a Quote</Text>
        <Text style={styles.subtitle}>
          Send project details to {contractor.name}.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Project description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={projectDescription}
            onChangeText={setProjectDescription}
            placeholder="Describe the work you need done"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Estimated budget</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder="Example: 5000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={() => void handleSubmit()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit Request</Text>
            )}
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 120,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#B91C1C',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  successIconText: {
    color: '#15803D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 12,
  },
});
