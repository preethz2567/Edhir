package com.edhir.proxy.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declares the durable RabbitMQ queue that the proxy publishes to
 * and the ml-service consumes from.
 */
@Configuration
public class RabbitMQConfig {

    public static final String REQUEST_METADATA_QUEUE = "request.metadata";

    @Bean
    public Queue requestMetadataQueue() {
        // durable = true: survives broker restart
        return new Queue(REQUEST_METADATA_QUEUE, true);
    }
}
