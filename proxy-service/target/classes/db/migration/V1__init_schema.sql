CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    app_name TEXT,
    api_key TEXT UNIQUE,
    integration_mode TEXT,
    created_at TIMESTAMP
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    session_count INT,
    description TEXT
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    client_fingerprint TEXT,
    started_at TIMESTAMP,
    last_seen_at TIMESTAMP,
    current_score FLOAT,
    campaign_id UUID REFERENCES campaigns(id)
);

CREATE TABLE rule_definitions (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    pattern TEXT,
    attack_type TEXT,
    severity TEXT
);

CREATE TABLE requests (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    timestamp TIMESTAMP,
    path TEXT,
    method TEXT,
    verdict TEXT,
    matched_rule_id UUID REFERENCES rule_definitions(id)
);

CREATE TABLE honeypot_events (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    redirected_at TIMESTAMP,
    observed_actions TEXT,
    resolved_verdict TEXT
);
