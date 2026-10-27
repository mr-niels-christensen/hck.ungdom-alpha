import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../App.tsx';
import { STORAGE_KEYS, DEFAULT_CLUB_PIN } from '../constants/config.ts';

describe('AppShell and Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders onboarding and hides shell when user is not onboarded', () => {
    render(<App />);
    expect(screen.getByTestId('onboarding-form')).toBeInTheDocument();
    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument();
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
});
