export type ContractorSpecialty =
  | 'Framing'
  | 'Concrete'
  | 'Plumbing'
  | 'Electrical';

export type PropertyType = 'Land' | 'House' | 'Industrial';

export type PropertyStatus = 'For Sale' | 'For Rent';

export interface Contractor {
  id: string;
  name: string;
  specialty: ContractorSpecialty;
  rating: number;
  reviews: number;
  rate: string;
  completedProjects: number;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  price: string;
  location: string;
  size: string;
}
