package com.conkiri.domain.notification.dto.response;

import java.util.List;
import java.util.stream.Collectors;

import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.base.entity.Concert;

public record ConcertSummary(
	Long concertId,
	String concertName,
	String artistName,
	String photoUrl
) {
	public static ConcertSummary of(Concert concert, List<Cast> casts) {
		String artistNames = casts.stream()
			.map(cast -> cast.getArtist().getArtistName())
			.collect(Collectors.joining(", "));

		return new ConcertSummary(
			concert.getConcertId(),
			concert.getConcertName(),
			artistNames,
			concert.getPhotoUrl()
		);
	}
}