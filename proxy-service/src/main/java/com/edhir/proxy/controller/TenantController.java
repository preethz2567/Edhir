package com.edhir.proxy.controller;

import com.edhir.proxy.model.Tenant;
import com.edhir.proxy.tenant.TenantRegistry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantRegistry tenantRegistry;

    public TenantController(TenantRegistry tenantRegistry) {
        this.tenantRegistry = tenantRegistry;
    }

    @PostMapping
    public ResponseEntity<String> registerTenant(@RequestBody TenantRequest request) {
        String apiKey = tenantRegistry.registerTenant(request.getAppName());
        return ResponseEntity.ok(apiKey);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenant(@PathVariable UUID id) {
        // TODO: Replace with actual database lookup
        Tenant tenant = new Tenant();
        tenant.setId(id);
        tenant.setAppName("Placeholder App");
        tenant.setIntegrationMode("API");
        tenant.setCreatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(tenant);
    }

    public static class TenantRequest {
        private String appName;

        public String getAppName() {
            return appName;
        }

        public void setAppName(String appName) {
            this.appName = appName;
        }
    }
}
