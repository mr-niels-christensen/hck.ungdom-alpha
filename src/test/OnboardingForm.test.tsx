import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.tsx';
import { OnboardingForm } from '../components/OnboardingForm.tsx';
import { ProfileProvider } from '../context/ProfileContext.tsx';
import { DEFAULT_CLUB_PIN, STORAGE_KEYS } from '../constants/config.ts';

const renderForm = (onSaved = vi.fn()) => {
  render(<ProfileProvider><OnboardingForm onSaved={onSaved} /></ProfileProvider>);
  return onSaved;
};

const type = (testId: string, value: string) =>
  fireEvent.change(screen.getByTestId(testId), { target: { value } });

const submit = () => fireEvent.click(screen.getByTestId('save-profile'));

/** Fills the form with a valid profile (Mette / Sofie U15) and the given PIN. */
const fillValid = (pin: string) => {
  type('pin-input', pin);
  type('parent-name-input', ' Mette ');
  type('rider-1-name', 'Sofie');
  type('rider-1-class', 'U15');
};

describe('OnboardingForm (Flow 1)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('saves a valid profile and calls onSaved', async () => {
    const onSaved = renderForm();
    fillValid(DEFAULT_CLUB_PIN);
    submit();
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)!)).toMatchObject({
      parentName: 'Mette',
      children: [{ name: 'Sofie', riderClass: 'U15' }],
    });
  });

  it.each([
    ['a wrong PIN', 'pin-input', 'forkert'],
    ['a missing parent name', 'parent-name-input', ''],
    ['no named rider', 'rider-1-name', ''],
  ])('shows an error and saves nothing given %s', async (_case, testId, value) => {
    const onSaved = renderForm();
    fillValid(DEFAULT_CLUB_PIN);
    type(testId, value);
    submit();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEYS.PROFILE)).toBeNull();
  });

  it('adds and removes rider rows', () => {
    renderForm();
    expect(screen.queryByTestId('rider-1-remove')).toBeNull();
    fireEvent.click(screen.getByTestId('add-rider'));
    type('rider-2-name', 'Mads');
    fireEvent.click(screen.getByTestId('rider-1-remove'));
    expect(screen.getByTestId('rider-1-name')).toHaveValue('Mads');
    expect(screen.queryByTestId('rider-2-name')).toBeNull();
  });

  it('hides the PIN field when a valid PIN is stored', async () => {
    localStorage.setItem(STORAGE_KEYS.CLUB_PIN, DEFAULT_CLUB_PIN);
    renderForm();
    await waitFor(() => expect(screen.queryByTestId('pin-input')).toBeNull());
  });

  it('hides the PIN field when a valid PIN is given in the URL', async () => {
    window.location.hash = `#/?pin=${DEFAULT_CLUB_PIN}`;
    renderForm();
    await waitFor(() => expect(screen.queryByTestId('pin-input')).toBeNull());
  });
});

describe('App onboarding gate', () => {
  beforeEach(() => localStorage.clear());

  it('shows the onboarding form when not onboarded, and shell after save', async () => {
    render(<App />);
    fillValid(DEFAULT_CLUB_PIN);
    submit();
    expect(await screen.findByTestId('app-shell')).toBeInTheDocument();
  });
});
