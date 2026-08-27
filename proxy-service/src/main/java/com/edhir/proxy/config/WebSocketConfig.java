package com.edhir.proxy.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.Cookie;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String JWT_SECRET = "edhir_super_secret_key_12345";

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/feed")
                .setAllowedOrigins("http://localhost:3000")
                .addInterceptors(new HttpToWsSessionInterceptor())
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    String tenantId = (String) accessor.getSessionAttributes().get("tenantId");
                    
                    if (tenantId == null) {
                        throw new IllegalArgumentException("No authenticated tenant found for WebSocket session");
                    }
                    
                    // Enforce tenant scoping: User can only subscribe to /topic/feed/{their-tenant-id}
                    if (destination != null && destination.startsWith("/topic/feed/")) {
                        String requestedTenant = destination.substring("/topic/feed/".length());
                        if (!tenantId.equals(requestedTenant)) {
                            throw new IllegalArgumentException("Unauthorized subscription attempt to another tenant's feed");
                        }
                    }
                }
                return message;
            }
        });
    }

    // Interceptor to extract the HTTP cookie during the initial WebSocket handshake
    public static class HttpToWsSessionInterceptor implements HandshakeInterceptor {

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
            if (request instanceof ServletServerHttpRequest) {
                ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
                Cookie[] cookies = servletRequest.getServletRequest().getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if ("EDHIR_SESSION".equals(cookie.getName())) {
                            try {
                                Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);
                                DecodedJWT jwt = JWT.require(algorithm)
                                        .withIssuer("edhir-proxy")
                                        .build()
                                        .verify(cookie.getValue());
                                        
                                attributes.put("tenantId", jwt.getSubject());
                                return true;
                            } catch (Exception e) {
                                // Invalid JWT
                                return false;
                            }
                        }
                    }
                }
            }
            return false; // Reject handshake if no valid cookie
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
        }
    }
}
