import React from 'react';
import { Link } from 'react-router-dom';
import { Key, Box, Activity, ShieldAlert, Cpu, Target } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="marketing-page">
      <nav className="marketing-nav">
        <div className="dashboard-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Edhir</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>How it Works</a>
          <a href="#integrations" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Integrations</a>
          <Link to="/app" className="btn btn-secondary btn-sm">Sign In</Link>
        </div>
      </nav>

      <header className="marketing-hero">
        <h1 className="marketing-title">Adaptive Web Application Firewall</h1>
        <p className="marketing-subtitle">
          Edhir is an adaptive, behavioral web application firewall that plugs effortlessly into any existing application. Defend against sophisticated threats in real-time.
        </p>
        <div className="marketing-actions">
          <Link to="/app" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Get Started</Link>
          <a href="#integrations" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>View Live Demo</a>
        </div>
      </header>

      <section id="how-it-works" className="marketing-section">
        <div className="marketing-section-inner">
          <h2 className="marketing-section-title">How it works</h2>
          <div className="marketing-grid">
            <div className="marketing-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '50%', marginBottom: '1rem', border: '1px solid var(--surface-border)' }}>
                <Key size={32} color="var(--text-secondary)" />
              </div>
              <h3>1. Register</h3>
              <p>Register your application in the dashboard and get a secure API key to identify your tenant traffic.</p>
            </div>
            <div className="marketing-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '50%', marginBottom: '1rem', border: '1px solid var(--surface-border)' }}>
                <Box size={32} color="var(--text-secondary)" />
              </div>
              <h3>2. Deploy</h3>
              <p>Deploy the sidecar container in front of your app, or add our SDK directly to your codebase in seconds.</p>
            </div>
            <div className="marketing-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '50%', marginBottom: '1rem', border: '1px solid var(--surface-border)' }}>
                <Activity size={32} color="var(--text-secondary)" />
              </div>
              <h3>3. Monitor</h3>
              <p>Traffic is monitored and protected in real time. Watch live analytics directly from your secure dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" style={{ background: 'var(--bg-color)' }}>
        <div className="marketing-section-inner">
          <h2 className="marketing-section-title">Why Edhir?</h2>
          <div className="marketing-grid">
            <div className="marketing-card">
              <Cpu size={24} color="var(--text-secondary)" />
              <h3>Behavioral Detection</h3>
              <p>Move beyond simple signature matching. Edhir analyzes request behavior and timing to catch advanced evasion techniques.</p>
            </div>
            <div className="marketing-card">
              <ShieldAlert size={24} color="var(--text-secondary)" />
              <h3>Adaptive Thresholds</h3>
              <p>Rate limits and security thresholds adapt dynamically to your baseline traffic, resisting slow-drip and burst evasion.</p>
            </div>
            <div className="marketing-card">
              <Target size={24} color="var(--text-secondary)" />
              <h3>Honeypot Handling</h3>
              <p>Instead of blunt blocking, suspicious actors are seamlessly routed to uncertain-case honeypots to waste their resources.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="integrations" className="marketing-section">
        <div className="marketing-section-inner">
          <h2 className="marketing-section-title">Integration Options</h2>
          <div className="marketing-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            <div className="marketing-card">
              <h3 style={{ marginTop: 0 }}>Sidecar Proxy</h3>
              <p style={{ marginBottom: '1.5rem' }}>Language agnostic. Requires zero code changes. Just place the Edhir reverse proxy in front of your application container.</p>
              <div className="code-block">
                {`docker run -d \\
  -p 80:8080 \\
  -e EDHIR_API_KEY=your_key \\
  -e UPSTREAM_URL=http://app:3000 \\
  edhir/proxy:latest`}
              </div>
            </div>
            <div className="marketing-card">
              <h3 style={{ marginTop: 0 }}>Native SDK</h3>
              <p style={{ marginBottom: '1.5rem' }}>For fine-grained control, embed the SDK directly into your Node.js or Java application middleware pipeline.</p>
              <div className="code-block">
                {`npm install @edhir/sdk

import { edhirMiddleware } from '@edhir/sdk';

app.use(edhirMiddleware({
  apiKey: process.env.EDHIR_API_KEY
}));`}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marketing-footer-wrap">
        <footer className="marketing-footer">
          <div>&copy; 2026 Edhir Security. All rights reserved.</div>
          <div>
            <a href="#">Documentation</a>
            <a href="#">GitHub Repo</a>
            <a href="#">Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
