package com.edhir.proxy.router;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HoneypotRouter {

    private static final Logger logger = LoggerFactory.getLogger(HoneypotRouter.class);
    private static final float HONEYPOT_MARGIN = 15.0f;

    public boolean shouldRedirect(float score, float threshold) {
        if (score >= threshold + HONEYPOT_MARGIN) {
            logger.info("Decision: HARD BLOCK. Score {} exceeds threshold {} by margin > {}", score, threshold, HONEYPOT_MARGIN);
            return false;
        } else if (score >= threshold) {
            logger.info("Decision: HONEYPOT REDIRECT. Score {} exceeds threshold {} but within margin {}", score, threshold, HONEYPOT_MARGIN);
            return true;
        }
        return false;
    }
}
