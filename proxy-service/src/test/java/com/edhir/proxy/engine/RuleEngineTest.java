package com.edhir.proxy.engine;

import com.edhir.proxy.entity.RuleDefinitionEntity;
import com.edhir.proxy.model.Verdict;
import com.edhir.proxy.repository.RuleDefinitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for RuleEngine.
 *
 * Each of the 5 seeded global rules is verified to:
 *   (a) BLOCK a realistic malicious input sample
 *   (b) ALLOW a clean, benign input sample
 *
 * Tests run with Mockito — no Spring context or database needed.
 */
@ExtendWith(MockitoExtension.class)
class RuleEngineTest {

    @Mock
    private RuleDefinitionRepository ruleRepo;

    private RuleEngine ruleEngine;
    private final UUID tenantId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        ruleEngine = new RuleEngine(ruleRepo);
    }

    // ── Helper ──────────────────────────────────────────────────────────────

    private RuleDefinitionEntity rule(String pattern, String attackType) {
        RuleDefinitionEntity r = new RuleDefinitionEntity();
        r.setId(UUID.randomUUID());
        r.setPattern(pattern);
        r.setAttackType(attackType);
        r.setSeverity("high");
        r.setActive(true);
        return r;
    }

    private void givenSingleRule(String pattern, String attackType) {
        when(ruleRepo.findActiveRulesForTenant(any()))
                .thenReturn(List.of(rule(pattern, attackType)));
    }

    // ── Rule 1: SQLi  ' OR 1=1 ──────────────────────────────────────────────

    @Test
    void sqlInjection_orOne_shouldBlock() {
        givenSingleRule("'\\s*OR\\s+1\\s*=\\s*1", "sqli");
        Verdict v = ruleEngine.evaluate("/login", "username=' OR 1=1--", tenantId);
        assertThat(v.isBlock()).isTrue();
        assertThat(v.getMatchedRuleId()).isNotNull();
    }

    @Test
    void sqlInjection_orOne_cleanRequest_shouldAllow() {
        givenSingleRule("'\\s*OR\\s+1\\s*=\\s*1", "sqli");
        Verdict v = ruleEngine.evaluate("/login", "username=alice&password=secret", tenantId);
        assertThat(v.isAllow()).isTrue();
    }

    // ── Rule 2: SQLi  UNION SELECT ──────────────────────────────────────────

    @Test
    void sqlInjection_unionSelect_shouldBlock() {
        givenSingleRule("(?i)UNION\\s+SELECT", "sqli");
        Verdict v = ruleEngine.evaluate("/products", "id=1 UNION SELECT * FROM users", tenantId);
        assertThat(v.isBlock()).isTrue();
    }

    @Test
    void sqlInjection_unionSelect_cleanRequest_shouldAllow() {
        givenSingleRule("(?i)UNION\\s+SELECT", "sqli");
        Verdict v = ruleEngine.evaluate("/products", "category=gadgets", tenantId);
        assertThat(v.isAllow()).isTrue();
    }

    // ── Rule 3: XSS  <script> ───────────────────────────────────────────────

    @Test
    void xss_scriptTag_shouldBlock() {
        givenSingleRule("(?i)<script[^>]*>", "xss");
        Verdict v = ruleEngine.evaluate("/comment", "body=<script>alert(1)</script>", tenantId);
        assertThat(v.isBlock()).isTrue();
    }

    @Test
    void xss_scriptTag_cleanRequest_shouldAllow() {
        givenSingleRule("(?i)<script[^>]*>", "xss");
        Verdict v = ruleEngine.evaluate("/comment", "body=Hello+world", tenantId);
        assertThat(v.isAllow()).isTrue();
    }

    // ── Rule 4: Path traversal  ../ ─────────────────────────────────────────

    @Test
    void pathTraversal_shouldBlock() {
        givenSingleRule("\\.\\./|\\.\\.\\\\" , "path_traversal");
        Verdict v = ruleEngine.evaluate("/files/../../etc/passwd", null, tenantId);
        assertThat(v.isBlock()).isTrue();
    }

    @Test
    void pathTraversal_cleanRequest_shouldAllow() {
        givenSingleRule("\\.\\./|\\.\\.\\\\" , "path_traversal");
        Verdict v = ruleEngine.evaluate("/files/report.pdf", null, tenantId);
        assertThat(v.isAllow()).isTrue();
    }

    // ── Rule 5: SQLi  DROP TABLE ─────────────────────────────────────────────

    @Test
    void sqlInjection_dropTable_shouldBlock() {
        givenSingleRule("(?i)DROP\\s+TABLE", "sqli");
        Verdict v = ruleEngine.evaluate("/admin", "q=DROP TABLE users", tenantId);
        assertThat(v.isBlock()).isTrue();
    }

    @Test
    void sqlInjection_dropTable_cleanRequest_shouldAllow() {
        givenSingleRule("(?i)DROP\\s+TABLE", "sqli");
        Verdict v = ruleEngine.evaluate("/admin", "q=show+tables", tenantId);
        assertThat(v.isAllow()).isTrue();
    }

    // ── No rules loaded ──────────────────────────────────────────────────────

    @Test
    void noRules_anyRequest_shouldAllow() {
        when(ruleRepo.findActiveRulesForTenant(any())).thenReturn(List.of());
        Verdict v = ruleEngine.evaluate("/anything", "x=' OR 1=1", tenantId);
        assertThat(v.isAllow()).isTrue();
    }
}
