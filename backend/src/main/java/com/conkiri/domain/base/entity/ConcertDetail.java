package com.conkiri.domain.base.entity;

import java.time.LocalDateTime;

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
public class ConcertDetail {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long concertDetailId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_id", nullable = false)
	private Concert concert;

	@Column(name = "start_time", nullable = false)
	private LocalDateTime startTime;

	private ConcertDetail(Concert concert, LocalDateTime startTime) {
		this.concert = concert;
		this.startTime = startTime;
	}

	public static ConcertDetail of(Concert concert, LocalDateTime startTime) {
		return new ConcertDetail(concert, startTime);
	}
}