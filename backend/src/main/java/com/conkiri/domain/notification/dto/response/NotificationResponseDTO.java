package com.conkiri.domain.notification.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.conkiri.domain.base.entity.Cast;
import com.conkiri.domain.notification.entity.Notification;
import com.conkiri.domain.notification.entity.NotificationType;

public record NotificationResponseDTO(
	Long notificationId,
	String title,
	String body,
	NotificationType type,
	boolean isRead,
	LocalDateTime createdAt,
	ConcertSummary concert
) {
	public static NotificationResponseDTO of(Notification notification, List<Cast> casts) {
		return new NotificationResponseDTO(
			notification.getNotificationId(),
			notification.getTitle(),
			notification.getBody(),
			notification.getNotificationType(),
			notification.isRead(),
			notification.getCreatedAt(),
			notification.getConcert() != null ? ConcertSummary.of(notification.getConcert(), casts) : null
		);
	}
}