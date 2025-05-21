package com.conkiri.domain.sharing.dto.request;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;

public record CommentRequestDTO(
	@NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED) String content,
	Long sharingId
) {
}
