package com.conkiri.domain.view.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.view.dto.response.SectionSeatsResponseDTO;
import com.conkiri.domain.view.service.SectionLayoutService;
import com.conkiri.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/view")
public class SectionLayoutController {

	private final SectionLayoutService sectionLayoutService;

	@GetMapping("/arenas/{arenaId}/sections/{section}")
	public ApiResponse<SectionSeatsResponseDTO> getSectionSeats(
		@PathVariable Long arenaId,
		@PathVariable String section) {

		return ApiResponse.success(sectionLayoutService.getSectionSeats(arenaId, section));
	}
}