package com.conkiri.domain.base.dto.request;

import com.conkiri.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

public record ConcertRequestDTO(
        @NotBlank(message = ValidationMessage.BLANK_IS_NOT_ALLOWED) String concertName,
        List<String> artists,
        String venueName,
        String photoUrl,
        LocalDateTime advanceReservation,
        LocalDateTime reservation,
        String ticketingPlatform,
        List<LocalDateTime> startTimes,
        String noticeImageUrl,
        String noticeText,
        String originalUrl
) {

}