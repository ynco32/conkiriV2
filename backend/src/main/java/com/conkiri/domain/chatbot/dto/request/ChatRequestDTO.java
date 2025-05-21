package com.conkiri.domain.chatbot.dto.request;

import com.conkiri.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatRequestDTO(
        @NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED)
        String query,

        @NotNull(message = ValidationMessage.BLANK_IS_NOT_ALLOWED)
        Long concertId
) {
}