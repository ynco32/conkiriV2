package com.conkiri.domain.sharing.dto.request;

import java.time.LocalDateTime;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;

public record SharingUpdateRequestDTO(
	@NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED) String title,
	String content,
	Double latitude,
	Double longitude,
	LocalDateTime startTime,
	Long concertId
) {
}
