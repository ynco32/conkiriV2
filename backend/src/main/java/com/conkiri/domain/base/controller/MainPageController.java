package com.conkiri.domain.base.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.base.dto.response.UserResponseDTO;
import com.conkiri.domain.user.dto.request.ProfileRequestDTO;
import com.conkiri.domain.user.service.UserService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/main")
@RequiredArgsConstructor
public class MainPageController {

	private final UserService userService;

	@GetMapping("/user-info")
	public ApiResponse<UserResponseDTO> getUserInformation(
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(UserResponseDTO.from(userPrincipal.getUser()));
	}

	@PatchMapping("/profile")
	public ApiResponse<Void> updateProfile(
		@AuthenticationPrincipal UserPrincipal userPrincipal,
		@RequestBody ProfileRequestDTO request){

		userService.updateProfile(userPrincipal.getUserId(), request.profileNumber());
		return ApiResponse.ofSuccess();
	}
}
