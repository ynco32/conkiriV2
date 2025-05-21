package com.conkiri.domain.notification.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.conkiri.domain.base.entity.Concert;
import com.conkiri.domain.notification.entity.Notification;
import com.conkiri.domain.notification.entity.NotificationType;
import com.conkiri.domain.notification.repository.NotificationRepository;
import com.conkiri.domain.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationWriteService {

	private final NotificationRepository notificationRepository;

	/**
	 * 알림 이력 저장
	 */
	public Notification saveNotification(User user, Concert concert, String title, String body, NotificationType type) {
		Notification notification = Notification.of(user, concert, title, body, type);
		return notificationRepository.save(notification);
	}

	/**
	 * 모든 알림 읽음 처리
	 */
	public void markAllAsRead(User user) {
		notificationRepository.markAllAsRead(user);
	}

	/**
	 * 특정 알림 읽음 처리
	 */
	public void markAsRead(Long notificationId) {
		notificationRepository.findById(notificationId)
			.ifPresent(Notification::markAsRead);
	}


	public void deleteAllNotifications(User user) {

		notificationRepository.deleteAllByUser(user);
	}

	public void deleteNotification(Long notificationId) {

		notificationRepository.deleteById(notificationId);
	}
}