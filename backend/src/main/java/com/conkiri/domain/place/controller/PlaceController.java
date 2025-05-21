package com.conkiri.domain.place.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.place.dto.response.MarkerResponseDTO;
import com.conkiri.domain.place.service.PlaceService;
import com.conkiri.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/place")
@RequiredArgsConstructor
public class PlaceController {

	private final PlaceService placeService;

	@GetMapping("/markers")
	public ApiResponse<MarkerResponseDTO> getMarkers(
		@RequestParam(value = "arena") Long arenaId,
		@RequestParam(value = "category", required = false) String category) {
		return ApiResponse.success(placeService.getMarkers(arenaId, category));
	}
}
