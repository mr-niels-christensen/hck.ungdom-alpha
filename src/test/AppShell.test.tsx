import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../App.tsx';
import { STORAGE_KEYS, DEFAULT_CLUB_PIN } from '../constants/config.ts';

/** Seeds localStorage with a verified PIN and a profile, renders App and waits for the shell. */
async function renderOnboarded() {
  localStorage.setItem(STORAGE_KEYS.CLUB_PIN, DEFAULT_CLUB_PIN);
  localStorage.setItem(
    STORAGE_KEYS.PROFILE,
    JSON.stringify({ parentName: 'Mette', children: [{ id: '1', name: 'Sofie', riderClass: 'U15' }] })
  );
  render(<App />);
  await screen.findByTestId('app-shell');
}

describe('AppShell and Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders onboarding and hides shell when user is not onboarded', () => {
    render(<App />);
    expect(screen.getByTestId('onboarding-form')).toBeInTheDocument();
    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profile-modal-close')).not.toBeInTheDocument();
  });

  it('renders shell and navigates between tabs when onboarded', async () => {
    localStorage.setItem(STORAGE_KEYS.CLUB_PIN, DEFAULT_CLUB_PIN);
    localStorage.setItem(
      STORAGE_KEYS.PROFILE,
      JSON.stringify({ parentName: 'Mette', children: [{ id: '1', name: 'Sofie', riderClass: 'U15' }] })
    );

    render(<App />);
    expect(await screen.findByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('shell-profile-btn')).toHaveTextContent('Mette');
    expect(screen.getByTestId('races-placeholder')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nav-tips'));
    expect(screen.getByTestId('tips-placeholder')).toBeInTheDocument();
    expect(window.location.hash).toBe('#/tips');

    fireEvent.click(screen.getByTestId('nav-races'));
    expect(screen.getByTestId('races-placeholder')).toBeInTheDocument();
    expect(window.location.hash).toBe('#/lob');
  });

  describe('profile modal', () => {
    it('opens from the top bar over the active tab and closes with Luk without saving', async () => {
      await renderOnboarded();
      expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('shell-profile-btn'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('races-placeholder')).toBeInTheDocument();
      expect(window.location.hash).toBe('#/lob');

      fireEvent.change(screen.getByTestId('parent-name-input'), { target: { value: 'Jens' } });
      fireEvent.click(screen.getByTestId('profile-modal-close'));
      await waitFor(() => expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument());
      expect(window.location.hash).toBe('#/lob');
      expect(screen.getByTestId('shell-profile-btn')).toHaveTextContent('Mette');
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)!).parentName).toBe('Mette');

      // Reopening shows the stored profile, not the discarded draft
      fireEvent.click(screen.getByTestId('shell-profile-btn'));
      expect(screen.getByTestId('parent-name-input')).toHaveValue('Mette');
    });

    it('closes when the browser back button is used', async () => {
      await renderOnboarded();
      fireEvent.click(screen.getByTestId('shell-profile-btn'));
      expect(screen.getByTestId('profile-modal')).toBeInTheDocument();

      act(() => window.history.back());
      await waitFor(() => expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument());
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });

    it('closes after a successful save and shows the updated name', async () => {
      await renderOnboarded();
      fireEvent.click(screen.getByTestId('shell-profile-btn'));
      fireEvent.change(screen.getByTestId('parent-name-input'), { target: { value: 'Jens' } });
      fireEvent.click(screen.getByTestId('save-profile'));

      await waitFor(() => expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument());
      expect(screen.getByTestId('shell-profile-btn')).toHaveTextContent('Jens');
    });
  });
});
