-- V3__add_indexes.sql

-- Composite index for fast session lookups by tenant and client fingerprint
CREATE INDEX idx_sessions_tenant_client ON sessions(tenant_id, client_fingerprint);

-- Index for session archival/cleanup based on last seen time
CREATE INDEX idx_sessions_last_seen ON sessions(last_seen_at);

-- Composite index for request lookups (e.g., retrieving recent requests for a session)
CREATE INDEX idx_requests_session_timestamp ON requests(session_id, timestamp);

-- Partial index to quickly find active rule definitions for a tenant
CREATE INDEX idx_rule_defs_active ON rule_definitions(tenant_id) WHERE is_active = true;
