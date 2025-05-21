package com.conkiri.domain.base.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.conkiri.domain.sharing.dto.response.SharingResponseDTO;
import com.conkiri.domain.sharing.repository.SharingRepository;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.view.dto.response.ReviewResponseDTO;
import com.conkiri.domain.view.entity.Review;
import com.conkiri.domain.view.repository.ReviewRepository;
import com.conkiri.domain.view.service.ViewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageService {

	private final SharingRepository sharingRepository;
	private final ReviewRepository reviewRepository;
	private final ViewService viewService;

	/**
	 * 마이페이지에서 회원이 작성한 전체 나눔게시글 목록 조회
	 * @param lastSharingId
	 * @param user
	 * @return
	 */
	public SharingResponseDTO getWroteList(Long lastSharingId, User user) {

		Pageable pageable = Pageable.ofSize(10);
		return sharingRepository.findWroteSharingsInMyPage(user, lastSharingId, pageable);
	}

	/**
	 * 마이페이지에서 회원이 스크랩한 전체 나눔게시글 목록 조회
	 * @param lastSharingId
	 * @param user
	 * @return
	 */
	public SharingResponseDTO getScrappedList(Long lastSharingId, User user) {

		Pageable pageable = Pageable.ofSize(10);
		return sharingRepository.findScrappedSharingsInMyPage(user, lastSharingId, pageable);
	}

	// 마이페이지에서 회원이 작성한 시야 후기 게시글 조회
	public ReviewResponseDTO getReviewsOfUser(User user) {
		List<Review> reviews = reviewRepository.findAllByUser(user);

		return viewService.getReviews(reviews);
	}
}
