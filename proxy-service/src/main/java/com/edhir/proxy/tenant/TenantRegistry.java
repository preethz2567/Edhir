package com.edhir.proxy.tenant;

import com.edhir.proxy.entity.TenantEntity;
import com.edhir.proxy.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java.util.UUID;

/**
 * TenantRegistry manages tenant lifecycle: registration and API key validation.
 * All state is persisted in the tenants table via Spring Data JPA.
 */
@Service
public class TenantRegistry {

    private final TenantRepository tenantRepository;
    
    @Value("${edhir.security.pepper}")
    private String pepper;

    public TenantRegistry(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    /**
     * Registers a new tenant, persisting it to the tenants table.
     *
     * @param appName          the name of the protected application
     * @param contactEmail     owner e-mail for alerts
     * @param integrationMode  "sidecar" or "sdk"
     * @return the generated API key that the tenant uses to authenticate requests
     */
    @Transactional
    public String registerTenant(String appName, String contactEmail, String integrationMode) {
        String rawApiKey = UUID.randomUUID().toString();
        
        TenantEntity tenant = new TenantEntity();
        tenant.setAppName(appName);
        tenant.setContactEmail(contactEmail);
        tenant.setIntegrationMode(integrationMode);
        tenant.setApiKey(hashApiKey(rawApiKey));
        tenant.setActive(true);
        tenant.setFailOpen(true);
        tenantRepository.save(tenant);
        
        // Return raw key so it can be shown to the user once
        return rawApiKey;
    }

    /**
     * Validates that the given API key belongs to an active tenant.
     *
     * @param apiKey the X-Api-Key header value
     * @return true if the key maps to a live tenant
     */
    public boolean validateApiKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) return false;
        return tenantRepository.existsByApiKeyAndIsActiveTrue(hashApiKey(apiKey));
    }

    /**
     * Looks up a tenant by its UUID primary key. Used by TenantController GET /tenants/{id}.
     */
    public Optional<TenantEntity> findById(UUID id) {
        return tenantRepository.findById(id);
    }

    /**
     * Looks up the full TenantEntity by API key. Used by the proxy to
     * obtain the tenantId for per-request scoped rule loading.
     */
    public Optional<TenantEntity> findByApiKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) return Optional.empty();
        return tenantRepository.findByApiKey(hashApiKey(apiKey));
    }
    
    private String hashApiKey(String rawApiKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = rawApiKey + pepper;
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
