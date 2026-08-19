package com.edhir.proxy.model;

import java.util.UUID;

/**
 * Verdict is the output of RuleEngine.evaluate(). It carries the decision
 * (allow or block) and, when blocking, the ID of the matching rule.
 *
 * Not a database table — this is a pure in-memory result object.
 */
public class Verdict {

    public enum Decision { ALLOW, BLOCK, HONEYPOT }

    private final Decision decision;
    private final UUID matchedRuleId; // null when decision == ALLOW

    private Verdict(Decision decision, UUID matchedRuleId) {
        this.decision = decision;
        this.matchedRuleId = matchedRuleId;
    }

    public static Verdict allow() {
        return new Verdict(Decision.ALLOW, null);
    }

    public static Verdict block(UUID ruleId) {
        return new Verdict(Decision.BLOCK, ruleId);
    }

    // Week 4 stub: honeypot routing will use this
    public static Verdict honeypot() {
        return new Verdict(Decision.HONEYPOT, null);
    }

    public boolean isAllow() { return decision == Decision.ALLOW; }
    public boolean isBlock() { return decision == Decision.BLOCK; }

    public Decision getDecision() { return decision; }
    public UUID getMatchedRuleId() { return matchedRuleId; }

    /** Returns the lowercase string stored in requests.verdict column */
    public String asDbValue() { return decision.name().toLowerCase(); }
}
