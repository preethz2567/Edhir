package com.edhir.proxy.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DataRetentionTask {
    private static final Logger logger = LoggerFactory.getLogger(DataRetentionTask.class);
    private final JdbcTemplate jdbcTemplate;

    public DataRetentionTask(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Run every day at 2 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldRequests() {
        logger.info("Starting data retention cleanup task for old requests...");
        try {
            // Delete requests older than 90 days
            String sql = "DELETE FROM requests WHERE timestamp < NOW() - INTERVAL '90 days'";
            int deletedRows = jdbcTemplate.update(sql);
            logger.info("Data retention cleanup complete. Deleted {} old requests.", deletedRows);
        } catch (Exception e) {
            logger.error("Failed to execute data retention cleanup task", e);
        }
    }
}
