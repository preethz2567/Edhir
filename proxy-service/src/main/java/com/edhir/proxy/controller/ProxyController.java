package com.edhir.proxy.controller;

import com.edhir.proxy.engine.RuleEngine;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class ProxyController {

    private final RuleEngine ruleEngine;
    private final CircuitBreakerFactory circuitBreakerFactory;
    private final RestTemplate restTemplate = new RestTemplate();

    public ProxyController(RuleEngine ruleEngine, CircuitBreakerFactory circuitBreakerFactory) {
        this.ruleEngine = ruleEngine;
        this.circuitBreakerFactory = circuitBreakerFactory;
    }

    @RequestMapping("/**")
    public String proxy(HttpServletRequest request) {
        if (!ruleEngine.isAllowed(request)) {
            return "Blocked by Rule Engine or Rate Limiting";
        }
        
        // Placeholder for calling ml-service wrapped with Resilience4j
        String mlResult = (String) circuitBreakerFactory.create("ml-service").run(
            () -> restTemplate.getForObject("http://ml-service:8000/score", String.class),
            throwable -> "Fallback: ML Service unavailable"
        );
        
        return "Proxy forwarded successfully. ML Status: " + mlResult;
    }
}
