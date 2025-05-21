package com.conkiri.domain.ticketing.dto.response;

import java.time.LocalDateTime;

public record TicketingResultResponseDTO(
	String concertName,
	String ticketingPlatform,
	String section,
	String seat,
	LocalDateTime reserveTime
) {
	public static TicketingResultResponseDTO of(String concertName, String ticketingPlatform, String section, String seat, LocalDateTime reserveTime) {
		return new TicketingResultResponseDTO(
			concertName,
			ticketingPlatform,
			section,
			seat,
			reserveTime);
	}
}