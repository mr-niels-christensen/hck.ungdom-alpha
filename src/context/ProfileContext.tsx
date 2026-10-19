import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/profile.ts';
import { verifyClubPin } from '../services/pinService.ts';
import {
  getStoredProfile,
  setStoredProfile,
  getStoredPin,
  setStoredPin,
  removeStoredPin,
  clearAllLocalState,
} from '../utils/storage.ts';
import { getUrlParam } from '../utils/urlParams.ts';

interface ProfileContextType {
  profile: UserProfile | null;
  isPinVerified: boolean;
  isOnboarded: boolean;
  saveProfile: (
    newProfile: UserProfile,
    pinInput?: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetAll: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => getStoredProfile());
  const [isPinVerified, setIsPinVerifiedState] = useState<boolean>(false);

  // Check URL params for pin
  const initialPin = getUrlParam('pin') || '';

  /**
   * Validates the provided PIN against the PIN service and updates storage and state.
   * If invalid, cleans up any previously stored PIN.
   */
  const verifyPin = async (pinInput: string): Promise<boolean> => {
    const isValid = await verifyClubPin(pinInput);
    if (isValid) {
      setStoredPin(pinInput);
      setIsPinVerifiedState(true);
    } else {
      removeStoredPin();
      setIsPinVerifiedState(false);
    }
    return isValid;
  };

  // Verify PIN asynchronously on mount (from URL or existing storage)
  useEffect(() => {
    const pinToCheck = initialPin || getStoredPin();
    if (pinToCheck) {
      void verifyPin(pinToCheck);
    }
  }, [initialPin]);

  /**
   * Validates and saves the user profile and optional PIN to storage and context state.
   */
  const saveProfile = async (
    newProfile: UserProfile,
    pinInput?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. PIN verification check
    if (!isPinVerified) {
      if (!pinInput) {
        return { success: false, error: 'Klub-pinkoden er påkrævet.' };
      }
      const isValid = await verifyPin(pinInput);
      if (!isValid) {
        return { success: false, error: 'Klub-pinkoden er ikke korrekt. Kontakt klubbens tovholder.' };
      }
    }

    // 2. Validate parent name
    const cleanParentName = newProfile.parentName.trim();
    if (!cleanParentName) {
      return { success: false, error: 'Indtast venligst dit fornavn som forælder.' };
    }

    // 3. Validate children
    const validChildren = newProfile.children
      .map((child) => ({
        ...child,
        name: child.name.trim(),
      }))
      .filter((child) => child.name.length > 0);

    if (validChildren.length === 0) {
      return { success: false, error: 'Tilføj mindst én rytter med navn og klasse.' };
    }

    const cleanedProfile: UserProfile = {
      parentName: cleanParentName,
      children: validChildren,
    };

    setStoredProfile(cleanedProfile);
    setProfileState(cleanedProfile);
    return { success: true };
  };

  const resetAll = () => {
    clearAllLocalState();
    setProfileState(null);
    setIsPinVerifiedState(false);
  };

  const isOnboarded = Boolean(
    isPinVerified &&
    profile &&
    profile.parentName.trim().length > 0 &&
    profile.children.length > 0
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isPinVerified,
        isOnboarded,
        saveProfile,
        resetAll,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Custom hook to access the ProfileContext.
 * Throws an error if used outside a ProfileProvider.
 */
export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
