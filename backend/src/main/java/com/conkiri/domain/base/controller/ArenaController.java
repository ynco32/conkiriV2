package com.conkiri.domain.base.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.base.dto.response.ArenaResponseDTO;
import com.conkiri.domain.base.service.ArenaService;
import com.conkiri.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/arena")
public class ArenaController {

	private final ArenaService arenaService;

	// 공연장 목록 조회
	@GetMapping("/arenas")
	public ApiResponse<ArenaResponseDTO> getArenas(@RequestParam(value = "searchWord", required = false) String searchWord) {
		return ApiResponse.success(arenaService.getArenas(searchWord));
	}
}
