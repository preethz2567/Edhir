package com.edhir.proxy.controller;

import com.edhir.proxy.model.Tenant;
import com.edhir.proxy.tenant.TenantRegistry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantRegistry tenantRegistry;

    public TenantController(TenantRegistry tenantRegistry) {
        this.tenantRegistry = tenantRegistry;
    }

    @PostMapping
    public ResponseEntity<String> registerTenant(@RequestBody TenantRequest request) {
        String apiKey = tenantRegistry.registerTenant(
                request.getAppName(),
                request.getContactEmail(),
                request.getIntegrationMode());
        return ResponseEntity.ok(apiKey);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTenant(@PathVariable UUID id) {
        return tenantRegistry.findById(id)
                .map(entity -> {
                    Tenant dto = new Tenant();
                    dto.setId(entity.getId());
                    dto.setAppName(entity.getAppName());
                    dto.setApiKey(entity.getApiKey());
                    dto.setIntegrationMode(entity.getIntegrationMode());
                    dto.setContactEmail(entity.getContactEmail());
                    dto.setActive(entity.isActive());
                    dto.setCreatedAt(entity.getCreatedAt());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class TenantRequest {
        private String appName;
        private String contactEmail;
        private String integrationMode;

        public String getAppName() { return appName; }
        public void setAppName(String appName) { this.appName = appName; }

        public String getContactEmail() { return contactEmail; }
        public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

        public String getIntegrationMode() { return integrationMode; }
        public void setIntegrationMode(String integrationMode) { this.integrationMode = integrationMode; }
    }
}
