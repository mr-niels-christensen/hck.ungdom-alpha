import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './context/ProfileContext.tsx';
import { OnboardingForm } from './components/OnboardingForm.tsx';
import { AppShell, RacesPlaceholder, TipsPlaceholder } from './components/layout/AppShell.tsx';

/**
 * Main application routes and authentication gate.
 * Shows Flow 1 (OnboardingForm) when not onboarded, otherwise AppShell with routes.
 */
function AppContent() {
  const { isOnboarded } = useProfile();
  if (!isOnboarded) return <OnboardingForm />;
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/lob" element={<RacesPlaceholder />} />
        <Route path="/tips" element={<TipsPlaceholder />} />
        <Route path="*" element={<Navigate to="/lob" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <ProfileProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ProfileProvider>
  );
}

export default App;
