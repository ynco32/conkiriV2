package com.conkiri.domain.notification.dto.response;

import java.time.LocalDateTime;

import com.conkiri.domain.notification.entity.NotificationType;

public record NotificationMessage(
	Long userId,
	Long concertId,
	String title,
	String body,
	NotificationType type,
	LocalDateTime scheduledAt
) {
}