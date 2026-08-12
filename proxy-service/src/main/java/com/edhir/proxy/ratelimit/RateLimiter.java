package com.edhir.proxy.ratelimit;

import org.springframework.stereotype.Service;

@Service
public class RateLimiter {

    public boolean checkLimit(String sessionId) {
        // TODO: Implement actual rate limiting logic per session
        return true; 
    }
}
