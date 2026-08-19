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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Enumeration;
import java.util.Optional;
import java.util.UUID;

/**
 * SidecarProxy — the main entry point for all traffic passing through Edhir.
 *
 * Synchronous pipeline (deterministic, Week 3):
 *   1. Validate X-Api-Key → reject with 401 if invalid
 *   2. Resolve / upsert session from client fingerprint
 *   3. Check rate limit (Redis token bucket) → reject with 429 if exhausted
 *   4. Evaluate rules (regex) → reject with 403 if matched
 *   5. Persist RequestEntity to DB
 *   6. Publish to RabbitMQ (async scoring by ml-service)
 *   7. Forward request to demo-app and return its response
 *
 * Week 4 additions: ML score check, adaptive threshold, honeypot routing.
 */
@RestController
public class ProxyController {

    private final TenantRegistry tenantRegistry;
    private final RateLimiter rateLimiter;
    private final RuleEngine ruleEngine;
    private final SessionRepository sessionRepository;
    private final RequestRepository requestRepository;
    private final RequestMetadataPublisher publisher;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${edhir.demo-app-url}")
    private String demoAppUrl;

    public ProxyController(TenantRegistry tenantRegistry,
                           RateLimiter rateLimiter,
                           RuleEngine ruleEngine,
                           SessionRepository sessionRepository,
                           RequestRepository requestRepository,
                           RequestMetadataPublisher publisher) {
        this.tenantRegistry = tenantRegistry;
        this.rateLimiter = rateLimiter;
        this.ruleEngine = ruleEngine;
        this.sessionRepository = sessionRepository;
        this.requestRepository = requestRepository;
        this.publisher = publisher;
    }

    @RequestMapping("/**")
    public ResponseEntity<String> proxy(HttpServletRequest httpRequest) {
        long startMs = System.currentTimeMillis();

        // ── Step 1: Validate API key ───────────────────────────────────────────
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

        // ── Step 2: Resolve session from fingerprint ───────────────────────────
        String fingerprint = computeFingerprint(httpRequest);
        SessionEntity session = sessionRepository
                .findByClientFingerprintAndTenantId(fingerprint, tenant.getId())
                .orElseGet(() -> createSession(fingerprint, tenant.getId()));
        session.setLastSeenAt(LocalDateTime.now());
        sessionRepository.save(session);

        // ── Step 3: Rate limit check ───────────────────────────────────────────
        if (!rateLimiter.checkLimit(session.getId().toString())) {
            persistAndPublish(session, httpRequest, null, "block",
                    (int)(System.currentTimeMillis() - startMs));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Edhir: rate limit exceeded");
        }

        // ── Step 4: Rule engine evaluation ────────────────────────────────────
        String queryString = httpRequest.getQueryString();
        Verdict verdict = ruleEngine.evaluate(
                httpRequest.getRequestURI(), queryString, tenant.getId());

        if (verdict.isBlock()) {
            persistAndPublish(session, httpRequest, verdict.getMatchedRuleId(), "block",
                    (int)(System.currentTimeMillis() - startMs));
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Edhir: request blocked by rule " + verdict.getMatchedRuleId());
        }

        // ── Step 5 & 6: Forward to demo-app, persist, publish ─────────────────
        String targetUrl = demoAppUrl + httpRequest.getRequestURI()
                + (queryString != null ? "?" + queryString : "");
        String response;
        try {
            HttpHeaders headers = copyHeaders(httpRequest);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> downstream = restTemplate.exchange(
                    targetUrl, HttpMethod.valueOf(httpRequest.getMethod()), entity, String.class);
            response = downstream.getBody();
        } catch (Exception e) {
            response = "demo-app unavailable: " + e.getMessage();
        }

        persistAndPublish(session, httpRequest, null, "allow",
                (int)(System.currentTimeMillis() - startMs));
        return ResponseEntity.ok(response);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private SessionEntity createSession(String fingerprint, UUID tenantId) {
        SessionEntity s = new SessionEntity();
        s.setClientFingerprint(fingerprint);
        s.setTenantId(tenantId);
        return sessionRepository.save(s);
    }

    /** SHA-256(IP + User-Agent) — no raw PII stored. */
    private String computeFingerprint(HttpServletRequest request) {
        String raw = request.getRemoteAddr()
                + "|" + request.getHeader("User-Agent");
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "unknown-" + raw.hashCode();
        }
    }

    private HttpHeaders copyHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            // Drop the Edhir API key before forwarding
            if (!name.equalsIgnoreCase("X-Api-Key")) {
                headers.set(name, request.getHeader(name));
            }
        }
        return headers;
    }

    private void persistAndPublish(SessionEntity session, HttpServletRequest httpRequest,
                                   UUID matchedRuleId, String verdict, int responseMs) {
        RequestEntity req = new RequestEntity();
        req.setSessionId(session.getId());
        req.setPath(httpRequest.getRequestURI());
        req.setMethod(httpRequest.getMethod());
        req.setVerdict(verdict);
        req.setMatchedRuleId(matchedRuleId);
        req.setResponseTimeMs(responseMs);
        requestRepository.save(req);
        publisher.publish(req);
    }
}
