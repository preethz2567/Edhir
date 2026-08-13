CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    app_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    integration_mode VARCHAR(20) NOT NULL CHECK (integration_mode IN ('sidecar', 'sdk')),
    contact_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    first_seen TIMESTAMP NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    session_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high'))
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    client_fingerprint VARCHAR(255) NOT NULL,
    campaign_id UUID REFERENCES campaigns(id),
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMP NOT NULL,
    current_score FLOAT NOT NULL DEFAULT 0,
    current_threshold FLOAT NOT NULL DEFAULT 80,
    status VARCHAR(20) NOT NULL CHECK (status IN ('normal', 'flagged', 'honeypot', 'blocked'))
);

CREATE TABLE rule_definitions (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    pattern TEXT NOT NULL,
    attack_type VARCHAR(50) NOT NULL CHECK (attack_type IN ('sqli', 'xss', 'path_traversal', 'other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE requests (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    path VARCHAR(2048) NOT NULL,
    method VARCHAR(10) NOT NULL,
    headers_hash VARCHAR(255),
    matched_rule_id UUID REFERENCES rule_definitions(id),
    verdict VARCHAR(20) NOT NULL CHECK (verdict IN ('allow', 'block', 'honeypot')),
    response_time_ms INTEGER
);

CREATE TABLE honeypot_events (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    redirected_at TIMESTAMP NOT NULL DEFAULT now(),
    observed_actions TEXT,
    resolved_verdict VARCHAR(20) CHECK (resolved_verdict IN ('confirmed_malicious', 'false_positive', 'inconclusive')),
    resolved_at TIMESTAMP
);
