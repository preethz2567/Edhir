package com.edhir.proxy.controller;

import com.edhir.proxy.engine.RuleEngine;
import com.edhir.proxy.entity.RequestEntity;
import com.edhir.proxy.entity.SessionEntity;
import com.edhir.proxy.entity.TenantEntity;
import com.edhir.proxy.messaging.RequestMetadataPublisher;
import com.edhir.proxy.model.Verdict;
import com.edhir.proxy.ratelimit.RateLimiter;
import com.edhir.proxy.repository.RequestRepository;
import com.edhir.proxy.repository.SessionRepository;
import com.edhir.proxy.tenant.TenantRegistry;
import com.edhir.proxy.adaptive.AdaptiveController;
import com.edhir.proxy.router.HoneypotRouter;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Enumeration;
import java.util.Optional;
import java.util.UUID;

@RestController
public class ProxyController {

    private static final Logger logger = LoggerFactory.getLogger(ProxyController.class);
    
    private final TenantRegistry tenantRegistry;
    private final RateLimiter rateLimiter;
    private final RuleEngine ruleEngine;
    private final SessionRepository sessionRepository;
    private final RequestRepository requestRepository;
    private final RequestMetadataPublisher publisher;
    private final CircuitBreakerFactory circuitBreakerFactory;
    private final AdaptiveController adaptiveController;
    private final HoneypotRouter honeypotRouter;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final MeterRegistry meterRegistry;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${edhir.demo-app-url}")
    private String demoAppUrl;

    public ProxyController(TenantRegistry tenantRegistry,
                           RateLimiter rateLimiter,
                           RuleEngine ruleEngine,
                           SessionRepository sessionRepository,
                           RequestRepository requestRepository,
                           RequestMetadataPublisher publisher,
                           CircuitBreakerFactory circuitBreakerFactory,
                           AdaptiveController adaptiveController,
                           HoneypotRouter honeypotRouter,
                           org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate,
                           MeterRegistry meterRegistry) {
        this.tenantRegistry = tenantRegistry;
        this.rateLimiter = rateLimiter;
        this.ruleEngine = ruleEngine;
        this.sessionRepository = sessionRepository;
        this.requestRepository = requestRepository;
        this.publisher = publisher;
        this.circuitBreakerFactory = circuitBreakerFactory;
        this.adaptiveController = adaptiveController;
        this.honeypotRouter = honeypotRouter;
        this.messagingTemplate = messagingTemplate;
        this.meterRegistry = meterRegistry;
    }

    @RequestMapping("/**")
    public ResponseEntity<String> proxy(HttpServletRequest httpRequest) {
        long startMs = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        
        try {
            MDC.put("requestId", requestId);
            
            // Input Validation: prevent resource exhaustion
            if (httpRequest.getRequestURI().length() > 2048) {
                return ResponseEntity.status(HttpStatus.URI_TOO_LONG).body("URI too long");
            }
            if (httpRequest.getHeaderNames() != null) {
                int headerCount = 0;
                Enumeration<String> names = httpRequest.getHeaderNames();
                while(names.hasMoreElements()) {
                    names.nextElement();
                    headerCount++;
                }
                if (headerCount > 100) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Too many headers");
                }
            }

            // Step 1: Validate API key
            String apiKey = httpRequest.getHeader("X-Api-Key");
            if (!tenantRegistry.validateApiKey(apiKey)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Edhir: invalid or missing X-Api-Key");
            }

            Optional<TenantEntity> tenantOpt = tenantRegistry.findByApiKey(apiKey);
            if (tenantOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Edhir: tenant not found");
            }
            TenantEntity tenant = tenantOpt.get();
            MDC.put("tenantId", tenant.getId().toString());

            // Step 2: Resolve or create session from client fingerprint
            String fingerprint = computeFingerprint(httpRequest);
            SessionEntity session = resolveSessionSafe(fingerprint, tenant);
            
            // Step 3: Rate limit check (Fail-open aware)
            boolean limitExceeded = false;
            try {
                if (!rateLimiter.checkLimit(session.getId().toString())) {
                    limitExceeded = true;
                }
            } catch (Exception e) {
                logger.warn("Rate limiter failed: {}", e.getMessage());
                if (!tenant.isFailOpen()) {
                    limitExceeded = true;
                }
            }
            
            if (limitExceeded) {
                persistAndPublish(session, httpRequest, null, "block", startMs);
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body("Edhir: rate limit exceeded");
            }

            // Step 4: Rule engine evaluation (Fail-open aware)
            String queryString = httpRequest.getQueryString();
            Verdict verdict = Verdict.allow();
            try {
                verdict = ruleEngine.evaluate(httpRequest.getRequestURI(), queryString, tenant.getId());
            } catch (Exception e) {
                logger.warn("Rule engine failed: {}", e.getMessage());
                if (!tenant.isFailOpen()) {
                    verdict = Verdict.block(null); // Block with no specific rule
                }
            }

            if (verdict.isBlock()) {
                persistAndPublish(session, httpRequest, verdict.getMatchedRuleId(), "block", startMs);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Edhir: request blocked by rule " + verdict.getMatchedRuleId());
            }

            // Step 4.5: Adaptive Detection and Honeypot Routing
            float currentScore = session.getCurrentScore();
            boolean isTrending = adaptiveController.detectTrend(session.getId().toString(), currentScore, tenant.getAdaptiveSensitivity());
            float newThreshold = adaptiveController.getAdjustedThreshold(session.getId().toString(), currentScore, 80.0f, tenant.getAdaptiveFloor(), isTrending);
            
            // Update session threshold if changed
            if (session.getCurrentThreshold() != newThreshold) {
                session.setCurrentThreshold(newThreshold);
                sessionRepository.save(session);
            }

            if (currentScore >= newThreshold) {
                boolean redirect = honeypotRouter.shouldRedirect(currentScore, newThreshold);
                if (redirect) {
                    persistAndPublish(session, httpRequest, null, "honeypot", startMs);
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .header(HttpHeaders.LOCATION, "/honeypot-sinkhole")
                            .build();
                } else {
                    persistAndPublish(session, httpRequest, null, "block", startMs);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Edhir: request blocked by adaptive score threshold");
                }
            }

            // Step 5: Forward request to demo-app using Resilience4j
            String targetUrl = demoAppUrl + httpRequest.getRequestURI()
                    + (queryString != null ? "?" + queryString : "");

            String requestBody = readBodySafe(httpRequest);
            HttpHeaders headers = copyHeaders(httpRequest);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            CircuitBreaker cb = circuitBreakerFactory.create("demoApp");
            ResponseEntity<String> downstream = cb.run(
                () -> restTemplate.exchange(targetUrl, HttpMethod.valueOf(httpRequest.getMethod()), entity, String.class),
                throwable -> ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("demo-app unavailable: " + throwable.getMessage())
            );

            // Step 6: Persist and publish
            persistAndPublish(session, httpRequest, null, "allow", startMs);

            return ResponseEntity.status(downstream.getStatusCode())
                    .headers(downstream.getHeaders())
                    .body(downstream.getBody());
                    
        } finally {
            MDC.clear();
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private SessionEntity resolveSessionSafe(String fingerprint, TenantEntity tenant) {
        try {
            SessionEntity session = sessionRepository
                    .findByClientFingerprintAndTenantId(fingerprint, tenant.getId())
                    .orElseGet(() -> createSession(fingerprint, tenant.getId()));
            session.setLastSeenAt(LocalDateTime.now());
            return sessionRepository.save(session);
        } catch (Exception e) {
            logger.warn("Session resolution failed, using ephemeral session: {}", e.getMessage());
            SessionEntity ephemeral = new SessionEntity();
            ephemeral.setId(UUID.randomUUID());
            ephemeral.setTenantId(tenant.getId());
            ephemeral.setClientFingerprint(fingerprint);
            return ephemeral;
        }
    }

    private SessionEntity createSession(String fingerprint, UUID tenantId) {
        SessionEntity s = new SessionEntity();
        s.setClientFingerprint(fingerprint);
        s.setTenantId(tenantId);
        return sessionRepository.save(s);
    }

    private String computeFingerprint(HttpServletRequest request) {
        String raw = request.getRemoteAddr() + "|" + request.getHeader("User-Agent");
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "unknown-" + Math.abs(raw.hashCode());
        }
    }

