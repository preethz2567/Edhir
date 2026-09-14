package com.edhir.proxy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
public class SessionEntity {

    @Id
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", columnDefinition = "uuid", nullable = false)
    private UUID tenantId;

    @Column(name = "client_fingerprint", nullable = false, length = 255)
    private String clientFingerprint;

    @Column(name = "campaign_id", columnDefinition = "uuid")
    private UUID campaignId;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @Column(name = "current_score", nullable = false)
    private float currentScore;

    @Column(name = "current_threshold", nullable = false)
    private float currentThreshold;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (startedAt == null) startedAt = LocalDateTime.now();
        if (lastSeenAt == null) lastSeenAt = LocalDateTime.now();
        if (status == null) status = "normal";
        if (currentThreshold == 0) currentThreshold = 80f;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getClientFingerprint() { return clientFingerprint; }
    public void setClientFingerprint(String fp) { this.clientFingerprint = fp; }

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
