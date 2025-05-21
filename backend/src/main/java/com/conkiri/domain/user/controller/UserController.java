package com.conkiri.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.user.dto.request.NicknameRequestDTO;
import com.conkiri.domain.user.service.UserService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

	private final UserService userService;

	@ResponseStatus(HttpStatus.CREATED)
	@PostMapping("/nickname")
	public ApiResponse<Void> setNickname(
		@Valid @RequestBody NicknameRequestDTO request,
		@AuthenticationPrincipal UserPrincipal user) {

		userService.updateNickname(user.getUser().getUserId(), request.nickname());
		return ApiResponse.ofSuccess();
	}

	@PatchMapping("/nickname")
	public ApiResponse<Void> modifyNickname(
		@Valid @RequestBody NicknameRequestDTO request,
		@AuthenticationPrincipal UserPrincipal user) {

		userService.updateNickname(user.getUser().getUserId(), request.nickname());
		return ApiResponse.ofSuccess();
	}

	@Validated
	@GetMapping("/nickname/check")
	public ApiResponse<Boolean> checkNicknameDuplicate(
		@NotBlank(message = ValidationMessage.NICKNAME_NOT_EMPTY)
		@Size(min = 2, max = 10, message = ValidationMessage.ERROR_NICKNAME_LENGTH)
		@Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = ValidationMessage.ERROR_NICKNAME_FORMAT)
		@RequestParam String nickname) {

		return ApiResponse.success(userService.checkNicknameExists(nickname));
	}
}
