package com.edhir.proxy.scoring;

import com.edhir.proxy.model.Request;
import org.springframework.stereotype.Service;

@Service
public class SessionScorer {

    private final java.util.Map<String, Integer> requestCounts = new java.util.concurrent.ConcurrentHashMap<>();

    public void recordRequest(Request request) {
        if (request != null && request.getSessionId() != null) {
            requestCounts.merge(request.getSessionId().toString(), 1, Integer::sum);
        }
    }

    public float getCurrentScore(String sessionId) {
        if (sessionId == null) return 0.0f;
        int count = requestCounts.getOrDefault(sessionId, 0);
        return Math.min(100.0f, count * 5.0f);
    }
}
