import React, { useState } from 'react';
import { Check, Copy, AlertTriangle } from 'lucide-react';

interface OnboardingProps {
  apiKey: string;
  integrationMode: string;
  onComplete: () => void;
}

export function Onboarding({ apiKey, integrationMode, onComplete }: OnboardingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="content-wrapper">
      <div className="content-inner" style={{ maxWidth: '800px', marginTop: '2rem' }}>
        <div className="solid-card" style={{ marginBottom: '2rem' }}>
          <div className="section-header-wrap">
            <h1 className="dashboard-title text-center" style={{ marginBottom: '1rem' }}>Welcome to Edhir</h1>
            <p className="dashboard-subtitle text-center">Your tenant has been created successfully.</p>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertTriangle color="var(--accent-red)" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ color: 'var(--accent-red)', fontSize: '0.875rem', marginBottom: '0.25rem', fontFamily: 'var(--font-space)' }}>Save your API Key</h3>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', lineHeight: 1.4 }}>
                This is the only time your full API key will be displayed. Please copy it and store it securely. We will only show a masked version (e.g. ****{apiKey.slice(-4)}) in the future.
              </p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Tenant API Key</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={apiKey} 
                readOnly 
                className="form-input" 
                style={{ fontFamily: 'monospace', flex: 1 }} 
              />
              <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ padding: '0 1rem' }}>
                {copied ? <Check size={18} color="var(--accent-teal)" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="solid-card">
          <div className="section-header-wrap">
            <h2 className="section-header">Setup Instructions</h2>
          </div>

          {integrationMode === 'sidecar' ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Deploy the Edhir sidecar container in front of your application. Ensure you route external traffic to this sidecar instead of directly to your app.
              </p>
              <div className="code-block" style={{ marginBottom: '2rem' }}>
                {`docker run -d \\
  -p 8443:8443 \\
  -e EDHIR_API_KEY=${apiKey} \\
  -e TARGET_URL=http://localhost:8080 \\
  edhir/sidecar:latest`}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Install the Edhir SDK via npm or Maven, then configure it as middleware in your application.
              </p>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>1. Install Dependency</h4>
              <div className="code-block" style={{ marginBottom: '1.5rem' }}>
                npm install @edhir/sdk
              </div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>2. Register Middleware</h4>
              <div className="code-block" style={{ marginBottom: '2rem' }}>
                {`import { edhirMiddleware } from '@edhir/sdk';
import express from 'express';

const app = express();

// Ensure EDHIR_API_KEY is set in your environment variables
app.use(edhirMiddleware({
  apiKey: process.env.EDHIR_API_KEY
}));`}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={onComplete}>
              I have copied my key and set up my app
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
