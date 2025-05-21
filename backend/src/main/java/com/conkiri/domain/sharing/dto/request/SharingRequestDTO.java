package com.conkiri.domain.sharing.dto.request;

import java.time.LocalDateTime;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SharingRequestDTO(
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) Long concertId,
	@NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED) String title,
	String content,
	Double latitude,
	Double longitude,
	LocalDateTime startTime
) {
}
