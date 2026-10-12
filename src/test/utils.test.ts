import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredProfile,
  setStoredProfile,
  getStoredPin,
  setStoredPin,
  removeStoredPin,
  clearAllLocalState,
} from '../utils/storage.ts';
import { verifyClubPin } from '../services/pinService.ts';
import { getUrlParam } from '../utils/urlParams.ts';
import { STORAGE_KEYS, DEFAULT_CLUB_PIN } from '../constants/config.ts';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no profile is stored', () => {
    expect(getStoredProfile()).toBeNull();
  });

  it('saves and reads valid profile', () => {
    const profile = {
      parentName: 'Mette',
      children: [
        { id: '1', name: 'Sofie', riderClass: 'U15' as const },
        { id: '2', name: 'Mads', riderClass: 'U11' as const },
      ],
    };
    setStoredProfile(profile);
    expect(getStoredProfile()).toEqual(profile);
  });

  it('handles corrupted profile in localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, 'invalid json {[');
    expect(getStoredProfile()).toBeNull();

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({ parentName: 123 }));
    expect(getStoredProfile()).toBeNull();
  });

  it('handles stored club PIN state', () => {
    expect(getStoredPin()).toBeNull();
    setStoredPin('hck2026');
    expect(getStoredPin()).toBe('hck2026');
    removeStoredPin();
    expect(getStoredPin()).toBeNull();
  });

  it('clears all local state', () => {
    setStoredProfile({ parentName: 'Test', children: [] });
    setStoredPin('hck2026');
    clearAllLocalState();
    expect(getStoredProfile()).toBeNull();
    expect(getStoredPin()).toBeNull();
  });
});

describe('pinService', () => {
  it('validates correct club pin asynchronously', async () => {
    expect(await verifyClubPin(DEFAULT_CLUB_PIN)).toBe(true);
    expect(await verifyClubPin('HCK2026')).toBe(true);
    expect(await verifyClubPin('  hck2026  ')).toBe(true);
  });

  it('rejects invalid or empty pins', async () => {
    expect(await verifyClubPin('wrong')).toBe(false);
    expect(await verifyClubPin('')).toBe(false);
  });
});

describe('urlParams utils', () => {
  it('extracts param from search', () => {
    expect(getUrlParam('pin', 'https://example.com/?pin=1234')).toBe('1234');
  });

  it('extracts param from hash query', () => {
    expect(getUrlParam('pin', 'https://example.com/#/?pin=hck2026')).toBe('hck2026');
    expect(getUrlParam('pin', 'https://example.com/#/lob?pin=secret')).toBe('secret');
  });

  it('returns null when param is absent', () => {
    expect(getUrlParam('pin', 'https://example.com/#/lob')).toBeNull();
  });
});
