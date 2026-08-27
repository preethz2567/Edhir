package com.edhir.proxy.adaptive;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdaptiveController {

    private final StringRedisTemplate redisTemplate;
    private static final int WINDOW_SIZE = 10;
    private static final String TREND_KEY_PREFIX = "trend:score:";

    public AdaptiveController(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean detectTrend(String sessionId, float currentScore, float sensitivity) {
        String key = TREND_KEY_PREFIX + sessionId;
        
        // Push current score and trim to WINDOW_SIZE
        redisTemplate.opsForList().rightPush(key, String.valueOf(currentScore));
        redisTemplate.opsForList().trim(key, -WINDOW_SIZE, -1);
        
        List<String> rawScores = redisTemplate.opsForList().range(key, 0, -1);
        if (rawScores == null || rawScores.size() < 5) {
            return false; // Not enough data points
        }
        
        List<Float> scores = rawScores.stream()
                .map(Float::parseFloat)
                .collect(Collectors.toList());
                
        // Compute linear regression slope
        int n = scores.size();
        float sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            float x = i;
            float y = scores.get(i);
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        
        float denominator = (n * sumX2) - (sumX * sumX);
        if (denominator == 0) return false;
        
        float slope = ((n * sumXY) - (sumX * sumY)) / denominator;
        
        // Flag consistent upward trend based on configurable sensitivity
        // Assuming sensitivity is the slope threshold (e.g., 5.0)
        return slope >= sensitivity;
    }

    public float getAdjustedThreshold(String sessionId, float currentScore, float baseThreshold, float floor, boolean isTrending) {
        if (!isTrending) {
            return baseThreshold;
        }
        // Tighten toward the trending session's current score, bounded by minimum floor
        float tightened = currentScore + 10.0f;
        return Math.max(floor, tightened);
    }
}
