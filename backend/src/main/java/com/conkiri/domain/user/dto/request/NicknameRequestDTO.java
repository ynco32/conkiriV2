package com.conkiri.domain.user.dto.request;

import com.conkiri.global.exception.ValidationMessage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record NicknameRequestDTO(
	@NotBlank(message = ValidationMessage.NICKNAME_NOT_EMPTY)
	@Size(min = 2, max = 10, message = ValidationMessage.ERROR_NICKNAME_LENGTH)
	@Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = ValidationMessage.ERROR_NICKNAME_FORMAT)
	String nickname
) {
}
