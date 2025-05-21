package com.conkiri.domain.place.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Category {
	TOILET("TOILET", "화장실"),
	CONVENIENCE("CONVENIENCE", "편의 시설"),
	STORAGE("STORAGE", "물품보관소"),
	TICKET("TICKET", "공연 관련 시설");

	private final String value;
	private final String responseValue;
}
