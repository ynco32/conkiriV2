package com.conkiri.domain.base.dto.response;

import com.conkiri.domain.base.entity.Artist;

public record ConcertCastResponseDTO(
	Long artistId,
	String artistName
) {
	public static ConcertCastResponseDTO from(Artist artist) {
		return new ConcertCastResponseDTO(
			artist.getArtistId(),
			artist.getArtistName()
		);
	}
}