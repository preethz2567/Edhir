package com.edhir.proxy.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Request {
    private UUID id;
    private UUID sessionId;
    private LocalDateTime timestamp;
    private String path;
    private String method;
    private String headersHash;
    private UUID matchedRuleId;
    private String verdict;
    private Integer responseTimeMs;

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
