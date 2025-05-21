package com.conkiri.global.auth.service.handler;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.global.auth.dto.TokenDTO;
import com.conkiri.global.auth.entity.Auth;
import com.conkiri.global.auth.repository.AuthRepository;
import com.conkiri.global.auth.service.AuthService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final JwtUtil jwtUtil;
	private final AuthService authService;
	private final AuthRepository authRepository;
	private final UserReadService userReadService;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException {
		UserPrincipal oAuth2User = (UserPrincipal) authentication.getPrincipal();
		String email = oAuth2User.getEmail();
		User user = userReadService.findUserByEmailOrElseThrow(email);
		Auth auth = authRepository.findByUser(user)
			.orElseThrow(() -> new BaseException(ErrorCode.AUTH_NOT_FOUND));

		// 토큰 생성
		TokenDTO tokens = jwtUtil.generateTokens(email);

		// Refresh Token DB 저장
		authService.updateRefreshToken(tokens.refreshToken(), auth);

		// Refresh Token 쿠키에 저장
		authService.addRefreshTokenCookie(response, tokens.refreshToken());

		// Access Token 쿠키에 저장
		authService.addAccessTokenCookie(response, tokens.accessToken());

		// CORS 헤더 설정
		response.setHeader("Access-Control-Allow-Origin", frontendUrl);
		response.setHeader("Access-Control-Allow-Credentials", "true");

		boolean isNewUser = oAuth2User.getNickname() == null;
		String targetUrl = isNewUser ? frontendUrl + "/login/nick" : frontendUrl + "/main";
		response.sendRedirect(targetUrl);

	}

}