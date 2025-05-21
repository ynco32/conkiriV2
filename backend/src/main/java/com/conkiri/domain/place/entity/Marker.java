package com.conkiri.domain.place.entity;

import com.conkiri.domain.base.entity.Arena;

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
public class Marker {

	@Id @Column(name = "marker_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long markerId;

	@Column(name = "latitude")
	private Double latitude;

	@Column(name = "longitude")
	private Double longitude;

	@Column(name = "category")
	@Enumerated(EnumType.STRING)
	private Category category;

	@Column(name = "detail")
	private String detail;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "arena_id", nullable = false)
	private Arena arena;
}
