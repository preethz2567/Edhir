package com.edhir.proxy.engine;

import com.edhir.proxy.entity.RuleDefinitionEntity;
import com.edhir.proxy.model.Verdict;
import com.edhir.proxy.repository.RuleDefinitionRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * RuleEngine evaluates an incoming request against the active rule set loaded
 * from the rule_definitions table. Only deterministic regex matching is done
 * here. ML-based scoring and adaptive thresholds are Week 4 concerns.
 */
@Component
public class RuleEngine {

    private final RuleDefinitionRepository ruleRepo;

    public RuleEngine(RuleDefinitionRepository ruleRepo) {
        this.ruleRepo = ruleRepo;
    }

    /**
     * Evaluates the request path (and, where present, the raw body) against all
     * active rules that apply to the given tenant (tenant-specific + global).
     *
     * @param path     the request URI path
     * @param rawQuery the query string or request body to test (may be null)
     * @param tenantId the calling tenant's UUID
     * @return a Verdict — either ALLOW or BLOCK with the matched rule ID set
     */
    public Verdict evaluate(String path, String rawQuery, UUID tenantId) {
        List<RuleDefinitionEntity> rules = ruleRepo.findActiveRulesForTenant(tenantId);

        // Combine path + query for matching so injection in query strings is caught
        String subject = (path == null ? "" : path)
                + (rawQuery != null ? "?" + rawQuery : "");

        for (RuleDefinitionEntity rule : rules) {
            try {
                Pattern compiled = Pattern.compile(rule.getPattern(),
                        Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
                if (compiled.matcher(subject).find()) {
                    return Verdict.block(rule.getId());
                }
            } catch (Exception e) {
                // Malformed regex in DB should not crash the proxy — skip and log
                System.err.println("[RuleEngine] Skipping malformed rule "
                        + rule.getId() + ": " + e.getMessage());
            }
        }

        return Verdict.allow();
    }
}
