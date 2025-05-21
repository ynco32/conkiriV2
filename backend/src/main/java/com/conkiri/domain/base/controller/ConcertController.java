package com.conkiri.domain.base.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.base.dto.request.ConcertListRequestDTO;
import com.conkiri.domain.base.dto.request.ConcertRequestDTO;
import com.conkiri.domain.base.dto.response.ConcertResponseDTO;
import com.conkiri.domain.base.service.ConcertService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/concerts")
public class ConcertController {

	private final ConcertService concertService;

	@GetMapping
	public ApiResponse<ConcertResponseDTO> getConcerts(
		@RequestParam(value = "last", required = false) Long lastConcertDetailId,
		@RequestParam(value = "search", required = false) String searchWord,
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(concertService.getConcerts(lastConcertDetailId, searchWord, user.getUser()));
	}

	@GetMapping("/my")
	public ApiResponse<ConcertResponseDTO> getMyConcerts(
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(concertService.getMyConcerts(user.getUser()));
	}

	@PutMapping("/my")
	public ApiResponse<Void> setMyConcerts(
		@Valid @RequestBody ConcertListRequestDTO request,
		@AuthenticationPrincipal UserPrincipal user) {

		concertService.setMyConcerts(request, user.getUser());
		return ApiResponse.ofSuccess();
	}

	@DeleteMapping("/my/{concertId}")
	public ApiResponse<Void> deleteMyConcert(
		@PathVariable Long concertId,
		@AuthenticationPrincipal UserPrincipal user) {

		concertService.deleteMyConcert(concertId, user.getUser());
		return ApiResponse.ofSuccess();
	}

	@PostMapping("/create")
	public ApiResponse<Long> createConcert(@Valid @RequestBody ConcertRequestDTO request) {
		return ApiResponse.success(concertService.createConcert(request));
	}

	@GetMapping("/checkExists")
	public ApiResponse<Boolean> checkConcertExists(@RequestParam String concertName) {
		return ApiResponse.success(concertService.checkConcertExists(concertName));
	}
}
