package com.edhir.proxy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "requests")
public class RequestEntity {

    @Id
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "session_id", columnDefinition = "uuid", nullable = false)
    private UUID sessionId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "path", nullable = false, length = 2048)
    private String path;

    @Column(name = "method", nullable = false, length = 10)
    private String method;

    @Column(name = "headers_hash", length = 255)
    private String headersHash;

    @Column(name = "matched_rule_id", columnDefinition = "uuid")
    private UUID matchedRuleId;

    @Column(name = "verdict", nullable = false, length = 20)
    private String verdict;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (timestamp == null) timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getHeadersHash() { return headersHash; }
    public void setHeadersHash(String headersHash) { this.headersHash = headersHash; }

    public UUID getMatchedRuleId() { return matchedRuleId; }
    public void setMatchedRuleId(UUID matchedRuleId) { this.matchedRuleId = matchedRuleId; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public Integer getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(Integer responseTimeMs) { this.responseTimeMs = responseTimeMs; }
}
