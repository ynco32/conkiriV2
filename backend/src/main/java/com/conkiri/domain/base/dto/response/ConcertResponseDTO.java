package com.conkiri.domain.base.dto.response;

import java.util.List;

public record ConcertResponseDTO(
	List<ConcertDetailResponseDTO> concerts,
	boolean isLastPage
) {
	public static ConcertResponseDTO of(List<ConcertDetailResponseDTO> concerts, boolean hasNext) {
		return new ConcertResponseDTO(concerts, hasNext);
	}
}
