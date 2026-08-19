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

    // Catch-all proxy handler. Spring resolves more specific mappings first,
    // so /tenants/** and /dashboard/** are handled by their own controllers
    // and never reach this method.
    @RequestMapping("/**")
    public ResponseEntity<String> proxy(HttpServletRequest httpRequest) {
        long startMs = System.currentTimeMillis();

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

        // Step 2: Resolve or create session from client fingerprint
        String fingerprint = computeFingerprint(httpRequest);
        SessionEntity session = sessionRepository
                .findByClientFingerprintAndTenantId(fingerprint, tenant.getId())
                .orElseGet(() -> createSession(fingerprint, tenant.getId()));
        session.setLastSeenAt(LocalDateTime.now());
        sessionRepository.save(session);

        // Step 3: Rate limit check
        if (!rateLimiter.checkLimit(session.getId().toString())) {
            persistAndPublish(session, httpRequest, null, "block",
                    (int) (System.currentTimeMillis() - startMs));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Edhir: rate limit exceeded");
        }

        // Step 4: Rule engine evaluation
        String queryString = httpRequest.getQueryString();
        Verdict verdict = ruleEngine.evaluate(httpRequest.getRequestURI(), queryString, tenant.getId());

        if (verdict.isBlock()) {
            persistAndPublish(session, httpRequest, verdict.getMatchedRuleId(), "block",
                    (int) (System.currentTimeMillis() - startMs));
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Edhir: request blocked by rule " + verdict.getMatchedRuleId());
        }

        // Step 5: Forward request to demo-app
        String targetUrl = demoAppUrl + httpRequest.getRequestURI()
                + (queryString != null ? "?" + queryString : "");

        String responseBody;
        try {
            String requestBody = readBody(httpRequest);
            HttpHeaders headers = copyHeaders(httpRequest);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> downstream = restTemplate.exchange(
                    targetUrl, HttpMethod.valueOf(httpRequest.getMethod()), entity, String.class);
            responseBody = downstream.getBody();
        } catch (Exception e) {
            responseBody = "demo-app unavailable: " + e.getMessage();
        }

        // Step 6: Persist and publish (always, regardless of downstream outcome)
        persistAndPublish(session, httpRequest, null, "allow",
                (int) (System.currentTimeMillis() - startMs));

        return ResponseEntity.ok(responseBody);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

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

    private String readBody(HttpServletRequest request) {
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
