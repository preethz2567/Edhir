import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardLayout } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Overview } from './pages/Overview';
import { Traffic } from './pages/Traffic';
import { Campaigns } from './pages/Campaigns';
import { Rules } from './pages/Rules';
import { Honeypot } from './pages/Honeypot';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';



function DashboardApp() {
  const [tenantId, setTenantId] = useState<string | null>(() => {
    return localStorage.getItem('edhirTenantId');
  });
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [onboardingData, setOnboardingData] = useState<{ apiKey: string; integrationMode: string } | null>(null);

  const handleSetTenantId = (id: string | null) => {
    if (id) {
      localStorage.setItem('edhirTenantId', id);
    } else {
      localStorage.removeItem('edhirTenantId');
    }
    setTenantId(id);
  };

  const handleSignupSuccess = async (apiKey: string, integrationMode: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      if (res.ok) {
        const data = await res.json();
        handleSetTenantId(data.tenantId);
        setOnboardingData({ apiKey, integrationMode });
      } else {
        console.error('Auto-login failed', await res.text());
      }
    } catch (err) {
      console.error('Auto-login after signup failed:', err);
    }
  };

  // Unauthenticated — show login or signup
  if (!tenantId) {
    return (
      <ErrorBoundary>
        {authView === 'login' ? (
          <Login
            onSuccess={handleSetTenantId}
            onNavigateToSignup={() => setAuthView('signup')}
          />
        ) : (
          <Signup
            onSuccess={handleSignupSuccess}
            onNavigateToLogin={() => setAuthView('login')}
          />
        )}
      </ErrorBoundary>
    );
  }

  // Just signed up — show onboarding before entering dashboard
  if (onboardingData) {
    return (
      <ErrorBoundary>
        <Onboarding
          apiKey={onboardingData.apiKey}
          integrationMode={onboardingData.integrationMode}
          onComplete={() => setOnboardingData(null)}
        />
      </ErrorBoundary>
    );
  }

  // Authenticated — render protected dashboard routes
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<DashboardLayout tenantId={tenantId} onLogout={() => handleSetTenantId(null)} />}>
          <Route path="overview"  element={<Overview />} />
          <Route path="traffic"   element={<Traffic />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="rules"     element={<Rules />} />
          <Route path="honeypot"  element={<Honeypot />} />
          <Route path="settings"  element={<Settings />} />
          <Route path=""          element={<Navigate to="overview" replace />} />
          <Route path="*"         element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<LandingPage />} />
          <Route path="/app/*" element={<DashboardApp />} />
          <Route path="*"      element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
