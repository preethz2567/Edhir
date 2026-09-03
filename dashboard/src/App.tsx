import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { ErrorBoundary } from './components/ErrorBoundary';

function DashboardApp() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [onboardingData, setOnboardingData] = useState<{apiKey: string, integrationMode: string} | null>(null);

  const handleSignupSuccess = async (apiKey: string, integrationMode: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setTenantId(data.tenantId);
        setOnboardingData({ apiKey, integrationMode });
      } else {
        console.error("Auto-login failed", await res.text());
      }
    } catch (err) {
      console.error("Auto-login after signup failed:", err);
    }
  };

  if (!tenantId) {
    return (
      <ErrorBoundary>
        {authView === 'login' ? (
          <Login 
            onSuccess={setTenantId} 
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

  return (
    <ErrorBoundary>
      <Dashboard tenantId={tenantId} onLogout={() => setTenantId(null)} />
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<DashboardApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
