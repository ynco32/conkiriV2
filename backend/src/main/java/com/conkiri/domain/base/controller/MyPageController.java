package com.conkiri.domain.base.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conkiri.domain.base.service.MyPageService;
import com.conkiri.domain.sharing.dto.response.SharingResponseDTO;
import com.conkiri.domain.view.dto.response.ReviewResponseDTO;
import com.conkiri.global.auth.token.UserPrincipal;
import com.conkiri.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mypage")
public class MyPageController {

	private final MyPageService myPageService;

	/**
	 * 마이페이지에서 회원이 등록한 나눔 게시글 조회
	 * @param lastSharingId
	 * @param userPrincipal
	 * @return
	 */
	@GetMapping("/wrote")
	public ApiResponse<SharingResponseDTO> getWroteList(
		@RequestParam(value = "lastSharingId", required = false) Long lastSharingId,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(myPageService.getWroteList(lastSharingId, userPrincipal.getUser()));
	}

	/**
	 * 마이페이지에서 회원이 스크랩한 나눔 게시글 조회
	 * @param lastSharingId
	 * @param userPrincipal
	 * @return
	 */
	@GetMapping("/scrap")
	public ApiResponse<SharingResponseDTO> getScrappedList(
		@RequestParam(value = "lastSharingId", required = false) Long lastSharingId,
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(myPageService.getScrappedList(lastSharingId, userPrincipal.getUser()));
	}

	// 마이페이지에서 회원이 작성한 시야 후기 게시글 조회
	@GetMapping("/reviews")
	public ApiResponse<ReviewResponseDTO> getMyReviews(
		@AuthenticationPrincipal UserPrincipal userPrincipal) {

		return ApiResponse.success(myPageService.getReviewsOfUser(userPrincipal.getUser()));
	}
}
