-- V5__seed_more_rules.sql

INSERT INTO rule_definitions (id, tenant_id, pattern, attack_type, severity, is_active, created_at) VALUES
    ('a1000000-0000-0000-0000-000000000006', NULL, $$(?i)(?:waitfor\s+delay|pg_sleep|dbms_pipe\.receive_message)$$, 'sqli', 'high', true, now()),
    ('a1000000-0000-0000-0000-000000000007', NULL, $$(?i)javascript:.*|onerror\s*=|onload\s*=|<svg\s+onload$$, 'xss', 'high', true, now()),
    ('a1000000-0000-0000-0000-000000000008', NULL, $$(?:%2e%2e%2f|%2e%2e/|\.\.%2f|\.\.\\|%2e%2e%5c|%2e%2e\\|%252e%252e%255c)$$, 'path_traversal', 'medium', true, now());
