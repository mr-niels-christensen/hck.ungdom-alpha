import { NavLink, Outlet } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext.tsx';

/** Temporary placeholder for Flow 2 (Race Schedule). */
export const RacesPlaceholder = () => (
  <section data-testid="races-placeholder">
    <h2>🏁 Løbsplan</h2>
    <p>Løbsoverblik og tilkendegivelser kommer snart.</p>
  </section>
);

/** Temporary placeholder for Flow 4 (Tips & Tricks). */
export const TipsPlaceholder = () => (
  <section data-testid="tips-placeholder">
    <h2>💡 Tips&amp;tricks</h2>
    <p>Videndeling og forældrehåndbog kommer snart.</p>
  </section>
);

/**
 * AppShell renders the main application layout for onboarded users:
 * Top bar with club title and parent name, route outlet, and fixed bottom navigation.
 */
export function AppShell({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const { profile } = useProfile();
  return (
    <div className="shell-container" data-testid="app-shell">
      <header className="shell-header" data-testid="shell-header">
        <span className="shell-club-title">HCK Ungdom</span>
        <button type="button" className="shell-profile-btn" data-testid="shell-profile-btn" onClick={onOpenProfile} aria-label="Rediger profil">
          👤 {profile?.parentName} ✏️
        </button>
      </header>
      <main className="shell-content"><Outlet /></main>
      <nav className="shell-nav" aria-label="Hovednavigation" data-testid="shell-nav">
        <NavLink to="/lob" className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`} data-testid="nav-races">🏁 Løbsplan</NavLink>
        <NavLink to="/tips" className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`} data-testid="nav-tips">💡 Tips&amp;tricks</NavLink>
      </nav>
    </div>
  );
}
