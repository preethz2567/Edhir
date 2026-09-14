# Edhir Integration Guide

Edhir is designed to protect your applications with minimal code changes. You can integrate Edhir via the **Standalone Sidecar** or the **Java SDK**.

---

## Method 1: Standalone Sidecar (Recommended)

The easiest way to integrate Edhir is by deploying the proxy sidecar alongside your application. The proxy intercepts all incoming traffic, enforces security rules, and forwards clean traffic to your application.

### Docker Compose Example

```yaml
services:
  your-app:
    image: your-app-image
    # Do not expose ports to the host; let the sidecar handle traffic.

  edhir-sidecar:
    image: edhir/sidecar:latest
    ports:
      - "8443:8080"
    environment:
      - TARGET_URL=http://your-app:5000
      - EDHIR_API_KEY=your-tenant-api-key
      - POSTGRES_USER=edhir_user
      - POSTGRES_PASSWORD=your-db-password
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    depends_on:
      - your-app
```

**Configuration Reference:**
- `TARGET_URL`: The internal address of your application.
- `EDHIR_API_KEY`: Your generated API Key from the Edhir dashboard.
- Database/Redis/RabbitMQ: Connects to the central Edhir infrastructure for real-time telemetry and rule updates.

---

## Method 2: Java SDK (Middleware)

For Java Spring Boot applications that require fine-grained control or cannot deploy a sidecar, you can embed the Edhir SDK directly into your application.

### 1. Add Maven Dependency

```xml
<dependency>
    <groupId>com.edhir</groupId>
    <artifactId>edhir-java-sdk</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

### 2. Configure application.yml

Connect the SDK to the Edhir infrastructure:

```yaml
edhir:
  security:
    pepper: your-secret-pepper

spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/edhir
    username: edhir_user
    password: your-password
```

### 3. Implement the Security Filter

Add a Servlet Filter to intercept incoming requests and use the SDK's `RuleEngine`:

```java
import com.edhir.proxy.engine.RuleEngine;
import com.edhir.proxy.model.Verdict;
import org.springframework.stereotype.Component;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;

@Component
public class EdhirSecurityFilter implements Filter {

    private final RuleEngine ruleEngine;
    private final UUID tenantId = UUID.fromString("your-tenant-id");

    public EdhirSecurityFilter(RuleEngine ruleEngine) {
        this.ruleEngine = ruleEngine;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Evaluate request with Edhir
        Verdict verdict = ruleEngine.evaluate(
            httpRequest.getRequestURI(), 
            httpRequest.getQueryString(), 
            null, 
            tenantId
        );

        if (verdict.isBlock()) {
            httpResponse.setStatus(403);
            httpResponse.getWriter().write("Blocked by Edhir Security");
            return;
        }

        chain.doFilter(request, response);
    }
}
```
