export interface FormData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  nationalId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    smokingPreference: 'smoking' | 'non-smoking' | 'no-preference';
    dietaryRestrictions: string;
    accessibilityNeeds: string;
  };
}

export const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  nationality: '',
  nationalId: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
  },
  preferences: {
    smokingPreference: 'no-preference',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
  },
};

export const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'France',
  'Germany',
  'Spain',
  'Italy',
  'Japan',
  'Australia',
  'Brazil',
  'Mexico',
  'India',
  'China',
  'South Korea',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
];

export const relationships = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Partner',
  'Other',
];
