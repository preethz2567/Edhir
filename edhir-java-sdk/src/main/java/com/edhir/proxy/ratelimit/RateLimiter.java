package com.edhir.proxy.ratelimit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Token-bucket rate limiter backed by Redis using a Lua script for atomicity.
 */
@Service
public class RateLimiter {

    private static final int BUCKET_CAPACITY = 10;
    private static final int BUCKET_TTL = BUCKET_CAPACITY; // TTL in seconds

    private final RedisTemplate<String, Long> redisTemplate;
    private final RedisScript<Long> rateLimitScript;

    public RateLimiter(RedisTemplate<String, Long> redisTemplate) {
        this.redisTemplate = redisTemplate;
        
        // Lua script to atomically decrement token bucket and handle TTL
        String scriptText = 
            "local key = KEYS[1]\n" +
            "local capacity = tonumber(ARGV[1])\n" +
            "local ttl = tonumber(ARGV[2])\n" +
            "local current = redis.call('GET', key)\n" +
            "if current == false then\n" +
            "    -- Bucket does not exist, create it with capacity - 1\n" +
            "    redis.call('SETEX', key, ttl, capacity - 1)\n" +
            "    return 1\n" +
            "else\n" +
            "    current = tonumber(current)\n" +
            "    if current > 0 then\n" +
            "        -- Bucket has tokens, consume one and refresh TTL\n" +
            "        redis.call('DECR', key)\n" +
            "        redis.call('EXPIRE', key, ttl)\n" +
            "        return 1\n" +
            "    else\n" +
            "        -- Bucket is empty, refresh TTL and reject\n" +
            "        redis.call('EXPIRE', key, ttl)\n" +
            "        return 0\n" +
            "    end\n" +
            "end";
        
        this.rateLimitScript = new DefaultRedisScript<>(scriptText, Long.class);
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

        Long result = redisTemplate.execute(
            rateLimitScript,
            Collections.singletonList(key),
            String.valueOf(BUCKET_CAPACITY),
            String.valueOf(BUCKET_TTL)
        );

        return result != null && result == 1L;
    }
}
