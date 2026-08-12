package com.edhir.proxy.router;

import org.springframework.stereotype.Service;

@Service
public class HoneypotRouter {

    public boolean shouldRedirect(float score, float threshold) {
        // TODO: Implement logic to determine if traffic should be redirected to honeypot
        return score >= threshold;
    }
}
