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
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Seat {

	@Id
	@Column(name = "seat_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long seatId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "arena_id", nullable = false)
	private Arena arena;

	@Column(name = "section", length = 10, nullable = false)
	private String section;

	@Column(name = "row_line", length = 10, nullable = false)
	private String rowLine;

	@Column(name = "column_line", nullable = false)
	private Long columnLine;

	@Column(name = "floor", nullable = false)
	private Long floor;
}
