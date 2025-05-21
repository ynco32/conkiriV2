package com.conkiri.domain.view.dto.response;

import java.util.List;

public record RowDTO(
	String row,
	List<SeatDTO> activeSeats
) {}