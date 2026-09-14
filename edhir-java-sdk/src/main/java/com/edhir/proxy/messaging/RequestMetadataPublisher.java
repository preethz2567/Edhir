package com.edhir.proxy.messaging;

import com.edhir.proxy.config.RabbitMQConfig;
import com.edhir.proxy.entity.RequestEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.UUID;

/**
 * Publishes request metadata to the request.metadata RabbitMQ queue
 * after every proxied request, regardless of verdict.
 *
 * The ml-service consumer reads from this queue to compute session scores.
 */
@Service
public class RequestMetadataPublisher {

    private static final Logger logger = LoggerFactory.getLogger(RequestMetadataPublisher.class);

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public RequestMetadataPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void setupConfirmCallback() {
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                logger.warn("Publisher confirm failed for correlation {}: {}", 
                    (correlationData != null ? correlationData.getId() : "null"), cause);
            }
        });
    }

    public void publish(RequestEntity request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
            rabbitTemplate.convertAndSend("", RabbitMQConfig.REQUEST_METADATA_QUEUE, json, correlationData);
        } catch (JsonProcessingException e) {
            // Non-fatal: log and continue — do not fail the request pipeline
            logger.error("Failed to serialize request: {}", e.getMessage());
        }
    }
}
