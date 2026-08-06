package com.edhir.proxy.engine;

import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import java.time.Duration;

@Component
public class RuleEngine {

    private final Bucket bucket;

    public RuleEngine() {
        Bandwidth limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));
        this.bucket = Bucket.builder().addLimit(limit).build();
    }

    public boolean isAllowed(HttpServletRequest request) {
        if (!bucket.tryConsume(1)) {
            return false;
        }
        
        String path = request.getRequestURI();
        if (path != null && path.contains("/admin/hack")) {
            return false;
        }
        
        return true;
    }
}
