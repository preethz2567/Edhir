package com.edhir.proxy.messaging;

import com.edhir.proxy.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class RabbitMQMonitor {

    private static final Logger logger = LoggerFactory.getLogger(RabbitMQMonitor.class);
    private static final int DLQ_ALERT_THRESHOLD = 10;

    private final RabbitAdmin rabbitAdmin;

    public RabbitMQMonitor(RabbitAdmin rabbitAdmin) {
        this.rabbitAdmin = rabbitAdmin;
    }

    @Scheduled(fixedRate = 60000)
    public void checkDlqDepth() {
        try {
            Properties props = rabbitAdmin.getQueueProperties(RabbitMQConfig.REQUEST_METADATA_DLQ);
            if (props != null && props.containsKey(RabbitAdmin.QUEUE_MESSAGE_COUNT)) {
                int count = (Integer) props.get(RabbitAdmin.QUEUE_MESSAGE_COUNT);
                if (count > DLQ_ALERT_THRESHOLD) {
                    logger.error("ALERT: Dead Letter Queue '{}' depth is {}. This exceeds the threshold of {}.", 
                            RabbitMQConfig.REQUEST_METADATA_DLQ, count, DLQ_ALERT_THRESHOLD);
                } else {
                    logger.debug("DLQ depth is {}.", count);
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to check DLQ depth: {}", e.getMessage());
        }
    }
}
