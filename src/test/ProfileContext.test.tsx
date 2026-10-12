import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ProfileProvider, useProfile } from '../context/ProfileContext.tsx';
import { DEFAULT_CLUB_PIN } from '../constants/config.ts';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProfileProvider>{children}</ProfileProvider>
);

describe('ProfileContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with non-onboarded state when storage is empty', () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current.profile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);
  });

  it('fails to save profile if pin is missing or invalid', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    let saveRes: { success: boolean; error?: string } | undefined;
    await act(async () => {
      saveRes = await result.current.saveProfile({
        parentName: 'Mette',
        children: [{ id: '1', name: 'Sofie', riderClass: 'U15' }],
      });
    });

    expect(saveRes?.success).toBe(false);
    expect(result.current.isOnboarded).toBe(false);

    let invalidPinRes: { success: boolean; error?: string } | undefined;
    await act(async () => {
      invalidPinRes = await result.current.saveProfile(
        {
          parentName: 'Mette',
          children: [{ id: '1', name: 'Sofie', riderClass: 'U15' }],
        },
        'wrong-pin'
      );
    });

    expect(invalidPinRes?.success).toBe(false);
    expect(result.current.isOnboarded).toBe(false);
  });

  it('saves profile successfully with valid PIN and valid data, and can reset', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    let saveRes: { success: boolean; error?: string } | undefined;
    await act(async () => {
      saveRes = await result.current.saveProfile(
        {
          parentName: 'Mette',
          children: [{ id: '1', name: 'Sofie', riderClass: 'U15' }],
        },
        DEFAULT_CLUB_PIN
      );
    });

    expect(saveRes).toEqual({ success: true });
    expect(result.current.isOnboarded).toBe(true);
    expect(result.current.profile?.parentName).toBe('Mette');
    expect(result.current.profile?.children).toHaveLength(1);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);
  });
});
