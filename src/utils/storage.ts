import { STORAGE_KEYS } from '../constants/config.ts';
import type { UserProfile, Rider } from '../types/profile.ts';

/**
 * Retrieves and validates the user profile from localStorage.
 * Returns null if no profile exists or if the stored JSON is corrupted/invalid.
 */
export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.parentName === 'string' &&
      Array.isArray(parsed.children)
    ) {
      // Validate children structure
      const validChildren = parsed.children.filter(
        (c: unknown): c is Rider =>
          Boolean(c) &&
          typeof c === 'object' &&
          typeof (c as Rider).name === 'string' &&
          typeof (c as Rider).riderClass === 'string'
      );
      return {
        parentName: parsed.parentName.trim(),
        children: validChildren,
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to load profile from localStorage:', err);
    return null;
  }
}

/**
 * Serializes and saves the user profile to localStorage.
 */
export function setStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
  }
}

/**
 * Removes the stored user profile from localStorage.
 */
export function removeStoredProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } catch (err) {
    console.warn('Failed to remove profile from localStorage:', err);
  }
}

/**
 * Retrieves the stored club PIN from localStorage.
 */
export function getStoredPin(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CLUB_PIN);
  } catch (err) {
    console.warn('Failed to read club PIN from localStorage:', err);
    return null;
  }
}

/**
 * Stores the club PIN in localStorage.
 */
export function setStoredPin(pin: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLUB_PIN, pin.trim());
  } catch (err) {
    console.error('Failed to save club PIN to localStorage:', err);
  }
}

/**
 * Removes the stored club PIN from localStorage.
 */
export function removeStoredPin(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CLUB_PIN);
  } catch (err) {
    console.warn('Failed to remove club PIN from localStorage:', err);
  }
}

/**
 * Clears all local application state (profile and stored club PIN).
 */
export function clearAllLocalState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CLUB_PIN);
  } catch (err) {
    console.warn('Failed to clear local state from localStorage:', err);
  }
}
