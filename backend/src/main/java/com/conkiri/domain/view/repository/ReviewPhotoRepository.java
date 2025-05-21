package com.conkiri.domain.view.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.view.entity.Review;
import com.conkiri.domain.view.entity.ReviewPhoto;

public interface ReviewPhotoRepository extends JpaRepository<ReviewPhoto, Long> {

	@Query("""
		SELECT rp FROM ReviewPhoto rp WHERE rp.review.reviewId IN :reviewIds
	""")
	List<ReviewPhoto> findAllByReviewIdIn(@Param("reviewIds") List<Long> reviewIds);

	List<ReviewPhoto> findAllByReview(Review review);
}
