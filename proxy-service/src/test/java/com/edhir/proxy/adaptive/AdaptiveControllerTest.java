package com.edhir.proxy.adaptive;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class AdaptiveControllerTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ListOperations<String, String> listOperations;

    private AdaptiveController adaptiveController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForList()).thenReturn(listOperations);
        adaptiveController = new AdaptiveController(redisTemplate);
    }

    @Test
    void testDetectTrend_UpwardTrend() {
        // Mock scores that are clearly trending upwards: 50, 60, 70, 80, 90
        when(listOperations.range(anyString(), eq(0L), eq(-1L)))
                .thenReturn(Arrays.asList("50.0", "60.0", "70.0", "80.0", "90.0"));

        // Slope of (0,50), (1,60), (2,70), (3,80), (4,90) is exactly 10.0
        // If sensitivity is 5.0, it should flag as trending
        boolean isTrending = adaptiveController.detectTrend("session-1", 90.0f, 5.0f);
        assertTrue(isTrending, "Should detect upward trend");
    }

    @Test
    void testDetectTrend_NoisyButFlat() {
        // Mock scores that are noisy but not trending: 50, 70, 40, 80, 50
        when(listOperations.range(anyString(), eq(0L), eq(-1L)))
                .thenReturn(Arrays.asList("50.0", "70.0", "40.0", "80.0", "50.0"));

        // Slope is roughly 0
        boolean isTrending = adaptiveController.detectTrend("session-2", 50.0f, 5.0f);
        assertFalse(isTrending, "Should not detect trend for noisy flat scores");
    }

    @Test
    void testDetectTrend_DownwardTrend() {
        // Mock scores trending down: 90, 80, 70, 60, 50
        when(listOperations.range(anyString(), eq(0L), eq(-1L)))
                .thenReturn(Arrays.asList("90.0", "80.0", "70.0", "60.0", "50.0"));

        // Slope is -10.0
        boolean isTrending = adaptiveController.detectTrend("session-3", 50.0f, 5.0f);
        assertFalse(isTrending, "Downward trend should not be flagged as upward anomaly");
    }
}
