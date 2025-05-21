package com.conkiri.domain.base.dto.response;

import java.util.List;

public record ArtistResponseDTO(
	List<ArtistDetailResponseDTO> artists,
	boolean isLastPage
) {
	public static ArtistResponseDTO of(List<ArtistDetailResponseDTO> artists, boolean isLastPage) {
		return new ArtistResponseDTO(artists, isLastPage);
	}
}
