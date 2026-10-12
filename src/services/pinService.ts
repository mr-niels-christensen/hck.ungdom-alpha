import { DEFAULT_CLUB_PIN } from '../constants/config.ts';

/**
 * Validates the entered club PIN.
 * Currently performs a local comparison against DEFAULT_CLUB_PIN.
 * Designed as an asynchronous function to allow seamless replacement with
 * a backend verification call (e.g. Supabase RPC or edge function).
 *
 * @param enteredPin - The PIN string entered by the user or read from storage/URL
 * @returns Promise resolving to true if PIN is valid, false otherwise
 */
export async function verifyClubPin(enteredPin: string): Promise<boolean> {
  if (!enteredPin) return false;
  const cleaned = enteredPin.trim().toLowerCase();
  return cleaned === DEFAULT_CLUB_PIN;
}
