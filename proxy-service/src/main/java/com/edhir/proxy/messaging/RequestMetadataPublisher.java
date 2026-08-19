package com.edhir.proxy.messaging;

import com.edhir.proxy.config.RabbitMQConfig;
import com.edhir.proxy.entity.RequestEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Publishes request metadata to the request.metadata RabbitMQ queue
 * after every proxied request, regardless of verdict.
 *
 * The ml-service consumer reads from this queue to compute session scores.
 */
@Service
public class RequestMetadataPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public RequestMetadataPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public void publish(RequestEntity request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            rabbitTemplate.convertAndSend(RabbitMQConfig.REQUEST_METADATA_QUEUE, json);
        } catch (JsonProcessingException e) {
            // Non-fatal: log and continue — do not fail the request pipeline
            System.err.println("[RequestMetadataPublisher] Failed to serialize request: " + e.getMessage());
        }
    }
}
