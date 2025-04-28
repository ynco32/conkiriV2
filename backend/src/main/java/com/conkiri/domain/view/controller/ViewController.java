package com.conkiri.domain.view.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.conkiri.domain.view.dto.request.ReviewRequestDTO;
import com.conkiri.domain.view.dto.response.ArenaResponseDTO;
import com.conkiri.domain.view.dto.response.ReviewDetailResponseDTO;
import com.conkiri.domain.view.dto.response.ReviewResponseDTO;
import com.conkiri.domain.view.dto.response.SeatResponseDTO;
import com.conkiri.domain.view.dto.response.SectionResponseDTO;
import com.conkiri.domain.view.dto.response.ViewConcertResponseDTO;
import com.conkiri.domain.view.service.ViewService;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/view")
public class ViewController {

	private final ViewService viewService;

	// 공연장 목록 조회 API
	@GetMapping("/arenas")
	public ApiResponse<ArenaResponseDTO> getArenas() {

		return ApiResponse.success(viewService.getArenas());
	}

	// 무대 유형에 따른 구역 정보 조회 API
	@GetMapping("/arenas/{arenaId}/sections")
	public ApiResponse<SectionResponseDTO> getSections(
		@PathVariable Long arenaId,
		@RequestParam(name = "stageType") Integer stageType,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(viewService.getSections(arenaId, stageType, userPrincipal.getUserId()));
	}

	// 선택한 구역의 좌석 정보 조회 API
	@GetMapping("/arenas/{arenaId}")
	public ApiResponse<SeatResponseDTO> getSeats(
		@PathVariable Long arenaId,
		@RequestParam(name = "stageType") Integer stageType,
		@RequestParam(name = "section") Long sectionNumber,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(viewService.getSeats(arenaId, stageType, sectionNumber, userPrincipal.getUserId()));
	}

	// 좌석 스크랩 등록 API
	@PostMapping("/scraps/{seatId}")
	public ApiResponse<Void> createScrapSeat(
		@PathVariable Long seatId,
		@RequestParam(name = "stageType") Integer stageType,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		viewService.createScrapSeat(seatId, stageType, userPrincipal.getUserId());
		return ApiResponse.ofSuccess();
	}

	// 좌석 스크랩 해제 API
	@DeleteMapping("/scraps/{seatId}")
	public ApiResponse<Void> deleteScrapSeat(
		@PathVariable Long seatId,
		@RequestParam(name = "stageType") Integer stageType,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		viewService.deleteScrapSeat(seatId, stageType, userPrincipal.getUserId());
		return ApiResponse.ofSuccess();
	}

	// 해당 영역의 전체 후기 조회 API (구역 / 좌석)
	@GetMapping("/arenas/{arenaId}/reviews")
	public ApiResponse<ReviewResponseDTO> getReviews(
		@PathVariable Long arenaId,
		@RequestParam(name = "stageType") Integer stageType,
		@RequestParam(name = "section") Long sectionNumber,
		@RequestParam(name = "seatId", required = false) Long seatId) {

		return ApiResponse.success(viewService.getReviews(arenaId, stageType, sectionNumber, seatId));
	}

	// 가수로 검색된 공연 전체 조회 API
	@GetMapping("/concerts")
	public ApiResponse<ViewConcertResponseDTO> getConcerts(@RequestParam(name = "artist") String artist) {

		return ApiResponse.success(viewService.getConcerts(artist));
	}

	// 후기 작성 API
	@PostMapping("/reviews")
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<Void> createReview(
		@Valid @RequestPart ReviewRequestDTO reviewRequestDTO,
		@RequestPart("file") MultipartFile file,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		viewService.createReview(reviewRequestDTO, file, userPrincipal.getUserId());
		return ApiResponse.ofSuccess();
	}

	// 수정할 후기 조회 API
	@GetMapping("/reviews/{reviewId}")
	public ApiResponse<ReviewDetailResponseDTO> getReview(
		@PathVariable Long reviewId,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(viewService.getReview(reviewId, userPrincipal.getUserId()));
	}

	// 후기 수정 API
	@PutMapping("/reviews/{reviewId}")
	public ApiResponse<Void> updateReview(
		@PathVariable Long reviewId,
		@Valid @RequestPart ReviewRequestDTO reviewRequestDTO,
		@RequestPart("file") MultipartFile file,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		viewService.updateReview(reviewId, reviewRequestDTO, file, userPrincipal.getUserId());
		return ApiResponse.ofSuccess();
	}

	// 후기 삭제 API
	@DeleteMapping("/reviews/{reviewId}")
	public ApiResponse<Void> deleteReview(
		@PathVariable Long reviewId,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		viewService.deleteReview(reviewId, userPrincipal.getUserId());
		return ApiResponse.ofSuccess();
	}
}