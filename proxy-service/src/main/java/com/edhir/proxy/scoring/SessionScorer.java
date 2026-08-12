package com.edhir.proxy.scoring;

import com.edhir.proxy.model.Request;
import org.springframework.stereotype.Service;

@Service
public class SessionScorer {

    public void recordRequest(Request request) {
        // TODO: Implement actual recording of request for scoring logic
    }

    public float getCurrentScore(String sessionId) {
        // TODO: Implement calculation of current score based on recorded data
        return 0.0f;
    }
}
