package com.conkiri.domain.view.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
public class ReviewPhoto {

	@Id
	@Column(name = "review_photo_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long reviewPhotoId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "review_id", nullable = false)
	private Review review;

	@Column(name = "photo_url", nullable = false, length = 200)
	private String photoUrl;

	public static ReviewPhoto of(Review review, String photoUrl) {
		return new ReviewPhoto(review, photoUrl);
	}

	private ReviewPhoto(Review review, String photoUrl) {
		this.review = review;
		this.photoUrl = photoUrl;
	}
}
