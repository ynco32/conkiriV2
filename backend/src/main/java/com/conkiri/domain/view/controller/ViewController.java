package com.conkiri.domain.view.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.conkiri.domain.view.dto.request.ReviewRequestDTO;
import com.conkiri.domain.view.dto.response.ConcertDTO;
import com.conkiri.domain.view.dto.response.ReviewDetailResponseDTO;
import com.conkiri.domain.view.dto.response.ReviewResponseDTO;
import com.conkiri.domain.view.dto.response.SectionResponseDTO;
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

	// 후기 작성
	@PostMapping(value = "/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<Long> createReview(
		@Valid @RequestPart ReviewRequestDTO reviewRequestDTO,
		@RequestPart List<MultipartFile> files,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(viewService.createReview(reviewRequestDTO, files, userPrincipal.getUser()));
	}

	// 단일 후기 조회 / 수정할 후기 조회
	@GetMapping("/reviews/{reviewId}")
	public ApiResponse<ReviewDetailResponseDTO> getAReview(
		@PathVariable("reviewId") Long reviewId) {

		return ApiResponse.success(viewService.getAReview(reviewId));
	}

	// 후기 수정
	@PutMapping(value = "/reviews/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<Long> updateReview(
		@PathVariable("reviewId") Long reviewId,
		@Valid @RequestPart ReviewRequestDTO reviewRequestDTO,
		@RequestPart List<MultipartFile> files,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(viewService.updateReview(reviewId, reviewRequestDTO, files, userPrincipal.getUser()));
	}

	// 후기 삭제
	@DeleteMapping("/reviews/{reviewId}")
	public ApiResponse<Void> deleteReview(
		@PathVariable("reviewId") Long reviewId,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(viewService.deleteReview(reviewId, userPrincipal.getUser()));
	}

	// (선택한 공연장의) 구역 정보 조회
	@GetMapping("/arenas/{arenaId}/sections")
	public ApiResponse<List<SectionResponseDTO>> getSections(
		@PathVariable("arenaId") Long arenaId) {

		return ApiResponse.success(viewService.getSections(arenaId));
	}

	// (선택한 구역의) 모든 후기 조회
	@GetMapping("/arenas/{arenaId}/sections/{section}/reviews")
	public ApiResponse<ReviewResponseDTO> getReviews(
		@PathVariable("arenaId") Long arenaId,
		@PathVariable("section") String section) {

		return ApiResponse.success(viewService.getReviewsOfSection(arenaId, section));
	}

	// 가수로 콘서트 검색
	@GetMapping("/concerts")
	public ApiResponse<List<ConcertDTO>> getConcerts(
		@RequestParam(value = "searchWord") String searchWord) {

		return ApiResponse.success(viewService.getConcerts(searchWord));
	}
}