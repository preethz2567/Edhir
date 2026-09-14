package com.edhir.proxy.engine;

import com.edhir.proxy.entity.RuleDefinitionEntity;
import com.edhir.proxy.model.Verdict;
import com.edhir.proxy.repository.RuleDefinitionRepository;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * RuleEngine evaluates an incoming request against the active rule set loaded
 * from the rule_definitions table. Uses Caffeine to cache rules in-memory.
 */
@Component
public class RuleEngine {
    private static final Logger logger = LoggerFactory.getLogger(RuleEngine.class);

    private final RuleDefinitionRepository ruleRepo;
    
    // Cache tenantId -> list of compiled patterns
    private final Cache<UUID, List<RuleEntry>> ruleCache;

    public RuleEngine(RuleDefinitionRepository ruleRepo) {
        this.ruleRepo = ruleRepo;
        this.ruleCache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .maximumSize(1000)
                .build();
    }

    /**
     * Evaluates the request path (and, where present, the raw body) against all
     * active rules that apply to the given tenant (tenant-specific + global).
     */
    public Verdict evaluate(String path, String rawQuery, String body, UUID tenantId) {
        List<RuleEntry> rules = ruleCache.get(tenantId, this::loadRulesFromDb);

        String subject = (path == null ? "" : path)
                + (rawQuery != null ? "?" + rawQuery : "")
                + (body != null ? "\n" + body : "");

        if (rules != null) {
            for (RuleEntry rule : rules) {
                if (rule.pattern().matcher(subject).find()) {
                    return Verdict.block(rule.ruleId());
                }
            }
        }
        return Verdict.allow();
    }

    private List<RuleEntry> loadRulesFromDb(UUID tenantId) {
        List<RuleDefinitionEntity> entities = ruleRepo.findActiveRulesForTenant(tenantId);
        List<RuleEntry> compiled = new ArrayList<>();
        
        for (RuleDefinitionEntity entity : entities) {
            try {
                Pattern pattern = Pattern.compile(entity.getPattern(), 
                        Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
                compiled.add(new RuleEntry(entity.getId(), pattern));
            } catch (Exception e) {
                logger.warn("Skipping malformed rule {}: {}", entity.getId(), e.getMessage());
            }
        }
        return compiled;
    }

    // Refresh all loaded tenants in the cache periodically
    @Scheduled(fixedRate = 60000)
    public void refreshCache() {
        for (UUID tenantId : ruleCache.asMap().keySet()) {
            ruleCache.put(tenantId, loadRulesFromDb(tenantId));
        }
    }

    private record RuleEntry(UUID ruleId, Pattern pattern) {}
}
