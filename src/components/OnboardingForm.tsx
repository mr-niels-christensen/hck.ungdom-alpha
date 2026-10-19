import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useProfile } from '../context/ProfileContext.tsx';
import { RIDER_CLASSES } from '../constants/config.ts';
import type { Rider, RiderClass } from '../types/profile.ts';

/** Creates a reasonably unique ID for a new rider row (used as React key). */
const newRiderId = () => `rider-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyRider = (): Rider => ({ id: newRiderId(), name: '', riderClass: 'U11' });

interface OnboardingFormProps {
  onSaved?: () => void;
}

/**
 * Flow 1: Onboarding / profile form.
 * Collects club PIN (only while not yet verified), parent name and a dynamic list
 * of riders, and persists them via ProfileContext. PIN and name are uncontrolled
 * inputs read on submit; only the rider list needs draft state (rows are added/removed).
 * Prefills from an existing profile so the same form works for editing.
 * Calls `onSaved` after a successful save.
 */
export function OnboardingForm({ onSaved }: OnboardingFormProps) {
  const { profile, isPinVerified, saveProfile } = useProfile();
  const [riders, setRiders] = useState<Rider[]>(() =>
    profile?.children.length ? profile.children : [emptyRider()]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateRider = (id: string, patch: Partial<Rider>) =>
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRider = (id: string) => setRiders((prev) => prev.filter((r) => r.id !== id));

  /**
   * Submits the form: delegates validation and persistence to saveProfile,
   * shows the (Danish) error message on failure and calls onSaved on success.
   */
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const pin = data.get('pin');
    const parentName = String(data.get('parentName') ?? '');
    setSaving(true);
    const result = await saveProfile(
      { parentName, children: riders },
      typeof pin === 'string' ? pin : undefined
    );
    setSaving(false);
    if (result.success) {
      setError(null);
      onSaved?.();
    } else {
      setError(result.error ?? 'Noget gik galt. Prøv igen.');
    }
  };

  return (
    <form className="onboarding" onSubmit={handleSubmit} noValidate>
      <h1>Velkommen til HCK Ungdom</h1>

      {!isPinVerified && (
        <>
          <label htmlFor="club-pin">Klub-pinkode</label>
          <input id="club-pin" name="pin" type="password" autoComplete="off" />
        </>
      )}

      <label htmlFor="parent-name">Dit navn (forælder)</label>
      <input
        id="parent-name"
        name="parentName"
        type="text"
        placeholder="F.eks. Mette"
        autoComplete="given-name"
        defaultValue={profile?.parentName ?? ''}
      />

      <fieldset>
        <legend>Dine ryttere i klubben</legend>
        {riders.map((rider, i) => (
          <div className="rider-row" key={rider.id}>
            <input
              aria-label={`Rytter ${i + 1} navn`}
              type="text"
              placeholder="Fornavn"
              value={rider.name}
              onChange={(e) => updateRider(rider.id, { name: e.target.value })}
            />
            <select
              aria-label={`Rytter ${i + 1} klasse`}
              value={rider.riderClass}
              onChange={(e) => updateRider(rider.id, { riderClass: e.target.value as RiderClass })}
            >
              {RIDER_CLASSES.map((c) => (
                <option key={c.value} value={c.value}>{c.value}</option>
              ))}
            </select>
            {riders.length > 1 && (
              <button type="button" aria-label={`Fjern rytter ${i + 1}`} onClick={() => removeRider(rider.id)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          id="add-rider"
          data-testid="add-rider"
          onClick={() => setRiders((prev) => [...prev, emptyRider()])}
        >
          ➕ Tilføj rytter
        </button>
      </fieldset>

      {error && <p role="alert" className="form-error">{error}</p>}

      <button
        type="submit"
        id="save-profile"
        data-testid="save-profile"
        disabled={saving}
      >
        Gem og fortsæt →
      </button>
    </form>
  );
}

export default OnboardingForm;
