package com.conkiri.global.config.ticketing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.conkiri.global.config.place.WebSocketHandshakeInterceptor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final WebSocketHandshakeInterceptor handshakeInterceptor;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {

		// 클라이언트가 서버로 보낼 때 사용할 prefix들
		config.setApplicationDestinationPrefixes("/ws", "/app");

		// 서버가 클라이언트에게 브로드캐스트할 때 사용할 prefix들
		config.enableSimpleBroker("/book", "/topic", "/user");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {

		// 티켓팅용 WebSocket 엔드포인트
		registry.addEndpoint("/ticketing-platform").setAllowedOrigins(frontendUrl);

		// 채팅용 WebSocket 엔드포인트
		registry.addEndpoint("/place-ws")
			.addInterceptors(handshakeInterceptor)
			.setAllowedOrigins(frontendUrl)
			.withSockJS();
	}
}
