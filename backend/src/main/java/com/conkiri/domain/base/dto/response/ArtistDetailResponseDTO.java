package com.conkiri.domain.base.dto.response;

import com.conkiri.domain.base.entity.Artist;

public record ArtistDetailResponseDTO(
	Long artistId,
	String artistName,
	String photoUrl,
	boolean isFollowing
) {
	public static ArtistDetailResponseDTO of(Artist artist, boolean isFollowing) {
		return new ArtistDetailResponseDTO(
			artist.getArtistId(),
			artist.getArtistName(),
			artist.getPhotoUrl(),
			isFollowing
		);
	}
}