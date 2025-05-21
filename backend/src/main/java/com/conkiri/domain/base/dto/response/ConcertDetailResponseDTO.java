package com.conkiri.domain.base.dto.response;

import java.util.List;

public record ConcertDetailResponseDTO(
	Long concertId,
	String concertName,
	String photoUrl,
	String arenaName,
	boolean ticketingNotificationEnabled,
	List<ConcertCastResponseDTO> artists,
	List<ConcertSessionDTO> sessions
) {
}