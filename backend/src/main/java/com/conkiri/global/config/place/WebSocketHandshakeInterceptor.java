package com.conkiri.global.config.place;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.repository.UserRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;

	@Override
	public boolean beforeHandshake(ServerHttpRequest request,
		ServerHttpResponse response,
		WebSocketHandler wsHandler,
		Map<String, Object> attributes) throws Exception {

		if (request instanceof ServletServerHttpRequest servletRequest) {
			HttpServletRequest httpRequest = servletRequest.getServletRequest();

			String token = null;
			if (httpRequest.getCookies() != null) {
				for (Cookie cookie : httpRequest.getCookies()) {
					if ("access_token".equals(cookie.getName())) {
						token = cookie.getValue();
						break;
					}
				}
			}

			if (token == null || token.isBlank()) {
				log.warn("❌ WebSocket 쿠키에 access_token 없음. 연결 차단");
				return false;
			}

			try {
				String email = jwtUtil.getEmailFromToken(token);
				User user = userRepository.findByEmail(email)
					.orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
				attributes.put("userId", user.getUserId());
				attributes.put("nickname", user.getNickname());
				log.info("✅ WebSocket 인증 성공 - userId: {}, nickname: {}", user.getUserId(), user.getNickname());
				return true;
			} catch (Exception e) {
				log.warn("❌ WebSocket 토큰 검증 실패: {}", e.getMessage());
				return false;
			}
		}

		return false;
	}


	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
		WebSocketHandler wsHandler, Exception exception) {
		// 사용하지 않음
	}
}
