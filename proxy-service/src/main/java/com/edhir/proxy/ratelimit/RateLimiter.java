package com.edhir.proxy.ratelimit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Token-bucket rate limiter backed by Redis.
 *
 * Bucket capacity: 10 tokens.
 * Refill: 1 token per second — implemented by expiring the key after
 * (capacity) seconds; when the key expires a fresh bucket is created.
 *
 * This gives a sliding-window approximation that is simple, O(1), and
 * requires no Lua script. True per-second refill (Bucket4j-in-Redis) is
 * deferred to Week 4 when the full async scoring pipeline is in place.
 */
@Service
public class RateLimiter {

    private static final int BUCKET_CAPACITY = 10;
    // TTL = capacity seconds, so on expiry the bucket refills to full
    private static final Duration BUCKET_TTL = Duration.ofSeconds(BUCKET_CAPACITY);

    private final RedisTemplate<String, Long> redisTemplate;

    public RateLimiter(RedisTemplate<String, Long> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Attempts to consume one token from the bucket keyed by sessionId.
     *
     * @param sessionId unique session identifier
     * @return true  – token consumed, request is within limit
     *         false – bucket empty, request should be denied
     */
    public boolean checkLimit(String sessionId) {
        String key = "ratelimit:" + sessionId;

        // Atomically decrement; returns the new value.
        Long remaining = redisTemplate.opsForValue().decrement(key);

        if (remaining == null) {
            // Key didn't exist — create it with capacity-1 (we already consumed 1)
            redisTemplate.opsForValue().set(key, (long) (BUCKET_CAPACITY - 1), BUCKET_TTL);
            return true;
        }

        if (remaining < 0) {
            // Bucket was already exhausted — reset to 0 to avoid runaway negatives
            redisTemplate.opsForValue().set(key, 0L, BUCKET_TTL);
            return false;
        }

        // Set/refresh TTL so the window slides from the last request
        redisTemplate.expire(key, BUCKET_TTL);
        return true;
    }
}
