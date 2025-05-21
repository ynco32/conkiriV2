package com.conkiri.domain.base.entity;

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
public class Cast {
	@Id
	@Column(name = "cast_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long castId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "concert_id", nullable = false)
	private Concert concert;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "artist_id", nullable = false)
	private Artist artist;

	private Cast(Concert concert, Artist artist) {
		this.concert = concert;
		this.artist = artist;
	}

	public static Cast of(Concert concert, Artist artist) {
		return new Cast(concert, artist);
	}
}

