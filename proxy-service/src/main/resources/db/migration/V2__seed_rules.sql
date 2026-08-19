-- Week 3: Seed 5 global rules (tenant_id IS NULL = applies to all tenants)
-- Rules cover: SQLi (OR 1=1), SQLi (UNION SELECT), XSS (<script>), path traversal (../), SQLi (DROP TABLE)
-- Using dollar-quoting ($$) so backslashes in regex patterns are stored literally.

INSERT INTO rule_definitions (id, tenant_id, pattern, attack_type, severity, is_active, created_at) VALUES
    ('a1000000-0000-0000-0000-000000000001', NULL, $$'\s*OR\s+1\s*=\s*1$$, 'sqli', 'high', true, now()),
    ('a1000000-0000-0000-0000-000000000002', NULL, $$(?i)UNION\s+SELECT$$, 'sqli', 'high', true, now()),
    ('a1000000-0000-0000-0000-000000000003', NULL, $$(?i)<script[^>]*>$$, 'xss', 'high', true, now()),
    ('a1000000-0000-0000-0000-000000000004', NULL, $$\.\./|\.\.\\$$, 'path_traversal', 'medium', true, now()),
    ('a1000000-0000-0000-0000-000000000005', NULL, $$(?i)DROP\s+TABLE$$, 'sqli', 'high', true, now());
