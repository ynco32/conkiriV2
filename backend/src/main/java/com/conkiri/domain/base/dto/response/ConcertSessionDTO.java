package com.conkiri.domain.base.dto.response;

import java.time.LocalDateTime;

public record ConcertSessionDTO(
	Long concertDetailId,
	LocalDateTime startTime,
	boolean entranceNotificationEnabled,
	boolean isEnded,
	boolean attended
) { }