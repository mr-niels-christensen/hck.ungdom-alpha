import type { RiderClass, TestPersona } from '../types/profile.ts';

export const DEFAULT_CLUB_PIN = (import.meta.env.VITE_CLUB_PIN || 'hck2026').trim().toLowerCase();

export const STORAGE_KEYS = {
  PROFILE: 'hck_profile_v1',
  CLUB_PIN: 'hck_club_pin_v1',
} as const;

export const RIDER_CLASSES: { value: RiderClass; label: string }[] = [
  { value: 'U11', label: 'U11 (Under 11 år)' },
  { value: 'U13', label: 'U13 (Under 13 år)' },
  { value: 'U15', label: 'U15 (Under 15 år)' },
  { value: 'U17', label: 'U17 (Under 17 år)' },
  { value: 'U19', label: 'U19 (Junior)' },
  { value: 'U9', label: 'U9 (Under 9 år)' },
];

export const TEST_PERSONAS: TestPersona[] = [
  {
    id: 'mette',
    label: 'Mette',
    description: '2 ryttere: Sofie (U15) & Mads (U11)',
    profile: {
      parentName: 'Mette',
      children: [
        { id: 'sofie-1', name: 'Sofie', riderClass: 'U15' },
        { id: 'mads-1', name: 'Mads', riderClass: 'U11' },
      ],
    },
  },
  {
    id: 'thomas',
    label: 'Thomas',
    description: '1 rytter: Emil (U11)',
    profile: {
      parentName: 'Thomas',
      children: [
        { id: 'emil-1', name: 'Emil', riderClass: 'U11' },
      ],
    },
  },
  {
    id: 'henrik',
    label: 'Henrik',
    description: '1 rytter: Lucas (U17)',
    profile: {
      parentName: 'Henrik',
      children: [
        { id: 'lucas-1', name: 'Lucas', riderClass: 'U17' },
      ],
    },
  },
];
