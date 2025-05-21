package com.conkiri.domain.view.entity;

import com.conkiri.domain.base.entity.Arena;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SectionLayout {

	@Id
	@Column(name = "layout_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long layoutId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "arena_id", nullable = false)
	private Arena arena;

	@Column(name = "section", length = 10, nullable = false)
	private String section;

	@Column(name = "layout_data", columnDefinition = "TEXT", nullable = false)
	private String layoutData;  // JSON 형태의 좌석 배치 데이터
}