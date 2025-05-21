package com.conkiri.domain.view.entity;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.user.entity.User;
import com.conkiri.domain.view.dto.request.ReviewRequestDTO;
import com.conkiri.global.common.BaseTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseTime {

	@Id
	@Column(name = "review_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long reviewId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_id", nullable = false)
	private Concert concert;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "seat_id", nullable = false)
	private Seat seat;

	@Column(name = "artist_grade", nullable = false)
	@Enumerated(EnumType.STRING)
	private ArtistGrade artistGrade;

	@Column(name = "stage_grade", nullable = false)
	@Enumerated(EnumType.STRING)
	private StageGrade stageGrade;

	@Column(name = "screen_grade", nullable = false)
	@Enumerated(EnumType.STRING)
	private ScreenGrade screenGrade;

	@Column(name = "content", length = 500, nullable = false)
	private String content;

	@Column(name = "camera_brand", length = 50)
	private String cameraBrand;

	@Column(name = "camera_model", length = 50)
	private String cameraModel;

	public static Review of(ReviewRequestDTO dto, User user, Concert concert, Seat seat) {
		return new Review(dto, user, concert, seat);
	}

	private Review(ReviewRequestDTO dto, User user, Concert concert, Seat seat) {
		this.user = user;
		this.concert = concert;
		this.seat = seat;
		this.artistGrade = dto.artistGrade();
		this.stageGrade = dto.stageGrade();
		this.screenGrade = dto.screenGrade();
		this.content = dto.content();
		this.cameraBrand = dto.cameraBrand() != null ? dto.cameraBrand() : null;
		this.cameraModel = dto.cameraModel() != null ? dto.cameraModel() : null;
	}

	public void update(ReviewRequestDTO dto, Seat seat, Concert concert) {
		this.concert = concert;
		this.seat = seat;
		this.artistGrade = dto.artistGrade();
		this.stageGrade = dto.stageGrade();
		this.screenGrade = dto.screenGrade();
		this.content = dto.content();
		this.cameraBrand = dto.cameraBrand() != null ? dto.cameraBrand() : null;
		this.cameraModel = dto.cameraModel() != null ? dto.cameraModel() : null;
	}
}
