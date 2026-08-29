import { supabase } from '@/lib/supabase';

// Update for src/lib/contractors.ts

export type Contractor = {
  id: string;
  external_id: string; // Add this new field
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  rate: string;
  completedProjects: number;
  description: string;
  is_published: boolean;
};

export const getPublishedContractors = async (): Promise<Contractor[]> => {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('is_published', true)
    .order('name');

  if (error) {
    console.error('Error fetching contractors:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    completedProjects: item.completed_projects,
  }));
};

export const getPublishedContractorByExternalId = async (externalId: string): Promise<Contractor | null> => {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('external_id', externalId) // Use external_id instead of id
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching contractor by external ID:', error);
    return null;
  }

  return {
    ...data,
    completedProjects: data.completed_projects,
  };
};
