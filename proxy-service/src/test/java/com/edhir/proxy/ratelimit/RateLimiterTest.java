package com.edhir.proxy.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RateLimiterTest {

    private RateLimiter rateLimiter;
    private RedisTemplate<String, Long> redisTemplate;
    
    // Simulate Lua script execution
    private AtomicInteger mockBucket = new AtomicInteger(10);

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(RedisTemplate.class);
        
        when(redisTemplate.execute(any(RedisScript.class), anyList(), any(), any())).thenAnswer(invocation -> {
            // Mocking the Lua script behavior: return 1L if token consumed, 0L if empty
            if (mockBucket.get() > 0) {
                mockBucket.decrementAndGet();
                return 1L;
            } else {
                return 0L;
            }
        });
        
        rateLimiter = new RateLimiter(redisTemplate);
    }

    @Test
    void testBucketDepletion() {
        // First 10 requests should succeed
        for (int i = 0; i < 10; i++) {
            assertEquals(true, rateLimiter.checkLimit("session1"));
        }
        
        // 11th request should fail
        assertEquals(false, rateLimiter.checkLimit("session1"));
    }

    @Test
    void testConcurrentAccess() throws InterruptedException {
        int threadCount = 20; // 20 threads trying to consume from a bucket of 10
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                if (rateLimiter.checkLimit("session2")) {
                    successCount.incrementAndGet();
                } else {
                    failCount.incrementAndGet();
                }
                latch.countDown();
            });
        }
        
        latch.await();
        executor.shutdown();
        
        // Exactly 10 should succeed, 10 should fail (simulated atomic lua execution)
        assertEquals(10, successCount.get());
        assertEquals(10, failCount.get());
    }
}
