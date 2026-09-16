import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Target } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="mkt-page">
      {/* Nav */}
      <nav className="mkt-nav">
        <span className="mkt-nav-logo">Edhir</span>
        <div className="mkt-nav-links">
          <a href="#how-it-works" className="mkt-nav-link">How it works</a>
          <a href="#integrations" className="mkt-nav-link">Integrations</a>
          <Link to="/app" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="mkt-hero">
        <div className="mkt-hero-eyebrow">
          <span className="status-dot allow" />
          Web Application Firewall
        </div>
        <h1 className="mkt-hero-title">
          Adaptive security for modern web applications
        </h1>
        <p className="mkt-hero-sub">
          Edhir sits in front of your application and learns your traffic patterns.
          It blocks threats, adapts thresholds automatically, and routes uncertain
          actors to honeypots — without changing a line of your code.
        </p>
        <div className="mkt-hero-actions">
          <Link to="/app" className="btn btn-primary">
            Get started <ArrowRight size={14} />
          </Link>
          <a href="#how-it-works" className="btn btn-secondary">
            How it works
          </a>
        </div>
      </header>

      {/* How it works */}
      <section id="how-it-works" className="mkt-section">
        <div className="mkt-section-inner">
          <div className="mkt-section-label">Process</div>
          <h2 className="mkt-section-title">From zero to protected in minutes</h2>
          <p className="mkt-section-sub">
            No configuration required for initial protection. Register, deploy one
            container or add one npm package, and Edhir starts learning immediately.
          </p>

          <div className="mkt-grid">
            <div className="mkt-grid-item">
              <Shield size={18} className="mkt-grid-icon" />
              <div className="mkt-grid-title">1 — Register</div>
              <p className="mkt-grid-text">
                Create a tenant in the dashboard. Receive a secure API key that
                identifies your application's traffic stream.
              </p>
            </div>
            <div className="mkt-grid-item">
              <Activity size={18} className="mkt-grid-icon" />
              <div className="mkt-grid-title">2 — Deploy</div>
              <p className="mkt-grid-text">
                Run a single Docker command to place the Edhir sidecar in front
                of your application, or add the SDK middleware directly.
              </p>
            </div>
            <div className="mkt-grid-item">
              <Target size={18} className="mkt-grid-icon" />
              <div className="mkt-grid-title">3 — Monitor</div>
              <p className="mkt-grid-text">
                Watch live traffic, inspect blocked requests, and review campaign
                clusters from the dashboard. Thresholds adapt automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Edhir */}
      <section className="mkt-section" style={{ background: 'var(--surface)' }}>
        <div className="mkt-section-inner">
          <div className="mkt-section-label">Capabilities</div>
          <h2 className="mkt-section-title">Built for evasion-resistant detection</h2>
          <p className="mkt-section-sub">
            Signature lists are easily bypassed. Edhir focuses on behavioral
            patterns and timing — the things attackers cannot easily change.
          </p>

          <div className="mkt-grid">
            <div className="mkt-grid-item" style={{ background: 'var(--bg)' }}>
              <div className="mkt-grid-title">Behavioral detection</div>
              <p className="mkt-grid-text">
                Analyzes the cadence, spread, and shape of requests across sessions —
                not just their content — to identify coordinated attacks.
              </p>
            </div>
            <div className="mkt-grid-item" style={{ background: 'var(--bg)' }}>
              <div className="mkt-grid-title">Adaptive thresholds</div>
              <p className="mkt-grid-text">
                Rate limits are derived from your actual baseline. Slow-drip attacks
                and burst evasion both fail because the system calibrates continuously.
              </p>
            </div>
            <div className="mkt-grid-item" style={{ background: 'var(--bg)' }}>
              <div className="mkt-grid-title">Honeypot routing</div>
              <p className="mkt-grid-text">
                Suspicious sessions are silently routed to a deception environment
                instead of hard-blocked, wasting attacker resources and gathering
                intent data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mkt-section">
        <div className="mkt-section-inner">
          <div className="mkt-section-label">Integrations</div>
          <h2 className="mkt-section-title">Two ways to deploy, one dashboard</h2>
          <p className="mkt-section-sub">
            The sidecar proxy works with any language. The SDK gives you fine-grained
            middleware control in Node.js or Java.
          </p>

          <div className="mkt-int-grid">
            <div className="mkt-int-card">
              <div className="mkt-int-title">Sidecar Proxy</div>
              <p className="mkt-int-sub">
                Language-agnostic. Zero code changes required. Place the Edhir reverse
                proxy in front of your application container.
              </p>
              <div className="code-block">{`docker run -d \\
  -p 8443:8443 \\
  -e EDHIR_API_KEY=<your_key> \\
  -e TARGET_URL=http://localhost:8080 \\
  edhir/sidecar:latest`}</div>
            </div>
            <div className="mkt-int-card">
              <div className="mkt-int-title">Native SDK</div>
              <p className="mkt-int-sub">
                For fine-grained control. Embed the SDK as middleware in your Node.js
                or Java application pipeline.
              </p>
              <div className="code-block">{`npm install @edhir/sdk

import { edhirMiddleware } from '@edhir/sdk';

app.use(edhirMiddleware({
  apiKey: process.env.EDHIR_API_KEY
}));`}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mkt-footer-bar">
        <span className="mkt-footer-copy">© 2026 Edhir Security, Inc.</span>
        <div className="mkt-footer-links">
          <a href="#">Documentation</a>
          <a href="#">GitHub</a>
          <a href="#">Status</a>
        </div>
      </div>
    </div>
  );
}
