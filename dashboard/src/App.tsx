import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function DashboardApp() {
  const [tenantId, setTenantId] = useState<string | null>(null);

  if (!tenantId) {
    return (
      <ErrorBoundary>
        <Login onSuccess={setTenantId} />
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
