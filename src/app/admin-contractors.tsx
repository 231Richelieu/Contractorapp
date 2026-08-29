import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createAdminContractor,
  getAdminContractors,
  getApprovedAdminStatus,
  setContractorPublished,
  updateAdminContractor,
  type AdminContractor,
  type AdminContractorInput,
} from '@/lib/admin-contractors';
import { supabase } from '@/lib/supabase';

type FormState = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  reviews: string;
  rate: string;
  completedProjects: string;
  description: string;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  id: '',
  name: '',
  specialty: '',
  rating: '0',
  reviews: '0',
  rate: '',
  completedProjects: '0',
  description: '',
  isPublished: false,
};

function toFormState(contractor: AdminContractor): FormState {
  return {
    id: contractor.id,
    name: contractor.name,
    specialty: contractor.specialty,
    rating: String(contractor.rating),
    reviews: String(contractor.reviews),
    rate: contractor.rate,
    completedProjects: String(contractor.completedProjects),
    description: contractor.description,
    isPublished: contractor.isPublished,
  };
}

function parseForm(form: FormState):
  | { input: AdminContractorInput }
  | { error: string } {
  const id = form.id.trim();
  const name = form.name.trim();
  const specialty = form.specialty.trim();
  const rate = form.rate.trim();
  const description = form.description.trim();
  const rating = Number(form.rating);
  const reviews = Number(form.reviews);
  const completedProjects = Number(form.completedProjects);

  if (!id) return { error: 'Enter a unique contractor ID.' };
  if (!name) return { error: 'Enter the contractor name.' };
  if (!specialty) return { error: 'Enter a specialty.' };
  if (!rate) return { error: 'Enter a rate, such as $25/hr.' };
  if (!description) return { error: 'Enter a short description.' };

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { error: 'Rating must be a number from 0 to 5.' };
  }

  if (!Number.isInteger(reviews) || reviews < 0) {
    return { error: 'Reviews must be a whole number of 0 or more.' };
  }

  if (!Number.isInteger(completedProjects) || completedProjects < 0) {
    return { error: 'Completed projects must be a whole number of 0 or more.' };
  }

  return {
    input: {
      id,
      name,
      specialty,
      rating,
      reviews,
      rate,
      completedProjects,
      description,
      isPublished: form.isPublished,
    },
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function AdminContractorsScreen() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [contractors, setContractors] = useState<AdminContractor[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user) {
        setIsAdmin(false);
        router.replace('/login');
        return;
      }

      const approved = await getApprovedAdminStatus();
      setIsAdmin(approved);

      if (!approved) {
        setContractors([]);
        return;
      }

      setContractors(await getAdminContractors());
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const startEdit = (contractor: AdminContractor) => {
    setEditingId(contractor.id);
    setForm(toFormState(contractor));
    setFormError('');
  };

  const handleSave = async () => {
    if (!isAdmin || saving) return;

    const parsed = parseForm(form);
    if ('error' in parsed) {
      setFormError(parsed.error);
      return;
    }

    setSaving(true);
    setFormError('');
    setError('');

    try {
      if (editingId) {
        await updateAdminContractor(editingId, parsed.input);
        Alert.alert('Listing updated', `${parsed.input.name} was updated successfully.`);
      } else {
        await createAdminContractor(parsed.input);
        Alert.alert('Listing created', `${parsed.input.name} was added to the catalog.`);
      }

      startCreate();
      await loadData(true);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (contractor: AdminContractor) => {
    if (!isAdmin || busyId) return;

    setBusyId(contractor.id);
    setError('');

    try {
      const updated = await setContractorPublished(
        contractor.id,
        !contractor.isPublished,
      );
      setContractors((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (toggleError) {
      setError(errorMessage(toggleError));
    } finally {
      setBusyId(null);
    }
  };

  const renderContractor = ({ item }: { item: AdminContractor }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            ID {item.id} · {item.specialty}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.isPublished ? styles.publishedBadge : styles.unpublishedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.isPublished ? 'Published' : 'Unpublished'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>{item.description}</Text>
      <Text style={styles.cardMeta}>
        Rating {item.rating.toFixed(1)} · {item.reviews} reviews · {item.rate}
      </Text>
      <Text style={styles.cardMeta}>
        {item.completedProjects} completed projects
      </Text>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => startEdit(item)}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => void handleTogglePublished(item)}
          disabled={busyId === item.id}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            busyId === item.id && styles.disabledButton,
          ]}
        >
          {busyId === item.id ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {item.isPublished ? 'Unpublish' : 'Publish'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  if (loading && isAdmin === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.mutedText}>Checking admin access…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isAdmin !== true) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Admin access required</Text>
          <Text style={styles.mutedText}>
            This screen is available only to an approved admin account.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={contractors}
          keyExtractor={(item) => item.id}
          renderItem={renderContractor}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadData(true)}
            />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Admin Catalog</Text>
                  <Text style={styles.mutedText}>
                    Add, edit, publish, or unpublish contractor listings.
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.replace('/')}
                  style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
                >
                  <Text style={styles.linkButtonText}>Home</Text>
                </Pressable>
              </View>

              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.sectionTitle}>
                    {editingId ? `Edit listing ${editingId}` : 'Add contractor'}
                  </Text>
                  {editingId ? (
                    <Pressable
                      onPress={startCreate}
                      style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.linkButtonText}>Cancel edit</Text>
                    </Pressable>
                  ) : null}
                </View>

                <Text style={styles.label}>Contractor ID</Text>
                <TextInput
                  value={form.id}
                  onChangeText={(value) => setForm((current) => ({ ...current, id: value }))}
                  placeholder="Example: 5"
                  placeholderTextColor="#8A94A6"
                  style={[styles.input, editingId && styles.readOnlyInput]}
                  editable={!editingId}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
                  placeholder="Contractor or company name"
                  placeholderTextColor="#8A94A6"
                  style={styles.input}
                />

                <Text style={styles.label}>Specialty</Text>
                <TextInput
                  value={form.specialty}
                  onChangeText={(value) => setForm((current) => ({ ...current, specialty: value }))}
                  placeholder="Example: Plumbing"
                  placeholderTextColor="#8A94A6"
                  style={styles.input}
                />

                <View style={styles.twoColumnRow}>
                  <View style={styles.halfColumn}>
                    <Text style={styles.label}>Rating (0–5)</Text>
                    <TextInput
                      value={form.rating}
                      onChangeText={(value) => setForm((current) => ({ ...current, rating: value }))}
                      placeholder="0"
                      placeholderTextColor="#8A94A6"
                      style={styles.input}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.halfColumn}>
                    <Text style={styles.label}>Reviews</Text>
                    <TextInput
                      value={form.reviews}
                      onChangeText={(value) => setForm((current) => ({ ...current, reviews: value }))}
                      placeholder="0"
                      placeholderTextColor="#8A94A6"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.halfColumn}>
                    <Text style={styles.label}>Rate</Text>
                    <TextInput
                      value={form.rate}
                      onChangeText={(value) => setForm((current) => ({ ...current, rate: value }))}
                      placeholder="$25/hr"
                      placeholderTextColor="#8A94A6"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.halfColumn}>
                    <Text style={styles.label}>Completed projects</Text>
                    <TextInput
                      value={form.completedProjects}
                      onChangeText={(value) => setForm((current) => ({ ...current, completedProjects: value }))}
                      placeholder="0"
                      placeholderTextColor="#8A94A6"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
                  placeholder="Describe the contractor’s services"
                  placeholderTextColor="#8A94A6"
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.switchRow}>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.label}>Published</Text>
                    <Text style={styles.smallText}>
                      Published listings appear in the public contractor catalog.
                    </Text>
                  </View>
                  <Switch
                    value={form.isPublished}
                    onValueChange={(value) => setForm((current) => ({ ...current, isPublished: value }))}
                  />
                </View>

                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                <Pressable
                  onPress={() => void handleSave()}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.fullButton,
                    pressed && styles.pressed,
                    saving && styles.disabledButton,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {editingId ? 'Save changes' : 'Create listing'}
                    </Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.catalogHeader}>
                <Text style={styles.sectionTitle}>All listings</Text>
                <Text style={styles.smallText}>{contractors.length} total</Text>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {!contractors.length ? (
                <Text style={styles.mutedText}>
                  No listings found. Use the form above to create the first one.
                </Text>
              ) : null}
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#1A202C',
    fontSize: 28,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#1A202C',
    fontSize: 19,
    fontWeight: '800',
  },
  mutedText: {
    color: '#718096',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  smallText: {
    color: '#718096',
    fontSize: 12,
    lineHeight: 18,
  },
  linkButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  formHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#2D3748',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderColor: '#CBD5E0',
    borderRadius: 10,
    borderWidth: 1,
    color: '#1A202C',
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readOnlyInput: {
    backgroundColor: '#EDF2F7',
    color: '#718096',
  },
  multilineInput: {
    minHeight: 96,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfColumn: {
    flex: 1,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullButton: {
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#007AFF',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
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
  catalogHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    color: '#1A202C',
    fontSize: 17,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#718096',
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  publishedBadge: {
    backgroundColor: '#DCFCE7',
  },
  unpublishedBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    color: '#2D3748',
    fontSize: 11,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#2D3748',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  cardMeta: {
    color: '#718096',
    fontSize: 13,
    marginTop: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
});
