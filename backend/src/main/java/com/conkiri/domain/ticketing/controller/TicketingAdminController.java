package com.conkiri.domain.ticketing.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.ticketing.dto.request.TicketingTimeRequestDTO;
import com.conkiri.domain.ticketing.service.TicketingAdminService;
import com.conkiri.global.common.ApiResponse;
import com.conkiri.global.scheduler.TicketingScheduler;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class TicketingAdminController {

	private final TicketingAdminService ticketingAdminService;
	private final TicketingScheduler ticketingScheduler;

	// 티켓팅 시간 설정
	@PostMapping("/time")
	public ApiResponse<Void> setTicketingTime(
		@Valid @RequestBody TicketingTimeRequestDTO requestDTO) {

		ticketingAdminService.setTime(requestDTO);
		return ApiResponse.ofSuccess();
	}

	// 모든 구역 및 예매내역 초기화
	@DeleteMapping("/reset")
	public ApiResponse<Void> resetTicketing() {

		ticketingScheduler.clearTicketingData();
		return ApiResponse.ofSuccess();
	}

	// 티켓팅 비활성화
	@PostMapping("/deactivate")
	public ApiResponse<Void> deactivateTicketing() {

		ticketingAdminService.deActiveTicketing();
		return ApiResponse.ofSuccess();
	}
}
