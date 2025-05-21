package com.conkiri.domain.place.dto.response;

import java.util.List;

import com.conkiri.domain.place.entity.Marker;

public record MarkerResponseDTO(
	List<MarkerDetailResponseDTO> markers
) {
	public static MarkerResponseDTO from(List<Marker> markers) {
		return new MarkerResponseDTO(
			markers.stream()
				.map(MarkerDetailResponseDTO::from)
				.toList()
		);
	}
}
