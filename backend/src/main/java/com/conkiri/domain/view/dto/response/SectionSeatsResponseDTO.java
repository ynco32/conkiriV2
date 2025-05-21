package com.conkiri.domain.view.dto.response;

import java.util.List;

public record SectionSeatsResponseDTO(
	String section,
	List<RowDTO> seatMap
) {}