package com.edhir.proxy.controller;

import com.edhir.proxy.entity.RequestEntity;
import com.edhir.proxy.repository.RequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DashboardController exposes read-only endpoints consumed by the React dashboard.
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Allow the dashboard (port 3000) to call directly
public class DashboardController {

    private final RequestRepository requestRepository;

    public DashboardController(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    /**
     * GET /dashboard/live
     *
     * Returns the last 50 requests ordered by timestamp descending, plus a
     * summary of allowed vs. blocked counts in that window.
     *
     * Response shape:
     * {
     *   "requests": [ { "id", "sessionId", "timestamp", "path", "method", "verdict", "responseTimeMs" }, ... ],
     *   "summary":  { "total": 50, "allowed": 40, "blocked": 10 }
     * }
     */
    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> live() {
        List<RequestEntity> recent = requestRepository.findTop50ByOrderByTimestampDesc();

        List<Map<String, Object>> rows = recent.stream().map(r -> {
            Map<String, Object> row = new HashMap<>();
            row.put("id", r.getId());
            row.put("sessionId", r.getSessionId());
            row.put("timestamp", r.getTimestamp());
            row.put("path", r.getPath());
            row.put("method", r.getMethod());
            row.put("verdict", r.getVerdict());
            row.put("responseTimeMs", r.getResponseTimeMs());
            row.put("matchedRuleId", r.getMatchedRuleId());
            return row;
        }).collect(Collectors.toList());

        long blocked = recent.stream()
                .filter(r -> "block".equals(r.getVerdict())).count();
        long allowed = recent.size() - blocked;

        Map<String, Object> summary = new HashMap<>();
        summary.put("total", recent.size());
        summary.put("allowed", allowed);
        summary.put("blocked", blocked);

        Map<String, Object> body = new HashMap<>();
        body.put("requests", rows);
        body.put("summary", summary);

        return ResponseEntity.ok(body);
    }
}
