package com.edhir.proxy.tenant;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class TenantRegistry {

    public String registerTenant(String appName) {
        // TODO: Implement actual registration logic and database storage
        return UUID.randomUUID().toString(); // Placeholder API Key
    }

    public boolean validateApiKey(String apiKey) {
        // TODO: Implement actual validation logic against database
        return true; 
    }
}
