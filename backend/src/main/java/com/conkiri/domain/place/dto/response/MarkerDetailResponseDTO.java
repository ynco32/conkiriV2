package com.conkiri.domain.place.dto.response;

import com.conkiri.domain.place.entity.Marker;
import com.fasterxml.jackson.annotation.JsonRawValue;

public record MarkerDetailResponseDTO(
	Long markerId,
	Double latitude,
	Double longitude,
	String category,
	@JsonRawValue
	String detail
) {
	public static MarkerDetailResponseDTO from(Marker marker) {
		return new MarkerDetailResponseDTO(
			marker.getMarkerId(),
			marker.getLatitude(),
			marker.getLongitude(),
			marker.getCategory().getValue(),
			marker.getDetail()
		);
	}
}
