package com.conkiri.domain.notification.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
	CONCERT_OPEN("공연 오픈"),
	TICKETING_DAY("티켓팅 당일"),
	TICKETING_SOON("티켓팅 임박"),
	CONCERT_DAY("공연 당일"),
	CONCERT_SOON("공연 시작 임박"),
	SYSTEM("시스템 알림");

	private final String title;
}
