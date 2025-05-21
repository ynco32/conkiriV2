package com.conkiri.domain.view.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.conkiri.domain.view.entity.ArtistGrade;
import com.conkiri.domain.view.entity.Review;
import com.conkiri.domain.view.entity.ScreenGrade;
import com.conkiri.domain.view.entity.StageGrade;

public record ReviewDetailResponseDTO(
	Long reviewId,
	String nickname,
	Integer profileNumber,
	Long concertId,
	String concertName,
	Long arenaId,
	String arenaName,
	Long seatId,
	String section,
	String rowLine,
	Long columnLine,
	ArtistGrade artistGrade,
	StageGrade stageGrade,
	ScreenGrade screenGrade,
	String content,
	String cameraBrand,
	String cameraModel,
	LocalDateTime createdAt,
	List<String> photoUrls
) {
	public static ReviewDetailResponseDTO of(Review review, List<String> photoUrls) {

		return new ReviewDetailResponseDTO(
			review.getReviewId(),
			review.getUser().getNickname(),
			review.getUser().getProfileNumber(),
			review.getConcert().getConcertId(),
			review.getConcert().getConcertName(),
			review.getConcert().getArena().getArenaId(),
			review.getConcert().getArena().getArenaName(),
			review.getSeat().getSeatId(),
			review.getSeat().getSection(),
			review.getSeat().getRowLine(),
			review.getSeat().getColumnLine(),
			review.getArtistGrade(),
			review.getStageGrade(),
			review.getScreenGrade(),
			review.getContent(),
			review.getCameraBrand(),
			review.getCameraModel(),
			review.getCreatedAt(),
			photoUrls
		);
	}
}
