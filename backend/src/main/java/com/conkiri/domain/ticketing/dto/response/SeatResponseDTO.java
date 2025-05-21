package com.conkiri.domain.ticketing.dto.response;

import java.util.List;

public record SeatResponseDTO(
	List<SeatDetailResponseDTO> seats
) {
	public static SeatResponseDTO from(List<SeatDetailResponseDTO> seats) {
		return new SeatResponseDTO(seats);
	}
}
