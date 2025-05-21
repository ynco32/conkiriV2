package com.conkiri.domain.base.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.base.dto.request.ArtistListRequestDTO;
import com.conkiri.domain.base.dto.response.ArtistResponseDTO;
import com.conkiri.domain.base.service.ArtistService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/artists")
public class ArtistController {

	private final ArtistService artistService;

	@GetMapping
	public ApiResponse<ArtistResponseDTO> getArtists(
		@RequestParam(value = "last", required = false) Long lastArtistId,
		@RequestParam(value = "search", required = false) String searchWord,
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(artistService.getArtists(lastArtistId, searchWord, user.getUser()));
	}

	@GetMapping("/my")
	public ApiResponse<ArtistResponseDTO> getMyArtists(
		@AuthenticationPrincipal UserPrincipal user) {

		return ApiResponse.success(artistService.getMyArtists(user.getUser()));
	}

	@PutMapping("/my")
	public ApiResponse<Void> setMyArtists(
		@Valid @RequestBody ArtistListRequestDTO dto,
		@AuthenticationPrincipal UserPrincipal user) {

		artistService.setMyArtists(dto.artistIds(), user.getUser());
		return ApiResponse.ofSuccess();
	}

	@DeleteMapping("/my/{artistId}")
	public ApiResponse<Void> deleteMyArtist(
		@PathVariable Long artistId,
		@AuthenticationPrincipal UserPrincipal user) {

		artistService.deleteMyArtist(artistId, user.getUser());
		return ApiResponse.ofSuccess();
	}
}