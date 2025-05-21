package com.conkiri.domain.user.dto.request;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotNull;

public record ProfileRequestDTO(
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED)
	Integer profileNumber

) {
}
