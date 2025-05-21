package com.conkiri.domain.base.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VenueKeyword {
	SANGAM_WORLD_CUP("상암월드컵", 1L),
	GOYANG_STADIUM("고양종합운동장", 2L),
	GOCHEOK("고척", 3L),
	INSPIRE("인스파이어", 4L),
	KSPO("KSPO", 5L),
	JAMSIL_GYMNASIUM("잠실실내체육관", 6L),
	HANDBALL_STADIUM("핸드볼경기장", 7L),
	OLYMPIC_HALL("올림픽홀", 8L);

	private final String keyword;
	private final Long arenaId;

	public static VenueKeyword findByVenueName(String venueName) {
		if (venueName == null || venueName.isEmpty()) {
			return null;
		}

		for (VenueKeyword keyword : VenueKeyword.values()) {
			if (venueName.contains(keyword.getKeyword())) {
				return keyword;
			}
		}

		return null;
	}
}
