package com.edhir.testapp;

import com.edhir.proxy.engine.RuleEngine;
import com.edhir.proxy.model.Verdict;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class EdhirSecurityFilter implements Filter {

    private final RuleEngine ruleEngine;
    // Hardcoded tenant ID for the demo test app
    private final UUID tenantId = UUID.fromString("bad07d18-621e-441a-8ecd-f7c769294ab1");

    public EdhirSecurityFilter(RuleEngine ruleEngine) {
        this.ruleEngine = ruleEngine;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Extract metadata for RuleEngine
        String path = httpRequest.getRequestURI();
        String query = httpRequest.getQueryString();
        
        // Use SDK to evaluate traffic locally
        Verdict verdict = ruleEngine.evaluate(path, query, null, tenantId);

        if (verdict.isBlock()) {
            httpResponse.setStatus(403);
            httpResponse.getWriter().write("Edhir SDK: Blocked by local rule engine! Rule=" + verdict.getMatchedRuleId());
            return;
        }

        chain.doFilter(request, response);
    }
}
