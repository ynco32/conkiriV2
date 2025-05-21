package com.conkiri.domain.view.dto.response;

public record SectionResponseDTO(
	String section,
	Long floor
) {
	public static SectionResponseDTO of(String section, Long floor) {

		return new SectionResponseDTO(
			section,
			floor
		);
	}
}
