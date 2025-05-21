package com.conkiri.domain.view.dto.response;

import com.conkiri.domain.base.entity.Concert;

public record ConcertDTO(
	Long concertId,
	Long arenaId,
	String concertName
) {
	public static ConcertDTO from(Concert concert) {

		return new ConcertDTO(
			concert.getConcertId(),
			concert.getArena().getArenaId(),
			concert.getConcertName()
		);
	}
}
