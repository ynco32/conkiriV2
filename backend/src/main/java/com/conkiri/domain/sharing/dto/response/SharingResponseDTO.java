package com.conkiri.domain.sharing.dto.response;

import java.util.List;
import java.util.stream.Collectors;

import com.conkiri.domain.sharing.entity.Sharing;

public record SharingResponseDTO(
	List<SharingDetailResponseDTO> sharings,
	boolean isLastPage
) {
	public static SharingResponseDTO of(List<Sharing> sharings, boolean hasNext) {
		return new SharingResponseDTO(
			sharings.stream()
				.map(SharingDetailResponseDTO::from)
				.collect(Collectors.toList()),
			!hasNext
		);
	}
}
