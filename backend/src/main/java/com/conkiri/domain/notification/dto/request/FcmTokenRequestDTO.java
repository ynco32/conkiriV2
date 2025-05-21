package com.conkiri.domain.notification.dto.request;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;

public record FcmTokenRequestDTO(
	@NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED)
	String fcmToken
){}
