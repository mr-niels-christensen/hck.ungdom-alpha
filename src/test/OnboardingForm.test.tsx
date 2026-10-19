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

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const submit = () => fireEvent.click(screen.getByTestId('save-profile'));

/** Fills the form with a valid profile (Mette / Sofie U15) and the given PIN. */
const fillValid = (pin: string) => {
  type('Klub-pinkode', pin);
  type('Dit navn (forælder)', ' Mette ');
  type('Rytter 1 navn', 'Sofie');
  type('Rytter 1 klasse', 'U15');
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
    ['a wrong PIN', 'Klub-pinkode', 'forkert'],
    ['a missing parent name', 'Dit navn (forælder)', ''],
    ['no named rider', 'Rytter 1 navn', ''],
  ])('shows an error and saves nothing given %s', async (_case, label, value) => {
    const onSaved = renderForm();
    fillValid(DEFAULT_CLUB_PIN);
    type(label, value);
    submit();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEYS.PROFILE)).toBeNull();
  });

  it('adds and removes rider rows', () => {
    renderForm();
    expect(screen.queryByLabelText('Fjern rytter 1')).toBeNull();
    fireEvent.click(screen.getByTestId('add-rider'));
    type('Rytter 2 navn', 'Mads');
    fireEvent.click(screen.getByLabelText('Fjern rytter 1'));
    expect(screen.getByLabelText('Rytter 1 navn')).toHaveValue('Mads');
    expect(screen.queryByLabelText('Rytter 2 navn')).toBeNull();
  });

  it('hides the PIN field when a valid PIN is stored', async () => {
    localStorage.setItem(STORAGE_KEYS.CLUB_PIN, DEFAULT_CLUB_PIN);
    renderForm();
    await waitFor(() => expect(screen.queryByLabelText('Klub-pinkode')).toBeNull());
  });

  it('hides the PIN field when a valid PIN is given in the URL', async () => {
    window.location.hash = `#/?pin=${DEFAULT_CLUB_PIN}`;
    renderForm();
    await waitFor(() => expect(screen.queryByLabelText('Klub-pinkode')).toBeNull());
  });
});

describe('App onboarding gate', () => {
  beforeEach(() => localStorage.clear());

  it('shows the form, then the main screen after save, and the form again after reset', async () => {
    render(<App />);
    fillValid(DEFAULT_CLUB_PIN);
    submit();
    expect(await screen.findByRole('heading', { name: 'Hej Mette' })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('reset-profile'));
    expect(screen.getByRole('heading', { name: 'Velkommen til HCK Ungdom' })).toBeInTheDocument();
  });
});
