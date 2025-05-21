package com.conkiri.domain.ticketing.dto.request;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;

public record TicketingRequestDTO(
	@NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED) String section,
	@NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED) String seat
) {
}