package com.conkiri.domain.ticketing.dto.request;

import java.time.LocalDateTime;

import com.conkiri.global.exception.BaseException;
import com.conkiri.global.exception.ErrorCode;
import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketingTimeRequestDTO(
	@NotBlank(message = ValidationMessage.NULL_IS_NOT_ALLOWED) String concertName,
	@NotBlank(message = ValidationMessage.NULL_IS_NOT_ALLOWED) String ticketingPlatform,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) LocalDateTime startTime,
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED) LocalDateTime endTime
) {
	public TicketingTimeRequestDTO {
		if (endTime != null && startTime != null && endTime.isBefore(startTime)) {
			throw new BaseException(ErrorCode.INVALID_TICKETING_TIME);
		}
	}
}