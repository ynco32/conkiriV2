package com.conkiri.global.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.global.auth.dto.LoginDTO;
import com.conkiri.global.auth.service.AuthService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/refresh")
	public ApiResponse<Void> refreshToken(
		HttpServletRequest request,
		HttpServletResponse response) {

		authService.refreshToken(request, response);
		return ApiResponse.ofSuccess();
	}

	@GetMapping("/login")
	public ApiResponse<LoginDTO> checkAuthStatus(
		@CookieValue(value = "access_token") String accessToken,
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(authService.loginStatus(accessToken, user.getNickname()));
	}


	@PostMapping("/logout")
	public ApiResponse<Void> logout(
		@AuthenticationPrincipal UserPrincipal user,
		HttpServletResponse response) {

		authService.logout(user.getUser(), response);
		return ApiResponse.ofSuccess();
	}
}
