import { ProfileProvider, useProfile } from './context/ProfileContext.tsx';
import { OnboardingForm } from './components/OnboardingForm.tsx';

/**
 * Temporary main screen: shows Flow 1 until the user is onboarded,
 * then a minimal profile summary with a reset button (for manual testing).
 */
function AppContent() {
  const { profile, isOnboarded, resetAll } = useProfile();
  if (!isOnboarded) return <OnboardingForm />;
  return (
    <main>
      <h1>Hej {profile?.parentName}</h1>
      <ul>
        {profile?.children.map((c) => (
          <li key={c.id}>{c.name} ({c.riderClass})</li>
        ))}
      </ul>
      <button type="button" data-testid="reset-profile" onClick={resetAll}>Nulstil</button>
    </main>
  );
}

export function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}

export default App;
