package com.edhir.proxy.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Session {
    private UUID id;
    private UUID tenantId;
    private String clientFingerprint;
    private UUID campaignId;
    private LocalDateTime startedAt;
    private LocalDateTime lastSeenAt;
    private float currentScore;
    private float currentThreshold;
    private String status;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getClientFingerprint() { return clientFingerprint; }
    public void setClientFingerprint(String clientFingerprint) { this.clientFingerprint = clientFingerprint; }

    public UUID getCampaignId() { return campaignId; }
    public void setCampaignId(UUID campaignId) { this.campaignId = campaignId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }

    public float getCurrentScore() { return currentScore; }
    public void setCurrentScore(float currentScore) { this.currentScore = currentScore; }

    public float getCurrentThreshold() { return currentThreshold; }
    public void setCurrentThreshold(float currentThreshold) { this.currentThreshold = currentThreshold; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
