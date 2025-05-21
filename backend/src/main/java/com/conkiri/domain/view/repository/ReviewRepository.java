package com.conkiri.domain.view.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.view.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

	@Query("""
		select r from Review r
		join fetch r.user
		join fetch r.concert c
		join fetch c.arena
		join fetch r.seat
		where r.reviewId = :reviewId
	""")
	Optional<Review> findByReviewId(@Param("reviewId") Long reviewId);

	@Query("""
		select distinct r from Review r
		join fetch r.seat
		join fetch r.concert c
		join fetch c.arena
		join fetch r.user
		where r.user = :user
	""")
	List<Review> findAllByUser(@Param("user") User user);

	@Query("""
		select distinct r from Review r
		join fetch r.seat s
		join fetch r.concert c
		join fetch c.arena
		join fetch r.user
		where s.arena.arenaId = :arenaId 
		and s.section = :section
    """)
	List<Review> findAllByArenaIdAndSection(@Param("arenaId") Long arenaId, @Param("section") String section);

	// 후기가 있는 좌석 ID 목록 조회
	@Query("SELECT r.seat.seatId FROM Review r WHERE r.seat.seatId IN :seatIds")
	List<Long> findSeatIdsWithReviews(@Param("seatIds") List<Long> seatIds);
}
