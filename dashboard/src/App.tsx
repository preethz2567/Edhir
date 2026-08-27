import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
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

export default App;
