package com.edhir.proxy.tenant;

import com.edhir.proxy.entity.TenantEntity;
import com.edhir.proxy.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * TenantRegistry manages tenant lifecycle: registration and API key validation.
 * All state is persisted in the tenants table via Spring Data JPA.
 */
@Service
public class TenantRegistry {

    private final TenantRepository tenantRepository;

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
        TenantEntity tenant = new TenantEntity();
        tenant.setAppName(appName);
        tenant.setContactEmail(contactEmail);
        tenant.setIntegrationMode(integrationMode);
        tenant.setApiKey(UUID.randomUUID().toString());
        tenant.setActive(true);
        tenantRepository.save(tenant);
        return tenant.getApiKey();
    }

    /**
     * Validates that the given API key belongs to an active tenant.
     *
     * @param apiKey the X-Api-Key header value
     * @return true if the key maps to a live tenant
     */
    public boolean validateApiKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) return false;
        return tenantRepository.existsByApiKeyAndIsActiveTrue(apiKey);
    }

    /**
     * Looks up the full TenantEntity by API key. Used by the proxy to
     * obtain the tenantId for per-request scoped rule loading.
     */
    public Optional<TenantEntity> findByApiKey(String apiKey) {
        return tenantRepository.findByApiKey(apiKey);
    }
}
