package com.edhir.proxy.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.edhir.proxy.entity.TenantEntity;
import com.edhir.proxy.tenant.TenantRegistry;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final TenantRegistry tenantRegistry;
    // In production, this should be an environment variable
    private static final String JWT_SECRET = "edhir_super_secret_key_12345";
    private static final long JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    public AuthController(TenantRegistry tenantRegistry) {
        this.tenantRegistry = tenantRegistry;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String apiKey = payload.get("apiKey");
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "API Key is required"));
        }

        Optional<TenantEntity> tenantOpt = tenantRegistry.findByApiKey(apiKey);
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid API Key"));
        }

        TenantEntity tenant = tenantOpt.get();

        // Generate JWT
        Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);
        String token = JWT.create()
                .withIssuer("edhir-proxy")
                .withSubject(tenant.getId().toString())
                .withClaim("appName", tenant.getAppName())
                .withExpiresAt(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .sign(algorithm);

        // Set HttpOnly Cookie
        Cookie cookie = new Cookie("EDHIR_SESSION", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Should be true in prod with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int) (JWT_EXPIRATION_MS / 1000));
        
        // Spring Boot cookie handling can sometimes lack SameSite configuration easily through basic Cookie class, 
        // but for now this suffices. Alternatively, set header manually:
        response.addHeader("Set-Cookie", "EDHIR_SESSION=" + token + "; HttpOnly; Path=/; Max-Age=" + (JWT_EXPIRATION_MS / 1000) + "; SameSite=Lax");

        Map<String, String> body = new HashMap<>();
        body.put("tenantId", tenant.getId().toString());
        body.put("appName", tenant.getAppName());
        
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addHeader("Set-Cookie", "EDHIR_SESSION=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
        return ResponseEntity.ok().build();
    }
}
