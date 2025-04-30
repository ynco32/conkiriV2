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
public class Seat {

	@Id
	@Column(name = "seat_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long seatId;

	@Column(name = "row_line")
	private Long rowLine;

	@Column(name = "column_line")
	private Long columnLine;
}
