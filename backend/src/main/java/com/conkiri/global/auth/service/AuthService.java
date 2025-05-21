package com.conkiri.global.auth.service;

import java.time.LocalDateTime;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.user.service.UserReadService;
import com.conkiri.global.auth.dto.LoginDTO;
import com.conkiri.global.auth.dto.TokenDTO;
import com.conkiri.global.auth.entity.Auth;
import com.conkiri.global.auth.repository.AuthRepository;
import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

	private final JwtUtil jwtUtil;
	private final AuthRepository authRepository;
	private final UserReadService userReadService;

	public LoginDTO loginStatus(HttpServletRequest request, String nickName) {

		String accessToken = (String) request.getAttribute("access_token");
		if (accessToken == null)
			accessToken = jwtUtil.extractAccessToken(request);
		
		jwtUtil.validateToken(accessToken);
		return (nickName == null) ? new LoginDTO(true, false): new LoginDTO(true, true);
	}

	public String refreshToken(HttpServletRequest request, HttpServletResponse response) {

		String refreshToken = jwtUtil.extractRefreshToken(request);
		if (!jwtUtil.validateToken(refreshToken)) {
			throw new BaseException(ErrorCode.INVALID_TOKEN);
		}

		String email = jwtUtil.getEmailFromToken(refreshToken);
		User user = userReadService.findUserByEmailOrElseThrow(email);
		Auth savedAuth = authRepository.findByUser(user)
			.orElseThrow(() -> new BaseException(ErrorCode.INVALID_TOKEN));

		if (!savedAuth.getRefreshToken().equals(refreshToken)) {
			throw new BaseException(ErrorCode.INVALID_TOKEN);
		}

		TokenDTO newTokens = jwtUtil.generateTokens(email);
		updateRefreshToken(newTokens.refreshToken(), savedAuth);
		addRefreshTokenCookie(response, newTokens.refreshToken());
		addAccessTokenCookie(response, newTokens.accessToken());
		return newTokens.accessToken();
	}

	public void updateRefreshToken(String refreshToken, Auth auth) {
		auth.updateToken(refreshToken, LocalDateTime.now().plusDays(14));
		authRepository.save(auth);
	}

	public void addAccessTokenCookie(HttpServletResponse response, String accessToken) {
		ResponseCookie cookie = ResponseCookie.from("access_token", accessToken)
			.httpOnly(true) // JavaScript 접근 차단
			.secure(true)   // HTTPS에서만 사용
			.sameSite("None") // SameSite=None 설정
			.path("/")      // 전체 경로에서 유효
			.maxAge(2592000)  // 9시간 유지
			.build();

		addCookieToResponse(cookie, response);
	}

	public void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
		ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
			.httpOnly(true) // JavaScript 접근 차단
			.secure(true)   // HTTPS에서만 사용
			.sameSite("None") // SameSite=None 설정
			.path("/")      // 전체 경로에서 유효
			.maxAge(1209600)  // 14일 유지
			.build();


		addCookieToResponse(cookie, response);
	}

	@Transactional
	public void logout(User user, HttpServletResponse response) {
		deleteAuthIfExists(user);
		deleteCookie("access_token", response);
		deleteCookie("refresh_token", response);
	}

	private void deleteAuthIfExists(User user) {
		if (authRepository.existsByUser(user)) {
			authRepository.deleteByUser(user);
		}
	}

	private void deleteCookie(String name, HttpServletResponse response) {
		ResponseCookie cookie = ResponseCookie.from(name, "")
			.httpOnly(true)
			.secure(true)
			.sameSite("None")
			.path("/")
			.maxAge(0)
			.build();

		addCookieToResponse(cookie, response);
	}

	private void addCookieToResponse(ResponseCookie cookie, HttpServletResponse response) {
		response.addHeader("Set-Cookie", cookie.toString());
	}
}
