package com.conkiri.domain.view.dto.response;

public record SeatDTO(
	int seat,  // 0이면 좌석 없음, 양수면 좌석 번호
	Long seatId,
	boolean isReviewed
) {}