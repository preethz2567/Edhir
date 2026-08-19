package com.edhir.proxy.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RateLimiter.
 *
 * Tests use Mockito to simulate Redis responses — no real Redis instance
 * required. This lets us verify bucket depletion and refill logic in isolation.
 */
@ExtendWith(MockitoExtension.class)
class RateLimiterTest {

    @Mock
    private RedisTemplate<String, Long> redisTemplate;

    @Mock
    private ValueOperations<String, Long> valueOps;

    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        rateLimiter = new RateLimiter(redisTemplate);
    }

    // ── New session: bucket starts full ─────────────────────────────────────

    @Test
    void firstRequest_bucketNotExist_shouldAllow() {
        // decrement returns null when key does not exist
        when(valueOps.decrement(anyString())).thenReturn(null);

        boolean result = rateLimiter.checkLimit("session-new");

        assertThat(result).isTrue();
        // Should initialise key with capacity - 1 = 9
        verify(valueOps).set(eq("ratelimit:session-new"), eq(9L), any(Duration.class));
    }

    // ── Tokens remaining: request should pass ────────────────────────────────

    @Test
    void tokenAvailable_shouldAllow() {
        when(valueOps.decrement(anyString())).thenReturn(5L); // 5 left after decrement

        boolean result = rateLimiter.checkLimit("session-abc");

        assertThat(result).isTrue();
        // TTL should be refreshed
        verify(redisTemplate).expire(eq("ratelimit:session-abc"), any(Duration.class));
    }

    // ── Bucket hits zero: last token ─────────────────────────────────────────

    @Test
    void lastToken_shouldStillAllow() {
        when(valueOps.decrement(anyString())).thenReturn(0L);

        boolean result = rateLimiter.checkLimit("session-zero");

        assertThat(result).isTrue();
    }

    // ── Bucket exhausted: negative counter → deny ────────────────────────────

    @Test
    void bucketExhausted_shouldDeny() {
        when(valueOps.decrement(anyString())).thenReturn(-1L);

        boolean result = rateLimiter.checkLimit("session-full");

        assertThat(result).isFalse();
        // Counter should be reset to 0 to prevent runaway negatives
        verify(valueOps).set(eq("ratelimit:session-full"), eq(0L), any(Duration.class));
    }

    // ── Repeated exhaustion ──────────────────────────────────────────────────

    @Test
    void repeatedExhaustedRequests_allDenied() {
        when(valueOps.decrement(anyString())).thenReturn(-5L);

        assertThat(rateLimiter.checkLimit("session-x")).isFalse();
        assertThat(rateLimiter.checkLimit("session-x")).isFalse();
    }

    // ── Different sessions: independent buckets ──────────────────────────────

    @Test
    void differentSessions_independentBuckets() {
        when(valueOps.decrement("ratelimit:session-a")).thenReturn(3L);
        when(valueOps.decrement("ratelimit:session-b")).thenReturn(-1L);

        assertThat(rateLimiter.checkLimit("session-a")).isTrue();
        assertThat(rateLimiter.checkLimit("session-b")).isFalse();
    }
}
