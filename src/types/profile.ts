export type RiderClass = 'U9' | 'U11' | 'U13' | 'U15' | 'U17' | 'U19';

export interface Rider {
  id: string; // Stable unique ID used for React list keys and dynamic form manipulation
  name: string;
  riderClass: RiderClass;
}

export interface UserProfile {
  parentName: string;
  children: Rider[];
}

export interface TestPersona {
  id: string;
  label: string;
  description: string;
  profile: UserProfile;
}
