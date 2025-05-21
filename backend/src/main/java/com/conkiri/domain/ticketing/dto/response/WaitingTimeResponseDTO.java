package com.conkiri.domain.ticketing.dto.response;

public record WaitingTimeResponseDTO(
	Long position,                 // 대기 순서
	Long estimatedWaitingSeconds,  // 예상 대기 시간(초)
	Long usersAfter                // 뒤에 있는 대기자 수
) {
	public static WaitingTimeResponseDTO of(
		Long position,
		Long estimatedWaitingSeconds,
		Long usersAfter
	) {
		return new WaitingTimeResponseDTO(position, estimatedWaitingSeconds, usersAfter);
	}
}
