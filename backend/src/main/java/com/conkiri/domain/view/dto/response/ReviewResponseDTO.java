package com.conkiri.domain.view.dto.response;

import java.util.List;
import java.util.Map;

import com.conkiri.domain.view.entity.Review;

public record ReviewResponseDTO(
	List<ReviewDetailResponseDTO> reviews
) {
	public static ReviewResponseDTO of(List<Review> reviews, Map<Long, List<String>> reviewPhotoMap) {
		return new ReviewResponseDTO(
			reviews.stream()
				.map(review -> ReviewDetailResponseDTO.of(review, reviewPhotoMap.get(review.getReviewId())))
				.toList()
		);
	}
}
