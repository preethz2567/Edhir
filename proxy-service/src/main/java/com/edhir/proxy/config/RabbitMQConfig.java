package com.edhir.proxy.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

/**
 * Declares the durable RabbitMQ queue that the proxy publishes to
 * and the ml-service consumes from, with a Dead Letter Queue (DLQ).
 */
@Configuration
public class RabbitMQConfig {

    public static final String REQUEST_METADATA_QUEUE = "request.metadata";
    public static final String REQUEST_METADATA_DLX = "request.metadata.dlx";
    public static final String REQUEST_METADATA_DLQ = "request.metadata.dlq";
    
    private final RabbitAdmin rabbitAdmin;

    public RabbitMQConfig(RabbitAdmin rabbitAdmin) {
        this.rabbitAdmin = rabbitAdmin;
    }

    @PostConstruct
    public void deleteOldQueue() {
        // Delete the old queue if it exists to allow re-declaration with new DLX arguments
        rabbitAdmin.deleteQueue(REQUEST_METADATA_QUEUE);
    }

    @Bean
    public DirectExchange dlx() {
        return new DirectExchange(REQUEST_METADATA_DLX);
    }

    @Bean
    public Queue dlq() {
        return QueueBuilder.durable(REQUEST_METADATA_DLQ).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(dlq()).to(dlx()).with(REQUEST_METADATA_DLQ);
    }

    @Bean
    public Queue requestMetadataQueue() {
        return QueueBuilder.durable(REQUEST_METADATA_QUEUE)
                .withArgument("x-dead-letter-exchange", REQUEST_METADATA_DLX)
                .withArgument("x-dead-letter-routing-key", REQUEST_METADATA_DLQ)
                .build();
    }
}
