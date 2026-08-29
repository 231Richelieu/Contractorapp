import { supabase } from '@/lib/supabase';

const ADMIN_CONTRACTOR_COLUMNS =
  'id, name, specialty, rating, reviews, rate, completed_projects, description, is_published, created_at, updated_at';

export type AdminContractor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  rate: string;
  completedProjects: number;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type ContractorRow = {
  id: string;
  name: string;
  specialty: string;
  rating: number | string | null;
  reviews: number | string | null;
  rate: string | number | null;
  completed_projects: number | string | null;
  description: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
};

export type AdminContractorInput = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  rate: string;
  completedProjects: number;
  description: string;
  isPublished: boolean;
};

export type AdminContractorUpdate = Omit<AdminContractorInput, 'id'>;

function mapContractor(row: ContractorRow): AdminContractor {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    rate: String(row.rate ?? ''),
    completedProjects: Number(row.completed_projects ?? 0),
    description: row.description ?? '',
    isPublished: row.is_published === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getApprovedAdminStatus(): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('approved')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.approved === true;
}

export async function getAdminContractors(): Promise<AdminContractor[]> {
  const { data, error } = await supabase
    .from('contractors')
    .select(ADMIN_CONTRACTOR_COLUMNS)
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ContractorRow[]).map(mapContractor);
}

export async function createAdminContractor(
  input: AdminContractorInput,
): Promise<AdminContractor> {
  const { data, error } = await supabase
    .from('contractors')
    .insert({
      id: input.id.trim(),
      name: input.name.trim(),
      specialty: input.specialty.trim(),
      rating: input.rating,
      reviews: input.reviews,
      rate: input.rate.trim(),
      completed_projects: input.completedProjects,
      description: input.description.trim(),
      is_published: input.isPublished,
    })
    .select(ADMIN_CONTRACTOR_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapContractor(data as ContractorRow);
}

export async function updateAdminContractor(
  id: string,
  input: AdminContractorUpdate,
): Promise<AdminContractor> {
  const { data, error } = await supabase
    .from('contractors')
    .update({
      name: input.name.trim(),
      specialty: input.specialty.trim(),
      rating: input.rating,
      reviews: input.reviews,
      rate: input.rate.trim(),
      completed_projects: input.completedProjects,
      description: input.description.trim(),
      is_published: input.isPublished,
    })
    .eq('id', id)
    .select(ADMIN_CONTRACTOR_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapContractor(data as ContractorRow);
}

export async function setContractorPublished(
  id: string,
  isPublished: boolean,
): Promise<AdminContractor> {
  const { data, error } = await supabase
    .from('contractors')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select(ADMIN_CONTRACTOR_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapContractor(data as ContractorRow);
}
