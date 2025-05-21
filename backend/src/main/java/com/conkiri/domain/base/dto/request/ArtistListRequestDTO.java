package com.conkiri.domain.base.dto.request;

import java.util.List;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotNull;

public record ArtistListRequestDTO(
	@NotNull(message = ValidationMessage.NULL_IS_NOT_ALLOWED)
	List<Long> artistIds
) {
}
