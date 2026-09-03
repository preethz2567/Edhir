package com.edhir.proxy.engine;

import com.edhir.proxy.entity.RuleDefinitionEntity;
import com.edhir.proxy.model.Verdict;
import com.edhir.proxy.repository.RuleDefinitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RuleEngineTest {

    private RuleEngine ruleEngine;
    private RuleDefinitionRepository ruleRepo;
    private UUID tenantId;

    @BeforeEach
    void setUp() {
        ruleRepo = mock(RuleDefinitionRepository.class);
        ruleEngine = new RuleEngine(ruleRepo);
        tenantId = UUID.randomUUID();

        // Seed 8 rules based on V2 + V5 migrations
        List<RuleDefinitionEntity> rules = Arrays.asList(
                createRule("sqli_or", "\\s*OR\\s+1\\s*=\\s*1"),
                createRule("sqli_union", "(?i)UNION\\s+SELECT"),
                createRule("xss_script", "(?i)<script[^>]*>"),
                createRule("path_traversal", "\\.\\./|\\.\\.\\\\"),
                createRule("sqli_drop", "(?i)DROP\\s+TABLE"),
                createRule("sqli_sleep", "(?i)(?:waitfor\\s+delay|pg_sleep|dbms_pipe\\.receive_message)"),
                createRule("xss_events", "(?i)javascript:.*|onerror\\s*=|onload\\s*=|req\\s*=|eval\\s*\\("),
                createRule("path_traversal_encoded", "(?:%2e%2e%2f|%2e%2e/|\\.\\.%2f|\\.\\.\\\\|%2e%2e%5c|%2e%2e\\\\|%252e%252e%255c)")
        );

        when(ruleRepo.findActiveRulesForTenant(tenantId)).thenReturn(rules);
    }

    private RuleDefinitionEntity createRule(String id, String pattern) {
        RuleDefinitionEntity r = new RuleDefinitionEntity();
        r.setId(UUID.randomUUID()); // Using random for tests instead of fixed string
        r.setPattern(pattern);
        return r;
    }

    @Test
    void testSqlInjection() {
        // Blocked
        assertTrue(ruleEngine.evaluate("/login", "user=admin' OR 1=1--", null, tenantId).isBlock());
        assertTrue(ruleEngine.evaluate("/search", "q=UNION SELECT * FROM users", null, tenantId).isBlock());
        assertTrue(ruleEngine.evaluate("/api", "q=DROP TABLE students;", null, tenantId).isBlock());
        assertTrue(ruleEngine.evaluate("/api", "q=pg_sleep(10)", null, tenantId).isBlock());

        // Allowed
        assertFalse(ruleEngine.evaluate("/login", "user=admin", null, tenantId).isBlock());
        assertFalse(ruleEngine.evaluate("/search", "q=union square", null, tenantId).isBlock());
    }

    @Test
    void testXss() {
        // Blocked
        assertTrue(ruleEngine.evaluate("/post", "comment=<script>alert(1)</script>", null, tenantId).isBlock());
        assertTrue(ruleEngine.evaluate("/post", "comment=<img src=x onerror=alert(1)>", null, tenantId).isBlock());
        assertTrue(ruleEngine.evaluate("/redirect", "url=javascript:alert(1)", null, tenantId).isBlock());

        // Allowed
        assertFalse(ruleEngine.evaluate("/post", "comment=hello there", null, tenantId).isBlock());
        assertFalse(ruleEngine.evaluate("/post", "comment=<p>Hello</p>", null, tenantId).isBlock());
    }

    @Test
    void testPathTraversal() {
        // Blocked
        assertTrue(ruleEngine.evaluate("/files/../../etc/passwd", null, null, tenantId).isBlock());
        assertTrue(ruleEngine.evaluate("/files/%2e%2e%2fetc%2fpasswd", null, null, tenantId).isBlock());

        // Allowed
        assertFalse(ruleEngine.evaluate("/files/images/photo.jpg", null, null, tenantId).isBlock());
        assertFalse(ruleEngine.evaluate("/files/profile.png", null, null, tenantId).isBlock());
    }
}
