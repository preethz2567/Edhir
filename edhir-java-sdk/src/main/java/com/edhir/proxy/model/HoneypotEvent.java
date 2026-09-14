package com.edhir.proxy.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class HoneypotEvent {
    private UUID id;
    private UUID sessionId;
    private LocalDateTime redirectedAt;
    private String observedActions;
    private String resolvedVerdict;
    private LocalDateTime resolvedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getRedirectedAt() { return redirectedAt; }
    public void setRedirectedAt(LocalDateTime redirectedAt) { this.redirectedAt = redirectedAt; }

    public String getObservedActions() { return observedActions; }
    public void setObservedActions(String observedActions) { this.observedActions = observedActions; }

    public String getResolvedVerdict() { return resolvedVerdict; }
    public void setResolvedVerdict(String resolvedVerdict) { this.resolvedVerdict = resolvedVerdict; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
