import { useState } from 'react';
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
    <div className="onboarding-wrapper">
      <div className="onboarding-inner">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.25rem' }}>
            Edhir
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            Tenant created
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
            Copy your API key and follow the setup instructions below.
          </p>
        </div>

        {/* Warning */}
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <strong style={{ fontWeight: 600 }}>Save your API key now.</strong>{' '}
            This is the only time the full key will be displayed. We store only a masked
            version after this screen (…{apiKey.slice(-4)}).
          </div>
        </div>

        {/* API Key */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Your API Key</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="code-block" style={{ letterSpacing: '0.03em' }}>
            {apiKey}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="card-title" style={{ marginBottom: '0.25rem' }}>Setup instructions</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>
              {integrationMode === 'sidecar'
                ? 'Deploy the Edhir sidecar container in front of your application.'
                : 'Install the SDK and register it as middleware in your application.'}
            </p>
          </div>

          {integrationMode === 'sidecar' ? (
            <div className="code-block">{`docker run -d \\
  -p 8443:8443 \\
  -e EDHIR_API_KEY=${apiKey} \\
  -e TARGET_URL=http://localhost:8080 \\
  edhir/sidecar:latest`}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.5rem' }}>
                  1. Install dependency
                </p>
                <div className="code-block">npm install @edhir/sdk</div>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.5rem' }}>
                  2. Register middleware
                </p>
                <div className="code-block">{`import { edhirMiddleware } from '@edhir/sdk';
import express from 'express';

const app = express();

app.use(edhirMiddleware({
  apiKey: process.env.EDHIR_API_KEY
}));`}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onComplete}>
            I've copied my key and deployed — go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
