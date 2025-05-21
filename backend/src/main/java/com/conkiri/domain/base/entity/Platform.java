package com.conkiri.domain.base.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Platform {

	MELON("멜론티켓"),
	YES24("예스24"),
	COUPANG_PLAY("쿠팡플레이"),
	INTERPARK("인터파크");

	private final String displayName;
}