    private String readBodySafe(HttpServletRequest request) {
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            if (reader == null) return null;
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.length() > 0 ? sb.toString() : null;
        } catch (IOException e) {
            return null;
        }
    }

    private HttpHeaders copyHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        if (names != null) {
            while (names.hasMoreElements()) {
                String name = names.nextElement();
                if (!name.equalsIgnoreCase("X-Api-Key")) {
                    headers.set(name, request.getHeader(name));
                }
            }
        }
        return headers;
    }

    private void persistAndPublish(SessionEntity session, HttpServletRequest httpRequest,
                                   UUID matchedRuleId, String verdict, long startMs) {
        int responseMs = (int) (System.currentTimeMillis() - startMs);
        
        MDC.put("verdict", verdict);
        MDC.put("latency", String.valueOf(responseMs));
        if (matchedRuleId != null) {
            MDC.put("matchedRuleId", matchedRuleId.toString());
        }
        
        // Structured log output (handled by Logstash encoder based on MDC context)
        logger.info("Request processed");

        // Record metrics
        Counter.builder("edhir.requests")
                .tag("verdict", verdict)
                .tag("tenantId", session.getTenantId().toString())
                .register(meterRegistry)
                .increment();

        if (matchedRuleId != null) {
            Counter.builder("edhir.rule.matches")
                    .tag("ruleId", matchedRuleId.toString())
                    .tag("tenantId", session.getTenantId().toString())
                    .register(meterRegistry)
                    .increment();
        }

        try {
            RequestEntity req = new RequestEntity();
            req.setSessionId(session.getId());
            req.setPath(httpRequest.getRequestURI());
            req.setMethod(httpRequest.getMethod());
            req.setVerdict(verdict);
            req.setMatchedRuleId(matchedRuleId);
            req.setResponseTimeMs(responseMs);
            requestRepository.save(req);
            publisher.publish(req);
            
            // Broadcast to WebSocket for the specific tenant
            java.util.Map<String, Object> wsPayload = new java.util.HashMap<>();
            wsPayload.put("id", req.getId());
            wsPayload.put("sessionId", req.getSessionId());
            wsPayload.put("timestamp", req.getTimestamp());
            wsPayload.put("path", req.getPath());
            wsPayload.put("method", req.getMethod());
            wsPayload.put("verdict", req.getVerdict());
            wsPayload.put("responseTimeMs", req.getResponseTimeMs());
            wsPayload.put("matchedRuleId", req.getMatchedRuleId());
            messagingTemplate.convertAndSend("/topic/feed/" + session.getTenantId(), (Object) wsPayload);
        } catch (Exception e) {
            logger.error("Failed to persist request record: {}", e.getMessage());
        }
    }
}
